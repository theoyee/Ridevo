import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, Pressable, StyleSheet, View } from "react-native";

import Animated from "react-native-reanimated";

import type BottomSheet from "@gorhom/bottom-sheet";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingNavigation } from "@/features/booking/hooks/useBookingNavigation";

import { useNearbyDrivers } from "@/features/drivers/hooks/useNearbyDrivers";

import { locationService } from "@/features/location/services/location.service";

import { useLocationStore } from "@/features/location/stores/location.store";

import {
  isLocationFresh,
  isValidCoordinates,
  toMapboxCoordinates,
} from "@/features/location/utils/location.utils";

import { MapDebugOverlay } from "@/features/map/components/MapDebugOverlay";
import { RecenterButton } from "@/features/map/components/RecenterButton";
import { RidevoMap } from "@/features/map/components/RidevoMap";

import { MAP_STYLES } from "@/features/map/constants/map.constants";

import { useMapCamera } from "@/features/map/hooks/useMapCamera";
import { useMapLocation } from "@/features/map/hooks/useMapLocation";
import { useNearbyDriverMarkers } from "@/features/map/hooks/useNearbyDriverMarkers";

import type { MapController } from "@/features/map/types/map-bridge.types";

import { useRecentDestinations } from "@/features/places/hooks/useRecentDestinations";
import { useSavedPlaces } from "@/features/places/hooks/useSavedPlaces";

import type {
  RecentDestination,
  SavedPlaceType,
} from "@/features/places/types/place.types";

import { BookingBottomSheet } from "../components/BookingBottomSheet";
import { HomeHeader } from "../components/HomeHeader";

import { HOME_CONFIG } from "../constants/home.constants";

import { useHomeMapLayout } from "../hooks/useHomeMapLayout";

export function HomeScreen() {
  // --------------------------------------------------
  // References
  // --------------------------------------------------

  const mapRef = useRef<MapController>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const recenterLock = useRef(false);

  // --------------------------------------------------
  // Component state
  // --------------------------------------------------

  const [isMapReady, setIsMapReady] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [locationError, setLocationError] = useState<string | null>(null);

  // --------------------------------------------------
  // Authenticated rider
  // --------------------------------------------------

  const firstName = useAuthStore((state) => state.session?.user.firstName);

  // --------------------------------------------------
  // Responsive map and bottom sheet layout
  // --------------------------------------------------

  const {
    isLayoutReady,
    snapPoints,
    initialSheetIndex,
    animatedSheetPosition,
    recenterAnimatedStyle,
    canShowRecenter,
    handleContainerLayout,
    handleSheetChange,
  } = useHomeMapLayout({
    mapRef,
    isMapReady,
  });

  // --------------------------------------------------
  // Booking navigation
  // --------------------------------------------------

  const { openDestinationSearch, selectDestination, openSavedPlaceSearch } =
    useBookingNavigation();

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

  // --------------------------------------------------
  // Recent destinations
  // --------------------------------------------------

  const {
    previewDestinations,
    error: recentDestinationsError,
    retry: retryRecentDestinations,
    removeDestination,
    clearDestinations,
  } = useRecentDestinations();

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
  // Synchronize nearby driver markers
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
  // Development diagnostics
  // --------------------------------------------------

  useEffect(() => {
    if (__DEV__ && driverError) {
      console.warn("[Ridevo] Nearby drivers:", driverError.message);
    }
  }, [driverError]);

  // --------------------------------------------------
  // Recenter map camera
  // --------------------------------------------------

  const handleRecenter = useCallback(async () => {
    if (recenterLock.current || !isMapReady) {
      return;
    }

    setLocationError(null);

    // Reuse an existing fresh GPS location.
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

      const permission = await locationService.getPermission();

      if (!permission.granted) {
        throw new Error("Location permission is required.");
      }

      // Synchronize the shared location store.
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
  // Start a new booking
  // --------------------------------------------------

  const handleDestinationPress = useCallback(() => {
    try {
      openDestinationSearch();
    } catch (cause) {
      Alert.alert(
        "Unable to start booking",
        cause instanceof Error ? cause.message : "Please try again.",
      );
    }
  }, [openDestinationSearch]);

  // --------------------------------------------------
  // Saved place selection
  // --------------------------------------------------

  const handleSavedPlacePress = useCallback(
    (type: SavedPlaceType) => {
      const place = type === "home" ? home : work;

      try {
        // No saved address: open address configuration.
        if (!place) {
          openSavedPlaceSearch(type);

          return;
        }

        // Existing address: start booking directly.
        selectDestination(place, "saved_place");
      } catch (cause) {
        Alert.alert(
          "Unable to select saved place",
          cause instanceof Error ? cause.message : "Please try again.",
        );
      }
    },
    [home, work, openSavedPlaceSearch, selectDestination],
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
  // Recent destination selection
  // --------------------------------------------------

  const handleRecentDestinationPress = useCallback(
    (destination: RecentDestination) => {
      try {
        selectDestination(destination, "recent_destination");
      } catch (cause) {
        Alert.alert(
          "Unable to select destination",
          cause instanceof Error ? cause.message : "Please try again.",
        );
      }
    },
    [selectDestination],
  );

  // --------------------------------------------------
  // Remove individual recent destination
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Clear recent destination history
  // --------------------------------------------------

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
  // Retry destination history hydration
  // --------------------------------------------------

  const handleRetryRecentDestinations = useCallback(() => {
    void retryRecentDestinations();
  }, [retryRecentDestinations]);

  // --------------------------------------------------
  // Open device settings
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
      <View className="relative flex-1" onLayout={handleContainerLayout}>
        {/* Full-screen Mapbox renderer */}

        <View style={StyleSheet.absoluteFill}>
          <RidevoMap
            ref={mapRef}
            styleURL={MAP_STYLES.streets}
            onReadyChange={setIsMapReady}
          />
        </View>

        {/* Floating home header */}

        <HomeHeader onNotificationsPress={handleNotificationsPress} />

        {/* Location error and recovery */}

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

        {/* Development-only map diagnostics */}

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

        {/* Animated recenter control */}

        {isLayoutReady && (
          <Animated.View
            pointerEvents={canShowRecenter ? "box-none" : "none"}
            accessibilityElementsHidden={!canShowRecenter}
            importantForAccessibility={
              canShowRecenter ? "auto" : "no-hide-descendants"
            }
            style={[styles.recenterContainer, recenterAnimatedStyle]}
          >
            <RecenterButton
              onPress={handleRecenter}
              loading={isLocating}
              disabled={!isMapReady || !canShowRecenter}
            />
          </Animated.View>
        )}

        {/* Responsive booking bottom sheet */}

        {isLayoutReady && (
          <BookingBottomSheet
            ref={bottomSheetRef}
            firstName={firstName}
            snapPoints={snapPoints}
            initialIndex={initialSheetIndex}
            animatedPosition={animatedSheetPosition}
            home={home}
            work={work}
            areSavedPlacesReady={areSavedPlacesReady}
            recentDestinations={previewDestinations}
            recentDestinationsError={recentDestinationsError}
            onRetryRecentDestinations={handleRetryRecentDestinations}
            onDestinationPress={handleDestinationPress}
            onSavedPlacePress={handleSavedPlacePress}
            onSavedPlaceLongPress={handleSavedPlaceLongPress}
            onRecentDestinationPress={handleRecentDestinationPress}
            onRecentDestinationLongPress={handleRecentDestinationLongPress}
            onClearRecentDestinations={handleClearRecentDestinations}
            onChange={handleSheetChange}
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
