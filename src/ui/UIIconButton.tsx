import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { UIGlass } from "./UIGlass";

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
      <UIGlass radius={999} style={styles.glass}>
        {children}
      </UIGlass>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  iconContainer: (pressed: boolean) => ({
    borderRadius: theme.vs(999),
    variants: {
      size: {
        sm: {
          height: theme.vs(28),
          width: theme.vs(28),
        },
        default: {
          height: theme.vs(40),
          width: theme.vs(40),
        },
        lg: {
          height: theme.vs(44),
          width: theme.vs(44),
        },
      },
    },
    opacity: pressed ? 0.8 : 1,
  }),
  glass: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
