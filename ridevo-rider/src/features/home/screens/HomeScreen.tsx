import { useCallback, useEffect, useRef, useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import type BottomSheet from "@gorhom/bottom-sheet";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useNearbyDrivers } from "@/features/drivers/hooks/useNearbyDrivers";

import { locationService } from "@/features/location/services/location.service";

import { useLocationStore } from "@/features/location/stores/location.store";

import {
  isLocationFresh,
  isValidCoordinates,
  toMapboxCoordinates,
} from "@/features/location/utils/location.utils";

import { RidevoMap } from "@/features/map/components/RidevoMap";

import { RecenterButton } from "@/features/map/components/RecenterButton";

import { MapDebugOverlay } from "@/features/map/components/MapDebugOverlay";

import { MAP_STYLES } from "@/features/map/constants/map.constants";

import { useMapCamera } from "@/features/map/hooks/useMapCamera";

import { useMapLocation } from "@/features/map/hooks/useMapLocation";

import { useNearbyDriverMarkers } from "@/features/map/hooks/useNearbyDriverMarkers";

import type { MapController } from "@/features/map/types/map-bridge.types";

import { useSavedPlaces } from "@/features/places/hooks/useSavedPlaces";

import type { SavedPlaceType } from "@/features/places/types/place.types";

import { HomeHeader } from "../components/HomeHeader";

import { BookingBottomSheet } from "../components/BookingBottomSheet";

import { HOME_CONFIG } from "../constants/home.constants";

import { useRecentDestinations } from "@/features/places/hooks/useRecentDestinations";

import type { RecentDestination } from "@/features/places/types/place.types";

