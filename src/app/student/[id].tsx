import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  InterestChips,
  ProfileHeader,
  ProfileHero,
  ProgrammeCard,
} from "@/components/profile";
import { FeedPostCard } from "@/components/feed";
import { ReportSheet } from "@/components/report";
import { useFeedPosts } from "@/hooks/useFeed";
import { usePublicProfile } from "@/hooks/useProfiles";
import {
  Icon,
  UIButton,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { authorName, FEED_HEADER_COMPACT_OFFSET, GENDER_LABELS } from "@/utils";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: profile, isPending, isError, refetch } = usePublicProfile(id);
  const reportRef = useRef<BottomSheetModal>(null);
  const postFilters = { authorId: id };
  const {
    data: postPages,
    isPending: arePostsPending,
    isError: arePostsError,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedPosts(postFilters);
  const posts = profile
    ? (postPages?.pages.flatMap((page) => page.items ?? []) ?? [])
    : [];
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  // the header floats over the list; scrolling blurs it and swaps its title for the name
  const [headerHeight, setHeaderHeight] = useState(0);
  // a boolean, so a scroll only re-renders when it flips
  const [isScrolled, setIsScrolled] = useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(
      event.nativeEvent.contentOffset.y > FEED_HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleBackPress = () => router.back();
  const handleReportPress = () => reportRef.current?.present();
  const handleMessagePress = () => router.push("/(tabs)/chat");

  const reportAction = profile ? (
    <UIIconButton
      accessibilityRole="button"
      accessibilityLabel={t("report.user")}
      onPress={handleReportPress}
    >
      <Icon name="flag" size={18} />
    </UIIconButton>
  ) : null;

  return (
    <UIPage>
      <ProfileHeader
        title={t("students.profile")}
        name={profile ? authorName(profile) || t("apiState.student") : ""}
        avatarUrl={profile?.avatarUrl}
        universityId={profile?.universityId}
        isScrolled={isScrolled}
        action={reportAction}
        onLayout={handleHeaderLayout}
        onBackPress={handleBackPress}
      />
      <FlashList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.page}>
            {isPending ? (
              <UISkeleton height={220} />
            ) : isError || !profile ? (
              <UIQueryError message={t("apiState.error")} onRetry={refetch} />
            ) : (
              <>
                <ProfileHero
                  avatar={profile.avatarUrl}
                  name={authorName(profile) || t("apiState.student")}
                  subtitle={profile.email}
                  universityId={profile.universityId}
                >
                  {profile.gender ? (
                    <UIText size="sm" color="secondary">
                      {t(GENDER_LABELS[profile.gender])}
                    </UIText>
                  ) : null}
                  {profile.bio ? (
                    <UIText size="rg" color="soft" style={styles.bio}>
                      {profile.bio}
                    </UIText>
                  ) : null}
                  {profile.interests?.length ? (
                    <InterestChips interests={profile.interests} />
                  ) : null}
                  <UIButton
                    accessibilityRole="button"
                    radius="md"
                    onPress={handleMessagePress}
                    style={styles.message}
                  >
                    <Icon
                      name="message-circle"
                      size={18}
                      uniProps={(theme) => ({ color: theme.colors.ink })}
                    />
                    <UIText size="rg" weight="semibold" color="black">
                      {t("app.message")}
                    </UIText>
                  </UIButton>
                </ProfileHero>
                {profile.programmes?.length ? (
                  <View style={styles.section}>
                    <UIText size="md" weight="semibold">
                      {t("app.studyProgrammes")}
                    </UIText>
                    {profile.programmes.map((programme) => (
                      <ProgrammeCard
                        key={programme.programme}
                        programme={programme}
                      />
                    ))}
                  </View>
                ) : null}
                <UIText size="md" weight="semibold">
                  {t("students.posts")}
                </UIText>
              </>
            )}
          </View>
        }
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list(headerHeight)}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          !profile ? null : arePostsPending ? (
            <UISkeleton height={120} />
          ) : arePostsError ? (
            <UIQueryError
              message={t("apiState.error")}
              onRetry={refetchPosts}
            />
          ) : (
            <UIText color="secondary">{t("students.noPosts")}</UIText>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={110} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FeedPostCard post={item} filters={postFilters} />
          </View>
        )}
      />
      <ReportSheet ref={reportRef} targetId={id} targetType="user" />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
  }),
  page: {
    paddingBottom: theme.vs(12),
    gap: theme.vs(20),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
  bio: {
    lineHeight: theme.vs(24),
  },
  message: {
    height: theme.vs(52),
    flexDirection: "row",
    gap: theme.s(8),
  },
  section: {
    gap: theme.vs(12),
  },
}));
