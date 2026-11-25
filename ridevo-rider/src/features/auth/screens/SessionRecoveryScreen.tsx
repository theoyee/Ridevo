import { ShieldAlert } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

import { useAuthStore } from "../stores/auth.store";

export function SessionRecoveryScreen() {
  const hydrate = useAuthStore((state) => state.hydrate);

  const signOut = useAuthStore((state) => state.signOut);

  const error = useAuthStore((state) => state.initializationError);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setLocalError(null);

    try {
      await signOut();
    } catch {
      setLocalError("Unable to clear your session. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 px-6 pt-4">
        <BrandLogo width={110} height={36} />

        <View className="flex-1 items-center justify-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent/20">
            <ShieldAlert size={36} color="#101820" strokeWidth={1.8} />
          </View>

          <Typography variant="h2" className="text-center">
            Unable to restore your session
          </Typography>

          <Typography variant="body" className="text-center text-muted">
            Something went wrong while checking your account. Try again or sign
            in again.
          </Typography>

          {__DEV__ && error ? (
            <Typography variant="caption" className="text-center text-error">
              {error}
            </Typography>
          ) : null}

          {localError ? (
            <Typography variant="small" className="text-center text-error">
              {localError}
            </Typography>
          ) : null}
        </View>

        <View className="gap-3 pb-4">
          <Button
            title="Try again"
            disabled={isSigningOut}
            onPress={() => void hydrate()}
          />

          <Button
            title="Sign in again"
            variant="outline"
            loading={isSigningOut}
            disabled={isSigningOut}
            onPress={() => void handleSignOut()}
          />
        </View>
      </View>
    </Screen>
  );
}
