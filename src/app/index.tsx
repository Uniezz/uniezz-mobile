import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/contexts";

export default function LoadingScreen() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      router.replace(session ? "/feed" : "/(auth)");
    }
  }, [isLoading, router, session]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
}
