import { Redirect, useLocalSearchParams } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { DestinationSearchScreen } from "@/features/booking/screens/DestinationSearchScreen";

import { destinationSearchModeSchema } from "@/features/booking/schemas/booking.schema";

import { useBookingStore } from "@/features/booking/stores/booking.store";

export default function DestinationSearchPage() {
  const { mode } = useLocalSearchParams<{
    mode?: string;
  }>();

  const result = destinationSearchModeSchema.safeParse(mode);

  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) => state.draft);

  if (!result.success) {
    return <Redirect href="/(tabs)" />;
  }

  const requiresBooking =
    result.data === "destination" || result.data === "pickup";

  if (requiresBooking && (!userId || draft?.userId !== userId)) {
    return <Redirect href="/(tabs)" />;
  }

  return <DestinationSearchScreen key={result.data} mode={result.data} />;
}
