import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Keyboard, View, Platform } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { PersonalDetailsFormValues } from "@/@types";
import { AuthPage } from "@/components/auth";
import { ProgrammeCard, ProgrammesSheet } from "@/components/profile";
import {
  useCompleteOnboarding,
  useMyProfile,
  usePickProfileImage,
  useUpdateMyProfile,
} from "@/hooks";
import { personalDetailsSchema } from "@/schemas";
import { vs } from "@/theme/scale";
import {
  UIPressable,
  Icon,
  UIAvatar,
  UIButton,
  UIGlass,
  UIIconButton,
  UIInput,
  UIPage,
  UIText,
  UIBlur,
} from "@/ui";
import {
  captureAction,
  ONBOARDING_STEPS,
  splitInterests,
  toDetailsValues,
} from "@/utils";

// first sign-in onboarding, as on web: photo, details, programmes. It shows until the profile's
// onboardedAt is set; skipping or finishing sets it for good, on every device
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { data: profile, isPending, isError } = useMyProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateMyProfile();
  const { pickImage: handlePhotoPress, isPending: isUploadingPhoto } =
    usePickProfileImage("avatar");
  const { mutateAsync: completeOnboarding, isPending: isCompleting } =
    useCompleteOnboarding();
  const programmesRef = useRef<BottomSheetModal>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    values: profile && toDetailsValues(profile),
    resetOptions: { keepDirtyValues: true },
  });

  if (isPending) {
    return (
      <UIPage style={styles.loading}>
        <ActivityIndicator color="white" />
      </UIPage>
    );
  }
  // finished or skipped (here or on another device): straight to the feed
  if (isError || profile.onboardedAt) return <Redirect href="/feed" />;

  const key = ONBOARDING_STEPS[step]!;
  const isLast = step === ONBOARDING_STEPS.length - 1;
  const programmes = profile.programmes ?? [];
  const isBusy = isSaving || isUploadingPhoto || isCompleting;
  // skip doesn't save the form, so it waits for a saved name
  const canSkip = Boolean(profile.firstName && profile.lastName);

  // once the API stored it, onboardedAt is in the profile and the Redirect above takes over
  const goToFeed = async () => {
    try {
      await completeOnboarding();
    } catch {
      toast.error(t("apiState.error"));
    }
  };
  const saveDetails = handleSubmit(
    async ({ interests, songUrl, gender: _gender, ...values }) => {
      try {
        if (isDirty)
          await updateProfile({
            ...values,
            interests: splitInterests(interests),
            songUrl: songUrl.trim(),
          });
        setStep(2);
      } catch {
        toast.error(t("apiState.profileSaveError"));
      }
    },
    () => captureAction(posthog, "profile_form", "validation_failed"),
  );
  const handleNextPress = () => {
    if (isLast) return goToFeed();
    if (step === 1) return saveDetails();
    setStep(step + 1);
  };
  const handleBackPress = () => setStep(step - 1);
  const handleProgrammesPress = () => programmesRef.current?.present();

  return (
    <AuthPage
      isTopAligned
      topText={t(`onboarding.${key}.title`)}
      bottomText={t(`onboarding.${key}.description`)}
    >
      <View onTouchStart={Keyboard.dismiss} style={styles.progress}>
        {ONBOARDING_STEPS.map((item, index) => (
          <View key={item} style={styles.segment(index <= step)} />
        ))}
      </View>
      <KeyboardAwareScrollView
        // keeps the focused field above the footer, not just the keyboard
        bottomOffset={vs(FOOTER_HEIGHT)}
        keyboardDismissMode="interactive"
        style={styles.content}
        contentContainerStyle={styles.fields}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {key === "photo" ? (
          <View style={styles.photoStep}>
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={t("app.changePhoto")}
              disabled={isUploadingPhoto}
              onPress={handlePhotoPress}
              style={styles.photo}
            >
              <UIAvatar
                size="hero"
                color="borderless"
                imageSrc={profile.avatarUrl}
              />
              <UIGlass radius={22} style={styles.photoBadge}>
                {isUploadingPhoto ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Icon name="camera" size={18} />
                )}
              </UIGlass>
            </UIPressable>
            <UIText size="sm" color="secondary" style={styles.photoHint}>
              {t("onboarding.photo.hint")}
            </UIText>
          </View>
        ) : null}
        {key === "details" ? (
          <>
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => {
                // names are saved trimmed, so the field shows them that way
                const handleBlur = () => {
                  field.onChange(field.value.trim());
                  field.onBlur();
                };
                return (
                  <UIInput
                    captionText={t("app.firstName")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={handleBlur}
                    errorText={
                      fieldState.error?.message && t(fieldState.error.message)
                    }
                    maxLength={100}
                  />
                );
              }}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => {
                // names are saved trimmed, so the field shows them that way
                const handleBlur = () => {
                  field.onChange(field.value.trim());
                  field.onBlur();
                };
                return (
                  <UIInput
                    captionText={t("app.lastName")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={handleBlur}
                    errorText={
                      fieldState.error?.message && t(fieldState.error.message)
                    }
                    maxLength={100}
                  />
                );
              }}
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
        {key === "programmes" ? (
          <>
            {programmes.map((item) => (
              <ProgrammeCard key={item.id} programme={item} />
            ))}
            <UIButton
              type="secondary"
              radius="sm"
              onPress={handleProgrammesPress}
              style={styles.programmesButton}
            >
              <Icon name={programmes.length ? "pencil" : "plus"} size={18} />
              <UIText weight="semibold">
                {t(programmes.length ? "app.edit" : "app.addProgramme")}
              </UIText>
            </UIButton>
          </>
        ) : null}
      </KeyboardAwareScrollView>
      {/* UIPage already pads the home indicator, so the footer lifts by the rest of the keyboard */}
      <KeyboardStickyView
        offset={{ opened: bottomInset }}
        style={styles.footer}
      >
        <UIBlur intensity={50} tint="dark" style={styles.footerBlur} />
        <View style={styles.actions}>
          {step > 0 ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("app.back")}
              disabled={isBusy}
              onPress={handleBackPress}
            >
              <Icon name="arrow-left" size={18} />
            </UIIconButton>
          ) : null}
          {isLast || !canSkip ? null : (
            <UIButton
              type="ghost"
              radius="sm"
              disabled={isBusy}
              onPress={goToFeed}
              style={styles.skip}
            >
              <UIText weight="semibold" color="secondary">
                {t("onboarding.skip")}
              </UIText>
            </UIButton>
          )}
          <UIButton
            radius="sm"
            disabled={isBusy}
            onPress={handleNextPress}
            style={styles.next}
          >
            <UIText weight="semibold" color="black">
              {t(isLast ? "onboarding.finish" : "onboarding.next")}
            </UIText>
            <Icon
              name={isLast ? "check" : "chevron-right"}
              size={18}
              uniProps={(theme) => ({ color: theme.colors.ink })}
            />
          </UIButton>
        </View>
      </KeyboardStickyView>
      <ProgrammesSheet
        ref={programmesRef}
        programmes={programmes}
        universityId={profile.universityId}
      />
    </AuthPage>
  );
}

