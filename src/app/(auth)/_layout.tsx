import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="otp" />
      <Stack.Screen options={{ presentation: "modal" }} name="usos" />
      <Stack.Screen name="finish" />
    </Stack>
  );
}
