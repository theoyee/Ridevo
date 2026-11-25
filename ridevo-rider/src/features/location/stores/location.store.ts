import { create } from "zustand";

import type { LocationPermission, UserLocation } from "../types/location.types";

interface LocationState {
  permission: LocationPermission | null;

  currentLocation: UserLocation | null;

  servicesEnabled: boolean | null;

  setPermission: (permission: LocationPermission) => void;

  setCurrentLocation: (location: UserLocation | null) => void;

  setServicesEnabled: (enabled: boolean) => void;

  reset: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  permission: null,

  currentLocation: null,

  servicesEnabled: null,

  setPermission: (permission) => {
    set((state) => ({
      permission,

      currentLocation: permission.granted ? state.currentLocation : null,
    }));
  },

  setCurrentLocation: (location) => {
    set((state) => ({
      currentLocation: state.permission?.granted ? location : null,
    }));
  },

  setServicesEnabled: (enabled) => {
    set({
      servicesEnabled: enabled,
    });
  },

  reset: () => {
    set({
      permission: null,
      currentLocation: null,
      servicesEnabled: null,
    });
  },
}));
