import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { HEADER_COMPACT_OFFSET } from "@/utils";
import { router } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { ApiRequestError } from "@/api";
import type { NewPostFormValues } from "@/@types/feed";
import {
  ComposerHeader,
  PostEventField,
  PostField,
  PostPhotosField,
  PostTagsField,
} from "@/components/feed";
import { useUploadImages } from "@/hooks/useMedia";
import { useCreateFeedPost } from "@/hooks/useCreateFeedPost";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useUniversities } from "@/hooks/useUniversities";
import { newPostSchema } from "@/schemas";
import {
  Icon,
  UIGlass,
  UIPage,
  UISegmented,
  UIText,
  UIUniversityLogo,
} from "@/ui";

const POST_TYPES = ["question", "announcement", "event"] as const;

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
  const audiences = [
    {
      value: "all",
      icon: (
        <Icon
          name="globe"
          size={20}
          uniProps={(theme) => ({ color: theme.colors.white80 })}
        />
      ),
      title: t("feed.allStudents"),
      subtitle: t("postComposer.audienceAll"),
    },
    {
      value: "university",
      icon: <UIUniversityLogo id={profile?.universityId ?? ""} size="xs" />,
      title: universityName,
      subtitle: t("postComposer.audienceUniversity", {
        university: universityName,
      }),
    },
  ] as const;

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async (values) => {
      if (!profile) return;
      try {
        const mediaIds = await uploadImages(values.photos);
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
        toast.success(t("postComposer.published"));
        router.back();
      } catch (error) {
        toast.error(
          t(
            error instanceof ApiRequestError && error.translationKey
              ? error.translationKey
              : "apiState.error",
          ),
        );
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
        <View style={styles.audience}>
          <UIText size="sm" weight="semibold" color="soft" style={styles.label}>
            {t("postComposer.audience")}
          </UIText>
          <Controller
            control={control}
            name="audience"
            render={({ field }) => (
              <UIGlass radius={16} style={styles.options}>
                {audiences.map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => field.onChange(option.value)}
                      style={styles.option(selected)}
                    >
                      {option.icon}
                      <View style={styles.optionText}>
                        <UIText weight="semibold">{option.title}</UIText>
                        <UIText size="sm" color="secondary">
                          {option.subtitle}
                        </UIText>
                      </View>
                      <View style={styles.radio(selected)}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </UIGlass>
            )}
          />
        </View>
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
  audience: {
    gap: theme.vs(8),
  },
  label: {
    paddingHorizontal: theme.s(4),
  },
  options: {
    padding: theme.s(4),
    gap: theme.vs(4),
  },
  option: (selected: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(14),
    padding: theme.s(12),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: selected ? theme.colors.white20 : "transparent",
    backgroundColor: selected ? theme.colors.white5 : "transparent",
  }),
  optionText: {
    flex: 1,
    gap: theme.vs(2),
  },
  radio: (selected: boolean) => ({
    width: theme.vs(22),
    height: theme.vs(22),
    borderRadius: theme.vs(11),
    borderWidth: 1.5,
    borderColor: selected ? theme.colors.sky : theme.colors.white40,
    alignItems: "center",
    justifyContent: "center",
  }),
  radioDot: {
    width: theme.vs(10),
    height: theme.vs(10),
    borderRadius: theme.vs(5),
    backgroundColor: theme.colors.sky,
  },
}));
