import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { EditPostFormValues } from "@/@types/feed";
import { ComposerHeader, PostField, PostTagsField } from "@/components/feed";
import { useFeedPost, useUpdateFeedPost } from "@/hooks/useFeed";
import { editPostSchema } from "@/schemas";
import { Icon, UIPage, UIQueryError, UISkeleton, UIText } from "@/ui";

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { mutateAsync: updatePost, isPending: isSaving } = useUpdateFeedPost();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostSchema),
    values: post && {
      title: post.title,
      content: post.content,
      tags: post.tags ?? [],
    },
  });

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await updatePost({ id, body: values });
        toast.success(t("app.saved"));
        router.back();
      } catch {
        toast.error(t("apiState.error"));
      }
    },
    () => captureAction(posthog, "post_update_form", "validation_failed"),
  );

  const handleSubmitPress = () => onSubmit();

  return (
    <UIPage backdrop="city">
      <View style={styles.header}>
        <ComposerHeader
          title={t("apiState.editPost")}
          actionLabel={t("app.saveChanges")}
          disabled={isSaving || !isDirty}
          onAction={handleSubmitPress}
        />
      </View>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        {isPending ? (
          <UISkeleton height={180} />
        ) : isError || !post ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : (
          <>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <PostField
                  label={t("postComposer.title")}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={150}
                  errorText={errors.title?.message && t(errors.title.message)}
                />
              )}
            />
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <PostField
                  tall
                  label={t("postComposer.details")}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={5000}
                  errorText={
                    errors.content?.message && t(errors.content.message)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <PostTagsField value={field.value} onChange={field.onChange} />
              )}
            />
            <View style={styles.note}>
              <Icon
                name="info"
                size={15}
                uniProps={(theme) => ({ color: theme.colors.white60 })}
              />
              <UIText size="sm" color="secondary" style={styles.noteText}>
                {t("postComposer.editNote")}
              </UIText>
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingTop: theme.vs(8),
    paddingHorizontal: theme.s(16),
  },
  content: {
    gap: theme.vs(20),
    paddingTop: theme.vs(20),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(24),
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
    paddingHorizontal: theme.s(4),
  },
  noteText: {
    flex: 1,
  },
}));
