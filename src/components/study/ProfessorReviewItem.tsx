import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ProfessorReview } from "@/@types";
import { UIPressable, UIText } from "@/ui";

type ProfessorReviewItemProps = {
  review: ProfessorReview;
  onReportPress: (review: ProfessorReview) => void;
};

// an anonymous review, as on the web: its text, when it was last written, and Report on the right
// for someone else's; your own has no actions here, the page's pinned form changes it
export const ProfessorReviewItem = ({
  review,
  onReportPress,
}: ProfessorReviewItemProps) => {
  const { t, i18n } = useTranslation();
  const updated = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(review.updatedAt));
  const handleReportPress = () => onReportPress(review);

  return (
    <View style={styles.item}>
      <UIText color="soft">{review.content}</UIText>
      <View style={styles.meta}>
        <UIText size="xs" color="secondary" style={styles.date}>
          {updated}
        </UIText>
        {/* yours is changed in the page's form, and is not yours to report */}
        {review.isMine ? null : (
          <UIPressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleReportPress}
          >
            <UIText size="xs" weight="semibold" color="error">
              {t("chat.report")}
            </UIText>
          </UIPressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    gap: theme.vs(6),
  },
  // the date on the left, Report pushed to the right
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(16),
  },
  date: { flex: 1 },
}));
