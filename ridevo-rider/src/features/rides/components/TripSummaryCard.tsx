import { View } from "react-native";

import { Banknote, CheckCircle2, Clock3, Receipt } from "lucide-react-native";

import { Typography } from "@/components/ui/Typography";

import { formatFare } from "@/features/booking/utils/fare.utils";

import type { Ride } from "../types/ride.types";

interface TripSummaryCardProps {
  ride: Ride;
}

export function TripSummaryCard({ ride }: TripSummaryCardProps) {
  const fare = ride.finalFareMinor ?? ride.estimatedFareMinor;

  const isPaid = ride.paymentStatus === "paid";

  const durationSeconds =
    ride.startedAt !== null && ride.completedAt !== null
      ? Math.max(0, Math.floor((ride.completedAt - ride.startedAt) / 1000))
      : null;

  return (
    <View className="gap-5 rounded-3xl border border-border p-5">
      <View className="flex-row items-center gap-3">
        <Receipt size={24} color="#101820" />

        <Typography variant="h3">Trip summary</Typography>
      </View>

      <View className="items-center gap-2 rounded-2xl bg-surface p-5">
        <Typography variant="small" className="text-muted">
          Total fare
        </Typography>

        <Typography variant="display">{formatFare(fare)}</Typography>
      </View>

      <View className="flex-row items-center gap-3">
        <Banknote size={22} color="#667085" />

        <Typography variant="bodyMedium" className="flex-1">
          Cash payment
        </Typography>

        <Typography variant="bodyMedium">{formatFare(fare)}</Typography>
      </View>

      {durationSeconds !== null && (
        <View className="flex-row items-center gap-3">
          <Clock3 size={22} color="#667085" />

          <Typography variant="small" className="flex-1 text-muted">
            Simulated trip duration
          </Typography>

          <Typography variant="bodyMedium">{durationSeconds}s</Typography>
        </View>
      )}

      <View className="h-px bg-border" />

      <View className="flex-row items-center gap-2">
        {isPaid ? (
          <CheckCircle2 size={20} color="#15803D" />
        ) : (
          <Clock3 size={20} color="#D97706" />
        )}

        <Typography
          variant="bodyMedium"
          className={isPaid ? "text-success" : "text-warning"}
        >
          {isPaid ? "Payment confirmed" : "Awaiting cash payment confirmation"}
        </Typography>
      </View>
    </View>
  );
}
