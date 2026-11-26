import type {
  Place,
  PlaceCoordinates,
} from "@/features/places/types/place.types";

export type PickupSource = "gps" | "search" | "map";

export type DestinationSource =
  "search" | "saved_place" | "recent_destination" | "map";

export interface BookingPickup {
  coordinates: PlaceCoordinates;

  name: string | null;

  address: string | null;

  source: PickupSource;

  accuracy: number | null;

  capturedAt: number;
}

export interface BookingDestination extends Place {
  source: DestinationSource;
}

export interface BookingDraft {
  userId: string;

  pickup: BookingPickup | null;

  destination: BookingDestination | null;

  createdAt: number;

  updatedAt: number;
}

export interface StartBookingInput {
  userId: string;

  pickup?: BookingPickup | null;

  destination?: BookingDestination | null;
}

export type DestinationSearchMode =
  "destination" | "pickup" | "save-home" | "save-work";
