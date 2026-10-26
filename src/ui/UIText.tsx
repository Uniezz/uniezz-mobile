import { ReactNode } from "react";
import { Text, TextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type UITextProps = UnistylesVariants<typeof styles> & {
  children: ReactNode;
} & TextProps;

export const UIText = ({
  children,
  size,
  color,
  weight,
  style,
  ...props
}: UITextProps) => {
  styles.useVariants({ size, color, weight });
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: theme.fonts.Geist,
    variants: {
      size: {
        xxs: { fontSize: theme.vs(11) },
        xs: { fontSize: theme.vs(12) },
        sm: { fontSize: theme.vs(13) },
        default: { fontSize: theme.vs(15) },
        rg: { fontSize: theme.vs(16) },
        md: { fontSize: theme.vs(17) },
        lg: { fontSize: theme.vs(21), letterSpacing: -0.6 },
        xl: { fontSize: theme.vs(30), letterSpacing: -1 },
        xxl: { fontSize: theme.vs(34), letterSpacing: -1.2 },
      },
      color: {
        default: { color: theme.colors.white },
        soft: { color: theme.colors.white80 },
        secondary: { color: theme.colors.white60 },
        gray: { color: theme.colors.white40 },
        brand: { color: theme.colors.blue },
        blue: { color: theme.colors.blue },
        link: { color: theme.colors.sky },
        error: { color: theme.colors.red },
        success: { color: theme.colors.green },
        white: { color: theme.colors.white },
        black: { color: theme.colors.ink },
      },
      weight: {
        light: {
          fontWeight: "300",
        },
        default: {
          fontWeight: "400",
        },
        medium: {
          fontWeight: "500",
        },
        semibold: {
          fontWeight: "600",
        },
        bold: {
          fontWeight: "700",
        },
        extrabold: {
          fontWeight: "800",
        },
      },
    },
  },
}));
