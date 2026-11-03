import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { CommentsSheet } from "@/components/feed";
import { useFeedPost } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIGlass,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { data: profile } = useMyProfile();
  const commentsRef = useRef<BottomSheetModal>(null);

  return (
    <UIPage backdrop="city">
      <View style={styles.header}>
        <UIIconButton
          size="lg"
          accessibilityRole="button"
          accessibilityLabel={t("app.back")}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={18} />
        </UIIconButton>
        {post && profile?.id === post.author.id ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/feed/post/edit/[id]", params: { id } })
            }
          >
            <UIText color="link" weight="semibold">
              {t("app.edit")}
            </UIText>
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
            <UIGlass style={styles.card}>
              <UIText size="lg" weight="semibold">
                {post.title}
              </UIText>
              <UIText color="soft">{post.content}</UIText>
            </UIGlass>
            <Pressable
              accessibilityRole="button"
              onPress={() => commentsRef.current?.present()}
            >
              <UIGlass radius={999} style={styles.commentsButton}>
                <Icon name="message-square" size={18} />
                <UIText weight="semibold" style={styles.grow}>
                  {t("app.comments")}
                </UIText>
                <UIText color="secondary">{post.commentsCount}</UIText>
              </UIGlass>
            </Pressable>
          </>
        )}
      </ScrollView>
      <CommentsSheet postId={id} ref={commentsRef} />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
  },
  content: {
    padding: theme.s(16),
    gap: theme.vs(16),
  },
  card: {
    padding: theme.s(16),
    gap: theme.vs(10),
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(52),
    paddingHorizontal: theme.s(18),
  },
  grow: {
    flex: 1,
  },
}));
