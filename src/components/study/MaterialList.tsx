import { FlashList } from "@shopify/flash-list";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Material } from "@/@types/study";
import { Icon, UIChip, UISearch, UIText } from "@/ui";

const TABS = [
  ["papers", "app.pastPapers"],
  ["reviews", "app.courseReviews"],
  ["professors", "app.professorRatings"],
] as const;

const TYPE_ICONS = {
  Exam: "file-check",
  Colloquium: "clipboard-list",
  "Lab reports": "flask-conical",
  Notes: "notebook-pen",
} as const;

export function MaterialList({
  header,
  materials,
  isSearching,
  onOpen,
}: {
  header: ReactNode;
  materials: Material[];
  isSearching: boolean;
  onOpen: (subject: string) => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("papers");
  const visible =
    tab === "papers"
      ? materials.filter((item) =>
          `${item.subject} ${item.university}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
      : [];
  return (
    <FlashList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={visible}
      keyExtractor={(item) => `${item.subject}-${item.author}`}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          {isSearching ? (
            <UISearch
              autoFocus
              placeholder={t("app.searchMaterials")}
              value={search}
              onChangeText={setSearch}
            />
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {TABS.map(([value, label]) => (
              <UIChip
                key={value}
                label={t(label)}
                selected={tab === value}
                onPress={() => setTab(value)}
              />
            ))}
          </ScrollView>
          <View style={styles.cardTop} />
        </View>
      }
      ListEmptyComponent={
        <UIText color="secondary" style={styles.empty}>
          {t("app.empty")}
        </UIText>
      }
      ListFooterComponent={<View style={styles.cardBottom} />}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          accessibilityRole="button"
          onPress={() => onOpen(item.subject)}
        >
          <View style={styles.tile}>
            <Icon
              name={
                TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ?? "file-check"
              }
              size={18}
              uniProps={(theme) => ({ color: theme.colors.white80 })}
            />
          </View>
          <View style={styles.text}>
            <UIText weight="semibold">{item.subject}</UIText>
            <UIText size="xs" color="secondary">
              {item.type} · {item.university}
            </UIText>
          </View>
          <View style={styles.rating}>
            <Icon
              name="star"
              size={13}
              uniProps={(theme) => ({ color: theme.colors.amber })}
            />
            <UIText size="body" weight="semibold">
              {item.rating}
            </UIText>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  },
  header: { gap: theme.vs(16) },
  tabs: { gap: theme.s(6) },
  cardTop: {
    height: theme.vs(6),
    marginTop: -theme.vs(16),
    borderTopLeftRadius: theme.vs(24),
    borderTopRightRadius: theme.vs(24),
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  },
  cardBottom: {
    height: theme.vs(6),
    borderBottomLeftRadius: theme.vs(24),
    borderBottomRightRadius: theme.vs(24),
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(10),
    paddingHorizontal: theme.s(16),
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  },
  empty: {
    padding: theme.s(16),
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  },
  tile: {
    width: theme.vs(42),
    height: theme.vs(42),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: theme.vs(3) },
  rating: {
    width: theme.s(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.s(4),
  },
}));
