import { Redirect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingStore } from "@/features/booking/stores/booking.store";

import { ConfirmDestinationScreen } from "@/features/booking/screens/ConfirmDestinationScreen";

export default function ConfirmDestinationPage() {
  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) => state.draft);

  if (!userId || !draft || draft.userId !== userId || !draft.destination) {
    return <Redirect href="/(tabs)" />;
  }

  if (!draft.pickup || !draft.pickupConfirmed) {
    return <Redirect href="/(booking)/confirm-pickup" />;
  }

  return <ConfirmDestinationScreen />;
}
