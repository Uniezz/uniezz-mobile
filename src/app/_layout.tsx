import "@/schemas";
import { env } from "@/schemas/env";
import "@/internationalization";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryProvider, SessionProvider, useSession } from "@/contexts";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { PostHogProvider, useFeatureFlag } from "posthog-react-native";
import { useNotificationTaps, useScreenTracking } from "@/hooks";
import { darkTheme } from "@/theme";
import { stackHostNativeProps, stackScreenOptions } from "@/utils";

// must run before the first render: iOS hides the splash as soon as any RN content appears,
// unless prevent was already called. The splash route hides it once its logo is laid out.
SplashScreen.preventAutoHideAsync();

// the window behind the navigator is white by default and shows through during push transitions
SystemUI.setBackgroundColorAsync(darkTheme.colors.ink);

function RootNavigator(): React.JSX.Element {
  const { session } = useSession();
  const chatEnabled = useFeatureFlag("chat") === true;
  const coinsEnabled = useFeatureFlag("coins") !== false;
  const segments = useSegments();
  useScreenTracking();
  useNotificationTaps(session?.token);

  // a cold start on any other route (USOS callback, deep link) never mounts the splash route
  useEffect(() => {
    if (segments.length > 0) SplashScreen.hide();
  }, [segments.length]);

  return (
    <Stack
      screenOptions={stackScreenOptions}
      unstable_nativeProps={stackHostNativeProps}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="finish" />
      <Stack.Screen name="invite/[code]" options={{ animation: "fade" }} />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Protected guard={chatEnabled}>
          <Stack.Screen name="chat" />
        </Stack.Protected>
        <Stack.Screen name="profile" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="post" />
        <Stack.Screen name="student/[id]" />
        <Stack.Screen name="students" />
        <Stack.Protected guard={coinsEnabled}>
          <Stack.Screen name="rewards" />
        </Stack.Protected>
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="professor/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider
      autocapture={{
        captureTouches: true,
        captureScreens: false,
        propsToCapture: ["testID", "ph-label"],
      }}
      projectToken={env.EXPO_PUBLIC_PROJECT_TOKEN}
      options={{
        // the EU cloud keeps analytics in Frankfurt, as the privacy policy says
        host: "https://eu.i.posthog.com",
      }}
    >
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryProvider>
            <SessionProvider>
              <BottomSheetModalProvider>
                <RootNavigator />
                <Toaster
                  theme="dark"
                  allowFontScaling={false}
                  styles={styles}
                />
              </BottomSheetModalProvider>
            </SessionProvider>
          </QueryProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </PostHogProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  toast: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.white10,
    borderWidth: 1,
    borderRadius: theme.vs(16),
  },
  title: { color: theme.colors.white },
  description: { color: theme.colors.white60 },
}));
