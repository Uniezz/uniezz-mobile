import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  InterestChips,
  ProfileHero,
  ProgrammeCard,
} from "@/components/profile";
import { FeedPostCard } from "@/components/feed";
import { ReportSheet } from "@/components/report";
import { useFeedPosts } from "@/hooks/useFeed";
import { usePublicProfile } from "@/hooks/useProfiles";
import { Icon, UIPage, UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName, GENDER_LABELS } from "@/utils";

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

  const handleBackPress = () => router.back();
  const handleReportPress = () => reportRef.current?.present();
  const handleMessagePress = () => router.push("/(tabs)/chat");

  return (
    <UIPage>
      <FlashList
        ListHeaderComponent={
          <View style={styles.page}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.back")}
                onPress={handleBackPress}
                style={styles.headerButton}
              >
                <Icon name="arrow-left" size={18} />
              </Pressable>
              {profile ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("report.user")}
                  onPress={handleReportPress}
                  style={styles.headerButton}
                >
                  <Icon
                    name="flag"
                    size={18}
                    uniProps={(theme) => ({ color: theme.colors.white60 })}
                  />
                </Pressable>
              ) : null}
            </View>
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
                  <Pressable
                    accessibilityRole="button"
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
                  </Pressable>
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
        contentContainerStyle={styles.list}
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

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
  },
  page: {
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(12),
    gap: theme.vs(20),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
  header: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    lineHeight: theme.vs(24),
  },
  message: {
    height: theme.vs(48),
    paddingHorizontal: theme.s(28),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  section: {
    gap: theme.vs(12),
  },
}));
