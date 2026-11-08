import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { CommentsSheet, LikeButton, PostMedia } from "@/components/feed";
import { ReportSheet } from "@/components/report";
import type { FeedNavigationFilters } from "@/@types/feed";
import {
  useDeleteFeedPost,
  useFeedPost,
  useFeedPostNavigation,
} from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIGlass,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { authorName, postDate } from "@/utils";

export default function PostScreen() {
  const { id, ...filters } = useLocalSearchParams<
    FeedNavigationFilters & { id: string }
  >();
  const { t, i18n } = useTranslation();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { data: profile } = useMyProfile();
  const { data: navigation } = useFeedPostNavigation(id, filters);
  const commentsRef = useRef<BottomSheetModal>(null);
  const reportRef = useRef<BottomSheetModal>(null);
  const { mutateAsync: deletePost, isPending: isDeleting } =
    useDeleteFeedPost();
  const isAuthor = Boolean(post && profile?.id === post.author.id);
  const date = post ? postDate(post, i18n.resolvedLanguage ?? "en") : "";

  const handleBackPress = () => router.back();

  // replace, not push: back from any neighbour returns to the list.
  const openPost = (postId: string) =>
    router.replace({
      pathname: "/post/[id]",
      params: { ...filters, id: postId },
    });
  const handlePreviousPress = () =>
    navigation?.previousId && openPost(navigation.previousId);
  const handleNextPress = () =>
    navigation?.nextId && openPost(navigation.nextId);

  const handleEditPress = () =>
    router.push({ pathname: "/post/edit/[id]", params: { id } });

  const handleReportPress = () => reportRef.current?.present();

  const handleCommentsPress = () => commentsRef.current?.present();

  const confirmDelete = async () => {
    try {
      await deletePost(id);
      toast.success(t("apiState.postDeleted"));
      router.back();
    } catch {
      toast.error(t("apiState.error"));
    }
  };

  const handleDeletePress = () =>
    Alert.alert(
      t("apiState.deletePostTitle"),
      t("apiState.deletePostDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
      ],
    );

  return (
    <UIPage>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.back")}
          onPress={handleBackPress}
          style={styles.headerButton}
        >
          <Icon name="arrow-left" size={18} />
        </Pressable>
        <UIText size="md" weight="semibold" style={styles.grow}>
          {t("postComposer.post")}
        </UIText>
        {navigation ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("feed.previousPost")}
            disabled={!navigation.previousId}
            onPress={handlePreviousPress}
            style={styles.navButton(Boolean(navigation.previousId))}
          >
            <Icon name="chevron-up" size={18} />
          </Pressable>
        ) : null}
        {navigation ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("feed.nextPost")}
            disabled={!navigation.nextId}
            onPress={handleNextPress}
            style={styles.navButton(Boolean(navigation.nextId))}
          >
            <Icon name="chevron-down" size={18} />
          </Pressable>
        ) : null}
        {isAuthor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("apiState.editPost")}
            onPress={handleEditPress}
            style={styles.headerButton}
          >
            <Icon name="pencil" size={18} />
          </Pressable>
        ) : null}
        {isAuthor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.remove")}
            disabled={isDeleting}
            onPress={handleDeletePress}
            style={styles.headerButton}
          >
            <Icon
              name="trash"
              size={18}
              uniProps={(theme) => ({ color: theme.colors.white60 })}
            />
          </Pressable>
        ) : null}
        {post && !isAuthor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("report.post")}
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
      <ScrollView contentContainerStyle={styles.content}>
        {isPending ? (
          <UISkeleton height={180} />
        ) : isError || !post ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : (
          <>
            <UIGlass radius={24} style={styles.card}>
              <View style={styles.row}>
                <UIAvatar size="xs" imageSrc={post.author.avatarUrl} />
                <UIText size="sm" color="soft" numberOfLines={1}>
                  {authorName(post.author) || t("apiState.student")},{" "}
                  {post.author.universityId.toUpperCase()} · {date}
                </UIText>
              </View>
              {post.mediaUrls?.length ? (
                <PostMedia urls={post.mediaUrls} />
              ) : null}
              <UIText size="title3" weight="semibold" style={styles.title}>
                {post.title}
              </UIText>
              {post.type === "event" && post.eventDate ? (
                <View style={styles.row}>
                  <Icon
                    name="calendar"
                    size={14}
                    uniProps={(theme) => ({ color: theme.colors.white60 })}
                  />
                  <UIText size="sm" color="secondary">
                    {date}
                  </UIText>
                </View>
              ) : null}
              <UIText color="soft" style={styles.body}>
                {post.content}
              </UIText>
              {post.tags?.length ? (
                <View style={styles.tags}>
                  {post.tags.map((tag) => (
                    <UIText key={tag} size="sm" weight="medium" color="link">
                      #{tag}
                    </UIText>
                  ))}
                </View>
              ) : null}
              <View style={styles.stats}>
                <LikeButton
                  id={post.id}
                  kind="post"
                  liked={post.likedByMe}
                  count={post.likesCount}
                />
                <View style={styles.row}>
                  <Icon
                    name="message-circle"
                    size={14}
                    uniProps={(theme) => ({ color: theme.colors.white60 })}
                  />
                  <UIText size="sm" color="secondary">
                    {t("feed.commentsCount", { count: post.commentsCount })}
                  </UIText>
                </View>
                <View style={styles.row}>
                  <Icon
                    name="users"
                    size={14}
                    uniProps={(theme) => ({ color: theme.colors.white60 })}
                  />
                  <UIText size="sm" color="secondary">
                    {post.university === "all"
                      ? t("feed.allStudents")
                      : post.university.toUpperCase()}
                  </UIText>
                </View>
              </View>
            </UIGlass>
            <Pressable accessibilityRole="button" onPress={handleCommentsPress}>
              <UIGlass radius={999} style={styles.commentsButton}>
                <Icon name="message-circle" size={18} />
                <UIText size="rg" weight="semibold" style={styles.grow}>
                  {t("app.comments")}
                </UIText>
                <UIText color="secondary">{post.commentsCount}</UIText>
                <Icon
                  name="chevron-up"
                  size={16}
                  uniProps={(theme) => ({ color: theme.colors.white60 })}
                />
              </UIGlass>
            </Pressable>
          </>
        )}
      </ScrollView>
      <CommentsSheet postId={id} ref={commentsRef} />
      <ReportSheet ref={reportRef} targetId={id} targetType="post" />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(44),
    marginTop: theme.vs(8),
    paddingHorizontal: theme.s(16),
  },
  headerButton: {
    width: theme.vs(44),
    height: theme.vs(44),
    borderRadius: theme.vs(22),
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: (enabled: boolean) => ({
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
    opacity: enabled ? 1 : 0.3,
  }),
  grow: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(12),
    gap: theme.vs(16),
  },
  card: {
    padding: theme.s(16),
    gap: theme.vs(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
  },
  title: {
    lineHeight: theme.vs(18 * 1.25),
  },
  body: {
    lineHeight: theme.vs(15 * 1.45),
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.s(8),
  },
  stats: {
    flexDirection: "row",
    gap: theme.s(14),
    paddingTop: theme.vs(4),
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(52),
    paddingHorizontal: theme.s(18),
  },
}));
