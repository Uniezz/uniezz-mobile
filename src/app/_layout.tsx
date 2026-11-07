import "@/schemas";
import "@/internationalization";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "@/contexts";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { PostHogProvider } from "posthog-react-native";

const queryClient = new QueryClient();

function RootNavigator(): React.JSX.Element {
  const { session } = useSession();

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
        <Stack.Screen name="student/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider
      projectToken="phc_pSPCwUwaLeA8xTLn6Y5XWS6Kq3TXEbBa3W3DNnoLPHsJ"
      options={{
        host: "https://us.i.posthog.com",
      }}
    >
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <BottomSheetModalProvider>
                <RootNavigator />
                <Toaster theme="dark" styles={styles} />
              </BottomSheetModalProvider>
            </SessionProvider>
          </QueryClientProvider>
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
