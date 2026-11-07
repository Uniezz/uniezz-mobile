import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CreateReportInput, ReportFormValues } from "@/@types/report";
import { ApiRequestError } from "@/api";
import { RowPicker } from "@/components/RowPicker";
import { useCreateReport } from "@/hooks/useReports";
import { reportSchema } from "@/schemas";
import { UIBottomSheet, UIButton, UIText } from "@/ui";
import { REPORT_REASONS } from "@/utils";

type ReportSheetProps = {
  ref: Ref<BottomSheetModal>;
  targetId: string;
  targetType: CreateReportInput["targetType"];
};

export const ReportSheet = ({
  ref,
  targetId,
  targetType,
}: ReportSheetProps) => {
  const { t, i18n } = useTranslation();
  const { mutateAsync: report, isPending } = useCreateReport();
  const { dismiss } = useBottomSheetModal();
  const { control, handleSubmit, reset, formState } = useForm<ReportFormValues>(
    {
      resolver: zodResolver(reportSchema),
      defaultValues: { reason: "spam", details: "" },
    },
  );

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
      } catch (error) {
        toast.error(
          t(
            error instanceof ApiRequestError &&
              error.translationKey &&
              i18n.exists(error.translationKey)
              ? error.translationKey
              : "apiState.error",
          ),
        );
      }
    },
    () => captureAction(posthog, "report_form", "validation_failed"),
  );

  return (
    <UIBottomSheet
      ref={ref}
      title={t(`report.${targetType}`)}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.content}>
        <UIText size="sm" color="secondary">
          {t("report.description")}
        </UIText>
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <RowPicker
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
          render={({ field }) => (
            <BottomSheetTextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t("report.details")}
              maxLength={1000}
              multiline
              style={styles.details}
            />
          )}
        />
        {formState.errors.details?.message ? (
          <UIText size="sm" color="error">
            {t(formState.errors.details.message)}
          </UIText>
        ) : null}
        <UIButton size="rg" disabled={isPending} onPress={() => onSubmit()}>
          <UIText size="md" weight="semibold" color="black">
            {t("report.submit")}
          </UIText>
        </UIButton>
      </BottomSheetView>
    </UIBottomSheet>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  content: {
    gap: theme.vs(14),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: rt.insets.bottom + theme.vs(16),
  },
  details: {
    minHeight: theme.vs(88),
    borderRadius: theme.vs(20),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(14),
    paddingBottom: theme.vs(14),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
    textAlignVertical: "top",
  },
}));
