import "@/schemas";
import "@/internationalization";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryProvider, SessionProvider, useSession } from "@/contexts";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { PostHogProvider } from "posthog-react-native";
import { useScreenTracking } from "@/hooks/useScreenTracking";

function RootNavigator(): React.JSX.Element {
  const { session } = useSession();
  useScreenTracking();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="finish" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="post" />
        <Stack.Screen name="student/[id]" />
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
      projectToken="phc_pSPCwUwaLeA8xTLn6Y5XWS6Kq3TXEbBa3W3DNnoLPHsJ"
      options={{
        host: "https://us.i.posthog.com",
      }}
    >
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryProvider>
            <SessionProvider>
              <BottomSheetModalProvider>
                <RootNavigator />
                <Toaster theme="dark" styles={styles} />
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
