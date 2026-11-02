import { LegendList } from "@legendapp/list/react-native";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIChip, UIGlass, UIInput, UIText } from "@/ui";
import type { Material } from "@/@types/study";

export function MaterialList({
  header,
  materials,
  onOpen,
}: {
  header: ReactNode;
  materials: Material[];
  onOpen: (subject: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Past papers");
  const visible =
    tab === "Past papers"
      ? materials.filter((item) =>
          `${item.subject} ${item.university}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
      : [];
  return (
    <LegendList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={visible}
      keyExtractor={(item) => `${item.subject}-${item.author}`}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <UIInput
            placeholder="Search materials"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {["Past papers", "Reviews", "Professors"].map((item) => (
              <UIChip
                key={item}
                label={item}
                selected={tab === item}
                onPress={() => setTab(item)}
              />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <UIGlass style={styles.card}>
          <UIText weight="semibold">No materials here yet</UIText>
          <UIText color="secondary">Try another category or search.</UIText>
        </UIGlass>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.item}
          accessibilityRole="button"
          onPress={() => onOpen(item.subject)}
        >
          <UIGlass style={styles.card}>
            <UIText size="md" weight="semibold">
              {item.subject}
            </UIText>
            <UIText color="secondary" size="sm">
              {item.type} · {item.university} · {item.author}
            </UIText>
            <UIText color="link" size="sm">
              ★ {item.rating}
            </UIText>
          </UIGlass>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { flex: 1 },
  listContent: { paddingHorizontal: theme.s(16), paddingBottom: theme.vs(100) },
  header: { gap: theme.vs(16), paddingBottom: theme.vs(16) },
  item: { marginBottom: theme.vs(16) },
  tabs: { gap: theme.s(8) },
  card: { padding: theme.s(16), gap: theme.vs(8) },
}));
