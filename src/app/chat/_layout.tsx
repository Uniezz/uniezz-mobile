import { Stack } from "expo-router";
import { stackHostNativeProps, stackScreenOptions } from "@/utils";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
      unstable_nativeProps={stackHostNativeProps}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" />
      <Stack.Screen name="group/[id]" />
    </Stack>
  );
}
