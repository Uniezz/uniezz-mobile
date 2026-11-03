import type { ProfileFormValues } from "@/schemas/profile";
import { UIInput, UIText } from "@/ui";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  control: Control<ProfileFormValues>;
  disabled: boolean;
};

export function ProfilePersonalInfoSection({ control, disabled }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.section, styles.panel]}>
      <UIText size="md" weight="bold">
        {t("profile.personalInfo")}
      </UIText>
      <Controller
        control={control}
        name="firstName"
        render={({ field, fieldState }) => (
          <UIInput
            captionText={t("profile.firstName")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              fieldState.error?.message
                ? t(fieldState.error.message)
                : undefined
            }
            editable={!disabled}
            autoCapitalize="words"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field, fieldState }) => (
          <UIInput
            captionText={t("profile.lastName")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              fieldState.error?.message
                ? t(fieldState.error.message)
                : undefined
            }
            editable={!disabled}
            autoCapitalize="words"
            returnKeyType="done"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.vs(12),
  },
  panel: {
    gap: theme.vs(12),
    padding: theme.s(16),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
}));
