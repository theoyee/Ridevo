import { useCallback, useRef } from "react";

import type { WebView } from "react-native-webview";

import type {
  MapCameraOptions,
  MapCommand,
  MapVehicle,
} from "../types/map-bridge.types";

import type { MapCoordinates } from "../types/map.types";

export function useMapBridge() {
  const webViewRef = useRef<WebView<object>>(null);

  const dispatch = useCallback((command: MapCommand): void => {
    const serialized = JSON.stringify(command).replace(/</g, "\\u003c");

    const script = `
        if (window.ridevoMap) {
          window.ridevoMap.dispatch(${serialized});
        }

        true;
      `;

    webViewRef.current?.injectJavaScript(script);
  }, []);

  const setCamera = useCallback(
    (options: MapCameraOptions) => {
      dispatch({
        type: "SET_CAMERA",
        payload: options,
      });
    },
    [dispatch],
  );

  const setUserLocation = useCallback(
    (coordinates: MapCoordinates, accuracy?: number) => {
      dispatch({
        type: "SET_USER_LOCATION",
        payload: {
          coordinates,
          accuracy,
        },
      });
    },
    [dispatch],
  );

  const clearUserLocation = useCallback(() => {
    dispatch({
      type: "CLEAR_USER_LOCATION",
    });
  }, [dispatch]);

  const setNearbyDrivers = useCallback(
    (drivers: MapVehicle[]) => {
      dispatch({
        type: "SET_NEARBY_DRIVERS",
        payload: {
          drivers,
        },
      });
    },
    [dispatch],
  );

  const clearNearbyDrivers = useCallback(() => {
    dispatch({
      type: "CLEAR_NEARBY_DRIVERS",
    });
  }, [dispatch]);

  return {
    webViewRef,
    setCamera,
    setUserLocation,
    clearUserLocation,
    setNearbyDrivers,
    clearNearbyDrivers,
  };
}
