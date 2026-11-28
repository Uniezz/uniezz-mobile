import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { ProfileButton } from "@/components/profile";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { Keyboard, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiConversation } from "@/@types";
import { useChatRequests } from "@/hooks";
import { conversationTitle } from "@/utils";
import { ChatSettingsSheet } from "./ChatSettingsSheet";
import { ConnectionAvatarList } from "./ConnectionAvatarList";
import { ConversationRow } from "./ConversationRow";
import {
  Icon,
  UIEmpty,
  UIIconButton,
  UIQueryError,
  UISearchOverlay,
  UISubTabs,
  UIText,
  UISkeletonRow,
} from "@/ui";

const FILTERS = [
  ["all", "app.all"],
  ["groups", "app.groups"],
  ["requests", "chat.requestsTab"],
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
  const settingsRef = useRef<BottomSheetModal>(null);
  const handleSettingsPress = () => settingsRef.current?.present();
  const handleSearchClose = () => setIsSearching(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const handleFilterPress = (index: number) =>
    setFilter(FILTERS[index]?.[0] ?? "all");
  // message requests stay out of the chat list; their tab reads them from their own endpoint
  const {
    data: requestPages,
    isPending: areRequestsPending,
    isError: isRequestsError,
    refetch: refetchRequests,
    fetchNextPage: fetchNextRequests,
    hasNextPage: hasMoreRequests,
    isFetchingNextPage: isFetchingRequests,
  } = useChatRequests();
  const requests =
    requestPages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const isRequests = filter === "requests";
  const [areRequestsRefreshing, setAreRequestsRefreshing] = useState(false);
  const handleRequestsRefresh = () => {
    setAreRequestsRefreshing(true);
    return refetchRequests().finally(() => setAreRequestsRefreshing(false));
  };
  const handleRequestsEndReached = () => {
    if (hasMoreRequests && !isFetchingRequests) return fetchNextRequests();
  };
  // counts the loaded pages only; the API has no request total
  const requestsLabel = requests.length
    ? `${t("chat.requestsTab")} (${requests.length}${hasMoreRequests ? "+" : ""})`
    : t("chat.requestsTab");
  const listPending = isRequests ? areRequestsPending : isPending;
  const listError = isRequests ? isRequestsError : isError;
  // shortcut: search filters only the loaded pages; the API has no conversation search yet
  const visible = (isRequests ? requests : conversations).filter(
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
            accessibilityLabel={t("chat.whoCanMessage")}
            onPress={handleSettingsPress}
          >
            <Icon name="settings" size={18} />
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
            items={FILTERS.map(([value, label]) =>
              value === "requests" ? requestsLabel : t(label),
            )}
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
          refreshing={isRequests ? areRequestsRefreshing : refreshing}
          onRefresh={isRequests ? handleRequestsRefresh : onRefresh}
          onEndReached={isRequests ? handleRequestsEndReached : onEndReached}
          ListEmptyComponent={
            listPending ? (
              <UISkeletonRow avatarSize="lg" count={8} />
            ) : listError ? (
              <UIQueryError
                message={t("apiState.error")}
                onRetry={isRequests ? refetchRequests : onRetry}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <ConversationRow conversation={item} onOpen={onOpen} />
          )}
        />
      </View>
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!listPending && !listError && visible.length === 0 ? (
        <UIEmpty
          isScreenCentred
          message={t(isRequests ? "chat.noRequests" : "app.empty")}
        />
      ) : null}
      <ChatSettingsSheet ref={settingsRef} />
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
