import {
  useCreateMyProgramme,
  useDeleteMyProgramme,
  useMyProfile,
  useReplaceMyProgramme,
  useUpdateMyProfile,
} from "@/hooks/profile";
import type { Programme, ProgrammeInput } from "@/api/profile";
import { Icon, UIButton, UIAvatar, UIInput, UIPage, UIText } from "@/ui";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

type ProgrammeDraft = {
  faculty: string;
  programme: string;
  yearOfStudy: string;
  isPrimary: boolean;
};

type ProgrammeFormMode =
  { type: "create" } | { type: "edit"; programme: Programme };

const emptyDraft = (isPrimary = false): ProgrammeDraft => ({
  faculty: "",
  programme: "",
  yearOfStudy: "",
  isPrimary,
});

function getProgrammeInput(
  draft: ProgrammeDraft,
  original?: Programme,
): ProgrammeInput {
  const year = draft.yearOfStudy.trim();

  return {
    faculty: draft.faculty.trim(),
    programme: draft.programme.trim(),
    status: original?.status ?? "active",
    isPrimary: draft.isPrimary,
    ...(year ? { yearOfStudy: Number(year) } : {}),
    ...(original?.level ? { level: original.level } : {}),
    ...(original?.modeOfStudies
      ? { modeOfStudies: original.modeOfStudies }
      : {}),
  };
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const createProgramme = useCreateMyProgramme();
  const replaceProgramme = useReplaceMyProgramme();
  const deleteProgramme = useDeleteMyProgramme();
  const profile = profileQuery.data;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formMode, setFormMode] = useState<ProgrammeFormMode | null>(null);
  const [draft, setDraft] = useState<ProgrammeDraft>(emptyDraft());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showError = (text1: string) => {
    Toast.show({ type: "error", text1, text2: t("common.tryAgain") });
  };

  const openProfileEdit = () => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setIsEditingProfile(false);
      Toast.show({ type: "success", text1: t("profile.profileSaved") });
    } catch {
      showError(t("profile.profileSaveError"));
    }
  };

  const openCreateForm = () => {
    setDraft(emptyDraft(!profile?.programmes?.length));
    setFormMode({ type: "create" });
  };

  const openEditForm = (programme: Programme) => {
    setDraft({
      faculty: programme.faculty,
      programme: programme.programme,
      yearOfStudy: programme.yearOfStudy?.toString() ?? "",
      isPrimary: programme.isPrimary,
    });
    setFormMode({ type: "edit", programme });
  };

  const handleSaveProgramme = async () => {
    if (!draft.faculty.trim() || !draft.programme.trim()) {
      showError(t("profile.requiredFields"));
      return;
    }

    const year = draft.yearOfStudy.trim();
    if (year && (!Number.isInteger(Number(year)) || Number(year) < 1)) {
      showError(t("profile.invalidYear"));
      return;
    }

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
  };

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
    <UIPage style={styles.page}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel={t("profile.back")}
          accessibilityRole="button"
          onPress={router.back}
          style={styles.backButton}
        >
          <Icon
            name="arrow-left"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.white })}
          />
        </Pressable>
        <UIText size="lg" weight="bold">
          {t("profile.title")}
        </UIText>
        <View style={styles.backButton} />
      </View>

      {profileQuery.isPending ? (
        <View style={styles.message}>
          <UIText color="secondary">{t("profile.loading")}</UIText>
        </View>
      ) : profileQuery.isError || !profile ? (
        <View style={styles.message}>
          <UIText color="soft">{t("profile.loadError")}</UIText>
          <Pressable
            accessibilityRole="button"
            onPress={() => profileQuery.refetch()}
          >
            <UIText color="link" weight="semibold">
              {t("common.tryAgain")}
            </UIText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.identity}>
            <UIAvatar
              size="xl"
              imageSrc={profile.avatarUrl ?? undefined}
              placeholderText={
                `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
                "U"
              }
            />
            <UIText size="lg" weight="bold" style={styles.name}>
              {[profile.firstName, profile.lastName]
                .filter(Boolean)
                .join(" ") || t("profile.nameMissing")}
            </UIText>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <UIText size="md" weight="bold">
                {t("profile.personalInfo")}
              </UIText>
              {!isEditingProfile ? (
                <Pressable accessibilityRole="button" onPress={openProfileEdit}>
                  <UIText color="link" weight="semibold">
                    {t("profile.edit")}
                  </UIText>
                </Pressable>
              ) : null}
            </View>
            {isEditingProfile ? (
              <>
                <UIInput
                  captionText={t("profile.firstName")}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <UIInput
                  captionText={t("profile.lastName")}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                <UIButton
                  type="brand"
                  onPress={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  accessibilityRole="button"
                >
                  <UIText weight="semibold">{t("profile.saveProfile")}</UIText>
                </UIButton>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsEditingProfile(false)}
                  style={styles.cancelForm}
                >
                  <UIText color="secondary">{t("profile.cancel")}</UIText>
                </Pressable>
              </>
            ) : (
              <View style={styles.personalInfo}>
                <View style={styles.personalField}>
                  <UIText size="sm" color="secondary">
                    {t("profile.firstName")}
                  </UIText>
                  <UIText>
                    {profile.firstName || t("profile.nameMissing")}
                  </UIText>
                </View>
                <View style={styles.personalField}>
                  <UIText size="sm" color="secondary">
                    {t("profile.lastName")}
                  </UIText>
                  <UIText>{profile.lastName || "-"}</UIText>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <UIText size="md" weight="bold">
              {t("profile.privacy")}
            </UIText>
            <View style={styles.notice}>
              <UIText color="soft">{t("profile.privacyUnavailable")}</UIText>
            </View>
          </View>

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

            {profile.programmes?.length ? (
              profile.programmes.map((programme) => (
                <View key={programme.id} style={styles.programmeCard}>
                  <View style={styles.programmeDetails}>
                    <UIText size="rg" weight="semibold">
                      {programme.programme}
                    </UIText>
                    <UIText color="secondary">{programme.faculty}</UIText>
                    {programme.yearOfStudy ? (
                      <UIText size="sm" color="soft">
                        {t("profile.yearOfStudy", {
                          year: programme.yearOfStudy,
                        })}
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
                          <UIText color="secondary">
                            {t("profile.cancel")}
                          </UIText>
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
                <UIInput
                  captionText={t("profile.faculty")}
                  value={draft.faculty}
                  onChangeText={(faculty) =>
                    setDraft((current) => ({ ...current, faculty }))
                  }
                />
                <UIInput
                  captionText={t("profile.programmeName")}
                  value={draft.programme}
                  onChangeText={(programme) =>
                    setDraft((current) => ({ ...current, programme }))
                  }
                />
                <UIInput
                  captionText={t("profile.yearOfStudyLabel")}
                  value={draft.yearOfStudy}
                  onChangeText={(yearOfStudy) =>
                    setDraft((current) => ({ ...current, yearOfStudy }))
                  }
                  keyboardType="number-pad"
                />
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: draft.isPrimary }}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      isPrimary: !current.isPrimary,
                    }))
                  }
                  style={styles.primaryToggle}
                >
                  <View
                    style={[
                      styles.checkbox,
                      draft.isPrimary && styles.checkboxSelected,
                    ]}
                  >
                    {draft.isPrimary ? (
                      <Icon
                        name="check"
                        size={12}
                        uniProps={(theme) => ({ color: theme.colors.white })}
                      />
                    ) : null}
                  </View>
                  <UIText>{t("profile.primary")}</UIText>
                </Pressable>
                <UIButton
                  type="brand"
                  onPress={handleSaveProgramme}
                  disabled={isSavingProgramme}
                >
                  <UIText weight="semibold">
                    {t("profile.saveProgramme")}
                  </UIText>
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
        </ScrollView>
      )}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingTop: theme.vs(8),
  },
  topBar: {
    minHeight: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(16),
    marginBottom: theme.vs(8),
  },
  backButton: {
    width: theme.s(36),
    height: theme.vs(36),
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: theme.vs(24),
    paddingHorizontal: theme.s(20),
    paddingTop: theme.vs(12),
    paddingBottom: theme.vs(32),
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.vs(12),
    paddingHorizontal: theme.s(24),
  },
  identity: {
    alignItems: "center",
    gap: theme.vs(12),
  },
  name: {
    textAlign: "center",
  },
  section: {
    gap: theme.vs(12),
  },
  personalInfo: {
    flexDirection: "row",
    gap: theme.s(16),
  },
  personalField: {
    flex: 1,
    gap: theme.vs(4),
  },
  notice: {
    padding: theme.s(14),
    borderRadius: theme.vs(14),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
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
