export type SavedPlaceType = "home" | "work";

export interface PlaceCoordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: PlaceCoordinates;
  provider: "mapbox" | "manual";
}

export interface SavedPlace extends Place {
  type: SavedPlaceType;
  createdAt: number;
  updatedAt: number;
}

export type SavedPlaces = Record<SavedPlaceType, SavedPlace | null>;

export interface SavePlaceInput {
  type: SavedPlaceType;
  place: Place;
}

export interface RecentDestination extends Place {
  lastSelectedAt: number;
  selectionCount: number;
}

export type RecentDestinationsByUser = Record<string, RecentDestination[]>;
