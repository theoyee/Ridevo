import { RIDE_CONFIG } from "../constants/ride.constants";

import type { Ride, RideVehicle } from "../types/ride.types";

import {
  assertRideTransition,
  isTerminalRideStatus,
} from "../utils/ride-status.utils";

function createMockVehicle(category: Ride["category"]): RideVehicle {
  const vehicles = {
    economy: {
      manufacturer: "Toyota",
      model: "Corolla",
    },

    comfort: {
      manufacturer: "Toyota",
      model: "Camry",
    },

    premium: {
      manufacturer: "Lexus",
      model: "ES 350",
    },
  };

  return {
    id: `mock-vehicle-${category}`,

    category,

    ...vehicles[category],

    color: "Silver",

    plateNumber: "DEMO-001",
  };
}

export function advanceMockRide(ride: Ride, now = Date.now()): Ride {
  if (isTerminalRideStatus(ride.status)) {
    return ride;
  }

  let next = ride;

  const acceptedAt = ride.requestedAt + RIDE_CONFIG.mock.matchingDelayMs;

  if (next.status === "searching" && now >= acceptedAt) {
    assertRideTransition(next.status, "accepted");

    next = {
      ...next,

      status: "accepted",

      version: next.version + 1,

      driver: {
        id: "mock-driver-001",
        firstName: "Daniel",
        lastName: "Adeyemi",
        rating: 4.9,
        photoUrl: null,
        phoneNumber: "+2340000000000",
      },

      vehicle: createMockVehicle(next.category),

      acceptedAt,

      updatedAt: acceptedAt,
    };
  }

  if (
    next.status === "accepted" &&
    next.acceptedAt !== null &&
    now >= next.acceptedAt + 2_000
  ) {
    assertRideTransition(next.status, "arriving");

    next = {
      ...next,

      status: "arriving",

      version: next.version + 1,

      updatedAt: next.acceptedAt + 2_000,
    };
  }

  if (next.status === "arriving" && next.acceptedAt !== null) {
    const arrivedAt = next.acceptedAt + RIDE_CONFIG.mock.arrivalDelayMs;

    if (now >= arrivedAt) {
      assertRideTransition(next.status, "arrived");

      next = {
        ...next,

        status: "arrived",

        version: next.version + 1,

        arrivedAt,

        verificationPin: "4821",

        driverLocation: {
          coordinates: next.pickup.coordinates,
          heading: 0,
          updatedAt: arrivedAt,
        },

        updatedAt: arrivedAt,
      };
    }
  }

  if (next.status === "in_progress" && next.startedAt !== null) {
    const completedAt = next.startedAt + RIDE_CONFIG.mock.tripDurationMs;

    if (now >= completedAt) {
      assertRideTransition(next.status, "completed");

      next = {
        ...next,

        status: "completed",

        version: next.version + 1,

        completedAt,

        finalFareMinor: next.estimatedFareMinor,

        paymentStatus: "pending",

        driverLocation: {
          coordinates: next.destination.coordinates,

          heading: 0,

          updatedAt: completedAt,
        },

        updatedAt: completedAt,
      };
    }
  }

  return next;
}
