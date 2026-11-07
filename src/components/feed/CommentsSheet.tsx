import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import {
  BottomSheetFooter,
  BottomSheetTextInput,
  useBottomSheetScrollableCreator,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { LegendList } from "@legendapp/list/react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CommentFormValues, FeedComment } from "@/@types/feed";
import { ReportSheet } from "@/components/report";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCreateComment, useFeedComments } from "@/hooks/useFeedComments";
import { commentSchema } from "@/schemas";
import { authorName } from "@/utils";
import { CommentItem } from "./CommentItem";
import { Icon, UIBottomSheet, UIQueryError, UISkeleton, UIText } from "@/ui";

type CommentsSheetProps = {
  postId: string;
  ref: Ref<BottomSheetModal>;
};

export const CommentsSheet = ({ postId, ref }: CommentsSheetProps) => {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [reportTarget, setReportTarget] = useState<FeedComment | null>(null);
  const reportRef = useRef<BottomSheetModal>(null);
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage } =
    useFeedComments(postId);
  const { createComment, isPending: isSending } = useCreateComment();
  const { control, handleSubmit, reset, formState } =
    useForm<CommentFormValues>({
      resolver: zodResolver(commentSchema),
      defaultValues: { content: "" },
    });
  const renderScrollComponent = useBottomSheetScrollableCreator({
    enableFooterMarginAdjustment: true,
  });
  const comments = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const posthog = usePostHog();
  const onSend = handleSubmit(
    async ({ content }) => {
      try {
        await createComment({
          id: postId,
          content,
          replyToCommentId: replyTo?.id,
        });
        reset();
        setReplyTo(null);
      } catch {
        toast.error(t("apiState.error"));
      }
    },
    () => captureAction(posthog, "comment_form", "validation_failed"),
  );

  const handleSendPress = () => onSend();
  const handleCancelReply = () => setReplyTo(null);
  const handleReport = (comment: FeedComment) => {
    setReportTarget(comment);
    reportRef.current?.present();
  };

  return (
    <>
      <UIBottomSheet
        ref={ref}
        title={t("app.comments")}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        footerComponent={(props) => (
          <BottomSheetFooter {...props}>
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
                  onPress={handleCancelReply}
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
            <View style={styles.composer}>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <BottomSheetTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("app.addComment")}
                    placeholderTextColor={styles.placeholder.color}
                    maxLength={1000}
                    multiline
                    style={styles.input}
                  />
                )}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.send")}
                disabled={isSending || !formState.isValid}
                onPress={handleSendPress}
                style={styles.send}
              >
                <Icon
                  name="arrow-up"
                  size={18}
                  uniProps={(theme) => ({ color: theme.colors.ink })}
                />
              </Pressable>
            </View>
          </BottomSheetFooter>
        )}
      >
        <LegendList
          data={comments}
          renderScrollComponent={renderScrollComponent}
          keyExtractor={(comment) => comment.id}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          ListEmptyComponent={
            isPending ? (
              <UISkeleton height={64} />
            ) : isError ? (
              <UIQueryError message={t("apiState.error")} onRetry={refetch} />
            ) : (
              <UIText color="secondary">{t("app.empty")}</UIText>
            )
          }
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              myId={profile?.id}
              onReply={setReplyTo}
              onReport={handleReport}
            />
          )}
        />
      </UIBottomSheet>
      <ReportSheet
        ref={reportRef}
        targetId={reportTarget?.id ?? ""}
        targetType="comment"
      />
    </>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  list: {
    paddingHorizontal: theme.s(16),
  },
  replying: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
    paddingHorizontal: theme.s(20),
    paddingTop: theme.vs(8),
    backgroundColor: theme.colors.surface,
  },
  grow: {
    flex: 1,
  },
  send: {
    width: theme.vs(44),
    height: theme.vs(44),
    borderRadius: theme.vs(22),
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: rt.insets.bottom + theme.vs(8),
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    color: theme.colors.white60,
  },
  input: {
    flex: 1,
    minHeight: theme.vs(44),
    maxHeight: theme.vs(120),
    borderRadius: theme.vs(22),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(12),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
}));
