import { useState } from "react";
import { ProfileButton } from "@/components/profile";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { Keyboard, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiConversation } from "@/@types";
import { conversationTitle } from "@/utils";
import { ConnectionAvatarList } from "./ConnectionAvatarList";
import { ConversationRow } from "./ConversationRow";
import {
  Icon,
  UIEmpty,
  UIIconButton,
  UIQueryError,
  UISearchOverlay,
  UISkeleton,
  UISubTabs,
  UIText,
} from "@/ui";

const FILTERS = [
  ["all", "app.all"],
  ["groups", "app.groups"],
] as const;

type ConversationListProps = {
  conversations: ApiConversation[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
};

export function ConversationList({
  conversations,
  isPending,
  isError,
  onRetry,
  refreshing,
  onRefresh,
  onEndReached,
  onOpen,
  onCreate,
}: ConversationListProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  // the list filters by `query`, applied only on submit as in the feed; `search` is the text being typed
  const [query, setQuery] = useState("");
  const handleSearchSubmit = () => {
    setQuery(search);
    Keyboard.dismiss();
  };
  // the search field only exists while the keyboard is up; blurring it closes it, the filter stays
  const [isSearching, setIsSearching] = useState(false);
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const handleFilterPress = (index: number) =>
    setFilter(FILTERS[index]?.[0] ?? "all");
  // shortcut: search filters only the loaded pages; the API has no conversation search yet
  const visible = conversations.filter(
    (item) =>
      conversationTitle(item, t).toLowerCase().includes(query.toLowerCase()) &&
      (filter !== "groups" || item.kind === "group"),
  );
  return (
    <>
      <View style={styles.page}>
        <View style={styles.header}>
          <UIText size="xl" weight="bold" style={styles.title}>
            {t("tabs.chat")}
          </UIText>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("topbar.search")}
            onPress={handleSearchPress}
          >
            <Icon name="search" size={18} />
          </UIIconButton>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.createGroup")}
            onPress={onCreate}
          >
            <Icon name="square-pen" size={18} />
          </UIIconButton>
          <ProfileButton />
        </View>
        <View style={styles.filters}>
          <UISubTabs
            items={FILTERS.map(([, label]) => t(label))}
            selectedItemIndex={FILTERS.findIndex(([value]) => value === filter)}
            onPress={handleFilterPress}
          />
        </View>
        {/* the people you matched with, a chat with each a tap away; a long press removes one */}
        <ConnectionAvatarList />
        <FlashList
          maintainVisibleContentPosition={{ disabled: true }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={visible}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          ListEmptyComponent={
            isPending ? (
              <UISkeleton height={64} />
            ) : isError ? (
              <UIQueryError message={t("apiState.error")} onRetry={onRetry} />
            ) : null
          }
          renderItem={({ item }) => (
            <ConversationRow conversation={item} onOpen={onOpen} />
          )}
        />
      </View>
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!isPending && !isError && visible.length === 0 ? (
        <UIEmpty isScreenCentred message={t("app.empty")} />
      ) : null}
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={t("app.searchConversations")}
        submitLabel={t("topbar.search")}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  // the tab's padded content; the empty cat sits outside it, directly on UIPage
  page: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(4),
    gap: theme.vs(16),
  },
  // matches UICollapsingHeader without a subtitle: the title centred on the buttons
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  title: {
    flex: 1,
    lineHeight: theme.vs(30),
  },
  // the tabs run edge to edge, 12pt under the title row, as in UICollapsingHeader
  filters: {
    marginHorizontal: -theme.s(16),
    marginTop: -theme.vs(4),
  },
  list: {
    flex: 1,
  },
  // keeps the last row clear of the tab bar
  listContent: {
    paddingBottom: theme.vs(110),
  },
}));
