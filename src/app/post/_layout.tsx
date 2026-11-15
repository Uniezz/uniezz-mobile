import { Stack } from "expo-router";
import { stackHostNativeProps, stackScreenOptions } from "@/utils";

export default function PostLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
      unstable_nativeProps={stackHostNativeProps}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
