import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-6 pt-4">
        <IconButton accessibilityLabel="Go back" onPress={() => router.back()}>
          <ArrowLeft size={22} color="#101820" />
        </IconButton>

        <BrandLogo width={100} height={36} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          paddingTop: 40,
        }}
      >
        <Typography variant="h1">Terms of Service</Typography>

        <Typography variant="body" className="mt-4 text-muted">
          Ridevo's Terms of Service are currently being prepared.
        </Typography>

        <Typography variant="body" className="mt-4 text-muted">
          This application is currently under development. Final terms will be
          available before the service launches.
        </Typography>
      </ScrollView>
    </Screen>
  );
}
