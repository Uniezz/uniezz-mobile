import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Share,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  GrantRow,
  QuestCard,
  RedeemInviteCard,
  ShopPreview,
} from "@/components/rewards";
import {
  useMyCoinGrants,
  useMyDailyQuests,
  useMyInviteCode,
  useMyProfile,
} from "@/hooks";
import {
  UICoin,
  UICollapsingHeader,
  UIEmpty,
  UIPage,
  UIQueryError,
  UISkeleton,
  UISubTabs,
  UIButton,
  UIGlass,
  UIText,
} from "@/ui";
import {
  canRedeemInvite,
  formatCompactCount,
  HEADER_COMPACT_OFFSET,
  inviteUrl,
} from "@/utils";

export default function RewardsScreen() {
  const { t, i18n } = useTranslation();
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  // 0: earn (quests and history), 1: spend (a blurred preview until there is a shop)
  const [tab, setTab] = useState(0);
  const isEarn = tab === 0;
  const { data: profile, refetch: refetchProfile } = useMyProfile();
  const {
    data: invite,
    isPending: isInvitePending,
    isError: isInviteError,
    refetch: refetchInvite,
  } = useMyInviteCode();
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
  // the balance comes from the profile, so pulling refreshes it too, e.g. after a friend redeems your code
  const handleRefresh = () =>
    Promise.all([refetch(), refetchQuests(), refetchProfile()]);
  const handleInvitePress = () => {
    if (!invite) return;
    const link = inviteUrl(invite.code);
    // iOS gets the link as its own item, so the share sheet and messengers build the preview card from it;
    // Android shares one text, and the messenger previews the link inside it
    return Share.share(
      Platform.OS === "ios"
        ? { message: t("rewards.invitePitch"), url: link }
        : {
            message: t("rewards.inviteMessage", { link }),
            title: t("rewards.inviteFriends"),
          },
    );
  };
  const handleEndReached = () => {
    if (isEarn && hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("rewards.title")}
        isCompact={isHeaderCompact}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
      >
        <UISubTabs
          items={[t("rewards.earnTab"), t("rewards.spendTab")]}
          selectedItemIndex={tab}
          onPress={setTab}
        />
      </UICollapsingHeader>
      <FlashList
        data={isEarn ? grants : []}
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
              <View style={styles.coinsRow}>
                <UICoin size="lg" />
                <UIText size="xl" weight="bold" style={styles.coins}>
                  {formatCompactCount(
                    profile?.coins ?? 0,
                    i18n.resolvedLanguage ?? i18n.language,
                  )}
                </UIText>
              </View>
            </View>
            {isInvitePending ? (
              <UISkeleton height={116} />
            ) : isInviteError ? (
              <UIQueryError
                message={t("apiState.error")}
                onRetry={refetchInvite}
              />
            ) : invite ? (
              <UIGlass radius={16} style={styles.invite}>
                <View style={styles.inviteCode}>
                  <UIText size="sm" color="secondary">
                    {t("rewards.inviteCode")}
                  </UIText>
                  <UIText weight="semibold">{invite.code}</UIText>
                </View>
                <UIButton
                  onPress={handleInvitePress}
                  type="secondary"
                  size="sm"
                  radius="sm"
                  accessibilityRole="button"
                  accessibilityLabel={t("rewards.inviteFriends")}
                >
                  <UIText weight="semibold">
                    {t("rewards.inviteFriends")}
                  </UIText>
                </UIButton>
              </UIGlass>
            ) : null}
            {profile && canRedeemInvite(profile.createdAt) ? (
              <RedeemInviteCard />
            ) : null}
            {isEarn ? (
              <>
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
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !isEarn ? (
            <ShopPreview />
          ) : isPending ? (
            <UISkeleton height={56} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : (
            // under the quests, not screen-centred: the header above fills the screen
            <UIEmpty message={t("rewards.historyEmpty")} />
          )
        }
        ListFooterComponent={
          isEarn && isFetchingNextPage ? <UISkeleton height={56} /> : null
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
  invite: {
    gap: theme.vs(12),
    padding: theme.s(16),
  },
  inviteCode: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balance: { gap: theme.vs(2) },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  coins: { color: theme.colors.amber },
}));
