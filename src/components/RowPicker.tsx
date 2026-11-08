import { ReactNode } from "react";
import { UIGlass, UIText } from "@/ui";
import { View, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type RowItem = {
  leading?: ReactNode;
  topText: string;
  bottomText?: string;
};

type RowPickerProps = {
  items: RowItem[];
  selectedItem: number;
  onItemPress: (idx: number) => void;
} & UnistylesVariants<typeof styles>;

const getRowEntering = (index: number) =>
  FadeInDown.duration(380).delay(index * 70);

export const RowPicker = ({
  items,
  selectedItem,
  onItemPress,
  appearance,
}: RowPickerProps) => {
  styles.useVariants({ appearance });
  return (
    <UIGlass style={styles.group}>
      {items.map((item, index) => {
        const isItemSelected = selectedItem === index;
        const isLast = index === items.length - 1;
        const handlePress = () => {
          onItemPress(index);
        };
        return (
          <Animated.View key={index} entering={getRowEntering(index)}>
            <Pressable
              onPress={handlePress}
              accessibilityRole="radio"
              accessibilityState={{ selected: isItemSelected }}
              style={styles.item(isItemSelected, isLast)}
            >
              {item.leading}
              <View style={styles.textContainer}>
                <UIText weight="semibold" size="rg" numberOfLines={1}>
                  {item.topText}
                </UIText>
                {item.bottomText ? (
                  <UIText size="sm" color="secondary" numberOfLines={1}>
                    {item.bottomText}
                  </UIText>
                ) : null}
              </View>
              <View style={styles.radio(isItemSelected)}>
                {isItemSelected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: {
    backgroundColor: theme.colors.ink70,
    borderRadius: theme.vs(24),
    variants: {
      appearance: {
        inset: {
          padding: theme.s(6),
          gap: theme.vs(2),
          backgroundColor: theme.colors.white3,
          borderColor: theme.colors.white12,
        },
      },
    },
  },
  textContainer: {
    flex: 1,
    gap: theme.vs(2),
  },
  item: (isItemSelected: boolean, isLast: boolean) => ({
    alignItems: "center",
    flexDirection: "row",
    gap: theme.s(12),
    paddingVertical: theme.vs(13),
    paddingHorizontal: theme.s(16),
    backgroundColor: isItemSelected ? theme.colors.blue20 : "transparent",
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.white5,
    variants: {
      appearance: {
        inset: {
          paddingVertical: theme.vs(11),
          paddingHorizontal: theme.s(10),
          borderRadius: theme.vs(12),
          backgroundColor: isItemSelected ? theme.colors.white5 : "transparent",
          borderWidth: isItemSelected ? 1 : 0,
          borderColor: theme.colors.white20,
          borderBottomWidth: isItemSelected || !isLast ? 1 : 0,
          borderBottomColor: isItemSelected
            ? theme.colors.white20
            : theme.colors.white5,
        },
      },
    },
  }),
  radio: (isItemSelected: boolean) => ({
    width: theme.vs(22),
    height: theme.vs(22),
    borderRadius: theme.vs(11),
    borderWidth: isItemSelected ? 0 : 1.5,
    borderColor: theme.colors.white20,
    backgroundColor: isItemSelected ? theme.colors.white : "transparent",
    justifyContent: "center",
    alignItems: "center",
    variants: {
      appearance: {
        inset: {
          borderWidth: 1.5,
          borderColor: isItemSelected ? theme.colors.sky : theme.colors.white20,
          backgroundColor: "transparent",
        },
      },
    },
  }),
  radioDot: {
    width: theme.vs(8),
    height: theme.vs(8),
    borderRadius: theme.vs(4),
    backgroundColor: theme.colors.ink,
    variants: {
      appearance: {
        inset: {
          width: theme.vs(10),
          height: theme.vs(10),
          borderRadius: theme.vs(5),
          backgroundColor: theme.colors.sky,
        },
      },
    },
  },
}));
