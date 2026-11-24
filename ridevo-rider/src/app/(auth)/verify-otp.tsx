import { Redirect } from "expo-router";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function VerifyOtpRoute() {
  const challenge = useAuthStore((state) => state.challenge);

  if (!challenge) {
    return <Redirect href="/(auth)/phone" />;
  }

  return (
    <Screen className="px-6 pt-8">
      <Typography variant="h1">Verify your number</Typography>

      <Typography variant="body" className="mt-3 text-muted">
        Enter the verification code sent to {challenge.phone}.
      </Typography>

      <Typography variant="small" className="mt-6 text-muted">
        Development mode — SMS delivery is simulated.
      </Typography>
    </Screen>
  );
}
