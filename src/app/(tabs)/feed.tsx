import { UIPage, UIText, UIInput, UIChip, Icon } from "@/ui";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Events", value: "events" },
  { label: "People", value: "people" },
  { label: "News", value: "news" },
  { label: "Campus", value: "campus" }
] as const;

export default function FeedScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const activeFilter = FILTERS[selected];

  return (
    <UIPage>
      <View style={styles.header}>
        <UIText weight="bold" size="lg">
          Feed
        </UIText>

        <UIInput
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
          leftIcon={<Icon name="search" size={18} color="grey" />}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((item, index) => (
            <UIChip
              key={item.value}
              label={item.label}
              selected={selected === index}
              onPress={() => setSelected(index)}
            />
          ))}
        </ScrollView>
      </View>

      {/*Waiting for API*/}

      <View style={styles.body}>
        <UIText color="secondary" size="sm">
          Filter: {activeFilter?.label}
          {query ? ` · “${query}”` : ""}
        </UIText>
        <UIText color="secondary" size="sm">
          Posts will be here
        </UIText>
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
  body: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(24),
    gap: theme.vs(6),
  }
}));
