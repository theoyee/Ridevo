import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Typography } from "@/components/ui/Typography";

export default function NotificationPermissionRoute() {
  return (
    <Screen>
      <View className="flex-1 px-6 pt-10">
        <Typography variant="h1">Stay updated</Typography>

        <Typography variant="body" className="mt-3 text-muted">
          Receive important updates about your rides.
        </Typography>
      </View>
    </Screen>
  );
}