// the footer button and its padding
const FOOTER_HEIGHT = 80;
const PHOTO_GLOW_BLUR = 48;
const PHOTO_GLOW_SPREAD = 8;

const styles = StyleSheet.create((theme, rt) => ({
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    flexDirection: "row",
    gap: theme.s(6),
    paddingBottom: theme.vs(20),
  },
  segment: (isReached: boolean) => ({
    flex: 1,
    height: theme.vs(4),
    borderRadius: theme.vs(999),
    backgroundColor: isReached ? theme.colors.white : theme.colors.white10,
  }),
  // fills the page, so the actions stay at the bottom on every step
  content: {
    flex: 1,
  },
  // the footer floats over the end of the content
  fields: {
    gap: theme.vs(16),
    paddingBottom: theme.vs(FOOTER_HEIGHT + 16),
  },
  // the scroll view clips the glow, so the step leaves room for all of it (blur + spread)
  photoStep: {
    alignItems: "center",
    gap: theme.vs(20),
    paddingTop: theme.vs(PHOTO_GLOW_BLUR + PHOTO_GLOW_SPREAD),
    paddingBottom: theme.vs(24),
  },
  // the blue glow around the photo, as on web
  photo: {
    borderRadius: theme.vs(999),
    boxShadow: `0 0 ${theme.vs(PHOTO_GLOW_BLUR)}px ${theme.vs(PHOTO_GLOW_SPREAD)}px ${theme.colors.blue20}`,
  },
  photoBadge: {
    position: "absolute",
    right: theme.vs(4),
    bottom: theme.vs(4),
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  photoHint: {
    maxWidth: theme.s(240),
    textAlign: "center",
  },
  programmesButton: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  // floats over the content edge to edge, and on under the home indicator so nothing shows below it
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -rt.insets.bottom,
    paddingTop: theme.vs(12),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(8) + rt.insets.bottom,
    overflow: "hidden",
  },
  footerBlur: {
    ...StyleSheet.absoluteFillObject,
    // Android has no real blur: an opaque fill, so nothing scrolls through
    backgroundColor:
      Platform.OS === "android" ? theme.colors.ink : theme.colors.ink40,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  skip: {
    flex: 1,
    width: "auto",
  },
  next: {
    flex: 1,
    width: "auto",
    flexDirection: "row",
    gap: theme.s(6),
  },
}));
