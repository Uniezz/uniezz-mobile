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
import type { FaqProposalFormValues } from "@/@types/faq";
import { useCreateFaqProposal } from "@/hooks/useFaq";
import { faqProposalSchema } from "@/schemas";
import { UIFormSheet, UIInput, UIText } from "@/ui";
import { apiErrorKey } from "@/utils/apiErrorKey";

type FaqProposalSheetProps = {
  ref: Ref<BottomSheetModal>;
};

export const FaqProposalSheet = ({ ref }: FaqProposalSheetProps) => {
  const { t } = useTranslation();
  const { mutateAsync: propose, isPending } = useCreateFaqProposal();
  const { dismiss } = useBottomSheetModal();
  const { control, handleSubmit, reset } = useForm<FaqProposalFormValues>({
    resolver: zodResolver(faqProposalSchema),
    defaultValues: { question: "", answer: "" },
  });

  const posthog = usePostHog();
  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await propose(values);
        toast.success(t("faq.proposalSent"));
        reset();
        dismiss();
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    },
    () => captureAction(posthog, "faq_proposal_form", "validation_failed"),
  );

  const handleSubmitPress = () => onSubmit();
  // a closed sheet starts over next time
  const handleDismiss = () => reset();

  return (
    <UIFormSheet
      ref={ref}
      title={t("faq.propose")}
      actionLabel={t("faq.proposalSubmit")}
      isActionDisabled={isPending}
      onActionPress={handleSubmitPress}
      onDismiss={handleDismiss}
    >
      <UIText size="sm" color="secondary">
        {t("faq.proposalDescription")}
      </UIText>
      <Controller
        control={control}
        name="question"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("faq.question")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={200}
            multiline
          />
        )}
      />
      <Controller
        control={control}
        name="answer"
        render={({ field, fieldState }) => (
          <UIInput
            isInSheet
            captionText={t("faq.answer")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={2000}
            multiline
          />
        )}
      />
    </UIFormSheet>
  );
};
