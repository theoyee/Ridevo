import { Redirect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { ConfirmPickupScreen } from "@/features/booking/screens/ConfirmPickupScreen";

import { useBookingStore } from "@/features/booking/stores/booking.store";

export default function ConfirmPickupPage() {
  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) => state.draft);

  if (!userId || draft?.userId !== userId || !draft.destination) {
    return <Redirect href="/(tabs)" />;
  }

  return <ConfirmPickupScreen />;
}
