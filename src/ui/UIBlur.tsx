import { BlurView } from "expo-blur";
import type { ComponentProps } from "react";
import { Platform, View } from "react-native";

type UIBlurProps = ComponentProps<typeof BlurView>;

// a real blur on iOS; on Android expo-blur only fakes one with a see-through fill, so it's a plain
// view there and the caller's style gives it an opaque color
export const UIBlur = ({ intensity, tint, ...props }: UIBlurProps) =>
  Platform.OS === "android" ? (
    <View {...props} />
  ) : (
    <BlurView intensity={intensity} tint={tint} {...props} />
  );
