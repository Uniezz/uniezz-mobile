import {
  BottomSheetFooter,
  BottomSheetTextInput,
  useBottomSheetScrollableCreator,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { LegendList } from "@legendapp/list/react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CommentFormValues } from "@/@types/feed";
import { useCreateComment, useFeedComments } from "@/hooks/useFeedComments";
import { commentSchema } from "@/schemas";
import {
  Icon,
  UIBottomSheet,
  UIIconButton,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";

type CommentsSheetProps = {
  postId: string;
  ref: Ref<BottomSheetModal>;
};

export const CommentsSheet = ({ postId, ref }: CommentsSheetProps) => {
  const { t } = useTranslation();
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

  const onSend = handleSubmit(async ({ content }) => {
    try {
      await createComment({ id: postId, content });
      reset();
    } catch {
      toast.error(t("apiState.error"));
    }
  });

  return (
    <UIBottomSheet
      ref={ref}
      title={t("app.comments")}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      footerComponent={(props) => (
        <BottomSheetFooter {...props}>
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
                  maxLength={1000}
                  multiline
                  style={styles.input}
                />
              )}
            />
            <UIIconButton
              size="lg"
              accessibilityRole="button"
              accessibilityLabel={t("app.send")}
              disabled={isSending || !formState.isValid}
              onPress={() => onSend()}
            >
              <Icon name="send" size={18} />
            </UIIconButton>
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
          <View style={styles.comment}>
            <UIText size="sm" weight="semibold">
              {item.author
                ? `${item.author.firstName ?? ""} ${item.author.lastName ?? ""}`.trim()
                : t("apiState.student")}
            </UIText>
            <UIText color="soft">
              {item.deleted ? t("apiState.deletedComment") : item.content}
            </UIText>
          </View>
        )}
      />
    </UIBottomSheet>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  list: {
    paddingHorizontal: theme.s(20),
  },
  comment: {
    gap: theme.vs(4),
    paddingVertical: theme.vs(8),
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
  input: {
    flex: 1,
    minHeight: theme.vs(44),
    maxHeight: theme.vs(120),
    borderRadius: theme.vs(22),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(12),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
}));
