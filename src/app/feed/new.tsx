import { ScrollView } from "react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NewPostFormValues } from "@/@types/feed";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCreateFeedPost } from "@/hooks/useCreateFeedPost";
import { newPostSchema } from "@/schemas";
import { UIButton, UIChip, UIInput, UIPage, UIText } from "@/ui";

export default function NewPostScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const { createPost, isPending } = useCreateFeedPost();
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
    },
  });
  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return;
    try {
      await createPost({
        type: values.type,
        title: values.title,
        content: values.content,
        university: values.audience === "all" ? "all" : profile.universityId,
      });
      toast.success(t("postComposer.published"));
      router.back();
    } catch {
      toast.error(t("apiState.error"));
    }
  });
  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <UIText size="lg" weight="bold">
          {t("postComposer.title")}
        </UIText>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <>
              <UIChip
                label={t("app.question")}
                selected={field.value === "question"}
                onPress={() => field.onChange("question")}
              />
              <UIChip
                label={t("feed.type")}
                selected={field.value === "announcement"}
                onPress={() => field.onChange("announcement")}
              />
            </>
          )}
        />
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
              errorText={errors.content?.message && t(errors.content.message)}
              maxLength={5000}
              multiline
            />
          )}
        />
        <Controller
          control={control}
          name="audience"
          render={({ field }) => (
            <>
              <UIChip
                label={t("app.all")}
                selected={field.value === "all"}
                onPress={() => field.onChange("all")}
              />
              <UIChip
                label={profile?.universityId ?? "University"}
                selected={field.value === "university"}
                onPress={() => field.onChange("university")}
              />
            </>
          )}
        />
        <UIButton disabled={isPending || !profile} onPress={() => onSubmit()}>
          <UIText color="black">{t("postComposer.publish")}</UIText>
        </UIButton>
      </ScrollView>
    </UIPage>
  );
}
