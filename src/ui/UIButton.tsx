import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { UIText } from "./UIText";

type UIButtonProps = UnistylesVariants<typeof styles> & {
  children: ReactNode;
} & PressableProps;

export const UIButton = ({
  children,
  size,
  type,
  disabled,
  style,
  ...props
}: UIButtonProps) => {
  styles.useVariants({ size, type });

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.button(state.pressed, !!disabled),
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <UIText
        color={type === "secondary" || type === "ghost" ? "brand" : "white"}
        weight="bold"
        size={size}
      >
        {children}
      </UIText>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: (pressed: boolean, disabled: boolean) => ({
    borderRadius: theme.vs(8),
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
    },
    opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
  }),
}));
