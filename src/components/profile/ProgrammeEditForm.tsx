import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Programme, ProgrammeDetailsFormValues } from "@/@types/profile";
import { useReplaceMyProgramme } from "@/hooks/useMyProfile";
import { programmeDetailsSchema } from "@/schemas";
import { UIButton, UIChip, UIInput, UIText } from "@/ui";
import { STUDY_LEVELS, STUDY_MODES, STUDY_STATUSES } from "@/utils";

type ProgrammeEditFormProps = {
  programme: Programme;
  onDone: () => void;
};

export const ProgrammeEditForm = ({
  programme,
  onDone,
}: ProgrammeEditFormProps) => {
  const { t } = useTranslation();
  const { mutateAsync: replace, isPending } = useReplaceMyProgramme();
  const { control, handleSubmit } = useForm<ProgrammeDetailsFormValues>({
    resolver: zodResolver(programmeDetailsSchema),
    defaultValues: {
      yearOfStudy: programme.yearOfStudy,
      level: programme.level,
      modeOfStudies: programme.modeOfStudies,
      status: programme.status,
    },
  });

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await replace({
          id: programme.id,
          body: {
            programme: programme.programme,
            faculty: programme.faculty,
            isPrimary: programme.isPrimary,
            status: values.status,
            yearOfStudy: values.yearOfStudy ?? undefined,
            level: values.level ?? undefined,
            modeOfStudies: values.modeOfStudies ?? undefined,
          },
        });
        onDone();
      } catch {
        toast.error(t("apiState.profileSaveError"));
      }
    },
    () => captureAction(posthog, "programme_update_form", "validation_failed"),
  );
  const handleSavePress = () => onSubmit();

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="yearOfStudy"
        render={({ field }) => (
          <UIInput
            captionText={t("app.yearOfStudy")}
            keyboardType="number-pad"
            maxLength={2}
            value={field.value ? String(field.value) : ""}
            onChangeText={(text) => field.onChange(text ? Number(text) : null)}
          />
        )}
      />
      {(
        [
          ["level", "app.studyLevel", STUDY_LEVELS],
          ["modeOfStudies", "app.modeOfStudies", STUDY_MODES],
          ["status", "app.studyStatus", STUDY_STATUSES],
        ] as const
      ).map(([name, label, options]) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <View style={styles.group}>
              <UIText size="xs" weight="semibold" color="secondary">
                {t(label)}
              </UIText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {options.map(([value, optionLabel]) => (
                  <UIChip
                    key={value}
                    label={t(optionLabel)}
                    selected={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        />
      ))}
      <UIButton disabled={isPending} onPress={handleSavePress}>
        <UIText color="black" weight="semibold">
          {t("app.saveChanges")}
        </UIText>
      </UIButton>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  form: {
    gap: theme.vs(12),
    paddingTop: theme.vs(4),
  },
  group: {
    gap: theme.vs(6),
  },
  chips: {
    gap: theme.s(6),
  },
}));
