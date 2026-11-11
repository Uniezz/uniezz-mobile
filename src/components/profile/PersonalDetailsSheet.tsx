import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHog } from "posthog-react-native";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { PersonalDetailsFormValues, Profile } from "@/@types/profile";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import { personalDetailsSchema } from "@/schemas";
import { UIChip, UIFormSheet, UIInput, UIText } from "@/ui";
import {
  GENDER_LABELS,
  GENDERS,
  splitInterests,
  toDetailsValues,
} from "@/utils";
import { captureAction } from "@/utils/analytics";

type PersonalDetailsSheetProps = {
  ref: Ref<BottomSheetModal>;
  profile: Profile;
  onSaved: () => void;
};

export function PersonalDetailsSheet({
  ref,
  profile,
  onSaved,
}: PersonalDetailsSheetProps) {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { mutateAsync: updateProfile, isPending } = useUpdateMyProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    // follows the saved profile, so the next opening starts from it
    values: toDetailsValues(profile),
    mode: "onChange",
  });
  // the API rejects changing a saved gender (gender_immutable)
  const isGenderLocked = Boolean(profile.gender);
  const handleSavePress = handleSubmit(
    async ({ interests, songUrl, gender, ...values }) => {
      try {
        await updateProfile({
          ...values,
          interests: splitInterests(interests),
          songUrl: songUrl.trim(),
          ...(isGenderLocked || !gender ? {} : { gender }),
        });
        toast.success(t("app.saved"));
        onSaved();
      } catch {
        toast.error(t("apiState.profileSaveError"));
      }
    },
    () => captureAction(posthog, "profile_form", "validation_failed"),
  );
  // a closed sheet drops unsaved edits
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t("app.personalDetails")}
      actionLabel={t("app.saveChanges")}
      isActionDisabled={!isDirty || !isValid || isPending}
      onActionPress={handleSavePress}
      onDismiss={handleDismiss}
    >
      <Controller
        control={control}
        name="firstName"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("app.firstName")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={100}
          />
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("app.lastName")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={100}
          />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("students.bio")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
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
            isInSheet
            captionText={t("students.interests")}
            placeholder={t("students.interestsHint")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="songUrl"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("students.song")}
            placeholder="https://…"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={500}
            autoCapitalize="none"
            inputMode="url"
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
                    isGenderLocked ? undefined : () => field.onChange(value)
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
    </UIFormSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.vs(8),
  },
  chips: {
    flexDirection: "row",
    gap: theme.s(8),
  },
}));
