import { distanceInMeters } from "@/features/location/utils/location.utils";

import { PLACE_CONFIG } from "../constants/place.constants";

import type { Place, RecentDestination } from "../types/place.types";

export function normalizePlaceText(value: string): string {
  return value.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

export function areSamePlace(first: Place, second: Place): boolean {
  // Provider-specific identity.
  if (first.provider === second.provider && first.id === second.id) {
    return true;
  }

  const sameName =
    normalizePlaceText(first.name) === normalizePlaceText(second.name);

  const sameAddress =
    normalizePlaceText(first.address) === normalizePlaceText(second.address);

  if (!sameName || !sameAddress) {
    return false;
  }

  const distance = distanceInMeters(first.coordinates, second.coordinates);

  return distance <= PLACE_CONFIG.recentDestinations.duplicateDistanceMeters;
}

export function sortRecentDestinations(
  destinations: RecentDestination[],
): RecentDestination[] {
  return [...destinations].sort(
    (first, second) => second.lastSelectedAt - first.lastSelectedAt,
  );
}

export function addRecentDestination(
  destinations: RecentDestination[],
  place: Place,
  timestamp = Date.now(),
): RecentDestination[] {
  const existing = destinations.find((destination) =>
    areSamePlace(destination, place),
  );

  const updatedDestination: RecentDestination = {
    ...place,

    lastSelectedAt: timestamp,

    selectionCount: Math.min(
      (existing?.selectionCount ?? 0) + 1,
      Number.MAX_SAFE_INTEGER,
    ),
  };

  const remainingDestinations = destinations.filter(
    (destination) => !areSamePlace(destination, place),
  );

  return sortRecentDestinations([
    updatedDestination,
    ...remainingDestinations,
  ]).slice(0, PLACE_CONFIG.recentDestinations.maxItems);
}
