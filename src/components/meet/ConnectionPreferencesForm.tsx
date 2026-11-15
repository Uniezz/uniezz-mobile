import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ConnectionPreferencesFormValues } from "@/@types";
import { UIInput, UIText } from "@/ui";

type ConnectionPreferencesFormProps = {
  control: Control<ConnectionPreferencesFormValues>;
};

// the fields only; the filters sheet saves them with its pinned button
export const ConnectionPreferencesForm = ({
  control,
}: ConnectionPreferencesFormProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <UIText size="xs" weight="semibold" color="secondary">
        {t("connections.preferences")}
      </UIText>
      <Controller
        control={control}
        name="intent"
        render={({ field }) => (
          <UIInput
            isInSheet
            captionText={t("connections.intent")}
            placeholder={t("connections.intentPlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            maxLength={200}
            multiline
            scrollEnabled
            inputContainerStyle={styles.intent}
            style={styles.intentInput}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
  },
  intent: { height: theme.vs(150) },
  intentInput: { alignSelf: "stretch" },
}));
