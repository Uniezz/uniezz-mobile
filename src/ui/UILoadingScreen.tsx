import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Default <Suspense> fallback. Pair it with an Error Boundary (see withSuspense)
 * so loading and error states are handled declaratively instead of with
 * conditional `if (isLoading)` / `if (error)` branches inside each screen.
 */
export function UILoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
