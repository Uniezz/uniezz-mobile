import { useUsosLogin } from "@/hooks";
import { Icon, UIIconButton } from "@/ui";
import { getUsosStartUrl } from "@/utils";
import { router } from "expo-router";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { StyleSheet } from "react-native-unistyles";

const USOS_SOURCE = { uri: getUsosStartUrl("umcs") };

export default function UsosScreen() {
  const handleNavigation = useUsosLogin();

  return (
    <View style={styles.container}>
      <WebView
        source={USOS_SOURCE}
        onShouldStartLoadWithRequest={handleNavigation}
        startInLoadingState
        style={styles.webView}
      />
      <UIIconButton onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={18} color="white" />
      </UIIconButton>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    zIndex: 1,
    top: theme.vs(20),
    left: theme.s(20),
  },
}));
