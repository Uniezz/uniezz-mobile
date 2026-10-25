import { useUsosLogin } from "@/hooks";
import { Icon, UIIconButton } from "@/ui";
import { getUsosStartUrl } from "@/utils";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import { StyleSheet } from "react-native-unistyles";

export default function UsosScreen() {
  const { university } = useLocalSearchParams<{ university?: string }>();
  const handleNavigation = useUsosLogin();

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: getUsosStartUrl(university ?? "umcs") }}
        incognito
        onShouldStartLoadWithRequest={handleNavigation}
        startInLoadingState
        style={styles.webView}
      />
      <UIIconButton
        onPress={router.back}
        size={Platform.OS === "ios" ? undefined : "lg"}
        style={styles.backButton}
      >
        <Icon name="arrow-left" size={18} color="white" />
      </UIIconButton>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.ink,
    paddingTop: Platform.OS === "android" ? rt.insets.top : 0,
  },
  webView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? theme.vs(20) : rt.insets.top + theme.vs(14),
    left: theme.s(Platform.OS === "ios" ? 20 : 16),
    zIndex: 1,
  },
}));
