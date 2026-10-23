import { UIPage, UIText, UIInput, UIChip, Icon } from "@/ui";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const FILTERS = ["All", "Events", "People", "News", "Campus"];

export default function FeedScreen() {
  const [querry, setQuerry] = useState("");
  const [selected, setSelected] = useState(0);

  return (
    <UIPage>
      <View style={styles.header}>
        <UIText weight="bold" size="lg">
          Feed
        </UIText>

        <UIInput
          placeholder="Search..."
          value={querry}
          onChangeText={setQuerry}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((label, index) => (
            <UIChip
              key={label}
              label={label}
              selected={selected === index}
              onPress={() => setSelected(index)}
            />
          ))}
        </ScrollView>
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.vs(12),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
  },
  chips: {
    flexDirection: "row",
    gap: theme.s(8),
    paddingVertical: theme.vs(4),
  },
}));
