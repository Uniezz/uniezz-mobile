import { Skeleton, type SkeletonProps } from "react-native-ease-skeleton";
import { AccessibilityInfo, View } from "react-native";
import { useEffect, useState } from "react";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const ThemedSkeleton = withUnistyles(Skeleton, (theme) => ({
  colors: [theme.colors.white5, theme.colors.white10] as [string, string],
}));

export function UISkeleton({
  width,
  height,
  borderRadius = 16,
  style,
}: Pick<SkeletonProps, "width" | "height" | "borderRadius" | "style">) {
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  if (reduceMotion)
    return (
      <View
        accessible={false}
        style={[
          {
            width,
            height,
            borderRadius,
          },
          styles.static,
          style,
        ]}
      />
    );
  return (
    <ThemedSkeleton
      show
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  static: { backgroundColor: theme.colors.white10 },
}));
