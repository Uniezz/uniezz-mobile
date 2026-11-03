import { Pressable, PressableProps, View } from "react-native";
import { UIText } from "./UIText";
import { StyleSheet } from "react-native-unistyles";

type UISegmentedProps = {
  items: string[];
  selectedItemIndex: number;
  onPress: (selectedIndex: number) => void;
} & Omit<PressableProps, "onPress">;

export const UISegmented = ({
  items,
  selectedItemIndex,
  onPress,
  ...props
}: UISegmentedProps) => {
  return (
    <View style={styles.container}>
      {items?.map((item, index) => {
        const isSelected = index === selectedItemIndex;
        return (
          <Pressable
            style={styles.item({ isSelected })}
            key={item}
            {...props}
            onPress={() => onPress(index)}
          >
            <UIText
              size="body"
              color={isSelected ? "black" : "soft"}
              weight="semibold"
            >
              {item}
            </UIText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.s(3),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.surface60,
    borderWidth: 1,
    borderColor: theme.colors.white10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.vs(3),
    paddingHorizontal: theme.s(3),
    width: "100%",
  },
  item: ({ isSelected }: { isSelected: boolean }) => ({
    backgroundColor: isSelected ? theme.colors.white : "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.vs(999),
    height: theme.vs(34),
  }),
}));
