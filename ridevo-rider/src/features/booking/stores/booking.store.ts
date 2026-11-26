import { create } from "zustand";

import {
  bookingDestinationSchema,
  bookingPickupSchema,
  selectedVehicleSchema,
  startBookingInputSchema,
} from "../schemas/booking.schema";

import type {
  BookingDestination,
  BookingDraft,
  BookingPickup,
  SelectedVehicle,
  StartBookingInput,
} from "../types/booking.types";

interface BookingState {
  draft: BookingDraft | null;

  startBooking: (input: StartBookingInput) => void;

  setPickup: (userId: string, pickup: BookingPickup) => void;

  setDestination: (userId: string, destination: BookingDestination) => void;

  confirmPickup: (userId: string) => void;

  confirmDestination: (userId: string) => void;

  selectVehicle: (userId: string, vehicle: SelectedVehicle) => void;

  clearPickup: (userId: string) => void;

  clearDestination: (userId: string) => void;

  resetBooking: () => void;
}

function requireBookingDraft(
  draft: BookingDraft | null,
  userId: string,
): BookingDraft {
  if (!draft) {
    throw new Error("No active booking.");
  }

  if (draft.userId !== userId) {
    throw new Error("Invalid booking owner.");
  }

  return draft;
}

export const useBookingStore = create<BookingState>((set) => ({
  draft: null,

  startBooking: (input) => {
    const validated = startBookingInputSchema.parse(input);

    const now = Date.now();

    set({
      draft: {
        userId: validated.userId,

        pickup: validated.pickup ?? null,

        destination: validated.destination ?? null,

        pickupConfirmed: false,

        destinationConfirmed: false,

        selectedVehicle: null,

        createdAt: now,

        updatedAt: now,
      },
    });
  },

  setPickup: (userId, pickup) => {
    const validated = bookingPickupSchema.parse(pickup);

    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      return {
        draft: {
          ...draft,

          pickup: validated,

          pickupConfirmed: false,

          destinationConfirmed: false,

          selectedVehicle: null,

          updatedAt: Date.now(),
        },
      };
    });
  },

  setDestination: (userId, destination) => {
    const validated = bookingDestinationSchema.parse(destination);

    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      return {
        draft: {
          ...draft,

          destination: validated,

          destinationConfirmed: false,

          selectedVehicle: null,

          updatedAt: Date.now(),
        },
      };
    });
  },

  confirmPickup: (userId) => {
    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      if (!draft.pickup) {
        throw new Error("Pickup is required.");
      }

      return {
        draft: {
          ...draft,

          pickupConfirmed: true,

          updatedAt: Date.now(),
        },
      };
    });
  },

  confirmDestination: (userId) => {
    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      if (!draft.pickupConfirmed || !draft.destination) {
        throw new Error("Confirm your pickup and destination first.");
      }

      return {
        draft: {
          ...draft,

          destinationConfirmed: true,

          updatedAt: Date.now(),
        },
      };
    });
  },

  selectVehicle: (userId, vehicle) => {
    const validated = selectedVehicleSchema.parse(vehicle);

    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      if (!draft.pickupConfirmed || !draft.destinationConfirmed) {
        throw new Error("Confirm your journey first.");
      }

      return {
        draft: {
          ...draft,

          selectedVehicle: validated,

          updatedAt: Date.now(),
        },
      };
    });
  },

  clearPickup: (userId) => {
    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      return {
        draft: {
          ...draft,

          pickup: null,

          pickupConfirmed: false,

          destinationConfirmed: false,

          selectedVehicle: null,

          updatedAt: Date.now(),
        },
      };
    });
  },

  clearDestination: (userId) => {
    set((state) => {
      const draft = requireBookingDraft(state.draft, userId);

      return {
        draft: {
          ...draft,

          destination: null,

          destinationConfirmed: false,

          selectedVehicle: null,

          updatedAt: Date.now(),
        },
      };
    });
  },

  resetBooking: () => {
    set({ draft: null });
  },
}));
