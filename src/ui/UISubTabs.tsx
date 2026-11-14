import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";

type UISubTabsProps = {
  items: string[];
  selectedItemIndex: number;
  onPress: (selectedIndex: number) => void;
};

export const UISubTabs = ({
  items,
  selectedItemIndex,
  onPress,
}: UISubTabsProps) => (
  <View accessibilityRole="tablist" style={styles.container}>
    <View style={styles.tabs}>
      {items.map((item, index) => {
        const isSelected = index === selectedItemIndex;
        const handlePress = () => onPress(index);

        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={handlePress}
            style={styles.tab(isSelected)}
          >
            <UIText
              size="body"
              weight="semibold"
              color={isSelected ? "white" : "secondary"}
              numberOfLines={1}
            >
              {item}
            </UIText>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(6),
  },
  tabs: { flexDirection: "row" },
  tab: (isSelected: boolean) => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: theme.vs(2),
    borderBottomColor: isSelected ? theme.colors.white : "transparent",
    paddingHorizontal: theme.s(4),
    paddingBottom: theme.vs(12),
  }),
}));
