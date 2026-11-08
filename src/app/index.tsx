import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { StyleSheet } from "react-native-unistyles";
import { useSession } from "@/contexts";
import { UIPage } from "@/ui";
import { SplashLogo } from "@/components/splash";
import {
  SPLASH_LAND_MS,
  SPLASH_LANDED_CENTER_Y,
  SPLASH_LANDED_WIDTH,
  SPLASH_LOGO_OFFSET_Y,
  SPLASH_LOGO_WIDTH,
  SPLASH_SHINE_END_MS,
} from "@/utils";

export default function LoadingScreen() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const { width, height } = useWindowDimensions();
  const [isIntroDone, setIsIntroDone] = useState(false);
  const land = useSharedValue(0);

  useEffect(() => {
    land.value = withDelay(
      SPLASH_SHINE_END_MS,
      withTiming(
        1,
        { duration: SPLASH_LAND_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(setIsIntroDone, true);
        },
      ),
    );
  }, [land]);

  useEffect(() => {
    if (!isLoading && isIntroDone) {
      router.replace(session ? "/feed" : "/(auth)");
    }
  }, [isIntroDone, isLoading, router, session]);

  // starts as the native splash image (screen-centered), lands the U on UIPage's backdrop U;
  // the U sits SPLASH_LOGO_OFFSET_Y below the image center, and that offset scales too
  const landedScale = (SPLASH_LANDED_WIDTH * width) / SPLASH_LOGO_WIDTH;
  const landedY =
    SPLASH_LANDED_CENTER_Y * width -
    height / 2 -
    landedScale * SPLASH_LOGO_OFFSET_Y;
  const logoStyle = useAnimatedStyle(() => ({
    opacity: 1 - land.value,
    transform: [
      {
        translateY: interpolate(land.value, [0, 1], [0, landedY]),
      },
      { scale: interpolate(land.value, [0, 1], [1, landedScale]) },
    ],
  }));
  const coverStyle = useAnimatedStyle(() => ({ opacity: 1 - land.value }));

  return (
    <UIPage>
      <Animated.View style={[styles.cover, coverStyle]} />
      <Animated.View style={[styles.logo, logoStyle]}>
        <SplashLogo onDisplay={SplashScreen.hide} />
      </Animated.View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.ink,
  },
  logo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
}));
