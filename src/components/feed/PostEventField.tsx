import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIGlass, UIText } from "@/ui";

type PickerMode = "date" | "time";

type PostEventFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  errorText?: string;
};

export const PostEventField = ({
  value,
  onChange,
  errorText,
}: PostEventFieldProps) => {
  const { t, i18n } = useTranslation();
  const date = value ?? new Date();
  const locale = i18n.resolvedLanguage ?? "en";

  const handleChange = (_event: DateTimePickerEvent, next?: Date) => {
    if (next) onChange(next);
  };

  // Android has no inline picker: rendering one opens a dialog, so open it on demand
  const openAndroidPicker = (mode: PickerMode) =>
    DateTimePickerAndroid.open({
      value: date,
      mode,
      minimumDate: mode === "date" ? new Date() : undefined,
      onChange: handleChange,
    });

  const renderPicker = (mode: PickerMode) =>
    Platform.OS === "android" ? (
      <Pressable
        accessibilityRole="button"
        onPress={() => openAndroidPicker(mode)}
      >
        <UIText weight="semibold" color="link">
          {value
            ? new Intl.DateTimeFormat(locale, {
                dateStyle: mode === "date" ? "medium" : undefined,
                timeStyle: mode === "time" ? "short" : undefined,
              }).format(value)
            : "—"}
        </UIText>
      </Pressable>
    ) : (
      <DateTimePicker
        value={date}
        mode={mode}
        minimumDate={mode === "date" ? new Date() : undefined}
        themeVariant="dark"
        onChange={handleChange}
      />
    );

  return (
    <View style={styles.field}>
      <UIText size="sm" weight="semibold" color="soft" style={styles.label}>
        {t("postComposer.eventDetails")}
      </UIText>
      <UIGlass radius={24} style={styles.card}>
        <View style={styles.row}>
          <UIText weight="medium">{t("postComposer.date")}</UIText>
          {renderPicker("date")}
        </View>
        <View style={[styles.row, styles.divided]}>
          <UIText weight="medium">{t("postComposer.time")}</UIText>
          {renderPicker("time")}
        </View>
      </UIGlass>
      {errorText ? (
        <UIText size="sm" weight="semibold" color="error">
          {errorText}
        </UIText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(8),
  },
  label: {
    paddingHorizontal: theme.s(4),
  },
  card: {
    paddingHorizontal: theme.s(16),
  },
  row: {
    minHeight: theme.vs(52),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.white5,
  },
}));
