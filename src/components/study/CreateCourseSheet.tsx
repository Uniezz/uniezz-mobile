import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import type { CreateCourseFormValues } from "@/@types/study";
import { useCreateCourse } from "@/hooks/useCourses";
import { createCourseSchema } from "@/schemas";
import { UIFormSheet, UIInput, UIText } from "@/ui";
import { RatingInput } from "./RatingInput";
import { apiErrorKey } from "@/utils/apiErrorKey";

type CreateCourseSheetProps = {
  ref: Ref<BottomSheetModal>;
  universityId: string;
};

export const CreateCourseSheet = ({
  ref,
  universityId,
}: CreateCourseSheetProps) => {
  const { t } = useTranslation();
  const { mutateAsync: create, isPending } = useCreateCourse();
  const { dismiss } = useBottomSheetModal();
  const { control, handleSubmit, reset } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      subject: "",
      faculty: "",
      semester: "",
      difficulty: 0,
      description: "",
    },
  });

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async ({ semester, ...values }) => {
      try {
        await create({ ...values, semester: Number(semester), universityId });
        toast.success(t("study.courseCreated"));
        reset();
        dismiss();
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    },
    () => captureAction(posthog, "course_form", "validation_failed"),
  );

  const handleSubmitPress = () => onSubmit();
  // a closed sheet starts over next time
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t("study.addCourse")}
      actionLabel={t("study.create")}
      isActionDisabled={isPending}
      onActionPress={handleSubmitPress}
      onDismiss={handleDismiss}
    >
      {(["name", "subject", "faculty"] as const).map((name) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <UIInput
              isInSheet
              captionText={t(`study.${name}`)}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorText={
                fieldState.error?.message && t(fieldState.error.message)
              }
              maxLength={150}
            />
          )}
        />
      ))}
      <Controller
        control={control}
        name="semester"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("study.semester")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            keyboardType="number-pad"
            maxLength={2}
          />
        )}
      />
      <Controller
        control={control}
        name="difficulty"
        render={({ field, fieldState }) => (
          <>
            <UIText size="sm" color="secondary">
              {t("study.difficulty")}
            </UIText>
            <RatingInput value={field.value} onChange={field.onChange} />
            {fieldState.error?.message ? (
              <UIText size="sm" color="error">
                {t(fieldState.error.message)}
              </UIText>
            ) : null}
          </>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("study.description")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={5000}
            multiline
          />
        )}
      />
    </UIFormSheet>
  );
};
