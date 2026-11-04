import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useAddMyProgramme } from "@/hooks/useMyProfile";
import type { AddProgrammeFormValues } from "@/@types/profile";
import { addProgrammeSchema } from "@/schemas";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";

export function AddProgrammeForm({
  isPrimary,
  onSaved,
}: {
  isPrimary: boolean;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { mutateAsync: addProgramme, isPending } = useAddMyProgramme();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<AddProgrammeFormValues>({
    resolver: zodResolver(addProgrammeSchema),
    defaultValues: { programme: "", faculty: "" },
    mode: "onChange",
  });
  const onSubmit = handleSubmit(async (values) => {
    try {
      await addProgramme({ ...values, status: "active", isPrimary });
      onSaved();
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  });
  return (
    <UIGlass style={styles.editor}>
      <Controller
        control={control}
        name="programme"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="Programme"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={120}
          />
        )}
      />
      <Controller
        control={control}
        name="faculty"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="Faculty"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={120}
          />
        )}
      />
      <UIButton disabled={isPending || !isValid} onPress={() => onSubmit()}>
        <UIText color="black" weight="semibold">
          Add programme
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  editor: { padding: theme.s(16), gap: theme.vs(12) },
}));
