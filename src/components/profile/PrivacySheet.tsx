import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Profile } from "@/@types/profile";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import { UIFormSheet, UISwitch, UIText } from "@/ui";
import { PRIVACY_SETTINGS } from "@/utils";

type PrivacySheetProps = {
  ref: Ref<BottomSheetModal>;
  privacy: Profile["privacy"];
  onSaved: () => void;
};

export const PrivacySheet = ({ ref, privacy, onSaved }: PrivacySheetProps) => {
  const { t } = useTranslation();
  const { mutateAsync: updateProfile, isPending } = useUpdateMyProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<Profile["privacy"]>({ values: privacy });
  const handleSavePress = handleSubmit(async (values) => {
    try {
      await updateProfile({ privacy: values });
      toast.success(t("app.saved"));
      onSaved();
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  });
  // a closed sheet drops unsaved changes
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t("app.profileVisibility")}
      actionLabel={t("app.saveChanges")}
      isActionDisabled={!isDirty || isPending}
      onActionPress={handleSavePress}
      onDismiss={handleDismiss}
    >
      {PRIVACY_SETTINGS.map(([key, label], index) => (
        <Controller
          key={key}
          control={control}
          name={key}
          render={({ field }) => (
            <View style={styles.row(index > 0)}>
              <UIText weight="medium" style={styles.label}>
                {t(label)}
              </UIText>
              <UISwitch
                accessibilityLabel={t(label)}
                value={field.value}
                onValueChange={field.onChange}
              />
            </View>
          )}
        />
      ))}
    </UIFormSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: (divided: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    minHeight: theme.vs(52),
    borderTopWidth: divided ? 1 : 0,
    borderTopColor: theme.colors.white5,
  }),
  label: {
    flex: 1,
  },
}));
