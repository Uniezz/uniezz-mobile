import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { PersonalDetailsFormValues, Profile } from "@/@types/profile";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import { personalDetailsSchema } from "@/schemas";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";
import { splitInterests } from "@/utils";

export function PersonalDetailsForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { mutateAsync: update, isPending } = useUpdateMyProfile();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      bio: profile.bio ?? "",
      interests: (profile.interests ?? []).join(", "),
    },
    mode: "onChange",
  });
  const onSubmit = handleSubmit(async ({ interests, ...values }) => {
    try {
      await update({ ...values, interests: splitInterests(interests) });
      onSaved();
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  });
  const handleSavePress = () => onSubmit();

  return (
    <UIGlass radius={24} style={styles.editor}>
      <Controller
        control={control}
        name="firstName"
        render={({ field, fieldState }) => (
          <UIInput
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
            captionText={t("students.interests")}
            placeholder={t("students.interestsHint")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
          />
        )}
      />
      <UIButton disabled={!isValid || isPending} onPress={handleSavePress}>
        <UIText color="black" weight="semibold">
          {t("app.saveChanges")}
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  editor: {
    padding: theme.s(16),
    gap: theme.vs(12),
  },
}));
