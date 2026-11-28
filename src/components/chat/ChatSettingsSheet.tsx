import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import type { ChatSettings } from "@/@types";
import { RowPicker } from "@/components/RowPicker";
import { useMyChatSettings, useUpdateMyChatSettings } from "@/hooks";
import { UIFormSheet, UIText } from "@/ui";
import { WHO_CAN_MESSAGE, apiErrorKey } from "@/utils";

type ChatSettingsSheetProps = {
  ref: Ref<BottomSheetModal>;
};

// the chat tab's settings: who may send you a message request
export const ChatSettingsSheet = ({ ref }: ChatSettingsSheetProps) => {
  const { t } = useTranslation();
  const { dismiss } = useBottomSheetModal();
  const { data: settings } = useMyChatSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateMyChatSettings();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ChatSettings>({ values: settings });

  const handleSavePress = handleSubmit(async (values) => {
    try {
      await updateSettings({ body: values });
      toast.success(t("app.saved"));
      dismiss();
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  });
  // a closed sheet drops unsaved changes
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t("chat.whoCanMessage")}
      actionLabel={t("apiState.save")}
      isActionDisabled={!isDirty || isPending}
      onActionPress={handleSavePress}
      onDismiss={handleDismiss}
      isDirty={isDirty && !isPending}
    >
      <UIText size="sm" color="secondary">
        {t("chat.whoCanMessageHint")}
      </UIText>
      <Controller
        control={control}
        name="whoCanMessage"
        render={({ field }) => {
          const handleItemPress = (index: number) =>
            field.onChange(WHO_CAN_MESSAGE[index]?.[0] ?? field.value);
          return (
            <RowPicker
              appearance="inset"
              items={WHO_CAN_MESSAGE.map(([, label]) => ({
                topText: t(label),
              }))}
              selectedItem={WHO_CAN_MESSAGE.findIndex(
                ([value]) => value === field.value,
              )}
              onItemPress={handleItemPress}
            />
          );
        }}
      />
    </UIFormSheet>
  );
};
