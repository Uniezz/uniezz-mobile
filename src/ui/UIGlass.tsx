import { BlurView } from "expo-blur";
import { ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type UIGlassProps = {
  radius?: number;
} & ViewProps;

// shortcut: Android shows the translucent fill only (no BlurTargetView wiring), add blurMethod + blurTarget if Android needs real blur
export const UIGlass = ({
  radius,
  style,
  children,
  ...props
}: UIGlassProps) => {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[styles.glass(radius), style]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create((theme) => ({
  glass: (radius?: number) => ({
    overflow: "hidden",
    borderRadius: radius ?? theme.vs(22),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  }),
}));
