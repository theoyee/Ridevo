import { memo, type Ref } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import type { SharedValue } from "react-native-reanimated";

import { Typography } from "@/components/ui/Typography";

import type {
  RecentDestination,
  SavedPlace,
  SavedPlaceType,
} from "@/features/places/types/place.types";

import { DestinationSearchButton } from "./DestinationSearchButton";

import { SavedPlaceCard } from "./SavedPlaceCard";

import { RecentDestinations } from "./RecentDestinations";

import { HOME_CONFIG } from "../constants/home.constants";

interface BookingBottomSheetProps {
  ref?: Ref<BottomSheet>;

  firstName?: string | null;

  animatedPosition: SharedValue<number>;

  home: SavedPlace | null;

  work: SavedPlace | null;

  areSavedPlacesReady: boolean;

  recentDestinations: RecentDestination[];

  recentDestinationsError: string | null;

  onRetryRecentDestinations: () => void;

  onDestinationPress: () => void;

  onSavedPlacePress: (type: SavedPlaceType) => void;

  onSavedPlaceLongPress?: (type: SavedPlaceType) => void;

  onRecentDestinationPress: (destination: RecentDestination) => void;

  onRecentDestinationLongPress: (destination: RecentDestination) => void;

  onClearRecentDestinations: () => void;

  onChange?: (index: number) => void;

  snapPoints: number[];

  initialIndex: number;

  // containerHeight: number;
}

export const BookingBottomSheet = memo(function BookingBottomSheet({
  ref,
  firstName,
  animatedPosition,
  home,
  work,
  areSavedPlacesReady,
  recentDestinations,
  recentDestinationsError,
  onRetryRecentDestinations,
  onDestinationPress,
  onSavedPlacePress,
  onSavedPlaceLongPress,
  onRecentDestinationPress,
  onRecentDestinationLongPress,
  onClearRecentDestinations,
  onChange,

  snapPoints,
  initialIndex,
}: BookingBottomSheetProps) {
  // const snapPoints = useMemo(() => [...HOME_CONFIG.sheet.snapPoints], []);

  return (
    <BottomSheet
      ref={ref}
      index={initialIndex}
      snapPoints={snapPoints}
      animatedPosition={animatedPosition}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      enableOverDrag={false}
      enableHandlePanningGesture
      enableContentPanningGesture
      animateOnMount
      onChange={onChange}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
      style={styles.sheet}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Greeting */}
        <View>
          <Typography variant="small" className="text-muted">
            {firstName
              ? `Welcome, ${firstName}`
              : "Your next journey starts here"}
          </Typography>

          <Typography variant="h1" className="mt-1">
            Where to?
          </Typography>
        </View>

        {/* Destination search */}
        <View className="mt-5">
          <DestinationSearchButton onPress={onDestinationPress} />
        </View>

        {/* Saved places */}
        <View className="mt-4 flex-row gap-3">
          <SavedPlaceCard
            type="home"
            place={home}
            disabled={!areSavedPlacesReady}
            onPress={() => onSavedPlacePress("home")}
            onLongPress={
              onSavedPlaceLongPress
                ? () => onSavedPlaceLongPress("home")
                : undefined
            }
          />

          <SavedPlaceCard
            type="work"
            place={work}
            disabled={!areSavedPlacesReady}
            onPress={() => onSavedPlacePress("work")}
            onLongPress={
              onSavedPlaceLongPress
                ? () => onSavedPlaceLongPress("work")
                : undefined
            }
          />
        </View>

        {/* History recovery */}
        {recentDestinationsError && (
          <View className="mt-5 rounded-2xl bg-surface p-4">
            <Typography variant="small" className="text-muted">
              Unable to load recent destinations.
            </Typography>

            <Pressable
              accessibilityRole="button"
              onPress={onRetryRecentDestinations}
              className="mt-2 min-h-12 self-start justify-center"
            >
              <Typography variant="bodyMedium">Try again</Typography>
            </Pressable>
          </View>
        )}

        {/* Recent destinations */}
        {recentDestinations.length > 0 && (
          <View className="mt-4">
            <RecentDestinations
              destinations={recentDestinations}
              onDestinationPress={onRecentDestinationPress}
              onDestinationLongPress={onRecentDestinationLongPress}
              onClearPress={onClearRecentDestinations}
            />
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheet: {
    elevation: 12,
    shadowColor: "#101820",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },

  background: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: HOME_CONFIG.sheet.borderRadius,

    borderTopRightRadius: HOME_CONFIG.sheet.borderRadius,
  },

  handle: {
    paddingTop: 12,
    paddingBottom: 10,
  },

  handleIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D5DD",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
