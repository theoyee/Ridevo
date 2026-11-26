import { useAuthStore } from "@/features/auth/stores/auth.store";

import {
  createRideInputSchema,
  rateRideInputSchema,
  startRideInputSchema,
  type MockRideDatabase,
} from "../schemas/ride.schema";

import type {
  CreateRideInput,
  RateRideInput,
  Ride,
  StartRideInput,
} from "../types/ride.types";

import {
  assertRideTransition,
  canCancelRide,
  isActiveRideStatus,
} from "../utils/ride-status.utils";

import { runRideTransaction } from "./mock-ride-database";

import { advanceMockRide } from "./mock-ride-simulator";

function requireUserId(): string {
  const auth = useAuthStore.getState();

  const userId = auth.session?.user.id;

  if (auth.status !== "authenticated" || !userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}

function assertSessionOwner(userId: string): void {
  if (requireUserId() !== userId) {
    throw new Error("Your session has changed.");
  }
}

function requireOwnedRide(
  database: MockRideDatabase,
  rideId: string,
  userId: string,
): Ride {
  const ride = database.rides[rideId];

  if (!ride || ride.userId !== userId) {
    throw new Error("Ride not found.");
  }

  return ride;
}

function refreshRide(database: MockRideDatabase, ride: Ride): Ride {
  const updated = advanceMockRide(ride);

  database.rides[ride.id] = updated;

  return updated;
}

function findActiveRide(
  database: MockRideDatabase,
  userId: string,
): Ride | null {
  for (const ride of Object.values(database.rides)) {
    if (ride.userId !== userId) {
      continue;
    }

    const updated = refreshRide(database, ride);

    const requiresPaymentConfirmation =
      updated.status === "completed" && updated.paymentStatus === "pending";

    if (isActiveRideStatus(updated.status) || requiresPaymentConfirmation) {
      return updated;
    }
  }

  return null;
}

async function createRide(input: CreateRideInput): Promise<Ride> {
  const userId = requireUserId();

  const validated = createRideInputSchema.parse(input);

  if (validated.paymentMethod !== "cash") {
    throw new Error("Only cash payments are currently supported.");
  }

  const requestKey = JSON.stringify([userId, validated.idempotencyKey]);

  const fingerprint = JSON.stringify(validated);

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const existingRequest = database.requests[requestKey];

    if (existingRequest) {
      if (existingRequest.fingerprint !== fingerprint) {
        throw new Error(
          "This request key has already been used with different booking details.",
        );
      }

      const existingRide = requireOwnedRide(
        database,
        existingRequest.rideId,
        userId,
      );

      return refreshRide(database, existingRide);
    }

    const activeRide = findActiveRide(database, userId);

    if (activeRide) {
      throw new Error("You already have an active ride.");
    }

    const now = Date.now();

    // Development-only identifier.
    const id = `mock-ride-${requestKey}`;

    const ride: Ride = {
      id,
      userId,

      status: "searching",
      version: 1,

      pickup: validated.pickup,
      destination: validated.destination,

      category: validated.category,

      estimatedFareMinor: validated.estimatedFareMinor,

      finalFareMinor: null,

      currency: validated.currency,

      paymentMethod: validated.paymentMethod,
      paymentStatus: "pending",

      driver: null,
      vehicle: null,
      driverLocation: null,

      verificationPin: null,

      requestedAt: now,

      acceptedAt: null,
      arrivedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,

      updatedAt: now,
    };

    database.rides[id] = ride;

    database.requests[requestKey] = {
      rideId: id,
      fingerprint,
    };

    return ride;
  });
}

async function getRide(rideId: string): Promise<Ride> {
  const userId = requireUserId();

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const ride = requireOwnedRide(database, rideId, userId);

    return refreshRide(database, ride);
  });
}

async function getActiveRide(): Promise<Ride | null> {
  const userId = requireUserId();

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    return findActiveRide(database, userId);
  });
}

