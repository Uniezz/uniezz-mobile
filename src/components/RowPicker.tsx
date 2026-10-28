import { UIGlass, UIText } from "@/ui";
import { Image } from "expo-image";
import { ImageSourcePropType, View, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

export type RowItem = {
  topText: string;
  iconText: string;
  image?: ImageSourcePropType;
};

type RowPickerProps = {
  items: RowItem[];
  selectedItem: number;
  onItemPress: (idx: number) => void;
};

const getRowEntering = (index: number) =>
  FadeInDown.duration(380).delay(index * 70);

export const RowPicker = ({
  items,
  selectedItem,
  onItemPress,
}: RowPickerProps) => {
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
              <View style={styles.logo(Boolean(item.image))}>
                {item.image ? (
                  <Image
                    source={item.image}
                    style={styles.logoImage}
                    contentFit="contain"
                  />
                ) : (
                  <UIText weight="bold" size="xs">
                    {item.iconText}
                  </UIText>
                )}
              </View>
              <View style={styles.textContainer}>
                <UIText weight="semibold" size="rg">
                  {item.topText}
                </UIText>
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
  },
  textContainer: {
    flex: 1,
  },
  logo: (hasImage: boolean) => ({
    width: theme.vs(36),
    height: theme.vs(36),
    borderRadius: theme.vs(8),
    padding: hasImage ? theme.vs(4) : 0,
    backgroundColor: hasImage ? theme.colors.white : theme.colors.blue20,
    justifyContent: "center",
    alignItems: "center",
  }),
  logoImage: {
    width: "100%",
    height: "100%",
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
  }),
  radioDot: {
    width: theme.vs(8),
    height: theme.vs(8),
    borderRadius: theme.vs(4),
    backgroundColor: theme.colors.ink,
  },
}));
