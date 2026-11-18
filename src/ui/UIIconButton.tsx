import { ReactNode } from "react";
import { PressableProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { UIGlass } from "./UIGlass";
import { UIPressable } from "./UIPressable";

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
    <UIPressable
      style={(state) => [
        styles.iconContainer(state.pressed),
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <UIGlass style={styles.glass}>{children}</UIGlass>
    </UIPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  // rounded square, as every icon button in the v2 design
  iconContainer: (pressed: boolean) => ({
    borderRadius: theme.vs(12),
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
        xl: {
          height: theme.vs(56),
          width: theme.vs(56),
        },
      },
    },
    opacity: pressed ? 0.8 : 1,
  }),
  glass: {
    flex: 1,
    borderRadius: theme.vs(12),
    justifyContent: "center",
    alignItems: "center",
  },
}));
