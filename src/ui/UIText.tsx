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
    fontFamily: theme.fonts.PlusJakartaSans,
    variants: {
      size: {
        xs: {
          fontSize: theme.vs(10),
        },
        sm: {
          fontSize: theme.vs(12),
        },
        default: {
          fontSize: theme.vs(14),
        },
        rg: {
          fontSize: theme.vs(16),
        },

        md: {
          fontSize: theme.vs(18),
        },
        lg: { fontSize: theme.vs(20) },

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
        white: {
          color: theme.colors.white,
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
