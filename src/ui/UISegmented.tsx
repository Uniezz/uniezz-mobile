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
            <UIText color={!isSelected ? "secondary" : undefined} weight="bold">
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
    gap: theme.s(2),
    borderRadius: theme.vs(10),
    backgroundColor: theme.colors.canvas,
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
    borderRadius: theme.vs(8),
    height: theme.vs(32),
  }),
}));
