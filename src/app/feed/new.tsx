import { usePostHog } from "posthog-react-native";
import { captureAction, HEADER_COMPACT_OFFSET, apiErrorKey } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { NewPostFormValues } from "@/@types";
import {
  ComposerHeader,
  PostAudienceField,
  PostEventField,
  PostField,
  PostPhotosField,
  PostTagsField,
} from "@/components/feed";
import {
  useUploadImages,
  useCreateFeedPost,
  useMyProfile,
  useUniversities,
} from "@/hooks";
import { newPostSchema } from "@/schemas";
import { UIPage, UISegmented } from "@/ui";

const POST_TYPES = ["question", "announcement", "event"] as const;

const samePhotos = (
  left: NewPostFormValues["photos"],
  right: NewPostFormValues["photos"],
) =>
  left.length === right.length &&
  left.every((photo) => right.some((item) => item.uri === photo.uri));

export default function NewPostScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const { data: universities = [] } = useUniversities();
  const { createPost, isPending: isCreating } = useCreateFeedPost();
  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadImages("feed");
  const isPending = isCreating || isUploading;
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<NewPostFormValues>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      type: "question",
      title: "",
      content: "",
      audience: "university",
      eventDate: null,
      tags: [],
      photos: [],
    },
  });
  const [title, content, type] = useWatch({
    control,
    name: ["title", "content", "type"],
  });
  const universityName =
    universities.find(({ id }) => id === profile?.universityId)?.name ??
    profile?.universityId.toUpperCase() ??
    "";

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async (values) => {
      if (!profile) return;
      // one toast while photos upload, which then turns into the outcome
      const toastId = values.photos.length
        ? toast.loading(t("app.processingPhotos"))
        : undefined;
      try {
        const mediaIds = await uploadImages(values.photos);
        // the photo can be removed while this upload is in flight
        if (!samePhotos(values.photos, getValues("photos"))) {
          // with no id sonner would dismiss every toast
          if (toastId !== undefined) toast.dismiss(toastId);
          return;
        }
        await createPost({
          type: values.type,
          title: values.title,
          content: values.content,
          university: values.audience === "all" ? "all" : profile.universityId,
          eventDate:
            values.type === "event"
              ? values.eventDate?.toISOString()
              : undefined,
          tags: values.tags.length ? values.tags : undefined,
          mediaIds: mediaIds.length ? mediaIds : undefined,
        });
        toast.success(t("postComposer.published"), { id: toastId });
        router.back();
      } catch (error) {
        if (!samePhotos(values.photos, getValues("photos"))) {
          // with no id sonner would dismiss every toast
          if (toastId !== undefined) toast.dismiss(toastId);
          return;
        }
        toast.error(t(apiErrorKey(error)), { id: toastId });
      }
    },
    () => captureAction(posthog, "post_create_form", "validation_failed"),
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
        title={t("app.newPost")}
        actionLabel={t("postComposer.post")}
        disabled={
          isPending ||
          !profile ||
          !newPostSchema.shape.title.safeParse(title).success ||
          !newPostSchema.shape.content.safeParse(content).success
        }
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
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <UISegmented
              items={[
                t("app.question"),
                t("feed.filters.news"),
                t("app.event"),
              ]}
              selectedItemIndex={POST_TYPES.indexOf(field.value)}
              onPress={(index) => field.onChange(POST_TYPES[index])}
            />
          )}
        />
        {type === "event" ? (
          <Controller
            control={control}
            name="eventDate"
            render={({ field, fieldState }) => (
              <PostEventField
                value={field.value}
                onChange={field.onChange}
                errorText={
                  fieldState.error?.message && t(fieldState.error.message)
                }
              />
            )}
          />
        ) : null}
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <PostField
              label={t("postComposer.title")}
              placeholder={t("postComposer.titlePlaceholder")}
              value={field.value}
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
              placeholder={t("postComposer.detailsPlaceholder")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={5000}
              errorText={errors.content?.message && t(errors.content.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="photos"
          render={({ field }) => (
            <PostPhotosField value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <PostTagsField value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="audience"
          render={({ field }) => (
            <PostAudienceField
              value={field.value}
              onChange={field.onChange}
              universityId={profile?.universityId ?? ""}
              universityName={universityName}
            />
          )}
        />
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
}));
