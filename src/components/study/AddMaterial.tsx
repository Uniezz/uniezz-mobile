import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
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
  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    ({ subject, university }) => {
      captureAction(posthog, "material_add", "attempted", { storage: "local" });
      try {
        onSave({
          subject,
          university,
          type: "Exam",
          author: "You",
          rating: "—",
        });
        captureAction(posthog, "material_add", "succeeded", {
          storage: "local",
        });
      } catch (error) {
        captureAction(posthog, "material_add", "failed", { storage: "local" });
        throw error;
      }
    },
    () => captureAction(posthog, "material_form", "validation_failed"),
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
