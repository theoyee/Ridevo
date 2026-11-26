import { Redirect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { useBookingStore } from "@/features/booking/stores/booking.store";

import { PaymentSelectionScreen } from "@/features/booking/screens/PaymentSelectionScreen";

export default function PaymentSelectionPage() {
  const userId = useAuthStore((state) => state.session?.user.id);

  const draft = useBookingStore((state) => state.draft);

  if (!userId || !draft || draft.userId !== userId || !draft.destination) {
    return <Redirect href="/(tabs)" />;
  }

  if (!draft.pickup || !draft.pickupConfirmed) {
    return <Redirect href="/(booking)/confirm-pickup" />;
  }

  if (!draft.destinationConfirmed) {
    return <Redirect href="/(booking)/confirm-destination" />;
  }

  if (!draft.selectedVehicle) {
    return <Redirect href="/(booking)/vehicle-selection" />;
  }

  return <PaymentSelectionScreen />;
}
