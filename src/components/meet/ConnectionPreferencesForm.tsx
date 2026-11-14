import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ConnectionPreferencesFormValues } from "@/@types/connections";
import { UIInput, UIText } from "@/ui";

type ConnectionPreferencesFormProps = {
  control: Control<ConnectionPreferencesFormValues>;
};

// the fields only; the filters sheet saves them with its pinned button
export const ConnectionPreferencesForm = ({
  control,
}: ConnectionPreferencesFormProps) => {
  const { t, i18n } = useTranslation();
  const today = new Date();

  return (
    <View style={styles.container}>
      <UIText size="xs" weight="semibold" color="secondary">
        {t("connections.preferences")}
      </UIText>
      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => {
          const handleChange = (_event: DateTimePickerEvent, next?: Date) => {
            if (next) field.onChange(next);
          };
          // Android has no inline picker: rendering one opens a dialog, so open it on demand
          const handleAndroidPress = () =>
            DateTimePickerAndroid.open({
              value: field.value ?? today,
              mode: "date",
              maximumDate: today,
              onChange: handleChange,
            });
          return (
            <View style={styles.field}>
              <View style={styles.row}>
                <UIText weight="medium">{t("connections.birthDate")}</UIText>
                {Platform.OS === "android" ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleAndroidPress}
                  >
                    <UIText weight="semibold" color="link">
                      {field.value
                        ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                            dateStyle: "medium",
                          }).format(field.value)
                        : "—"}
                    </UIText>
                  </Pressable>
                ) : (
                  <DateTimePicker
                    value={field.value ?? today}
                    mode="date"
                    maximumDate={today}
                    themeVariant="dark"
                    onChange={handleChange}
                  />
                )}
              </View>
              <UIText size="xs" color="secondary">
                {t("connections.birthDateHint")}
              </UIText>
            </View>
          );
        }}
      />
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
  field: {
    gap: theme.vs(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));
