import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type UIButtonProps = UnistylesVariants<typeof styles> & {
  children: ReactNode;
} & PressableProps;

export const UIButton = ({
  children,
  size,
  type,
  disabled,
  style,
  radius,
  ...props
}: UIButtonProps) => {
  styles.useVariants({ size, type, radius });

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.button(state.pressed, !!disabled),
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: (pressed: boolean, disabled: boolean) => ({
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        sm: { height: theme.vs(31) },
        default: { height: theme.vs(41) },
        rg: { height: theme.vs(51) },
      },
      type: {
        default: {
          backgroundColor: theme.colors.brand,
        },
        secondary: {
          backgroundColor: theme.colors.white,
          borderWidth: theme.vs(1),
          borderColor: theme.colors.gray,
        },
        danger: {
          backgroundColor: theme.colors.error,
        },
        ghost: {
          backgroundColor: "transparent",
        },
      },
      radius: {
        default: {
          borderRadius: theme.vs(8),
        },
        md: {
          borderRadius: theme.vs(12),
        },
      },
    },
    opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
  }),
}));
