import {
  useCreateMyProgramme,
  useDeleteMyProgramme,
  useReplaceMyProgramme,
} from "@/hooks/profile";
import type { Programme, Profile } from "@/@types/profile";
import {
  programmeFormDefaultValues,
  programmeFormSchema,
  type ProgrammeFormValues,
} from "@/schemas/profile";
import { getProgrammeInput } from "@/utils";
import { Icon, UIButton, UIInput, UIText } from "@/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

type ProgrammeFormMode =
  { type: "create" } | { type: "edit"; programme: Programme };

type Props = {
  programmes: Profile["programmes"];
};

export function ProfileProgrammesSection({ programmes }: Props) {
  const { t } = useTranslation();
  const createProgramme = useCreateMyProgramme();
  const replaceProgramme = useReplaceMyProgramme();
  const deleteProgramme = useDeleteMyProgramme();
  const programmeForm = useForm<ProgrammeFormValues>({
    resolver: zodResolver(programmeFormSchema),
    defaultValues: programmeFormDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { control } = programmeForm;
  const [formMode, setFormMode] = useState<ProgrammeFormMode | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showError = (text1: string) => {
    Toast.show({ type: "error", text1, text2: t("common.tryAgain") });
  };

  const openCreateForm = () => {
    programmeForm.reset({
      ...programmeFormDefaultValues,
      isPrimary: !programmes?.length,
    });
    setFormMode({ type: "create" });
  };

  const openEditForm = (programme: Programme) => {
    programmeForm.reset({
      faculty: programme.faculty,
      programme: programme.programme,
      yearOfStudy: programme.yearOfStudy?.toString() ?? "",
      isPrimary: programme.isPrimary,
    });
    setFormMode({ type: "edit", programme });
  };

  const handleSaveProgramme = programmeForm.handleSubmit(async (draft) => {
    try {
      const input = getProgrammeInput(
        draft,
        formMode?.type === "edit" ? formMode.programme : undefined,
      );
      if (formMode?.type === "edit") {
        await replaceProgramme.mutateAsync({
          id: formMode.programme.id,
          input,
        });
      } else {
        await createProgramme.mutateAsync(input);
      }
      setFormMode(null);
      Toast.show({ type: "success", text1: t("profile.programmeSaved") });
    } catch {
      showError(t("profile.programmeSaveError"));
    }
  });

  const handleDeleteProgramme = async (id: string) => {
    try {
      await deleteProgramme.mutateAsync(id);
      setConfirmDeleteId(null);
      Toast.show({ type: "success", text1: t("profile.programmeDeleted") });
    } catch {
      showError(t("profile.programmeDeleteError"));
    }
  };

  const isSavingProgramme =
    createProgramme.isPending || replaceProgramme.isPending;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <UIText size="md" weight="bold">
          {t("profile.programmes")}
        </UIText>
        <Pressable
          accessibilityLabel={t("profile.addProgramme")}
          accessibilityRole="button"
          onPress={openCreateForm}
          style={styles.addButton}
        >
          <UIText size="rg" weight="bold" color="link">
            +
          </UIText>
          <UIText color="link" weight="semibold">
            {t("profile.addProgramme")}
          </UIText>
        </Pressable>
      </View>

      {programmes?.length ? (
        programmes.map((programme) => (
          <View key={programme.id} style={styles.programmeCard}>
            <View style={styles.programmeDetails}>
              <UIText size="rg" weight="semibold">
                {programme.programme}
              </UIText>
              <UIText color="secondary">{programme.faculty}</UIText>
              {programme.yearOfStudy ? (
                <UIText size="sm" color="soft">
                  {t("profile.yearOfStudy", { year: programme.yearOfStudy })}
                </UIText>
              ) : null}
              {programme.isPrimary ? (
                <View style={styles.primaryBadge}>
                  <UIText size="xs" color="link" weight="semibold">
                    {t("profile.primary")}
                  </UIText>
                </View>
              ) : null}
            </View>
            {confirmDeleteId === programme.id ? (
              <View style={styles.confirmDelete}>
                <UIText size="sm">{t("profile.confirmDelete")}</UIText>
                <View style={styles.inlineActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={deleteProgramme.isPending}
                    onPress={() => handleDeleteProgramme(programme.id)}
                  >
                    <UIText color="error" weight="semibold">
                      {t("profile.delete")}
                    </UIText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmDeleteId(null)}
                  >
                    <UIText color="secondary">{t("profile.cancel")}</UIText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.inlineActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openEditForm(programme)}
                >
                  <UIText color="link" weight="semibold">
                    {t("profile.edit")}
                  </UIText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirmDeleteId(programme.id)}
                >
                  <UIText color="error" weight="semibold">
                    {t("profile.delete")}
                  </UIText>
                </Pressable>
              </View>
            )}
          </View>
        ))
      ) : (
        <UIText color="secondary">{t("profile.noProgrammes")}</UIText>
      )}

      {formMode ? (
        <View style={styles.formCard}>
          <UIText size="rg" weight="semibold">
            {formMode.type === "create"
              ? t("profile.addProgramme")
              : t("profile.editProgramme")}
          </UIText>
          <Controller
            control={control}
            name="faculty"
            render={({ field, fieldState }) => (
              <UIInput
                captionText={t("profile.faculty")}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorText={
                  fieldState.error?.message
                    ? t(fieldState.error.message)
                    : undefined
                }
              />
            )}
          />
          <Controller
            control={control}
            name="programme"
            render={({ field, fieldState }) => (
              <UIInput
                captionText={t("profile.programmeName")}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorText={
                  fieldState.error?.message
                    ? t(fieldState.error.message)
                    : undefined
                }
              />
            )}
          />
          <Controller
            control={control}
            name="yearOfStudy"
            render={({ field, fieldState }) => (
              <UIInput
                captionText={t("profile.yearOfStudyLabel")}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorText={
                  fieldState.error?.message
                    ? t(fieldState.error.message)
                    : undefined
                }
                keyboardType="number-pad"
              />
            )}
          />
          <Controller
            control={control}
            name="isPrimary"
            render={({ field }) => (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: field.value }}
                onPress={() => field.onChange(!field.value)}
                style={styles.primaryToggle}
              >
                <View
                  style={[
                    styles.checkbox,
                    field.value && styles.checkboxSelected,
                  ]}
                >
                  {field.value ? (
                    <Icon
                      name="check"
                      size={12}
                      uniProps={(theme) => ({ color: theme.colors.white })}
                    />
                  ) : null}
                </View>
                <UIText>{t("profile.primary")}</UIText>
              </Pressable>
            )}
          />
          <UIButton
            type="brand"
            onPress={handleSaveProgramme}
            disabled={isSavingProgramme}
          >
            <UIText weight="semibold">{t("profile.saveProgramme")}</UIText>
          </UIButton>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFormMode(null)}
            style={styles.cancelForm}
          >
            <UIText color="secondary">{t("profile.cancel")}</UIText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.vs(12),
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(8),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
    paddingVertical: theme.vs(6),
  },
  programmeCard: {
    gap: theme.vs(10),
    padding: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  programmeDetails: {
    gap: theme.vs(5),
  },
  primaryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.s(9),
    paddingVertical: theme.vs(4),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.blue20,
  },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(18),
  },
  confirmDelete: {
    gap: theme.vs(8),
  },
  formCard: {
    gap: theme.vs(12),
    padding: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface,
  },
  primaryToggle: {
    minHeight: theme.vs(38),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  checkbox: {
    width: theme.s(20),
    height: theme.vs(20),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.vs(5),
    borderWidth: 1,
    borderColor: theme.colors.white40,
  },
  checkboxSelected: {
    borderColor: theme.colors.blue,
    backgroundColor: theme.colors.blue,
  },
  cancelForm: {
    alignItems: "center",
    paddingVertical: theme.vs(6),
  },
}));
