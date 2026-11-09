import { Skeleton, type SkeletonProps } from "react-native-ease-skeleton";
import { AccessibilityInfo, View } from "react-native";
import { useEffect, useState } from "react";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { s, vs } from "@/theme/scale";

const ThemedSkeleton = withUnistyles(Skeleton, (theme) => ({
  colors: [theme.colors.white5, theme.colors.white10] as [string, string],
}));

// numeric sizes are design points, scaled to the screen; percentages pass through
const scaled = <T,>(value: T, scale: (size: number) => number) =>
  typeof value === "number" ? scale(value) : value;

export function UISkeleton({
  width: rawWidth,
  height: rawHeight,
  borderRadius: rawBorderRadius = 16,
  style,
}: Pick<SkeletonProps, "width" | "height" | "borderRadius" | "style">) {
  const width = scaled(rawWidth, s);
  const height = scaled(rawHeight, vs);
  const borderRadius = scaled(rawBorderRadius, vs);
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
