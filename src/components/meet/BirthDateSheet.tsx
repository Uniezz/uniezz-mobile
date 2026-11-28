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
import { Platform, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { BirthDateFormValues } from "@/@types";
import {
  useConnectionPreferences,
  useUpdateConnectionPreferences,
} from "@/hooks";
import { birthDateSchema } from "@/schemas";
import { Icon, UIPressable, UIFormSheet, UIText } from "@/ui";
import { DEFAULT_OPEN_TO, toCalendarDay, apiErrorKey } from "@/utils";

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
  // the calendar opens on a typical student's year, not today, so picking needs no long scroll back
  const startDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  const { data: preferences } = useConnectionPreferences();
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
      // a new student is open to nothing, so the deck would stay empty until the filters are saved
      const openTo = preferences?.openTo?.length
        ? undefined
        : [...DEFAULT_OPEN_TO];
      await savePreferences({ birthDate: toCalendarDay(birthDate), openTo });
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
              value: field.value ?? startDate,
              mode: "date",
              maximumDate: today,
              onValueChange: handleChange,
            });
          return (
            <View style={styles.field}>
              {Platform.OS === "android" ? (
                // a whole field to tap, like the other inputs, rather than a small link
                <UIPressable
                  accessibilityRole="button"
                  accessibilityLabel={t("connections.birthDate")}
                  onPress={handleAndroidPress}
                  style={styles.androidField(Boolean(fieldState.error))}
                >
                  <UIText color={field.value ? "white" : "secondary"}>
                    {field.value
                      ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                          dateStyle: "long",
                        }).format(field.value)
                      : t("connections.pickBirthDate")}
                  </UIText>
                  <Icon
                    name="calendar"
                    size={18}
                    uniProps={(theme) => ({ color: theme.colors.white60 })}
                  />
                </UIPressable>
              ) : (
                <View style={styles.row}>
                  <UIText weight="medium">{t("connections.birthDate")}</UIText>
                  <DateTimePicker
                    value={field.value ?? startDate}
                    mode="date"
                    maximumDate={today}
                    themeVariant="dark"
                    onValueChange={handleChange}
                  />
                </View>
              )}
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
  // looks like UIInput
  androidField: (isError: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: theme.vs(48),
    paddingHorizontal: theme.s(14),
    borderWidth: 1,
    borderRadius: theme.vs(12),
    borderColor: isError ? theme.colors.red : theme.colors.white12,
    backgroundColor: theme.colors.white3,
  }),
}));
