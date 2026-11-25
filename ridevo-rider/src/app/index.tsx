import { Redirect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";

import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";

import { SessionRecoveryScreen } from "@/features/auth/screens/SessionRecoveryScreen";

export default function Index() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  if (status === "initializing") {
    return null;
  }

  if (status === "error") {
    return <SessionRecoveryScreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href={getAuthenticatedRoute(session)} />;
}
