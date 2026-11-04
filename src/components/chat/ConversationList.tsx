import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Conversation } from "@/@types/chat";
import { Icon, UIAvatar, UIChip, UIIconButton, UISearch, UIText } from "@/ui";

const FILTERS = [
  ["all", "app.all"],
  ["groups", "app.groups"],
  ["requests", "chat.requests"],
] as const;

export function ConversationList({
  conversations,
  onOpen,
  onCreate,
}: {
  conversations: Conversation[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const visible = conversations.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "groups" || item.group),
  );
  return (
    <>
      <View style={styles.header}>
        <UIText size="xl" weight="bold" style={styles.title}>
          {t("tabs.chat")}
        </UIText>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("app.createGroup")}
          onPress={onCreate}
        >
          <Icon name="square-pen" size={18} />
        </UIIconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.profile")}
          onPress={() => router.push("/profile")}
        >
          <UIAvatar />
        </Pressable>
      </View>
      <UISearch
        placeholder={t("app.searchConversations")}
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filters}>
        {FILTERS.map(([value, label]) => (
          <UIChip
            key={value}
            label={t(label)}
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>
      <LegendList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filter === "requests" ? [] : visible}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          filter === "requests" ? (
            <UIText color="secondary" style={styles.empty}>
              {t("chat.noRequests")}
            </UIText>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            onPress={() => onOpen(item.id)}
          >
            <UIAvatar size="lg" />
            <View style={styles.rowText}>
              <UIText size="rg" weight="semibold" numberOfLines={1}>
                {item.name}
              </UIText>
              <View style={styles.bottom}>
                <UIText
                  size="body"
                  color={item.unread > 0 ? "white" : "secondary"}
                  numberOfLines={1}
                  style={styles.preview}
                >
                  {item.preview}
                </UIText>
                {item.unread > 0 ? (
                  <View style={styles.badge}>
                    <UIText size="xs" weight="semibold">
                      {item.unread}
                    </UIText>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  title: {
    flex: 1,
    lineHeight: theme.vs(30),
  },
  filters: {
    flexDirection: "row",
    gap: theme.s(6),
  },
  list: {
    flex: 1,
    backgroundColor: theme.colors.surface60,
    borderRadius: theme.vs(24),
    borderWidth: 1,
    borderColor: theme.colors.white10,
  },
  listContent: {
    padding: theme.s(6),
    paddingBottom: theme.vs(90),
  },
  empty: {
    padding: theme.s(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(10),
  },
  rowText: {
    flex: 1,
    gap: theme.vs(3),
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  preview: {
    flex: 1,
  },
  badge: {
    paddingVertical: theme.vs(1),
    paddingHorizontal: theme.s(7),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.blue,
  },
}));
