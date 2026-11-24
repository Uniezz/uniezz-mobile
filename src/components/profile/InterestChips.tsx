import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "@/ui";

export const InterestChips = ({ interests }: { interests: string[] }) => (
  <View style={styles.row}>
    {interests.map((interest) => (
      <View key={interest} style={styles.chip}>
        <UIText size="sm" weight="medium" color="soft">
          {interest}
        </UIText>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.s(8),
  },
  // a row stretches every chip to its tallest one (an emoji label is taller); the text stays centred
  chip: {
    justifyContent: "center",
    paddingVertical: theme.vs(5),
    paddingHorizontal: theme.s(11),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
}));
