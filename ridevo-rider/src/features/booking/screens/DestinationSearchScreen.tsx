import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";

import {
  ArrowLeft,
  BriefcaseBusiness,
  History,
  House,
  MapPin,
  Search,
  X,
} from "lucide-react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { Screen } from "@/components/layout/Screen";

import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useSavedPlaces } from "@/features/places/hooks/useSavedPlaces";

import { useRecentDestinations } from "@/features/places/hooks/useRecentDestinations";

import { usePlaceSearch } from "@/features/places/hooks/usePlaceSearch";

import { PlaceSearchResult } from "@/features/places/components/PlaceSearchResult";

import { SEARCH_CONFIG } from "@/features/places/constants/search.constants";

import type { Place } from "@/features/places/types/place.types";

import { useBookingStore } from "../stores/booking.store";

import { BOOKING_CONFIG } from "../constants/booking.constants";

import type {
  DestinationSearchMode,
  DestinationSource,
} from "../types/booking.types";

interface DestinationSearchScreenProps {
  mode: DestinationSearchMode;
}

const MODE_CONFIG = {
  destination: {
    title: "Plan your ride",
    placeholder: "Where are you going?",
  },

  pickup: {
    title: "Choose pickup",
    placeholder: "Enter pickup address",
  },

  "save-home": {
    title: "Add home",
    placeholder: "Enter your home address",
  },

  "save-work": {
    title: "Add work",
    placeholder: "Enter your work address",
  },
} satisfies Record<
  DestinationSearchMode,
  {
    title: string;
    placeholder: string;
  }
>;

