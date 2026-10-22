import { useUsosLogin } from "@/hooks";
import { Icon, UIIconButton } from "@/ui";
import { getUsosStartUrl } from "@/utils";
import { router } from "expo-router";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import { StyleSheet } from "react-native-unistyles";

const USOS_SOURCE = { uri: getUsosStartUrl("umcs") };

export default function UsosScreen() {
  const handleNavigation = useUsosLogin();

  return (
    <View style={styles.container}>
      <WebView
        source={USOS_SOURCE}
        incognito
        onShouldStartLoadWithRequest={handleNavigation}
        startInLoadingState
        style={styles.webView}
      />
      <UIIconButton onPress={router.back} size="lg" style={styles.backButton}>
        <Icon name="arrow-left" size={18} color="white" />
      </UIIconButton>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.midnight,
    paddingTop: Platform.OS === "android" ? rt.insets.top : 0,
  },
  webView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: rt.insets.top + theme.vs(14),
    left: theme.s(16),
    zIndex: 1,
  },
}));
