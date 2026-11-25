import { Redirect } from "expo-router";

import { useAuthStore } from "@/features/auth/stores/auth.store";
import { getAuthenticatedRoute } from "@/features/auth/utils/auth-navigation";

export default function Index() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  // Wait for session restoration.
  if (status === "initializing") {
    return null;
  }

  // Unauthenticated users.
  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Authenticated users.
  return <Redirect href={getAuthenticatedRoute(session)} />;
}
