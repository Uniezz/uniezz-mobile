import { Icon, UIIconButton } from "@/ui";
import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { WebView } from "react-native-webview";

export default function UsosScreen() {
  const onBackPress = () => {
    router.back();
  };
  return (
    <View style={styles.container}>
      <UIIconButton onPress={onBackPress} style={styles.backButton}>
        <Icon name="arrow-left" size={18} color={"white"} />
      </UIIconButton>
      <WebView style={styles.container} source={{ uri: "https://expo.dev" }} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    zIndex: 1,
    top: theme.vs(20),
    left: theme.s(20),
  },
}));
