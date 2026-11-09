import { ReactNode } from "react";
import { UIGlass, UIText } from "@/ui";
import { View, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type RowItem = {
  leading?: ReactNode;
  topText: string;
  bottomText?: string;
  /** sits before `bottomText`, e.g. a university logo */
  bottomLeading?: ReactNode;
};

type RowPickerProps = {
  items: RowItem[];
  selectedItem: number;
  onItemPress: (idx: number) => void;
} & UnistylesVariants<typeof styles>;

type RowPickerItemProps = {
  item: RowItem;
  isSelected: boolean;
  isLast: boolean;
  onPress: () => void;
  /** a checkbox for multi-select lists, a radio otherwise */
  isMultiple?: boolean;
} & UnistylesVariants<typeof styles>;

const getRowEntering = (index: number) =>
  FadeInDown.duration(380).delay(index * 70);

// one row of the picker; exported so long lists (FlashList) can render the same rows
export const RowPickerItem = ({
  item,
  isSelected,
  isLast,
  onPress,
  isMultiple = false,
  appearance,
}: RowPickerItemProps) => {
  styles.useVariants({ appearance });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={isMultiple ? "checkbox" : "radio"}
      accessibilityState={
        isMultiple ? { checked: isSelected } : { selected: isSelected }
      }
      style={styles.item(isSelected, isLast)}
    >
      {item.leading}
      <View style={styles.textContainer}>
        <UIText weight="semibold" size="rg" numberOfLines={1}>
          {item.topText}
        </UIText>
        {item.bottomText ? (
          <View style={styles.bottom}>
            {item.bottomLeading}
            <UIText
              size="sm"
              color="secondary"
              numberOfLines={1}
              style={styles.bottomText}
            >
              {item.bottomText}
            </UIText>
          </View>
        ) : null}
      </View>
      <View style={styles.radio(isSelected)}>
        {isSelected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
};

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
        const handlePress = () => {
          onItemPress(index);
        };
        return (
          <Animated.View key={index} entering={getRowEntering(index)}>
            <RowPickerItem
              item={item}
              isSelected={selectedItem === index}
              isLast={index === items.length - 1}
              onPress={handlePress}
              appearance={appearance}
            />
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
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  bottomText: {
    flexShrink: 1,
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
          // only the selected row is rounded, so the dividers on the others stay straight
          borderRadius: isItemSelected ? theme.vs(12) : 0,
          backgroundColor: isItemSelected ? theme.colors.white5 : "transparent",
          // constant 1px border on every row so selecting one doesn't shift the content
          borderWidth: 1,
          borderBottomWidth: 1,
          borderColor: isItemSelected ? theme.colors.white20 : "transparent",
          borderBottomColor: isItemSelected
            ? theme.colors.white20
            : isLast
              ? "transparent"
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
