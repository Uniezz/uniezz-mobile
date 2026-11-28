import { ViewProps, Platform } from "react-native";
import { UIBlur } from "./UIBlur";
import { StyleSheet } from "react-native-unistyles";

type UIGlassProps = {
  radius?: number;
} & ViewProps;

export const UIGlass = ({
  radius,
  style,
  children,
  ...props
}: UIGlassProps) => {
  return (
    <UIBlur
      intensity={40}
      tint="dark"
      style={[styles.glass(radius), style]}
      {...props}
    >
      {children}
    </UIBlur>
  );
};

const styles = StyleSheet.create((theme) => ({
  glass: (radius?: number) => ({
    overflow: "hidden",
    // `radius` is in design points, scaled like every other size
    borderRadius: theme.vs(radius ?? 22),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    // Android has no real blur: an opaque fill, so nothing scrolls through
    backgroundColor:
      Platform.OS === "android" ? theme.colors.surface : theme.colors.surface60,
  }),
}));
