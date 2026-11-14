import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDocumentAsync } from "expo-document-picker";
import { usePostHog } from "posthog-react-native";
import type { Ref } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Course, CourseFormValues } from "@/@types/study";
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourses";
import { useUploadImages } from "@/hooks/useMedia";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useAddCourseFile } from "@/hooks/useStudyFiles";
import { useUniversities } from "@/hooks/useUniversities";
import { courseSchema } from "@/schemas";
import {
  Icon,
  UIButton,
  UIChip,
  UIFilterRow,
  UIFormSheet,
  UIInput,
  UIText,
  UIUniversityLogo,
} from "@/ui";
import {
  canUploadCourseMaterial,
  FILE_TYPES,
  SEMESTERS,
  toCourseValues,
} from "@/utils";
import { captureAction } from "@/utils/analytics";
import { apiErrorKey } from "@/utils/apiErrorKey";
import { IMAGE_TYPES } from "@/utils/media";
import { RatingInput } from "./RatingInput";

const MATERIAL_TYPES = [...IMAGE_TYPES, "application/pdf"];
const MAX_MATERIALS = 10;

type CourseFormSheetProps = {
  ref: Ref<BottomSheetModal>;
  /** edits this course; without it the sheet creates one */
  course?: Course;
};

// creates or edits a course, as the web course form: materials, university, programme, subject and semester only when creating
export const CourseFormSheet = ({ ref, course }: CourseFormSheetProps) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { dismiss } = useBottomSheetModal();
  const { data: profile } = useMyProfile();
  const { data: universities = [] } = useUniversities();
  const { mutateAsync: create, isPending: isCreating } = useCreateCourse();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateCourse();
  const { mutateAsync: upload, isPending: isUploading } =
    useUploadImages("exam");
  const { mutateAsync: attach, isPending: isAttaching } = useAddCourseFile();
  const isSaving = isCreating || isUpdating || isUploading || isAttaching;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    values: toCourseValues(profile, course),
  });
  const faculty = useWatch({ control, name: "faculty" });
  const programmes = profile?.programmes ?? [];
  const universityId = profile?.universityId ?? "";
  const universityName =
    universities.find(({ id }) => id === universityId)?.name ?? universityId;

  const onSubmit = handleSubmit(
    async ({ materials, materialType, ...values }) => {
      // one toast follows the steps and ends as the result
      let progressId: string | number | undefined;
      try {
        if (course) {
          await update({
            id: course.id,
            body: {
              name: values.name,
              description: values.description,
              difficulty: values.difficulty,
            },
          });
          toast.success(t("study.courseSaved"));
          dismiss();
          return;
        }
        if (
          materials.length > 0 &&
          !canUploadCourseMaterial(profile, { ...values, universityId })
        ) {
          toast.error(t("study.uploadEligibility"));
          return;
        }
        if (materials.length > 0)
          progressId = toast.loading(t("study.uploadingMaterials"));
        const mediaIds = await upload(materials);
        progressId = toast.loading(t("study.creatingCourse"), {
          id: progressId,
        });
        const created = await create({ ...values, universityId });
        try {
          await Promise.all(
            materials.map(({ name }, index) =>
              attach({
                id: created.id,
                body: {
                  mediaId: mediaIds[index] ?? "",
                  // the API wants 3 to 150 characters
                  title: name.length < 3 ? `${name} file` : name.slice(0, 150),
                  type: materialType,
                },
              }),
            ),
          );
        } catch {
          toast.error(t("study.materialAttachFailed"), { id: progressId });
          reset();
          dismiss();
          return;
        }
        toast.success(t("study.courseCreated"), { id: progressId });
        reset();
        dismiss();
      } catch (error) {
        toast.error(t(apiErrorKey(error)), { id: progressId });
      }
    },
    () => captureAction(posthog, "course_form", "validation_failed"),
  );

  const handleSubmitPress = () => onSubmit();
  // a closed sheet starts over next time
  const handleDismiss = () => reset();
  // a stray swipe or tap does not drop edits: closing asks first
  const handleDismissAttempt = () =>
    Alert.alert(
      t("app.unsavedChangesTitle"),
      t("app.discardChangesDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        {
          text: t("app.discardChanges"),
          style: "destructive",
          onPress: dismiss,
        },
      ],
    );

  return (
    <UIFormSheet
      ref={ref}
      title={t(course ? "study.editCourse" : "study.addCourse")}
      actionLabel={t(course ? "apiState.save" : "study.create")}
      isActionDisabled={isSaving}
      onActionPress={handleSubmitPress}
      onDismiss={handleDismiss}
      onDismissAttempt={isDirty && !isSaving ? handleDismissAttempt : undefined}
    >
      {course ? null : (
        <Controller
          control={control}
          name="materials"
          render={({ field, fieldState }) => {
            const handlePickPress = async () => {
              const result = await getDocumentAsync({
                type: MATERIAL_TYPES,
                multiple: true,
                copyToCacheDirectory: true,
              });
              if (result.canceled) return;
              const picked = result.assets.map(
                ({ uri, name, mimeType, size }) => ({
                  uri,
                  name,
                  mimeType,
                  fileSize: size,
                }),
              );
              field.onChange(
                [...field.value, ...picked].slice(0, MAX_MATERIALS),
              );
            };
            return (
              <View style={styles.group}>
                <UIText size="xs" weight="semibold" color="secondary">
                  {t("study.materials")}
                </UIText>
                {field.value.map((file) => {
                  const handleRemovePress = () =>
                    field.onChange(
                      field.value.filter((item) => item.uri !== file.uri),
                    );
                  return (
                    <View key={file.uri} style={styles.file}>
                      <UIText numberOfLines={1} style={styles.fileName}>
                        {file.name}
                      </UIText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("study.removeMaterial")}
                        hitSlop={12}
                        onPress={handleRemovePress}
                      >
                        <Icon name="x" size={18} />
                      </Pressable>
                    </View>
                  );
                })}
                {field.value.length < MAX_MATERIALS ? (
                  <UIButton
                    type="secondary"
                    disabled={isSaving}
                    onPress={handlePickPress}
                    style={styles.pick}
                  >
                    <Icon name="upload" size={18} />
                    <UIText weight="semibold">{t("study.chooseFiles")}</UIText>
                  </UIButton>
                ) : null}
                <UIText
                  size="xs"
                  color={fieldState.error ? "error" : "secondary"}
                >
                  {t("study.materialsHint")}
                </UIText>
              </View>
            );
          }}
        />
      )}
      {course ? null : (
        <Controller
          control={control}
          name="materialType"
          render={({ field }) => (
            <UIFilterRow label={t("study.materialType")}>
              {Object.entries(FILE_TYPES).map(([type, label]) => (
                <UIChip
                  key={type}
                  label={t(label)}
                  selected={field.value === type}
                  onPress={() => field.onChange(type)}
                />
              ))}
            </UIFilterRow>
          )}
        />
      )}
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("study.name")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={150}
          />
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
            scrollEnabled
            inputContainerStyle={styles.description}
            style={styles.descriptionInput}
          />
        )}
      />
      <Controller
        control={control}
        name="difficulty"
        render={({ field, fieldState }) => (
          <View style={styles.group}>
            <UIText size="xs" weight="semibold" color="secondary">
              {t("study.difficulty")}
            </UIText>
            <RatingInput
              icon="flame"
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error?.message ? (
              <UIText size="sm" color="error">
                {t(fieldState.error.message)}
              </UIText>
            ) : null}
          </View>
        )}
      />
      {course ? null : (
        <>
          <View style={styles.group}>
            <UIText size="xs" weight="semibold" color="secondary">
              {t("app.university")}
            </UIText>
            <View style={styles.university}>
              <UIUniversityLogo id={universityId} size="xs" />
              <UIText style={styles.fileName}>{universityName}</UIText>
            </View>
          </View>
          {programmes.length > 1 ? (
            <UIFilterRow label={t("app.studyProgrammes")}>
              {programmes.map((programme) => (
                <UIChip
                  key={programme.id}
                  label={programme.programme}
                  selected={faculty === programme.faculty}
                  onPress={() =>
                    setValue("faculty", programme.faculty, {
                      shouldDirty: true,
                    })
                  }
                />
              ))}
            </UIFilterRow>
          ) : null}
          <Controller
            control={control}
            name="faculty"
            render={({ field, fieldState }) => (
              <UIInput
                isInSheet
                captionText={t("study.faculty")}
                value={field.value}
                editable={false}
                errorText={
                  fieldState.error?.message && t(fieldState.error.message)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="subject"
            render={({ field, fieldState }) => (
              <UIInput
                isInSheet
                captionText={t("study.subject")}
                placeholder={t("study.subjectPlaceholder")}
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
          <Controller
            control={control}
            name="semester"
            render={({ field }) => (
              <UIFilterRow label={t("study.semester")}>
                {SEMESTERS.map((semester) => (
                  <UIChip
                    key={semester}
                    label={String(semester)}
                    selected={field.value === semester}
                    onPress={() => field.onChange(semester)}
                  />
                ))}
              </UIFilterRow>
            )}
          />
        </>
      )}
    </UIFormSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.vs(8),
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingVertical: theme.vs(10),
    paddingHorizontal: theme.s(14),
    borderRadius: theme.vs(14),
    backgroundColor: theme.colors.white5,
  },
  fileName: {
    flex: 1,
  },
  university: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  pick: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  description: { height: theme.vs(150) },
  descriptionInput: { alignSelf: "stretch" },
}));
