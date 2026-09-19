import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FallbackProps, getErrorMessage } from "react-error-boundary";

/**
 * Error Boundary fallback. Suspense cannot catch errors — only Error Boundaries
 * can — so this renders when a suspended child throws (e.g. a rejected promise
 * read via `use()`, or a failed `useSuspenseQuery`). The thrown value is typed
 * as `unknown`, so we use the library's `getErrorMessage` helper to read it.
 */
export function UIErrorScreen({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        {getErrorMessage(error) ?? "Unknown error"}
      </Text>
      <TouchableOpacity style={styles.button} onPress={resetErrorBoundary}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
