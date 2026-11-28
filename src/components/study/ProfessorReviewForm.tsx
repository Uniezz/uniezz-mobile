import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CommentFormValues } from "@/@types";
import { useReviewProfessor } from "@/hooks";
import { commentSchema } from "@/schemas";
import { UIButton, UIInput, UIPressable, UIText } from "@/ui";
import { apiErrorKey } from "@/utils";

type ProfessorReviewFormProps = {
  professorId: string;
  /** your saved review's text; the field starts from it, and Remove shows */
  myReviewContent?: string;
  onDeletePress: () => void;
};

// your review of a professor, pinned under the professor page's reviews: a fixed field above the
// button, holding your saved review to change, with Remove beside the label
export const ProfessorReviewForm = ({
  professorId,
  myReviewContent,
  onDeletePress,
}: ProfessorReviewFormProps) => {
  const { t } = useTranslation();
  const hasMyReview = myReviewContent !== undefined;
  const { mutateAsync: review, isPending: isSaving } =
    useReviewProfessor(professorId);
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: myReviewContent ?? "" },
    mode: "onChange",
  });
  // your review saves only once changed
  const isSubmitDisabled = isSaving || !isValid || (hasMyReview && !isDirty);

  // one toast: it shows the saving, then turns into the outcome
  const handleSubmitPress = handleSubmit(async ({ content }) => {
    const toastId = toast.loading(t("study.publishingReview"));
    try {
      await review(content);
      // the page remounts the form with the saved text
      toast.success(t("study.reviewSaved"), { id: toastId });
    } catch (error) {
      toast.error(t(apiErrorKey(error)), { id: toastId });
    }
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="content"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <View style={styles.line}>
              <UIText size="sm" weight="semibold" style={styles.grow}>
                {t("study.yourReview")}
              </UIText>
              {hasMyReview ? (
                <UIPressable
                  accessibilityRole="button"
                  hitSlop={8}
                  disabled={isSaving}
                  onPress={onDeletePress}
                >
                  <UIText size="sm" weight="semibold" color="error">
                    {t("app.remove")}
                  </UIText>
                </UIPressable>
              ) : null}
            </View>
            <UIInput
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSaving}
              maxLength={1000}
              style={styles.input}
            />
            <View style={styles.line}>
              <UIText size="xs" color="secondary" style={styles.grow}>
                {t("study.reviewHint")}
              </UIText>
              <UIText size="xs" color="secondary">
                {value.length} / 1000
              </UIText>
            </View>
          </View>
        )}
      />
      <UIButton
        size="rg"
        disabled={isSubmitDisabled}
        onPress={handleSubmitPress}
      >
        <UIText size="md" color="black" weight="semibold">
          {t(hasMyReview ? "study.saveReview" : "app.submit")}
        </UIText>
      </UIButton>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  form: {
    gap: theme.vs(12),
  },
  field: {
    gap: theme.vs(6),
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
  },
  grow: { flex: 1 },
  // a fixed box that scrolls inside, so the footer keeps one height
  input: {
    height: theme.vs(96),
  },
}));
