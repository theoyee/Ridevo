import { create } from "zustand";

import {
  bookingDestinationSchema,
  bookingPickupSchema,
  startBookingInputSchema,
} from "../schemas/booking.schema";

import type {
  BookingDestination,
  BookingDraft,
  BookingPickup,
  StartBookingInput,
} from "../types/booking.types";

interface BookingState {
  draft: BookingDraft | null;

  startBooking: (input: StartBookingInput) => void;

  setPickup: (userId: string, pickup: BookingPickup) => void;

  setDestination: (userId: string, destination: BookingDestination) => void;

  clearPickup: (userId: string) => void;

  clearDestination: (userId: string) => void;

  resetBooking: () => void;
}

function requireBookingDraft(
  draft: BookingDraft | null,
  userId: string,
): BookingDraft {
  if (!draft) {
    throw new Error("No active booking draft.");
  }

  if (draft.userId !== userId) {
    throw new Error("Booking draft belongs to another rider.");
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

          updatedAt: Date.now(),
        },
      };
    });
  },

  resetBooking: () => {
    set({
      draft: null,
    });
  },
}));
