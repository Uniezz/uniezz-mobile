import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { FeedComment } from "@/@types/feed";
import {
  useCommentReplies,
  useDeleteFeedComment,
} from "@/hooks/useFeedComments";
import { UIAvatar, UIText, UIUniversityLogo } from "@/ui";
import { authorName, postDate, profileHref } from "@/utils";
import { LikeButton } from "./LikeButton";

type CommentItemProps = {
  comment: FeedComment;
  myId?: string;
  onReply: (comment: FeedComment) => void;
  /** edits happen in the post's comment field */
  onEdit: (comment: FeedComment) => void;
  onReport: (comment: FeedComment) => void;
};

export const CommentItem = ({
  comment,
  myId,
  onReply,
  onEdit,
  onReport,
}: CommentItemProps) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isTopLevel = comment.parentId === null;
  const isMine = Boolean(myId && comment.author?.id === myId);
  const { data: replies } = useCommentReplies(
    comment.id,
    expanded && isTopLevel,
  );
  const { mutateAsync: deleteComment } = useDeleteFeedComment();
  const name = authorName(comment.author) || t("apiState.student");

  const handleAuthorPress = () => {
    if (!comment.author) return;
    router.push(profileHref(comment.author.id, myId));
  };
  const handleReplyPress = () => onReply(comment);
  const handleReportPress = () => onReport(comment);
  const handleEditPress = () => onEdit(comment);
  const handleToggleReplies = () => setExpanded(!expanded);

  const confirmDelete = async () => {
    try {
      await deleteComment(comment.id);
      toast.success(t("apiState.commentDeleted"));
    } catch {
      toast.error(t("apiState.error"));
    }
  };

  const handleDeletePress = () =>
    Alert.alert(
      t("apiState.deleteCommentTitle"),
      t("apiState.deleteCommentDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
      ],
    );

  return (
    <View style={styles.item(isTopLevel)}>
      <View style={styles.comment}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={name}
          disabled={!comment.author}
          onPress={handleAuthorPress}
        >
          <UIAvatar
            size={isTopLevel ? "sm" : "xs"}
            imageSrc={comment.author?.avatarUrl}
          />
        </Pressable>
        <View style={styles.content}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={name}
            disabled={!comment.author}
            onPress={handleAuthorPress}
            style={styles.top}
          >
            <UIText
              size="body"
              weight="semibold"
              numberOfLines={1}
              style={styles.name}
            >
              {name}
            </UIText>
            {comment.author ? (
              <UIUniversityLogo id={comment.author.universityId} size="xxs" />
            ) : null}
            <UIText size="xs" color="secondary">
              ·{" "}
              {postDate(
                { eventDate: null, createdAt: comment.createdAt },
                i18n.resolvedLanguage ?? "en",
              )}
            </UIText>
          </Pressable>
          <UIText
            color={comment.deleted ? "secondary" : "soft"}
            style={styles.text}
          >
            {comment.deleted ? t("apiState.deletedComment") : comment.content}
          </UIText>
          {comment.deleted ? null : (
            <View style={styles.actions}>
              <LikeButton
                id={comment.id}
                kind="comment"
                liked={comment.likedByMe}
                count={comment.likesCount}
              />
              {isTopLevel ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleReplyPress}
                  hitSlop={6}
                >
                  <UIText size="sm" weight="semibold" color="secondary">
                    {t("apiState.reply")}
                  </UIText>
                </Pressable>
              ) : null}
              {isMine ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleEditPress}
                    hitSlop={6}
                  >
                    <UIText size="sm" weight="semibold" color="secondary">
                      {t("app.edit")}
                    </UIText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleDeletePress}
                    hitSlop={6}
                  >
                    <UIText size="sm" weight="semibold" color="error">
                      {t("app.remove")}
                    </UIText>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleReportPress}
                  hitSlop={6}
                >
                  <UIText size="sm" weight="semibold" color="secondary">
                    {t("report.comment")}
                  </UIText>
                </Pressable>
              )}
            </View>
          )}
          {isTopLevel && comment.repliesCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleToggleReplies}
              hitSlop={6}
            >
              <UIText size="sm" weight="semibold" color="link">
                {expanded
                  ? t("apiState.hideReplies")
                  : t("apiState.showReplies", { total: comment.repliesCount })}
              </UIText>
            </Pressable>
          ) : null}
        </View>
      </View>
      {expanded
        ? replies?.pages
            .flatMap((page) => page.items ?? [])
            .map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                myId={myId}
                onReply={onReply}
                onEdit={onEdit}
                onReport={onReport}
              />
            ))
        : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: (isTopLevel: boolean) => ({
    paddingLeft: isTopLevel ? 0 : theme.s(42),
  }),
  comment: {
    flexDirection: "row",
    gap: theme.s(10),
    paddingVertical: theme.vs(9),
    paddingHorizontal: theme.s(4),
  },
  content: {
    flex: 1,
    gap: theme.vs(6),
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  name: {
    flexShrink: 1,
  },
  text: {
    lineHeight: theme.vs(15 * 1.4),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(16),
  },
}));
