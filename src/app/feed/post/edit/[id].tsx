import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { EditPostFormValues } from "@/@types/feed";
import { useFeedPost, useUpdateFeedPost } from "@/hooks/useFeed";
import { editPostSchema } from "@/schemas";
import {
  UIButton,
  UIInput,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";

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
    values: post && { title: post.title, content: post.content },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updatePost({ id, body: values });
      toast.success(t("app.saved"));
      router.back();
    } catch {
      toast.error(t("apiState.error"));
    }
  });

  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.content}>
        <UIText size="lg" weight="bold">
          {t("apiState.editPost")}
        </UIText>
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
                <UIInput
                  captionText={t("postComposer.title")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={errors.title?.message && t(errors.title.message)}
                  maxLength={150}
                />
              )}
            />
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <UIInput
                  captionText={t("postComposer.details")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    errors.content?.message && t(errors.content.message)
                  }
                  maxLength={5000}
                  multiline
                />
              )}
            />
            <UIButton
              disabled={isSaving || !isDirty}
              onPress={() => onSubmit()}
            >
              <UIText color="black">{t("app.saveChanges")}</UIText>
            </UIButton>
          </>
        )}
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    padding: theme.s(20),
    gap: theme.vs(16),
  },
}));
