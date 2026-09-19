import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Implement your custom session check and redirection logic here
    // For now, we'll just redirect to the auth group
    router.replace("/(auth)");
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
}
