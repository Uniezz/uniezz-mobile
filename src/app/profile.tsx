import {
  useCreateMyProgramme,
  useDeleteMyProgramme,
  useMyProfile,
  useReplaceMyProgramme,
  useUpdateMyProfile,
} from "@/hooks/profile";
import {
  uploadMyAvatar,
  type AvatarContentType,
  type Programme,
  type ProgrammeInput,
  MAX_AVATAR_SIZE_BYTES,
} from "@/api/profile";
import { Icon, UIButton, UIAvatar, UIInput, UIPage, UIText } from "@/ui";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";
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

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState<{
    uri: string;
    contentType: AvatarContentType;
  } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formMode, setFormMode] = useState<ProgrammeFormMode | null>(null);
  const [draft, setDraft] = useState<ProgrammeDraft>(emptyDraft());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showError = (text1: string) => {
    Toast.show({ type: "error", text1, text2: t("common.tryAgain") });
  };

  const currentFirstName = profile?.firstName ?? "";
  const currentLastName = profile?.lastName ?? "";
  const firstNameValue = firstName ?? currentFirstName;
  const lastNameValue = lastName ?? currentLastName;
  const hasProfileChanges =
    (firstName !== null && firstName.trim() !== currentFirstName) ||
    (lastName !== null && lastName.trim() !== currentLastName) ||
    avatarDraft !== null;

  const handleSaveProfile = async () => {
    const input: {
      firstName?: string;
      lastName?: string;
      avatarMediaId?: string;
    } = {};
    if (firstName !== null && firstName.trim() !== currentFirstName) {
      input.firstName = firstName.trim();
    }
    if (lastName !== null && lastName.trim() !== currentLastName) {
      input.lastName = lastName.trim();
    }

    try {
      if (avatarDraft) {
        setIsUploadingAvatar(true);
        input.avatarMediaId = await uploadMyAvatar(
          avatarDraft.uri,
          avatarDraft.contentType,
        );
      }
      await updateProfile.mutateAsync(input);
      setFirstName(null);
      setLastName(null);
      setAvatarDraft(null);
      Toast.show({ type: "success", text1: t("profile.profileSaved") });
    } catch {
      showError(t("profile.profileSaveError"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickAvatar = async () => {
    let imagePicker: typeof import("expo-image-picker");
    try {
      imagePicker = await import("expo-image-picker");
    } catch {
      showError(t("profile.avatarPickerUnavailable"));
      return;
    }

    try {
      const result = await imagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        showError(t("profile.avatarPickError"));
        return;
      }

      if (new File(asset.uri).size > MAX_AVATAR_SIZE_BYTES) {
        showError(t("profile.avatarTooLarge"));
        return;
      }

      const assetMimeType = asset.mimeType?.toLowerCase();
      const assetName = (asset.fileName ?? asset.uri).toLowerCase();
      const contentType =
        assetMimeType === "image/png" ||
        (!assetMimeType && assetName.endsWith(".png"))
          ? "image/png"
          : assetMimeType === "image/webp" ||
              (!assetMimeType && assetName.endsWith(".webp"))
            ? "image/webp"
            : assetMimeType === "image/jpeg" ||
                (!assetMimeType && /\.(jpe?g)$/.test(assetName))
              ? "image/jpeg"
              : null;
      if (!contentType) {
        showError(t("profile.avatarFormatError"));
        return;
      }

      setAvatarDraft({ uri: asset.uri, contentType });
    } catch {
      showError(t("profile.avatarPickError"));
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
    <UIPage>
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
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled:
              !hasProfileChanges ||
              updateProfile.isPending ||
              isUploadingAvatar,
          }}
          disabled={
            !hasProfileChanges || updateProfile.isPending || isUploadingAvatar
          }
          onPress={handleSaveProfile}
          style={styles.saveButton}
        >
          <UIText color={hasProfileChanges ? "link" : "soft"} weight="semibold">
            {isUploadingAvatar || updateProfile.isPending
              ? t("profile.saving")
              : t("profile.saveChanges")}
          </UIText>
        </Pressable>
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
          <View style={[styles.identity, styles.panel]}>
            <UIAvatar
              size="xl"
              imageSrc={avatarDraft?.uri ?? profile.avatarUrl ?? undefined}
              placeholderText={
                `${firstNameValue[0] ?? ""}${lastNameValue[0] ?? ""}`.toUpperCase() ||
                "U"
              }
            />
            <UIText size="lg" weight="bold" style={styles.name}>
              {[firstNameValue, lastNameValue].filter(Boolean).join(" ") ||
                t("profile.nameMissing")}
            </UIText>
            <Pressable
              accessibilityRole="button"
              disabled={isUploadingAvatar || updateProfile.isPending}
              onPress={handlePickAvatar}
              style={styles.photoButton}
            >
              <UIText color="link" weight="semibold">
                {t("profile.changePhoto")}
              </UIText>
            </Pressable>
          </View>

          <View style={[styles.section, styles.panel]}>
            <View style={styles.sectionHeading}>
              <UIText size="md" weight="bold">
                {t("profile.personalInfo")}
              </UIText>
            </View>
            <UIInput
              captionText={t("profile.firstName")}
              value={firstNameValue}
              onChangeText={setFirstName}
              editable={!isUploadingAvatar && !updateProfile.isPending}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <UIInput
              captionText={t("profile.lastName")}
              value={lastNameValue}
              onChangeText={setLastName}
              editable={!isUploadingAvatar && !updateProfile.isPending}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <View style={[styles.section, styles.panel]}>
            <UIText size="md" weight="bold">
              {t("profile.privacy")}
            </UIText>
            <View style={styles.visibilityList}>
              {[
                t("profile.showEmail"),
                t("profile.showFaculty"),
                t("profile.showYear"),
              ].map((label) => (
                <View key={label} style={styles.visibilityRow}>
                  <UIText>{label}</UIText>
                  <Switch accessibilityLabel={label} value={false} disabled />
                </View>
              ))}
            </View>
            <View style={styles.notice}>
              <UIText color="soft">{t("profile.privacyUnavailable")}</UIText>
            </View>
          </View>

          <View style={[styles.section, styles.panel]}>
            <UIText size="md" weight="bold">
              {t("profile.about")}
            </UIText>
            <View style={styles.disabledField}>
              <UIText color="soft">{t("profile.unavailableField")}</UIText>
            </View>
            <UIText size="md" weight="bold">
              {t("profile.interests")}
            </UIText>
            <View style={styles.disabledField}>
              <UIText color="soft">{t("profile.unavailableField")}</UIText>
            </View>
            <View style={styles.notice}>
              <UIText color="soft">{t("profile.fieldsUnavailable")}</UIText>
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
  topBar: {
    minHeight: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
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
    paddingBottom: theme.vs(48),
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
  saveButton: {
    minWidth: theme.s(72),
    minHeight: theme.vs(36),
    alignItems: "flex-end",
    justifyContent: "center",
  },
  panel: {
    gap: theme.vs(12),
    padding: theme.s(16),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  photoButton: {
    minHeight: theme.vs(36),
    justifyContent: "center",
    paddingHorizontal: theme.s(12),
  },
  visibilityList: {
    gap: theme.vs(8),
  },
  visibilityRow: {
    minHeight: theme.vs(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(12),
  },
  disabledField: {
    minHeight: theme.vs(68),
    justifyContent: "center",
    paddingHorizontal: theme.s(12),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
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
