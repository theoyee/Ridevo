import { useCallback, useRef } from "react";

import { WebView } from "react-native-webview";

import type {
  MapCameraOptions,
  MapCommand,
  MapFitOptions,
  MapPadding,
  MapRouteOptions,
  MapVehicle,
} from "../types/map-bridge.types";

import type { MapCoordinates } from "../types/map.types";

export function useMapBridge() {
  const webViewRef = useRef<WebView<object>>(null);

  const dispatch = useCallback((command: MapCommand) => {
    const serialized = JSON.stringify(command).replace(/</g, "\\u003c");

    webViewRef.current?.injectJavaScript(`
        if (window.ridevoMap) {
          window.ridevoMap.dispatch(
            ${serialized}
          );
        }

        true;
      `);
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

  const setCameraPadding = useCallback(
    (padding: MapPadding) => {
      dispatch({
        type: "SET_CAMERA_PADDING",
        payload: padding,
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

  const setRoute = useCallback(
    (options: MapRouteOptions) => {
      dispatch({
        type: "SET_ROUTE",
        payload: options,
      });
    },
    [dispatch],
  );

  const clearRoute = useCallback(() => {
    dispatch({
      type: "CLEAR_ROUTE",
    });
  }, [dispatch]);

  const fitCoordinates = useCallback(
    (options: MapFitOptions) => {
      dispatch({
        type: "FIT_COORDINATES",
        payload: options,
      });
    },
    [dispatch],
  );

  const getCamera = useCallback(() => {
    dispatch({
      type: "GET_CAMERA",
    });
  }, [dispatch]);

  return {
    webViewRef,

    setCamera,

    setCameraPadding,

    setUserLocation,

    clearUserLocation,

    setNearbyDrivers,

    clearNearbyDrivers,
    setRoute,
    clearRoute,
    fitCoordinates,
    getCamera,
  };
}
