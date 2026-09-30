import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type UIIconButtonProps = UnistylesVariants<typeof styles> & {
  children?: ReactNode;
} & PressableProps;

export const UIIconButton = ({
  children,
  size,
  style,
  ...props
}: UIIconButtonProps) => {
  styles.useVariants({ size });
  return (
    <Pressable
      style={(state) => [
        styles.iconContainer(state.pressed),
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  iconContainer: (pressed: boolean) => ({
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
    variants: {
      size: {
        sm: {
          height: theme.vs(28),
          width: theme.vs(28),
        },
        default: {
          height: theme.vs(36),
          width: theme.vs(36),
        },
        lg: {
          height: theme.vs(44),
          width: theme.vs(44),
        },
      },
    },
    opacity: pressed ? 0.8 : 1,
  }),
}));
