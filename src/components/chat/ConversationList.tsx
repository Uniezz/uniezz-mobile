import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenHeader } from "@/components/ScreenHeader";
import { UIAvatar, UIChip, UIInput, UIText } from "@/ui";
import type { Conversation } from "@/@types/chat";

export function ConversationList({
  conversations,
  onOpen,
  onCreate,
}: {
  conversations: Conversation[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const visible = conversations.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "Groups" || item.group),
  );
  return (
    <>
      <View style={styles.header}>
        <View style={styles.title}>
          <ScreenHeader title="Chat" style={styles.screenHeader} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create group"
          onPress={onCreate}
        >
          <UIText color="link" size="lg">
            ＋
          </UIText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push("/profile")}
        >
          <UIAvatar imageSrc={require("../../../assets/profile-cat.png")} />
        </Pressable>
      </View>
      <UIInput
        placeholder="Search conversations"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filters}>
        {["All", "Groups", "Requests"].map((item) => (
          <UIChip
            key={item}
            label={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      <LegendList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filter === "Requests" ? [] : visible}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          filter === "Requests" ? (
            <UIText color="secondary">No message requests</UIText>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            onPress={() => onOpen(item.id)}
          >
            <UIAvatar placeholderText={item.name[0]} />
            <View style={styles.rowText}>
              <UIText weight="semibold">{item.name}</UIText>
              <UIText size="sm" color="secondary" numberOfLines={1}>
                {item.preview}
              </UIText>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <UIText size="xs" color="black" weight="bold">
                  {item.unread}
                </UIText>
              </View>
            )}
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { flexDirection: "row", alignItems: "center", gap: theme.s(8) },
  title: { flex: 1 },
  screenHeader: { paddingHorizontal: 0, paddingTop: 0 },
  filters: { flexDirection: "row", gap: theme.s(7) },
  list: {
    flex: 1,
    backgroundColor: theme.colors.surface60,
    borderRadius: theme.vs(24),
  },
  listContent: {
    padding: theme.s(6),
    paddingBottom: theme.vs(90),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.vs(72),
    gap: theme.s(12),
    paddingHorizontal: theme.s(8),
  },
  rowText: { flex: 1, gap: theme.vs(4) },
  badge: {
    width: theme.s(22),
    height: theme.s(22),
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
}));
