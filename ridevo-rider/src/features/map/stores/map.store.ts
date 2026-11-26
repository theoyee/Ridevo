import { create } from "zustand";

import type { MapStatus } from "../types/map.types";

interface MapState {
  status: MapStatus;
  error: string | null;

  setLoading: () => void;
  setReady: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  status: "idle",
  error: null,

  setLoading: () =>
    set({
      status: "loading",
      error: null,
    }),

  setReady: () =>
    set({
      status: "ready",
      error: null,
    }),

  setError: (error) =>
    set({
      status: "error",
      error,
    }),

  reset: () =>
    set({
      status: "idle",
      error: null,
    }),
}));
