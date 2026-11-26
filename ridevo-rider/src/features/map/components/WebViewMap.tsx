import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type Ref,
} from "react";

import { View } from "react-native";

import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from "react-native-webview";

import { MAP_CONFIG, MAP_STYLES } from "../constants/map.constants";

import { useMapBridge } from "../hooks/useMapBridge";
import { mapService } from "../services/map.service";
import { createMapHtml } from "../utils/map-html";

import type { MapController, MapEvent } from "../types/map-bridge.types";

import type { MapStatus } from "../types/map.types";

import { MapLoadingOverlay } from "./MapLoadingOverlay";

export interface WebViewMapProps {
  ref?: Ref<MapController>;
  styleURL?: string;
  onReady?: () => void;
  onEvent?: (event: MapEvent) => void;
  onReadyChange?: (ready: boolean) => void;
}

export function WebViewMap({
  ref,
  styleURL = MAP_STYLES.light,
  onReady,
  onEvent,
  onReadyChange,
}: WebViewMapProps) {
  const [status, setStatus] = useState<MapStatus>("loading");

  const [error, setError] = useState<string | null>(null);

  const [attempt, setAttempt] = useState(0);

  const {
    webViewRef,
    setCamera,
    setUserLocation,
    clearUserLocation,
    setNearbyDrivers,
    clearNearbyDrivers,
  } = useMapBridge();

  // Expose map operations to the parent component.
  useImperativeHandle(
    ref,
    () => ({
      setCamera,
      setUserLocation,
      clearUserLocation,
      setNearbyDrivers,
      clearNearbyDrivers,
    }),
    [
      setCamera,
      setUserLocation,
      clearUserLocation,
      setNearbyDrivers,
      clearNearbyDrivers,
    ],
  );

  const configuration = useMemo(() => {
    try {
      const accessToken = mapService.getAccessToken();

      return {
        source: {
          html: createMapHtml({
            accessToken,
            styleURL,
          }),
        },
        error: null,
      };
    } catch (cause) {
      return {
        source: null,
        error:
          cause instanceof Error ? cause.message : "Map configuration failed.",
      };
    }
  }, [styleURL]);

  const isReady = status === "ready" && !configuration.error;

  // Notify the parent whenever map readiness changes.
  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  // Prevent the loading overlay from remaining indefinitely.
  useEffect(() => {
    if (status !== "loading" || configuration.error) {
      return;
    }

    const timeout = setTimeout(() => {
      setStatus("error");
      setError("The map is taking too long to load.");
    }, MAP_CONFIG.loadingTimeoutMs);

    return () => clearTimeout(timeout);
  }, [status, attempt, configuration.error]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as MapEvent;

      switch (message.type) {
        case "MAP_READY": {
          setStatus("ready");
          setError(null);

          onReady?.();

          break;
        }

        case "MAP_ERROR": {
          setStatus("error");

          setError(message.payload?.message || "Unable to load the map.");

          break;
        }

        case "MAP_PRESS":
        case "CAMERA_CHANGED": {
          break;
        }

        case "MAP_PERFORMANCE": {
          if (__DEV__) {
            console.log("[RidevoMap Performance]", message.payload);
          }

          break;
        }

        default: {
          return;
        }
      }

      onEvent?.(message);
    } catch (cause) {
      if (__DEV__) {
        console.warn("[RidevoMap] Invalid map event:", cause);
      }
    }
  }

  function handleLoadStart() {
    setStatus("loading");
    setError(null);

    onReadyChange?.(false);
  }

  function handleError() {
    setStatus("error");

    setError("Unable to initialize the map renderer.");

    onReadyChange?.(false);
  }

  function handleRetry() {
    setError(null);
    setStatus("loading");

    onReadyChange?.(false);

    setAttempt((previous) => previous + 1);
  }

  const displayError = configuration.error ?? error;

  return (
    <View className="relative flex-1 overflow-hidden bg-[#F3F5F0]">
      {configuration.source && (
        <WebView<object>
          key={attempt}
          ref={webViewRef}
          source={configuration.source}
          style={{
            flex: 1,
            backgroundColor: "#F3F5F0",
          }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          onMessage={handleMessage}
          onLoadStart={handleLoadStart}
          onError={handleError}
          onShouldStartLoadWithRequest={(request: WebViewNavigation) => {
            return (
              request.url === "about:blank" ||
              request.url.startsWith("data:text/html")
            );
          }}
        />
      )}

      {(!isReady || displayError) && (
        <MapLoadingOverlay error={displayError} onRetry={handleRetry} />
      )}
    </View>
  );
}
