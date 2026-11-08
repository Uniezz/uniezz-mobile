import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHog } from "posthog-react-native";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CommentFormValues, FeedComment } from "@/@types/feed";
import { useCreateComment } from "@/hooks/useFeedComments";
import { commentSchema } from "@/schemas";
import { Icon, UIText } from "@/ui";
import { authorName } from "@/utils";
import { captureAction } from "@/utils/analytics";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
}));

type CommentComposerProps = {
  postId: string;
  /** the comment being replied to, if any */
  replyTo: FeedComment | null;
  onCancelReply: () => void;
};

// the comment field under a post; replies when a comment is picked
export const CommentComposer = ({
  postId,
  replyTo,
  onCancelReply,
}: CommentComposerProps) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { createComment, isPending } = useCreateComment();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
    mode: "onChange",
  });
  const handleSendPress = handleSubmit(
    async ({ content }) => {
      try {
        await createComment({
          id: postId,
          content,
          replyToCommentId: replyTo?.id,
        });
        reset();
        onCancelReply();
        toast.success(t("apiState.commentSent"));
      } catch {
        toast.error(t("apiState.error"));
      }
    },
    () => captureAction(posthog, "comment_form", "validation_failed"),
  );

  return (
    <View style={styles.container}>
      {replyTo ? (
        <View style={styles.replying}>
          <UIText
            size="sm"
            color="secondary"
            numberOfLines={1}
            style={styles.grow}
          >
            {t("apiState.replyingTo", {
              name: authorName(replyTo.author) || t("apiState.student"),
            })}
          </UIText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("postComposer.cancel")}
            onPress={onCancelReply}
            hitSlop={8}
          >
            <Icon
              name="x"
              size={16}
              uniProps={(theme) => ({ color: theme.colors.white60 })}
            />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <View style={styles.field}>
              <ThemedTextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder={t("app.addComment")}
                maxLength={1000}
                multiline
                style={styles.input}
              />
            </View>
          )}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.send")}
          disabled={isPending || !isValid}
          onPress={handleSendPress}
          style={styles.send(isPending || !isValid)}
        >
          <Icon
            name="arrow-up"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(8),
  },
  replying: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
    paddingHorizontal: theme.s(4),
  },
  grow: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  // grows from one line; padding centres that first line in the 48pt pill
  // the pill centres the input, so its first line sits in the middle whether it holds text or a taller emoji line
  field: {
    flex: 1,
    minHeight: theme.vs(48),
    maxHeight: theme.vs(120),
    justifyContent: "center",
    borderRadius: theme.vs(24),
    borderWidth: 1,
    borderColor: theme.colors.white14,
    backgroundColor: theme.colors.white5,
    paddingHorizontal: theme.s(16),
  },
  // a fixed line height fits an emoji line, so adding or removing emoji doesn't change the height
  input: {
    maxHeight: theme.vs(118),
    lineHeight: theme.vs(22),
    paddingTop: theme.vs(12),
    paddingBottom: theme.vs(12),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
  send: (isDisabled: boolean) => ({
    width: theme.vs(48),
    height: theme.vs(48),
    borderRadius: theme.vs(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    opacity: isDisabled ? 0.5 : 1,
  }),
}));
