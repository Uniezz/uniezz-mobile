import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Professor } from "@/@types/study";
import { useRateProfessor } from "@/hooks/useProfessors";
import { UIGlass, UIText } from "@/ui";
import { UNIVERSITY_SHORT_NAMES } from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";
import { RatingInput } from "./RatingInput";

export function ProfessorRow({ professor }: { professor: Professor }) {
  const { t } = useTranslation();
  const { mutateAsync: rate, isPending } = useRateProfessor();
  // The API does not return the student's rating, so keep it locally.
  const [myRating, setMyRating] = useState(0);

  const handleRatingChange = async (rating: number) => {
    setMyRating(rating);
    try {
      await rate({ id: professor.id, rating });
    } catch (error) {
      setMyRating(0);
      toast.error(t(apiErrorKey(error)));
    }
  };

  return (
    <View style={styles.cell}>
      <UIGlass radius={16} style={styles.card}>
        <View style={styles.text}>
          <UIText weight="semibold" numberOfLines={1}>
            {professor.name}
          </UIText>
          <UIText size="xs" color="secondary" numberOfLines={1}>
            {[
              professor.degree,
              UNIVERSITY_SHORT_NAMES[professor.universityId] ??
                professor.universityId,
            ]
              .filter(Boolean)
              .join(" · ")}
          </UIText>
        </View>
        <View style={styles.ratingRow}>
          <View style={styles.ratingSummary}>
            <UIText size="xs" color="secondary">
              {t("study.averageRating")}
            </UIText>
            {professor.ratingAverage > 0 ? (
              <View style={styles.average}>
                <UIText size="xs" style={styles.star}>
                  ★
                </UIText>
                <UIText size="xs" color="secondary">
                  {t("study.ratingSummary", {
                    rating: professor.ratingAverage.toFixed(1),
                    votes: professor.ratingCount,
                  })}
                </UIText>
              </View>
            ) : (
              <UIText size="xs" color="secondary">
                {t("study.noRatings")}
              </UIText>
            )}
          </View>
          <View style={styles.myRating}>
            <UIText size="xs" color="secondary">
              {t("study.yourRating")}
            </UIText>
            <RatingInput
              value={myRating}
              onChange={handleRatingChange}
              disabled={isPending}
              size="compact"
            />
          </View>
        </View>
      </UIGlass>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: { paddingBottom: theme.vs(8) },
  card: { padding: theme.s(12), gap: theme.vs(10) },
  text: { flex: 1, gap: theme.vs(3) },
  star: { color: theme.colors.amber },
  ratingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.s(8),
  },
  ratingSummary: { gap: theme.vs(2) },
  average: { flexDirection: "row", alignItems: "center", gap: theme.s(4) },
  myRating: { alignItems: "flex-end", gap: theme.vs(2) },
}));
