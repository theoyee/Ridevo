import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

export default function AccountScreen() {
  return (
    <Screen edges={["top"]}>
      <View className="flex-1 px-6 pt-6">
        <Typography variant="h1">Account</Typography>

        <Typography variant="body" className="mt-2 text-muted">
          Manage your profile and preferences.
        </Typography>
      </View>
    </Screen>
  );
}
