import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GrantRow, QuestCard } from "@/components/rewards";
import { useMyCoinGrants, useMyDailyQuests, useMyProfile } from "@/hooks";
import {
  UICollapsingHeader,
  UIEmpty,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

export default function RewardsScreen() {
  const { t } = useTranslation();
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const { data: profile } = useMyProfile();
  const {
    data: quests,
    isPending: isQuestsPending,
    isError: isQuestsError,
    refetch: refetchQuests,
  } = useMyDailyQuests();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useMyCoinGrants();
  const grants = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleBackPress = () => router.back();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleRefresh = () => Promise.all([refetch(), refetchQuests()]);
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("rewards.title")}
        isCompact={isHeaderCompact}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        data={grants}
        keyExtractor={(grant, index) => `${grant.createdAt}-${index}`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        contentContainerStyle={styles.list(headerHeight)}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleEndReached}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.balance}>
              <UIText size="sm" color="secondary">
                {t("rewards.balance")}
              </UIText>
              <UIText size="xl" weight="bold" style={styles.coins}>
                {profile?.coins ?? 0}
              </UIText>
            </View>
            {isQuestsPending ? (
              <UISkeleton height={180} />
            ) : isQuestsError ? (
              <UIQueryError
                message={t("apiState.error")}
                onRetry={refetchQuests}
              />
            ) : (
              <QuestCard quests={quests} />
            )}
            <UIText weight="semibold">{t("rewards.historyTitle")}</UIText>
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={56} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : (
            // under the quests, not screen-centred: the header above fills the screen
            <UIEmpty message={t("rewards.historyEmpty")} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={56} /> : null
        }
        renderItem={({ item }) => <GrantRow grant={item} />}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(8),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(40),
  }),
  header: {
    gap: theme.vs(16),
    paddingBottom: theme.vs(4),
  },
  balance: { gap: theme.vs(2) },
  coins: { color: theme.colors.amber },
}));
