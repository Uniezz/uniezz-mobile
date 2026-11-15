import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { PersonalDetailsFormValues, UpdateProfileInput } from "@/@types";
import { AuthPage } from "@/components/auth";
import { ProfileHero } from "@/components/profile";
import { useMyProfile, usePickProfileImage, useUpdateMyProfile } from "@/hooks";
import { personalDetailsSchema } from "@/schemas";
import {
  UIButton,
  UIChip,
  UIFadeScrollView,
  UIInput,
  UIPage,
  UIText,
} from "@/ui";
import {
  apiErrorKey,
  authorName,
  captureAction,
  GENDER_LABELS,
  GENDERS,
  isProfileComplete,
  ONBOARDING_STEPS,
  splitInterests,
  toDetailsValues,
} from "@/utils";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { data: profile, isPending, isError } = useMyProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateMyProfile();
  const { pickImage: handleAvatarPress, isPending: isUploadingAvatar } =
    usePickProfileImage("avatar");
  const { pickImage: handleBannerPress, isPending: isUploadingBanner } =
    usePickProfileImage("banner");
  const [step, setStep] = useState(0);
  const {
    control,
    trigger,
    getValues,
    formState: { dirtyFields },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    // follows the saved profile, keeping edits on the current step
    values: profile && toDetailsValues(profile),
    resetOptions: { keepDirtyValues: true },
    mode: "onChange",
  });

  if (isPending) {
    return (
      <UIPage style={styles.loading}>
        <ActivityIndicator color="white" />
      </UIPage>
    );
  }
  // nothing left to fill, or nothing to fill it with
  if (isError || isProfileComplete(profile)) return <Redirect href="/feed" />;

  const { title, description, fields } = ONBOARDING_STEPS[step]!;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  // the API rejects changing a saved gender (gender_immutable)
  const isGenderLocked = Boolean(profile.gender);

  const goToNextStep = () =>
    isLastStep ? router.replace("/feed") : setStep(step + 1);

  const handleNextPress = async () => {
    if (!fields.some((field) => dirtyFields[field])) return goToNextStep();
    if (!(await trigger([...fields]))) {
      captureAction(posthog, "onboarding_form", "validation_failed");
      return;
    }
    const { firstName, lastName, bio, gender, interests, songUrl } =
      getValues();
    const update: UpdateProfileInput =
      step === 1
        ? {
            firstName,
            lastName,
            bio,
            ...(isGenderLocked || !gender ? {} : { gender }),
          }
        : { interests: splitInterests(interests), songUrl: songUrl.trim() };
    try {
      const saved = await updateProfile(update);
      // a now complete profile redirects to the feed on its own
      if (!isProfileComplete(saved)) goToNextStep();
    } catch (error) {
      toast.error(t(apiErrorKey(error, "apiState.profileSaveError")));
    }
  };

  return (
    <AuthPage topText={t(title)} bottomText={t(description)}>
      <UIText size="sm" color="secondary" style={styles.counter}>
        {t("onboarding.step", {
          current: step + 1,
          total: ONBOARDING_STEPS.length,
        })}
      </UIText>
      <UIFadeScrollView
        style={styles.content}
        contentContainerStyle={styles.fields}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <>
            <ProfileHero
              avatar={profile.avatarUrl}
              name={authorName(profile) || t("apiState.student")}
              universityId={profile.universityId}
              bannerUrl={profile.bannerUrl}
              onAvatarPress={handleAvatarPress}
              avatarLabel={t("app.changePhoto")}
              isAvatarDisabled={isUploadingAvatar}
            />
            <UIButton
              type="secondary"
              radius="sm"
              disabled={isUploadingBanner}
              onPress={handleBannerPress}
            >
              <UIText weight="semibold">{t("app.changeBanner")}</UIText>
            </UIButton>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <UIInput
                  captionText={t("app.firstName")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    fieldState.error?.message && t(fieldState.error.message)
                  }
                  maxLength={100}
                />
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <UIInput
                  captionText={t("app.lastName")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    fieldState.error?.message && t(fieldState.error.message)
                  }
                  maxLength={100}
                />
              )}
            />
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <View style={styles.group}>
                  <UIText size="xs" weight="semibold" color="secondary">
                    {t("students.gender")}
                  </UIText>
                  <View style={styles.chips}>
                    {GENDERS.map((value) => (
                      <UIChip
                        key={value}
                        label={t(GENDER_LABELS[value])}
                        selected={field.value === value}
                        onPress={
                          isGenderLocked
                            ? undefined
                            : () => field.onChange(value)
                        }
                      />
                    ))}
                  </View>
                  {isGenderLocked ? null : (
                    <UIText size="xs" color="secondary">
                      {t("students.genderHint")}
                    </UIText>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="bio"
              render={({ field, fieldState }) => (
                <UIInput
                  captionText={t("students.bio")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    fieldState.error?.message && t(fieldState.error.message)
                  }
                  maxLength={500}
                  multiline
                />
              )}
            />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Controller
              control={control}
              name="interests"
              render={({ field, fieldState }) => (
                <UIInput
                  captionText={t("students.interests")}
                  placeholder={t("students.interestsHint")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    fieldState.error?.message && t(fieldState.error.message)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="songUrl"
              render={({ field, fieldState }) => (
                <UIInput
                  captionText={t("students.song")}
                  placeholder="https://…"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorText={
                    fieldState.error?.message && t(fieldState.error.message)
                  }
                  maxLength={500}
                  autoCapitalize="none"
                  inputMode="url"
                />
              )}
            />
          </>
        ) : null}
      </UIFadeScrollView>
      <View style={styles.actions}>
        <UIButton
          size="rg"
          radius="sm"
          disabled={isSaving}
          onPress={handleNextPress}
        >
          <UIText weight="semibold" size="md" color="black">
            {t(isLastStep ? "onboarding.done" : "onboarding.next")}
          </UIText>
        </UIButton>
        <UIButton
          type="ghost"
          radius="sm"
          disabled={isSaving}
          onPress={goToNextStep}
        >
          <UIText weight="semibold" color="soft">
            {t("onboarding.skip")}
          </UIText>
        </UIButton>
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    paddingHorizontal: theme.s(4),
    paddingBottom: theme.vs(12),
  },
  content: {
    flexGrow: 0,
    flexShrink: 1,
  },
  fields: {
    gap: theme.vs(16),
    paddingBottom: theme.vs(16),
  },
  group: {
    gap: theme.vs(8),
  },
  chips: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  actions: {
    gap: theme.vs(4),
    paddingBottom: theme.vs(8),
  },
}));
