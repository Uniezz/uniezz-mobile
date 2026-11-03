import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { FeedComment } from "@/@types/feed";
import {
  useCommentReplies,
  useDeleteFeedComment,
  useUpdateFeedComment,
} from "@/hooks/useFeedComments";
import { UIAvatar, UIText } from "@/ui";
import { authorName, postDate } from "@/utils";
import { LikeButton } from "./LikeButton";

type CommentItemProps = {
  comment: FeedComment;
  myId?: string;
  onReply: (comment: FeedComment) => void;
  onReport: (comment: FeedComment) => void;
};

export const CommentItem = ({
  comment,
  myId,
  onReply,
  onReport,
}: CommentItemProps) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const isTopLevel = comment.parentId === null;
  const isMine = Boolean(myId && comment.author?.id === myId);
  const { data: replies } = useCommentReplies(
    comment.id,
    expanded && isTopLevel,
  );
  const { mutateAsync: updateComment, isPending: isSaving } =
    useUpdateFeedComment();
  const { mutateAsync: deleteComment } = useDeleteFeedComment();
  const name = authorName(comment.author) || t("apiState.student");

  const handleReplyPress = () => onReply(comment);
  const handleReportPress = () => onReport(comment);
  const handleEditPress = () => setDraft(comment.content ?? "");
  const handleCancelEdit = () => setDraft(null);
  const handleToggleReplies = () => setExpanded(!expanded);

  const handleSavePress = async () => {
    const content = draft?.trim();
    if (!content) return;
    try {
      await updateComment({ id: comment.id, content });
      setDraft(null);
    } catch {
      toast.error(t("apiState.error"));
    }
  };

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
        <UIAvatar
          size={isTopLevel ? "sm" : "xs"}
          imageSrc={comment.author?.avatarUrl}
        />
        <View style={styles.content}>
          <View style={styles.top}>
            <UIText size="body" weight="semibold" numberOfLines={1}>
              {name}
            </UIText>
            <UIText size="xs" color="secondary">
              {comment.author?.universityId.toUpperCase()} ·{" "}
              {postDate(
                { eventDate: null, createdAt: comment.createdAt },
                i18n.resolvedLanguage ?? "en",
              )}
            </UIText>
          </View>
          {draft === null ? (
            <UIText
              color={comment.deleted ? "secondary" : "soft"}
              style={styles.text}
            >
              {comment.deleted ? t("apiState.deletedComment") : comment.content}
            </UIText>
          ) : (
            <View style={styles.editor}>
              <BottomSheetTextInput
                value={draft}
                onChangeText={setDraft}
                maxLength={1000}
                multiline
                autoFocus
                accessibilityLabel={t("apiState.editComment")}
                style={styles.input}
              />
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleCancelEdit}
                  hitSlop={6}
                >
                  <UIText size="sm" weight="semibold" color="secondary">
                    {t("postComposer.cancel")}
                  </UIText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving || !draft.trim()}
                  onPress={handleSavePress}
                  hitSlop={6}
                >
                  <UIText size="sm" weight="semibold" color="link">
                    {t("app.saveChanges")}
                  </UIText>
                </Pressable>
              </View>
            </View>
          )}
          {comment.deleted || draft !== null ? null : (
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
  text: {
    lineHeight: theme.vs(15 * 1.4),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(16),
  },
  editor: {
    gap: theme.vs(8),
  },
  input: {
    minHeight: theme.vs(44),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white40,
    backgroundColor: theme.colors.surface60,
    paddingHorizontal: theme.s(12),
    paddingVertical: theme.vs(10),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
  },
}));
