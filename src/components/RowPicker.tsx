import { Icon, UIText } from "@/ui";
import { View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type RowItem = {
  topText: string;
  bottomText: string;
};

type RowPickerProps = {
  items: RowItem[];
  selectedItem: number;
  onItemPress: (idx: number) => void;
};

export const RowPicker = ({
  items,
  selectedItem,
  onItemPress,
}: RowPickerProps) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isItemSelected = selectedItem === index;
        const handlePress = () => {
          onItemPress(index);
        };
        return (
          <Pressable
            onPress={handlePress}
            style={styles.item(isItemSelected)}
            key={index}
          >
            <View>
              <UIText color="black" weight="semibold">
                {item.topText}
              </UIText>
              <UIText size="sm" color="gray">
                {item.bottomText}
              </UIText>
            </View>

            <View style={styles.selectedMark(isItemSelected)}>
              <Icon name="check" color={"white"} size={14} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(7),
  },
  item: (isItemSelected: boolean) => ({
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: theme.s(10),
    paddingVertical: theme.vs(8),
    paddingHorizontal: theme.s(10),
    borderRadius: theme.vs(12),
    borderWidth: theme.vs(1),
    backgroundColor: isItemSelected ? theme.colors.brandLight : "transparent",
    borderColor: isItemSelected ? theme.colors.brand : theme.colors.gray,
  }),
  selectedMark: (isItemSelected: boolean) => ({
    width: theme.s(19),
    height: theme.vs(19),
    borderRadius: theme.vs(19),
    backgroundColor: isItemSelected ? theme.colors.brand : "transparent",
    borderWidth: theme.vs(1),
    borderColor: isItemSelected ? theme.colors.brand : theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
  }),
}));
