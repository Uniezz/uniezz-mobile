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
}: UITextProps) => {
  styles.useVariants({ size, color, weight });
  return <Text style={[styles.text, style]}>{children}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: theme.fonts.PlusJakartaSans,
    variants: {
      size: {
        sm: {
          fontSize: theme.vs(12),
        },
        default: {
          fontSize: theme.vs(14),
        },
        lg: { fontSize: theme.vs(18) },
        xl: {
          fontSize: theme.vs(28),
        },
      },
      color: {
        default: {
          color: theme.colors.midnight,
        },
        secondary: {
          color: theme.colors.textSecondary,
        },
        gray: { color: theme.colors.gray },
        brand: { color: theme.colors.brand },
        error: {
          color: theme.colors.error,
        },
        success: {
          color: theme.colors.green,
        },
      },
      weight: {
        light: {
          fontWeight: "300",
        },
        default: {
          fontWeight: "400",
        },
        semibold: {
          fontWeight: "500",
        },
        bold: {
          fontWeight: "600",
        },
        extrabold: {
          fontWeight: "800",
        },
      },
    },
  },
}));
