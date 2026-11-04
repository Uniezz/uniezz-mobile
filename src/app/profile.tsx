import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useSession } from "@/contexts";
import {
  AddProgrammeForm,
  EditableProgramme,
  InterestChips,
  PersonalDetailsForm,
  PrivacyCard,
  ProfileHero,
  UniversityCard,
} from "@/components/profile";
import { launchImageLibraryAsync } from "expo-image-picker";
import { ApiRequestError } from "@/api";
import { useUploadImages } from "@/hooks/useMedia";
import {
  useDeleteMyAvatar,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/useMyProfile";
import { Icon, UIGlass, UIPage, UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName } from "@/utils";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { mutateAsync: deleteAvatar, isPending: isRemovingPhoto } =
    useDeleteMyAvatar();
  const { mutateAsync: uploadImages, isPending: isUploadingPhoto } =
    useUploadImages("avatar");
  const { mutateAsync: updateProfile } = useUpdateMyProfile();
  const { clearSession } = useSession();
  const [editing, setEditing] = useState(false);
  const [addingProgramme, setAddingProgramme] = useState(false);

  const handleBackPress = () => router.back();
  const handleToggleEditing = () => setEditing(!editing);
  const handleDetailsSaved = () => setEditing(false);
  const handleToggleAddProgramme = () => setAddingProgramme(!addingProgramme);
  const handleProgrammeAdded = () => setAddingProgramme(false);

  const handleRemovePhotoPress = async () => {
    try {
      await deleteAvatar();
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  const handleChangePhotoPress = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const { uri, mimeType, fileSize } = result.assets[0];
    try {
      const [avatarMediaId] = await uploadImages([{ uri, mimeType, fileSize }]);
      await updateProfile({ avatarMediaId });
    } catch (error) {
      toast.error(
        t(
          error instanceof ApiRequestError && error.translationKey
            ? error.translationKey
            : "apiState.profileSaveError",
        ),
      );
    }
  };

  const handleLogoutPress = async () => {
    try {
      await clearSession();
    } catch {
      toast.error(t("auth.logoutError"));
    }
  };

  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.back")}
            onPress={handleBackPress}
            style={styles.back}
          >
            <Icon name="arrow-left" size={18} />
          </Pressable>
          {profile ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleToggleEditing}
              hitSlop={8}
            >
              <UIText size="sm" weight="semibold" color="brand">
                {editing ? t("postComposer.cancel") : t("app.edit")}
              </UIText>
            </Pressable>
          ) : null}
        </View>
        {isPending ? (
          <UISkeleton height={220} />
        ) : isError || !profile ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : (
          <>
            <ProfileHero
              avatar={profile.avatarUrl}
              name={authorName(profile) || t("apiState.student")}
              subtitle={profile.email}
            >
              {editing ? (
                <View style={styles.photoActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isUploadingPhoto}
                    onPress={handleChangePhotoPress}
                  >
                    <UIText size="sm" weight="semibold" color="link">
                      {t("app.changePhoto")}
                    </UIText>
                  </Pressable>
                  {profile.avatarUrl ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isRemovingPhoto}
                      onPress={handleRemovePhotoPress}
                    >
                      <UIText size="sm" weight="semibold" color="error">
                        {t("students.removePhoto")}
                      </UIText>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {!editing && profile.bio ? (
                <UIText color="soft" style={styles.bio}>
                  {profile.bio}
                </UIText>
              ) : null}
              {!editing && profile.interests?.length ? (
                <InterestChips interests={profile.interests} />
              ) : null}
            </ProfileHero>
            {editing ? (
              <View style={styles.section}>
                <UIText size="md" weight="semibold">
                  {t("app.personalDetails")}
                </UIText>
                <PersonalDetailsForm
                  profile={profile}
                  onSaved={handleDetailsSaved}
                />
              </View>
            ) : null}
            <UniversityCard universityId={profile.universityId} />
            <View style={styles.section}>
              <UIText size="md" weight="semibold">
                {t("app.studyProgrammes")}
              </UIText>
              {(profile.programmes ?? []).map((item) => (
                <EditableProgramme
                  key={item.id}
                  programme={item}
                  editing={editing}
                />
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={handleToggleAddProgramme}
                style={styles.addProgramme}
              >
                <Icon
                  name={addingProgramme ? "x" : "plus"}
                  size={16}
                  uniProps={(theme) => ({ color: theme.colors.blue })}
                />
                <UIText size="body" weight="semibold" color="brand">
                  {addingProgramme
                    ? t("postComposer.cancel")
                    : t("app.addProgramme")}
                </UIText>
              </Pressable>
              {addingProgramme ? (
                <AddProgrammeForm
                  isPrimary={!profile.programmes?.length}
                  onSaved={handleProgrammeAdded}
                />
              ) : null}
            </View>
            {editing ? <PrivacyCard privacy={profile.privacy} /> : null}
            <Pressable accessibilityRole="button" onPress={handleLogoutPress}>
              <UIGlass radius={999} style={styles.logout}>
                <Icon
                  name="log-out"
                  size={17}
                  uniProps={(theme) => ({ color: theme.colors.red })}
                />
                <UIText weight="semibold" color="error">
                  {t("auth.logOut")}
                </UIText>
              </UIGlass>
            </Pressable>
          </>
        )}
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingTop: theme.vs(8),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
    gap: theme.vs(20),
  },
  header: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoActions: {
    flexDirection: "row",
    gap: theme.s(20),
  },
  bio: {
    width: theme.s(300),
    textAlign: "center",
    lineHeight: theme.vs(15 * 1.45),
  },
  back: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: theme.vs(12),
  },
  addProgramme: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(8),
  },
  logout: {
    height: theme.vs(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(8),
  },
}));
