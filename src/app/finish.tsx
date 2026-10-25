import { useFinishLogin } from "@/hooks";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function FinishLoginScreen(): React.JSX.Element {
  const { code, error } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  useFinishLogin(code, error);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="white" />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ink,
  },
}));
