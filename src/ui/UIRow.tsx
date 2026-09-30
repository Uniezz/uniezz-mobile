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
        <UIText weight="bold">{topText}</UIText>
        <UIText color="gray" size="sm">
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
    paddingHorizontal: theme.s(12),
    gap: theme.s(12),
    borderRadius: theme.vs(12),
    borderWidth: theme.vs(1),

    variants: {
      isSelected: {
        true: {
          backgroundColor: theme.colors.brandLight,
          borderColor: theme.colors.brand,
        },
        false: {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.graySoft,
        },
      },
    },
  },
}));
