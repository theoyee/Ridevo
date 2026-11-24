import { useCallback, useRef } from "react";

import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

// import { useFocusEffect, useRouter } from "expo-router";

import { useFocusEffect, useIsFocused, useRouter } from "expo-router";

import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
} from "react-native-reanimated";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

import { WelcomeAnimation } from "../components/welcome/WelcomeAnimation";

const heroEntrance = FadeInDown.duration(650).reduceMotion(ReduceMotion.System);

const contentEntrance = FadeInDown.duration(500)
  .delay(120)
  .reduceMotion(ReduceMotion.System);

const footerEntrance = FadeIn.duration(450)
  .delay(220)
  .reduceMotion(ReduceMotion.System);

export function WelcomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const navigationLock = useRef(false);

  const { height, width } = useWindowDimensions();

  const compact = height < 760;

  const heroWidth = Math.min(width - 48, 420, height * 0.43);

  useFocusEffect(
    useCallback(() => {
      navigationLock.current = false;
    }, []),
  );

  const handleContinue = useCallback(() => {
    if (navigationLock.current) return;

    navigationLock.current = true;

    router.push("/(auth)/phone");
  }, [router]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-auto w-full max-w-[480px] flex-1 px-6">
          {/* Brand header */}
          <View className={compact ? "pb-4 pt-3" : "pb-6 pt-4"}>
            <BrandLogo width={120} height={40} />
          </View>

          {/* Hero illustration */}
          <Animated.View entering={heroEntrance} className="items-center">
            <View
              style={{
                width: heroWidth,
                maxWidth: "100%",
              }}
            >
              <WelcomeAnimation active={isFocused} />
            </View>
          </Animated.View>

          {/* Main content */}
          <Animated.View
            entering={contentEntrance}
            className={compact ? "flex-1 pt-6" : "flex-1 pt-8"}
          >
            {/* Brand eyebrow */}
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-accent" />

              <Typography
                variant="caption"
                className="font-medium tracking-[1px] text-muted"
              >
                MADE FOR EVERYDAY MOVEMENT
              </Typography>
            </View>

            {/* Headline */}
            <Typography variant="display" className="mt-4 tracking-[-1.5px]">
              {"Go where\nlife takes you"}
              <Typography variant="display" className="text-[#91BC35]">
                .
              </Typography>
            </Typography>

            {/* Supporting copy */}
            <Typography
              variant="body"
              className="mt-4 max-w-[360px] text-muted"
            >
              Reliable rides, effortless journeys. Your next destination is just
              a tap away.
            </Typography>
          </Animated.View>

          {/* Authentication actions */}
          <Animated.View
            entering={footerEntrance}
            className={compact ? "pb-2 pt-6" : "pb-4 pt-8"}
          >
            <Button
              title="Get started"
              variant="primary"
              onPress={handleContinue}
            />

            <Pressable
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your Ridevo account"
              className="mt-2 min-h-12 items-center justify-center active:opacity-70"
            >
              <Typography variant="small" className="text-center text-muted">
                Already have an account?{" "}
                <Typography
                  variant="small"
                  className="font-semibold text-primary"
                >
                  Sign in
                </Typography>
              </Typography>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}
