import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { HEADER_COMPACT_OFFSET } from "@/utils";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
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

  // the header floats over the form; scrolling fades in its blurred backdrop
  const [headerHeight, setHeaderHeight] = useState(0);
  // a boolean, so a scroll only re-renders when it flips
  const [isScrolled, setIsScrolled] = useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET);
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  return (
    <UIPage>
      <ComposerHeader
        title={t("apiState.editPost")}
        actionLabel={t("app.saveChanges")}
        disabled={isSaving || !isDirty}
        onAction={handleSubmitPress}
        isScrolled={isScrolled}
        onLayout={handleHeaderLayout}
      />
      <KeyboardAwareScrollView
        onScroll={handleScroll}
        // taps on buttons (adding a tag) keep the keyboard open
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content(headerHeight)}
      >
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

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  content: (headerHeight: number) => ({
    gap: theme.vs(24),
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(12),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(24),
  }),
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
