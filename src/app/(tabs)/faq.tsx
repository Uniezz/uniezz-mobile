import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { FaqItem, FaqProposalSheet } from "@/components/faq";
import { useFaqEntries } from "@/hooks/useFaq";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UICollapsingHeader,
  UIEmpty,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISearchOverlay,
  UISkeleton,
  UIText,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

export default function FaqScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useFaqEntries();
  const proposalRef = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

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
  const handleProfilePress = () => router.push("/profile");
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("app.profile")}
        onPress={handleProfilePress}
      >
        <UIAvatar imageSrc={profile?.avatarUrl} />
      </Pressable>
    </>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("tabs.faq")}
        isCompact={isHeaderCompact}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        data={visible}
        keyExtractor={(entry) => entry.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        contentContainerStyle={styles.list(headerHeight)}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={handleEndReached}
        ListHeaderComponent={
          // under the title, as in the design; a header subtitle would sit above it and shift the row off the other tabs'
          <UIText color="secondary" style={styles.subtitle}>
            {t("faq.subtitle")}
          </UIText>
        }
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={56} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={56} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FaqItem entry={item} />
          </View>
        )}
      />
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!isPending && !isError && visible.length === 0 ? (
        <UIEmpty isScreenCentred message={t("faq.empty")} />
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
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
  subtitle: { paddingBottom: theme.vs(16) },
  cell: { paddingBottom: theme.vs(8) },
}));
