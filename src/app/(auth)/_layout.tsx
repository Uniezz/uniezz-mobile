import { Stack } from "expo-router";
import { stackHostNativeProps, stackScreenOptions } from "@/utils";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
      unstable_nativeProps={stackHostNativeProps}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="otp" />
      <Stack.Screen options={{ presentation: "modal" }} name="usos" />
    </Stack>
  );
}