async function cancelRide(rideId: string, _reason?: string): Promise<Ride> {
  const userId = requireUserId();

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const existing = requireOwnedRide(database, rideId, userId);

    const ride = refreshRide(database, existing);

    if (ride.status === "cancelled") {
      return ride;
    }

    if (!canCancelRide(ride.status)) {
      throw new Error("This ride can no longer be cancelled.");
    }

    const now = Date.now();

    const cancelledRide: Ride = {
      ...ride,

      status: "cancelled",

      version: ride.version + 1,

      verificationPin: null,

      cancelledAt: now,

      updatedAt: now,
    };

    database.rides[rideId] = cancelledRide;

    return cancelledRide;
  });
}

async function startRide(input: StartRideInput): Promise<Ride> {
  const userId = requireUserId();

  const validated = startRideInputSchema.parse(input);

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const existing = requireOwnedRide(database, validated.rideId, userId);

    const ride = refreshRide(database, existing);

    if (ride.status === "in_progress") {
      return ride;
    }

    if (ride.status !== "arrived") {
      throw new Error("The driver must arrive before starting the trip.");
    }

    if (!ride.verificationPin || ride.verificationPin !== validated.pin) {
      throw new Error("Incorrect verification PIN.");
    }

    assertRideTransition(ride.status, "in_progress");

    const now = Date.now();

    const updatedRide: Ride = {
      ...ride,

      status: "in_progress",

      version: ride.version + 1,

      startedAt: now,

      verificationPin: null,

      updatedAt: now,

      driverLocation: {
        coordinates: ride.pickup.coordinates,
        heading: 0,
        updatedAt: now,
      },
    };

    database.rides[ride.id] = updatedRide;

    return updatedRide;
  });
}

async function completeRide(rideId: string): Promise<Ride> {
  const userId = requireUserId();

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const existing = requireOwnedRide(database, rideId, userId);

    const ride = refreshRide(database, existing);

    if (ride.status === "completed") {
      return ride;
    }

    assertRideTransition(ride.status, "completed");

    const now = Date.now();

    const completedRide: Ride = {
      ...ride,

      status: "completed",

      version: ride.version + 1,

      finalFareMinor: ride.estimatedFareMinor,

      paymentStatus: "pending",

      completedAt: now,

      updatedAt: now,

      driverLocation: {
        coordinates: ride.destination.coordinates,
        heading: 0,
        updatedAt: now,
      },
    };

    database.rides[ride.id] = completedRide;

    return completedRide;
  });
}

async function confirmCashPayment(rideId: string): Promise<Ride> {
  const userId = requireUserId();

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const ride = requireOwnedRide(database, rideId, userId);

    if (ride.status !== "completed") {
      throw new Error("The trip is not completed.");
    }

    if (ride.paymentMethod !== "cash") {
      throw new Error("This is not a cash payment.");
    }

    if (ride.paymentStatus === "paid") {
      return ride;
    }

    if (ride.paymentStatus !== "pending") {
      throw new Error("Payment cannot be confirmed.");
    }

    const updatedRide: Ride = {
      ...ride,

      paymentStatus: "paid",

      version: ride.version + 1,

      updatedAt: Date.now(),
    };

    database.rides[ride.id] = updatedRide;

    return updatedRide;
  });
}

async function rateRide(input: RateRideInput): Promise<Ride> {
  const userId = requireUserId();

  const validated = rateRideInputSchema.parse(input);

  return runRideTransaction((database) => {
    assertSessionOwner(userId);

    const ride = requireOwnedRide(database, validated.rideId, userId);

    if (ride.status !== "completed") {
      throw new Error("Only completed rides can be rated.");
    }

    if (ride.rating) {
      return ride;
    }

    const now = Date.now();

    const updatedRide: Ride = {
      ...ride,

      version: ride.version + 1,

      rating: {
        stars: validated.stars,

        comment: validated.comment || null,

        createdAt: now,
      },

      updatedAt: now,
    };

    database.rides[ride.id] = updatedRide;

    return updatedRide;
  });
}

export const mockRideService = {
  createRide,
  getRide,
  getActiveRide,
  cancelRide,
  rateRide,
};

export const mockDriverSimulator = {
  startRide,
  completeRide,
  confirmCashPayment,
};