export function HomeScreen() {
  // --------------------------------------------------
  // References
  // --------------------------------------------------

  const mapRef = useRef<MapController>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const recenterLock = useRef(false);

  // --------------------------------------------------
  // Layout and component state
  // --------------------------------------------------

  const { height: windowHeight } = useWindowDimensions();

  const [containerHeight, setContainerHeight] = useState(0);

  const [isMapReady, setIsMapReady] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [locationError, setLocationError] = useState<string | null>(null);

  // --------------------------------------------------
  // Authenticated rider
  // --------------------------------------------------

  const firstName = useAuthStore((state) => state.session?.user.firstName);

  // --------------------------------------------------
  // Location store
  // --------------------------------------------------

  const setCurrentLocation = useLocationStore(
    (state) => state.setCurrentLocation,
  );

  // --------------------------------------------------
  // Saved places
  // --------------------------------------------------

  const {
    home,
    work,
    isReady: areSavedPlacesReady,
    removePlace,
  } = useSavedPlaces();

  const {
    previewDestinations,
    error: recentDestinationsError,
    retry: retryRecentDestinations,
    removeDestination,
    clearDestinations,
    isReady: isHistoryReady,
    recordDestination,
  } = useRecentDestinations();

  const handleRecentDestinationPress = useCallback(
    (destination: RecentDestination) => {
      Alert.alert(destination.name, destination.address);
    },
    [],
  );

  const handleRecentDestinationLongPress = useCallback(
    (destination: RecentDestination) => {
      Alert.alert("Remove destination?", destination.name, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",

          onPress: () => {
            try {
              removeDestination(destination);
            } catch {
              Alert.alert("Unable to remove destination", "Please try again.");
            }
          },
        },
      ]);
    },
    [removeDestination],
  );

  const handleClearRecentDestinations = useCallback(() => {
    Alert.alert(
      "Clear destination history?",
      "This will remove all your recent destinations from this device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear history",
          style: "destructive",

          onPress: () => {
            try {
              clearDestinations();
            } catch {
              Alert.alert("Unable to clear history", "Please try again.");
            }
          },
        },
      ],
    );
  }, [clearDestinations]);

  // --------------------------------------------------
  // Bottom sheet animation
  // --------------------------------------------------

  const animatedSheetPosition = useSharedValue(windowHeight);

  const recenterSpacing = HOME_CONFIG.map.recenterSpacing;

  const recenterAnimatedStyle = useAnimatedStyle(() => {
    const top = Math.max(
      96,
      animatedSheetPosition.value - 48 - recenterSpacing,
    );

    return {
      transform: [
        {
          translateY: top,
        },
      ],
    };
  });

  // --------------------------------------------------
  // GPS tracking
  // --------------------------------------------------

  const { location, isTracking, error: trackingError } = useMapLocation();

  // --------------------------------------------------
  // Camera management
  // --------------------------------------------------

  const { recenter } = useMapCamera({
    mapRef,
    location,
    isMapReady,
  });

  // --------------------------------------------------
  // Nearby drivers
  // --------------------------------------------------

  const {
    drivers,
    isActive: isDriverTrackingActive,
    isFetching: isFetchingDrivers,
    error: driverError,
    lastUpdatedAt,
  } = useNearbyDrivers({
    location,
    enabled: __DEV__ && isMapReady,
  });

  // --------------------------------------------------
  // Synchronize driver markers
  // --------------------------------------------------

  useNearbyDriverMarkers({
    mapRef,
    drivers,
    isMapReady,
    enabled: isDriverTrackingActive,
  });

  // --------------------------------------------------
  // Synchronize rider location marker
  // --------------------------------------------------

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    if (
      !location ||
      !isValidCoordinates(location) ||
      !isLocationFresh(location)
    ) {
      mapRef.current.clearUserLocation();

      return;
    }

    mapRef.current.setUserLocation(
      toMapboxCoordinates(location),
      location.accuracy ?? undefined,
    );
  }, [location, isMapReady]);

  // --------------------------------------------------
  // Development driver diagnostics
  // --------------------------------------------------

  useEffect(() => {
    if (__DEV__ && driverError) {
      console.warn("[Ridevo] Nearby drivers:", driverError.message);
    }
  }, [driverError]);

  // --------------------------------------------------
  // Recenter camera
  // --------------------------------------------------

  const handleRecenter = useCallback(async () => {
    if (recenterLock.current || !isMapReady) {
      return;
    }

    setLocationError(null);

    // Use the existing location if it is fresh.
    if (recenter()) {
      return;
    }

    recenterLock.current = true;

    setIsLocating(true);

    try {
      const currentLocation = await locationService.getCurrentLocation();

      if (!isValidCoordinates(currentLocation)) {
        throw new Error("Unable to determine your current location.");
      }

      // Keep the shared location store synchronized.
      setCurrentLocation(currentLocation);

      const coordinates = toMapboxCoordinates(currentLocation);

      mapRef.current?.setUserLocation(
        coordinates,
        currentLocation.accuracy ?? undefined,
      );

      mapRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 16,
        heading: 0,
        pitch: 0,
        duration: 800,
      });
    } catch (cause) {
      setLocationError(
        cause instanceof Error
          ? cause.message
          : "Unable to locate your device.",
      );
    } finally {
      recenterLock.current = false;

      setIsLocating(false);
    }
  }, [isMapReady, recenter, setCurrentLocation]);

  // --------------------------------------------------
  // Notifications
  // --------------------------------------------------

  const handleNotificationsPress = useCallback(() => {
    Alert.alert(
      "Notifications",
      "The notifications screen will be available in a later milestone.",
    );
  }, []);

  // --------------------------------------------------
  // Destination search
  // --------------------------------------------------

  const handleDestinationPress = useCallback(() => {
    Alert.alert(
      "Destination search",
      "Destination search will be implemented in R09.",
    );
  }, []);

  // --------------------------------------------------
  // Saved place selection
  // --------------------------------------------------

  const handleSavedPlacePress = useCallback(
    (type: SavedPlaceType) => {
      const place = type === "home" ? home : work;

      const title = type === "home" ? "Home" : "Work";

      if (!place) {
        Alert.alert(
          `Add ${title}`,
          "Address search will be available in the destination search milestone.",
        );

        return;
      }

      Alert.alert(title, place.address);
    },
    [home, work],
  );

  // --------------------------------------------------
  // Saved place removal
  // --------------------------------------------------

  const handleSavedPlaceLongPress = useCallback(
    (type: SavedPlaceType) => {
      const place = type === "home" ? home : work;

      if (!place) {
        return;
      }

      Alert.alert("Remove saved place?", place.address, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",

          onPress: () => {
            try {
              removePlace(type);
            } catch {
              Alert.alert("Unable to remove saved place", "Please try again.");
            }
          },
        },
      ]);
    },
    [home, work, removePlace],
  );

  // --------------------------------------------------
  // Location settings
  // --------------------------------------------------

  const handleOpenSettings = useCallback(async () => {
    try {
      await locationService.openSettings();
    } catch {
      Alert.alert(
        "Unable to open settings",
        "Please open your device settings manually.",
      );
    }
  }, []);

  // --------------------------------------------------
  // Derived state
  // --------------------------------------------------

  const displayError = locationError ?? trackingError;

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Screen edges={["top"]}>
      <View
        className="relative flex-1"
        onLayout={(event) => {
          setContainerHeight(event.nativeEvent.layout.height);
        }}
      >
        {/* Full-screen map */}
        <View style={StyleSheet.absoluteFill}>
          <RidevoMap
            ref={mapRef}
            styleURL={MAP_STYLES.streets}
            onReadyChange={setIsMapReady}
          />
        </View>

        {/* Floating header */}
        <HomeHeader onNotificationsPress={handleNotificationsPress} />

        {/* Location error */}
        {displayError && (
          <View
            className="absolute left-4 right-4 top-28 rounded-2xl border border-border bg-white p-4"
            style={styles.errorContainer}
          >
            <Typography variant="small" className="text-muted">
              {displayError}
            </Typography>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open location settings"
              onPress={handleOpenSettings}
              className="mt-3 min-h-12 self-start justify-center"
            >
              <Typography variant="bodyMedium">Open settings</Typography>
            </Pressable>
          </View>
        )}

        {/* Development diagnostics */}
        {__DEV__ && !displayError && (
          <MapDebugOverlay
            isMapReady={isMapReady}
            isTracking={isTracking}
            isFetchingDrivers={isFetchingDrivers}
            driverCount={drivers.length}
            locationAccuracy={location?.accuracy ?? null}
            lastUpdatedAt={lastUpdatedAt}
          />
        )}

        {__DEV__ && isHistoryReady && (
          <Pressable
            onPress={() => {
              recordDestination({
                id: "test-ikeja-city-mall",
                name: "Ikeja City Mall",
                address: "Obafemi Awolowo Way, Ikeja",
                coordinates: {
                  latitude: 6.614,
                  longitude: 3.358,
                },
                provider: "manual",
              });

              recordDestination({
                id: "test-landmark-centre",
                name: "Landmark Centre",
                address: "Victoria Island, Lagos",
                coordinates: {
                  latitude: 6.423,
                  longitude: 3.444,
                },
                provider: "manual",
              });
            }}
            className="absolute right-4 top-28 rounded-full bg-primary px-4 py-3"
            style={{ zIndex: 20 }}
          >
            <Typography variant="caption" className="text-white">
              Seed history
            </Typography>
          </Pressable>
        )}

        {/* Animated recenter button */}
        {containerHeight > 0 && (
          <Animated.View
            pointerEvents="box-none"
            style={[styles.recenterContainer, recenterAnimatedStyle]}
          >
            <RecenterButton
              onPress={handleRecenter}
              loading={isLocating}
              disabled={!isMapReady}
            />
          </Animated.View>
        )}

        {/* Persistent booking bottom sheet */}
        {containerHeight > 0 && (
          <BookingBottomSheet
            ref={bottomSheetRef}
            firstName={firstName}
            animatedPosition={animatedSheetPosition}
            home={home}
            work={work}
            areSavedPlacesReady={areSavedPlacesReady}
            recentDestinations={previewDestinations}
            recentDestinationsError={recentDestinationsError}
            onRetryRecentDestinations={() => {
              void retryRecentDestinations();
            }}
            onDestinationPress={handleDestinationPress}
            onSavedPlacePress={handleSavedPlacePress}
            onSavedPlaceLongPress={handleSavedPlaceLongPress}
            onRecentDestinationPress={handleRecentDestinationPress}
            onRecentDestinationLongPress={handleRecentDestinationLongPress}
            onClearRecentDestinations={handleClearRecentDestinations}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    zIndex: 11,
    elevation: 4,
  },

  recenterContainer: {
    position: "absolute",
    top: 0,
    right: HOME_CONFIG.map.recenterSpacing,
    zIndex: 5,
  },
});
