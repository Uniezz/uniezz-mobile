import { useExchangeLoginCode } from "@/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

export default function FinishLoginScreen(): React.JSX.Element {
  const { code, error } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  const { mutate: exchangeLoginCode } = useExchangeLoginCode();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    if (error || !code) {
      Toast.show({
        type: "error",
        text1: "Couldn’t sign in with USOS.",
        text2: error || "The sign-in redirect did not include a code.",
      });
      router.replace("/(auth)");
      return;
    }

    exchangeLoginCode({ code });
  }, [code, error, exchangeLoginCode]);

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
    backgroundColor: theme.colors.midnight,
  },
}));
