import { use } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UIScreen } from "@/ui/UIScreen";
import { withSuspense } from "@/ui/withSuspense";
import { getUserResource, resetUserResource } from "@/hooks/useMockResource";

/**
 * SCREEN-LEVEL Suspense pattern — wrap the screen, not individual widgets.
 *
 * The screen reads its data with the `use` API: `use` reads a promise during
 * render, suspending while it is pending and throwing if it rejects. So the
 * screen needs no useEffect and no isLoading/error branches — withSuspense
 * provides the full-screen UILoadingScreen / UIErrorScreen fallbacks.
 *
 * Keep withSuspense at the screen/route level (e.g. in a route file:
 * `export default withSuspense(ProfileScreen, { onReset })`). A small widget
 * that shouldn't blank out the whole screen should manage its OWN inline
 * loading / error UI instead of suspending up to this boundary.
 *
 * The promise MUST be stable across renders (getUserResource caches it),
 * otherwise React would suspend forever on a brand-new promise each render.
 */
function ProfileScreen() {
  const user = use(getUserResource());

  return (
    <UIScreen title="Profile">
      <View style={styles.content}>
        <Text style={styles.label}>Loaded with use()</Text>
        <Text style={styles.name}>{user.name}</Text>
      </View>
    </UIScreen>
  );
}

// onReset clears the cached promise so the error screen's "Try again" re-fetches.
export const SuspenseScreenExample = withSuspense(ProfileScreen, {
  onReset: resetUserResource,
});

const styles = StyleSheet.create({
  content: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
});
