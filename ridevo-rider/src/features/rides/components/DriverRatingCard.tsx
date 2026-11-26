import { useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Star } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import { rideService } from "../services/ride.service";

import { useActiveRideStore } from "../stores/active-ride.store";

import type { Ride } from "../types/ride.types";

const RATING_LABELS = [
  "Select a rating",
  "Very poor",
  "Poor",
  "Okay",
  "Good",
  "Excellent",
];

interface DriverRatingCardProps {
  ride: Ride;
}

export function DriverRatingCard({ ride }: DriverRatingCardProps) {
  const [stars, setStars] = useState(0);

  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionLock = useRef(false);

  const submittedRating = ride.rating;

  const selectedStars = submittedRating?.stars ?? stars;

  async function handleSubmit() {
    if (submissionLock.current || stars < 1 || submittedRating) {
      return;
    }

    submissionLock.current = true;

    setIsSubmitting(true);

    try {
      const updatedRide = await rideService.rateRide({
        rideId: ride.id,

        stars,

        comment: comment.trim(),
      });

      useActiveRideStore.getState().setRide(updatedRide);
    } catch (cause) {
      Alert.alert(
        "Unable to submit rating",

        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      submissionLock.current = false;

      setIsSubmitting(false);
    }
  }

  return (
    <View className="items-center gap-4 rounded-3xl border border-border p-5">
      <Typography variant="h2" className="text-center">
        {submittedRating ? "Thanks for your feedback" : "How was your ride?"}
      </Typography>

      <Typography variant="small" className="text-center text-muted">
        Rate your experience with {ride.driver?.firstName ?? "your driver"}.
      </Typography>

      <View className="flex-row justify-center">
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = value <= selectedStars;

          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${value} out of 5 stars`}
              accessibilityState={{
                selected: selectedStars === value,
                disabled: Boolean(submittedRating) || isSubmitting,
              }}
              disabled={Boolean(submittedRating) || isSubmitting}
              onPress={() => setStars(value)}
              className="h-12 w-12 items-center justify-center"
            >
              <Star
                size={30}
                color={selected ? "#D97706" : "#98A2B3"}
                fill={selected ? "#FBBF24" : "transparent"}
                strokeWidth={1.6}
              />
            </Pressable>
          );
        })}
      </View>

      <Typography variant="bodyMedium">
        {RATING_LABELS[selectedStars]}
      </Typography>

      {!submittedRating && (
        <>
          <TextInput
            accessibilityLabel="Optional driver feedback"
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience (optional)"
            placeholderTextColor="#98A2B3"
            multiline
            maxLength={500}
            editable={!isSubmitting}
            textAlignVertical="top"
            className="min-h-[100px] w-full rounded-xl border border-border p-4 text-base text-primary"
          />

          <Pressable
            accessibilityRole="button"
            disabled={stars === 0 || isSubmitting}
            onPress={() => void handleSubmit()}
            className="min-h-14 w-full flex-row items-center justify-center gap-2 rounded-full bg-accent disabled:opacity-50"
          >
            {isSubmitting && <ActivityIndicator color="#101820" />}

            <Typography variant="bodyMedium">
              {isSubmitting ? "Submitting..." : "Submit rating"}
            </Typography>
          </Pressable>
        </>
      )}
    </View>
  );
}
