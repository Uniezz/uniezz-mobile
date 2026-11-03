import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import type { PersonalDetailsFormValues } from "@/@types/profile";
import { personalDetailsSchema } from "@/schemas";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";

export function PersonalDetailsForm({
  firstName,
  lastName,
  onSaved,
}: {
  firstName: string;
  lastName: string;
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
    defaultValues: { firstName, lastName },
    mode: "onChange",
  });
  const onSubmit = handleSubmit(async (values) => {
    try {
      await update(values);
      onSaved();
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  });
  return (
    <UIGlass style={styles.editor}>
      <Controller
        control={control}
        name="firstName"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="First name"
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
            captionText="Last name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={100}
          />
        )}
      />
      <UIButton disabled={isPending || !isValid} onPress={() => onSubmit()}>
        <UIText color="black" weight="semibold">
          Save changes
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  editor: { padding: theme.s(16), gap: theme.vs(12) },
}));
