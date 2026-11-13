import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { StyleSheet } from "react-native-unistyles";
import type { CreateReportInput, ReportFormValues } from "@/@types/report";
import { RowPicker } from "@/components/RowPicker";
import { useCreateReport } from "@/hooks/useReports";
import { reportSchema } from "@/schemas";
import { UIFormSheet, UIInput, UIText } from "@/ui";
import { REPORT_REASONS } from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";

type ReportSheetProps = {
  ref: Ref<BottomSheetModal>;
  targetId: string;
  targetType: CreateReportInput["targetType"];
  onSent?: () => void;
};

export const ReportSheet = ({
  ref,
  targetId,
  targetType,
  onSent,
}: ReportSheetProps) => {
  const { t } = useTranslation();
  const { mutateAsync: report, isPending } = useCreateReport();
  const { dismiss } = useBottomSheetModal();
  const { control, handleSubmit, reset } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "spam", details: "" },
  });

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async ({ reason, details }) => {
      try {
        await report({
          targetId,
          targetType,
          reason,
          details: details || undefined,
        });
        toast.success(t("report.sent"));
        reset();
        dismiss();
        onSent?.();
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    },
    () => captureAction(posthog, "report_form", "validation_failed"),
  );

  const handleSubmitPress = () => onSubmit();
  // a closed sheet starts over next time
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t(`report.${targetType}`)}
      actionLabel={t("report.submit")}
      isActionDisabled={isPending}
      onActionPress={handleSubmitPress}
      onDismiss={handleDismiss}
    >
      <UIText size="sm" color="secondary">
        {t("report.description")}
      </UIText>
      <Controller
        control={control}
        name="reason"
        render={({ field }) => (
          <RowPicker
            appearance="inset"
            items={REPORT_REASONS.map(([, label]) => ({ topText: t(label) }))}
            selectedItem={REPORT_REASONS.findIndex(
              ([reason]) => reason === field.value,
            )}
            onItemPress={(index) =>
              field.onChange(REPORT_REASONS[index]?.[0] ?? field.value)
            }
          />
        )}
      />
      <Controller
        control={control}
        name="details"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("report.details")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={1000}
            multiline
            scrollEnabled
            inputContainerStyle={styles.details}
            style={styles.detailsInput}
          />
        )}
      />
    </UIFormSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  details: { height: theme.vs(150) },
  detailsInput: { alignSelf: "stretch" },
}));
