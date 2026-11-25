import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Typography } from "@/components/ui/Typography";

export default function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 px-6 pt-4">
        <BrandLogo width={100} height={36} />

        <Typography variant="h1" className="mt-10">
          Where to?
        </Typography>

        <Typography variant="body" className="mt-3 text-muted">
          Your next journey starts here.
        </Typography>
      </View>
    </Screen>
  );
}
