import { useMyProfile, useUpdateMyProfile } from "@/hooks/profile";
import { uploadMyAvatar } from "@/api/profile";
import type { AvatarContentType } from "@/@types/profile";
import {
  ProfileIdentitySection,
  ProfilePersonalInfoSection,
  ProfileProgrammesSection,
  ProfileUnavailableSections,
} from "@/components";
import { profileFormSchema, type ProfileFormValues } from "@/schemas";
import { MAX_AVATAR_SIZE_BYTES } from "@/utils";
import { Icon, UIPage, UIText } from "@/ui";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const profile = profileQuery.data;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { firstName: "", lastName: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { control: profileControl, reset: resetProfile } = profileForm;
  const firstNameValue = useWatch({
    control: profileControl,
    name: "firstName",
  });
  const lastNameValue = useWatch({
    control: profileControl,
    name: "lastName",
  });
  const profileIsDirty = profileForm.formState.isDirty;
  const [avatarDraft, setAvatarDraft] = useState<{
    uri: string;
    contentType: AvatarContentType;
  } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile && !profileIsDirty) {
      resetProfile({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
      });
    }
  }, [profile, profileIsDirty, resetProfile]);

  const showError = (text1: string) => {
    Toast.show({ type: "error", text1, text2: t("common.tryAgain") });
  };

  const hasProfileChanges =
    (firstNameValue ?? "").trim() !== (profile?.firstName ?? "") ||
    (lastNameValue ?? "").trim() !== (profile?.lastName ?? "") ||
    avatarDraft !== null;

  const handleSaveProfile = profileForm.handleSubmit(async (values) => {
    const input: ProfileFormValues & { avatarMediaId?: string } = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };
    try {
      if (avatarDraft) {
        setIsUploadingAvatar(true);
        input.avatarMediaId = await uploadMyAvatar(
          avatarDraft.uri,
          avatarDraft.contentType,
        );
      }
      const updatedProfile = await updateProfile.mutateAsync(input);
      resetProfile({
        firstName: updatedProfile.firstName ?? values.firstName.trim(),
        lastName: updatedProfile.lastName ?? values.lastName.trim(),
      });
      setAvatarDraft(null);
      Toast.show({ type: "success", text1: t("profile.profileSaved") });
    } catch {
      showError(t("profile.profileSaveError"));
    } finally {
      setIsUploadingAvatar(false);
    }
  });

  const handlePickAvatar = async (source: "library" | "camera") => {
    let imagePicker: typeof import("expo-image-picker");
    try {
      imagePicker = await import("expo-image-picker");
    } catch {
      showError(t("profile.avatarPickerUnavailable"));
      return;
    }

    try {
      if (source === "camera") {
        const permission = await imagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showError(t("profile.cameraPermissionDenied"));
          return;
        }
      }

      const result =
        source === "camera"
          ? await imagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.85,
            })
          : await imagePicker.launchImageLibraryAsync({
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

  const openAvatarSourcePicker = () => {
    Alert.alert(t("profile.changePhoto"), undefined, [
      {
        text: t("profile.chooseFromLibrary"),
        onPress: () => void handlePickAvatar("library"),
      },
      {
        text: t("profile.takePhoto"),
        onPress: () => void handlePickAvatar("camera"),
      },
      { text: t("profile.cancel"), style: "cancel" },
    ]);
  };

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
          <ProfileIdentitySection
            firstName={firstNameValue}
            lastName={lastNameValue}
            avatarUrl={profile.avatarUrl}
            avatarDraftUri={avatarDraft?.uri}
            disabled={isUploadingAvatar || updateProfile.isPending}
            onChangePhoto={openAvatarSourcePicker}
          />
          <ProfilePersonalInfoSection
            control={profileControl}
            disabled={isUploadingAvatar || updateProfile.isPending}
          />
          <ProfileUnavailableSections />
          <ProfileProgrammesSection programmes={profile.programmes} />
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
  saveButton: {
    minWidth: theme.s(72),
    minHeight: theme.vs(36),
    alignItems: "flex-end",
    justifyContent: "center",
  },
}));
