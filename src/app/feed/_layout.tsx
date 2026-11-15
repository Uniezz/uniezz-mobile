import { Stack } from "expo-router";
import { stackHostNativeProps, stackScreenOptions } from "@/utils";

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
      unstable_nativeProps={stackHostNativeProps}
    >
      <Stack.Screen name="new" />
    </Stack>
  );
}
