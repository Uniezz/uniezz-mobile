import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable } from "react-native";
import { UIGlass, UIInput, UIText } from "@/ui";
import { StyleSheet } from "react-native-unistyles";
import type { AddMaterialFormValues, Material } from "@/@types/study";
import { addMaterialSchema } from "@/schemas";
import { useTranslation } from "react-i18next";

export function AddMaterial({
  onSave,
}: {
  onSave: (material: Material) => void;
}) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<AddMaterialFormValues>({
    resolver: zodResolver(addMaterialSchema),
    defaultValues: { subject: "", university: "" },
    mode: "onChange",
  });
  const onSubmit = handleSubmit(({ subject, university }) =>
    onSave({ subject, university, type: "Exam", author: "You", rating: "—" }),
  );
  return (
    <UIGlass style={styles.card}>
      <UIText size="md" weight="bold">
        Add material details
      </UIText>
      <UIText size="sm" color="secondary">
        This saves details only. File upload is not available yet.
      </UIText>
      <Controller
        control={control}
        name="subject"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="Subject"
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
        name="university"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="University"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={120}
          />
        )}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!isValid}
        onPress={() => onSubmit()}
      >
        <UIText color="link" weight="semibold">
          Save details
        </UIText>
      </Pressable>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { padding: theme.s(16), gap: theme.vs(8) },
}));
