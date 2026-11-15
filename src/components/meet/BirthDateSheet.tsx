import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { BirthDateFormValues } from "@/@types/connections";
import { useUpdateConnectionPreferences } from "@/hooks/useConnections";
import { birthDateSchema } from "@/schemas";
import { UIFormSheet, UIText } from "@/ui";
import { toCalendarDay } from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";

type BirthDateSheetProps = {
  ref: Ref<BottomSheetModal>;
  /** fires on every close, Save's included */
  onDismiss: () => void;
};

// as on the web: discovery stays locked until the birth date is set, and it can be set only once.
// Closing it unsaved leaves the tab (the screen decides), as the web's Cancel does.
export const BirthDateSheet = ({ ref, onDismiss }: BirthDateSheetProps) => {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const { mutateAsync: savePreferences, isPending } =
    useUpdateConnectionPreferences();
  const { dismiss } = useBottomSheetModal();
  const { control, handleSubmit } = useForm<BirthDateFormValues>({
    resolver: zodResolver(birthDateSchema),
    defaultValues: { birthDate: null },
  });

  const handleSavePress = handleSubmit(async ({ birthDate }) => {
    if (!birthDate) return;
    try {
      await savePreferences({ birthDate: toCalendarDay(birthDate) });
      toast.success(t("connections.ageSubmitted"));
      dismiss();
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  });
  const handleSubmitPress = () => handleSavePress();

  return (
    <UIFormSheet
      ref={ref}
      title={t("connections.birthDate")}
      actionLabel={t("apiState.save")}
      isActionDisabled={isPending}
      onDismiss={onDismiss}
      onActionPress={handleSubmitPress}
    >
      <UIText size="sm" color="secondary">
        {t("connections.birthDateHint")}
      </UIText>
      <Controller
        control={control}
        name="birthDate"
        render={({ field, fieldState }) => {
          const handleChange = (
            _event: DateTimePickerChangeEvent,
            next: Date,
          ) => field.onChange(next);
          // Android has no inline picker: rendering one opens a dialog, so open it on demand
          const handleAndroidPress = () =>
            DateTimePickerAndroid.open({
              value: field.value ?? today,
              mode: "date",
              maximumDate: today,
              onValueChange: handleChange,
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
                    onValueChange={handleChange}
                  />
                )}
              </View>
              {fieldState.error?.message ? (
                <UIText size="xs" color="error">
                  {t(fieldState.error.message)}
                </UIText>
              ) : null}
            </View>
          );
        }}
      />
      <UIText size="sm" weight="medium" color="error">
        {t("connections.birthDateOnce")}
      </UIText>
    </UIFormSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));
