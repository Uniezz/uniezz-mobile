import { ReactNode } from "react";
import { Pressable, PressableProps, View } from "react-native";
import { UIText } from "./UIText";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type UIRowProps = UnistylesVariants<typeof styles> & {
  topText?: string;
  bottomText?: string;
  leftItem?: ReactNode;
} & PressableProps;

export const UIRow = ({
  topText,
  bottomText,
  leftItem,
  isSelected = true,
  ...props
}: UIRowProps) => {
  styles.useVariants({ isSelected });
  return (
    <Pressable style={styles.rowItem} {...props}>
      {leftItem}
      <View>
        <UIText weight="bold" style={styles.title}>
          {topText}
        </UIText>
        <UIText color="secondary" size="xs">
          {bottomText}
        </UIText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  rowItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.vs(12),
    paddingHorizontal: theme.s(14),
    gap: theme.s(12),
    borderRadius: theme.vs(16),
    borderWidth: 1,

    variants: {
      isSelected: {
        true: {
          borderWidth: 1.5,
          backgroundColor: theme.colors.blue20,
          borderColor: theme.colors.blue40,
        },
        false: {
          backgroundColor: theme.colors.white5,
          borderColor: theme.colors.white10,
        },
      },
    },
  },
  title: {
    fontSize: theme.vs(14.5),
  },
}));
