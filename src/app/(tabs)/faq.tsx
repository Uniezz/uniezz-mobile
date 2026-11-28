import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { FaqItem, FaqProposalSheet, FaqItemSkeleton } from "@/components/faq";
import { useFaqEntries, useMyFaqProposals } from "@/hooks";
import { ProfileButton } from "@/components/profile";
import {
  Icon,
  UICollapsingHeader,
  UIEmpty,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISearchOverlay,
  UISubTabs,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

export default function FaqScreen() {
  const { t } = useTranslation();
  // 0: published questions, 1: the student's own proposals; moderation lives on the web only
  const [tab, setTab] = useState(0);
  const isMine = tab === 1;
  const all = useFaqEntries();
  // loaded with the screen, so switching tabs neither waits for it nor refetches it
  const mine = useMyFaqProposals();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = isMine ? mine : all;
  const proposalRef = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const entries = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  // shortcut: search filters only the loaded pages; use a server query once GET /faq takes one
  const needle = search.trim().toLowerCase();
  const visible = needle
    ? entries.filter((entry) =>
        `${entry.question} ${entry.answer}`.toLowerCase().includes(needle),
      )
    : entries;

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  // the search field only exists while the keyboard is up; blurring it closes it
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleAskPress = () => proposalRef.current?.present();
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => {
    setRefreshing(true);
    return refetch().finally(() => setRefreshing(false));
  };

  const headerActions = (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("topbar.search")}
        onPress={handleSearchPress}
      >
        <Icon name="search" size={18} />
      </UIIconButton>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("faq.propose")}
        onPress={handleAskPress}
      >
        <Icon name="message-circle-plus" size={18} />
      </UIIconButton>
      <ProfileButton />
    </>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("tabs.faq")}
        isCompact={isHeaderCompact}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      >
        <UISubTabs
          items={[t("faq.allQuestions"), t("faq.myProposals")]}
          selectedItemIndex={tab}
          onPress={setTab}
        />
      </UICollapsingHeader>
      <FlashList
        data={visible}
        // on by default, it keeps a row in place when a search changes the rows above it, so clearing
        // a search could leave the list scrolled down
        maintainVisibleContentPosition={{ disabled: true }}
        keyExtractor={(entry) => entry.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        contentContainerStyle={styles.list(headerHeight)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          isPending ? (
            <FaqItemSkeleton count={8} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : null
        }
        ListFooterComponent={isFetchingNextPage ? <FaqItemSkeleton /> : null}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FaqItem entry={item} hasStatus={isMine} />
          </View>
        )}
      />
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!isPending && !isError && visible.length === 0 ? (
        <UIEmpty
          isScreenCentred
          message={t(isMine ? "faq.noProposals" : "faq.empty")}
        />
      ) : null}
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={Keyboard.dismiss}
        onClose={handleSearchClose}
        placeholder={t("faq.search")}
        submitLabel={t("topbar.search")}
      />
      <FaqProposalSheet ref={proposalRef} />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    // the gap the subtabs used to leave above the first question
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(12),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
  cell: { paddingBottom: theme.vs(8) },
}));
