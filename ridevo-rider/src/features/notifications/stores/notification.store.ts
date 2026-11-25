import { create } from "zustand";

import type {
  NotificationPermission,
  PushRegistration,
} from "../types/notification.types";

interface NotificationState {
  permission: NotificationPermission | null;

  registration: PushRegistration | null;

  setPermission: (permission: NotificationPermission) => void;

  setRegistration: (registration: PushRegistration | null) => void;

  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  permission: null,

  registration: null,

  setPermission: (permission) => {
    set((state) => ({
      permission,

      registration: permission.granted ? state.registration : null,
    }));
  },

  setRegistration: (registration) => {
    set({ registration });
  },

  reset: () => {
    set({
      permission: null,
      registration: null,
    });
  },
}));
