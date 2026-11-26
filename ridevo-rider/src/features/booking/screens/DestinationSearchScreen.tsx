import { useState } from "react";

import { Pressable, TextInput, View } from "react-native";

import { ArrowLeft, Search } from "lucide-react-native";

import { useRouter } from "expo-router";

import { Screen } from "@/components/layout/Screen";

import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingStore } from "../stores/booking.store";

import type { DestinationSearchMode } from "../types/booking.types";

interface DestinationSearchScreenProps {
  mode: DestinationSearchMode;
}

const SEARCH_CONFIG = {
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

  const [query, setQuery] = useState("");

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) =>
    userId && state.draft?.userId === userId ? state.draft : null,
  );

  const config = SEARCH_CONFIG[mode];

  const pickupLabel =
    draft?.pickup?.address ??
    (draft?.pickup?.source === "gps"
      ? "Current location"
      : "Pickup not selected");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();

      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <Screen>
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            className="h-12 w-12 items-center justify-center rounded-full bg-surface active:opacity-70"
          >
            <ArrowLeft size={24} color="#101820" strokeWidth={1.8} />
          </Pressable>

          <Typography variant="h2">{config.title}</Typography>
        </View>

        <View className="mt-8 gap-3">
          {mode === "destination" && (
            <View className="min-h-14 flex-row items-center rounded-2xl bg-surface px-4">
              <View className="h-3 w-3 rounded-full bg-info" />

              <Typography
                variant="bodyMedium"
                className="ml-3 flex-1"
                numberOfLines={1}
              >
                {pickupLabel}
              </Typography>
            </View>
          )}

          <View className="min-h-14 flex-row items-center rounded-2xl border border-primary px-4">
            <Search size={21} color="#667085" strokeWidth={1.8} />

            <TextInput
              accessibilityLabel={config.placeholder}
              value={query}
              onChangeText={setQuery}
              placeholder={config.placeholder}
              placeholderTextColor="#98A2B3"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              maxLength={200}
              className="ml-3 min-h-14 flex-1 text-base text-primary"
            />
          </View>
        </View>

        <View className="mt-8 items-center rounded-2xl bg-surface p-6">
          <Typography variant="bodyMedium">Address search</Typography>

          <Typography variant="small" className="mt-2 text-center text-muted">
            Address search and suggestions will be available in the next
            milestone.
          </Typography>
        </View>
      </View>
    </Screen>
  );
}