export function DestinationSearchScreen({
  mode,
}: DestinationSearchScreenProps) {
  const router = useRouter();

  const inputRef = useRef<TextInput>(null);

  const selectionLock = useRef(false);

  const [query, setQuery] = useState("");

  const [isSelecting, setIsSelecting] = useState(false);

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const {
    home,
    work,
    savePlace,
    isReady: areSavedPlacesReady,
  } = useSavedPlaces();

  const {
    destinations,
    recordDestination,
    isReady: isHistoryReady,
  } = useRecentDestinations();

  const isSaveMode = mode === "save-home" || mode === "save-work";

  const permanentSearch =
    SEARCH_CONFIG.permanentGeocoding && (isSaveMode || mode === "destination");

  const {
    results,
    isLoading,
    isFetching,
    isOffline,
    isEmpty,
    error,
    hasMinimumLength,
    retry,
  } = usePlaceSearch(query, {
    enabled: !isSelecting,
    permanent: permanentSearch,
  });

  const config = MODE_CONFIG[mode];

  const pickupLabel =
    draft?.pickup?.address ??
    (draft?.pickup?.source === "gps"
      ? "Current location"
      : "Pickup not selected");

  useFocusEffect(
    useCallback(() => {
      selectionLock.current = false;

      setIsSelecting(false);
    }, []),
  );

  const handleBack = useCallback(() => {
    Keyboard.dismiss();

    if (router.canGoBack()) {
      router.back();

      return;
    }

    router.replace("/(tabs)");
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setQuery("");

    inputRef.current?.focus();
  }, []);

  const handleSelectPlace = useCallback(
    (place: Place, source: DestinationSource = "search") => {
      if (selectionLock.current) {
        return;
      }

      selectionLock.current = true;

      setIsSelecting(true);

      Keyboard.dismiss();

      try {
        const auth = useAuthStore.getState();

        const currentUserId = auth.session?.user.id;

        if (
          auth.status !== "authenticated" ||
          !currentUserId ||
          currentUserId !== userId
        ) {
          throw new Error("Your session is no longer available.");
        }

        if (isSaveMode) {
          if (!permanentSearch) {
            throw new Error(
              "Permanent address storage must be enabled before saving Mapbox addresses.",
            );
          }

          if (!areSavedPlacesReady) {
            throw new Error("Saved places are not ready.");
          }

          savePlace({
            type: mode === "save-home" ? "home" : "work",

            place,
          });

          handleBack();

          return;
        }

        const booking = useBookingStore.getState();

        if (mode === "pickup") {
          booking.setPickup(currentUserId, {
            coordinates: place.coordinates,

            name: place.name,

            address: place.address,

            source: "search",

            accuracy: null,

            capturedAt: Date.now(),
          });

          handleBack();

          return;
        }

        booking.setDestination(currentUserId, {
          ...place,
          source,
        });

        // Only persist newly searched Mapbox
        // results when permanent geocoding
        // is explicitly enabled.
        const canRecord =
          source === "search" ? permanentSearch : place.provider === "manual";

        if (isHistoryReady && canRecord) {
          try {
            recordDestination(place);
          } catch (cause) {
            if (__DEV__) {
              console.warn("[Ridevo] Unable to record destination:", cause);
            }
          }
        }

        router.push(BOOKING_CONFIG.routes.confirmPickup);
      } catch (cause) {
        selectionLock.current = false;

        setIsSelecting(false);

        Alert.alert(
          "Unable to select address",

          cause instanceof Error ? cause.message : "Please try again.",
        );
      }
    },
    [
      userId,
      mode,
      isSaveMode,
      permanentSearch,
      areSavedPlacesReady,
      isHistoryReady,
      savePlace,
      recordDestination,
      handleBack,
      router,
    ],
  );

  const handleSearchResultPress = useCallback(
    (place: Place) => {
      handleSelectPlace(place, "search");
    },
    [handleSelectPlace],
  );

  const handleChangePickup = useCallback(() => {
    router.push({
      pathname: BOOKING_CONFIG.routes.destinationSearch,

      params: {
        mode: "pickup",
      },
    });
  }, [router]);

  const showShortcuts = query.trim().length === 0 && mode === "destination";

  return (
    <Screen>
      <View className="flex-1">
        {/* Header */}

        <View className="flex-row items-center gap-3 px-6 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            className="h-12 w-12 items-center justify-center rounded-full bg-surface active:opacity-70"
          >
            <ArrowLeft size={24} color="#101820" strokeWidth={1.8} />
          </Pressable>

          <Typography variant="h2" className="flex-1">
            {config.title}
          </Typography>
        </View>

        {/* Search controls */}

        <View className="mt-6 gap-3 px-6">
          {mode === "destination" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Pickup: ${pickupLabel}`}
              accessibilityHint="Change pickup address"
              onPress={handleChangePickup}
              className="min-h-14 flex-row items-center rounded-2xl bg-surface px-4 active:opacity-70"
            >
              <View className="h-3 w-3 rounded-full bg-info" />

              <Typography
                variant="bodyMedium"
                className="ml-3 flex-1"
                numberOfLines={1}
              >
                {pickupLabel}
              </Typography>
            </Pressable>
          )}

          <View className="min-h-14 flex-row items-center rounded-2xl border border-primary px-4">
            <Search size={21} color="#667085" strokeWidth={1.8} />

            <TextInput
              ref={inputRef}
              accessibilityLabel={config.placeholder}
              value={query}
              onChangeText={setQuery}
              placeholder={config.placeholder}
              placeholderTextColor="#98A2B3"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              maxLength={SEARCH_CONFIG.maximumQueryLength}
              editable={!isSelecting}
              className="ml-3 min-h-14 flex-1 font-inter-regular text-base text-primary"
            />

            {query.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                disabled={isSelecting}
                onPress={handleClearSearch}
                className="h-12 w-12 items-center justify-center"
              >
                <X size={20} color="#667085" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search content */}

        <FlatList
          data={results}
          keyExtractor={(item) => `${item.provider}:${item.id}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          renderItem={({ item }) => (
            <PlaceSearchResult
              place={item}
              disabled={isSelecting}
              onPress={handleSearchResultPress}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="ml-15 h-px bg-border" />
          )}
          ListHeaderComponent={
            <View>
              {isSaveMode && !permanentSearch && (
                <View className="mb-4 rounded-2xl bg-surface p-4">
                  <Typography variant="small" className="text-muted">
                    Permanent address storage is currently unavailable.
                  </Typography>
                </View>
              )}

              {showShortcuts && (
                <View>
                  <Typography variant="bodyMedium">Saved places</Typography>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select home"
                    disabled={!home || !areSavedPlacesReady || isSelecting}
                    onPress={() => {
                      if (home) {
                        handleSelectPlace(home, "saved_place");
                      }
                    }}
                    className="min-h-[72px] flex-row items-center gap-3"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
                      <House size={22} color="#101820" />
                    </View>

                    <View className="flex-1">
                      <Typography variant="bodyMedium">Home</Typography>

                      <Typography
                        variant="small"
                        className="text-muted"
                        numberOfLines={1}
                      >
                        {home?.address ?? "Not configured"}
                      </Typography>
                    </View>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select work"
                    disabled={!work || !areSavedPlacesReady || isSelecting}
                    onPress={() => {
                      if (work) {
                        handleSelectPlace(work, "saved_place");
                      }
                    }}
                    className="min-h-[72px] flex-row items-center gap-3"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
                      <BriefcaseBusiness size={22} color="#101820" />
                    </View>

                    <View className="flex-1">
                      <Typography variant="bodyMedium">Work</Typography>

                      <Typography
                        variant="small"
                        className="text-muted"
                        numberOfLines={1}
                      >
                        {work?.address ?? "Not configured"}
                      </Typography>
                    </View>
                  </Pressable>

                  {destinations.length > 0 && (
                    <View className="mt-5">
                      <View className="flex-row items-center gap-2">
                        <History size={18} color="#667085" />

                        <Typography variant="bodyMedium">
                          Recent destinations
                        </Typography>
                      </View>

                      {destinations.map((destination) => (
                        <PlaceSearchResult
                          key={`${destination.provider}:${destination.id}`}
                          place={destination}
                          disabled={isSelecting}
                          onPress={(place) =>
                            handleSelectPlace(place, "recent_destination")
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {isOffline ? (
                <View className="items-center py-12">
                  <Typography variant="bodyMedium">
                    No internet connection
                  </Typography>

                  <Typography
                    variant="small"
                    className="mt-2 text-center text-muted"
                  >
                    Connect to the internet to search for addresses.
                  </Typography>
                </View>
              ) : isLoading || isFetching ? (
                <View
                  accessible
                  accessibilityLabel="Searching addresses"
                  accessibilityLiveRegion="polite"
                  className="flex-row items-center justify-center gap-3 py-8"
                >
                  <ActivityIndicator color="#101820" />

                  <Typography variant="small" className="text-muted">
                    Searching addresses...
                  </Typography>
                </View>
              ) : error ? (
                <View className="items-center rounded-2xl bg-surface p-6">
                  <Typography variant="bodyMedium">
                    Search unavailable
                  </Typography>

                  <Typography
                    variant="small"
                    className="mt-2 text-center text-muted"
                  >
                    {error.message}
                  </Typography>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      void retry();
                    }}
                    className="mt-4 min-h-12 justify-center rounded-full bg-accent px-6"
                  >
                    <Typography variant="bodyMedium">Try again</Typography>
                  </Pressable>
                </View>
              ) : isEmpty ? (
                <View
                  accessibilityLiveRegion="polite"
                  className="items-center py-12"
                >
                  <MapPin size={36} color="#98A2B3" />

                  <Typography variant="bodyMedium" className="mt-4">
                    No addresses found
                  </Typography>

                  <Typography
                    variant="small"
                    className="mt-2 text-center text-muted"
                  >
                    Try a different street, neighborhood or city.
                  </Typography>
                </View>
              ) : !hasMinimumLength && !showShortcuts ? (
                <Typography variant="small" className="text-muted">
                  Enter at least three characters to search.
                </Typography>
              ) : null}

              {results.length > 0 && (
                <Typography variant="caption" className="mb-2 text-muted">
                  Search results
                </Typography>
              )}
            </View>
          }
        />
      </View>
    </Screen>
  );
}
