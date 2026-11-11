import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { RatingInput } from "@/components/study";
import { useProfessor, useRateProfessor } from "@/hooks/useProfessors";
import {
  UICollapsingHeader,
  UIGlass,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { UNIVERSITY_SHORT_NAMES } from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";

export default function ProfessorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: professor, isPending, isError, refetch } = useProfessor(id);
  const { mutateAsync: rate, isPending: isRating } = useRateProfessor();
  // the API does not return the student's own rating, so it starts empty
  const [myRating, setMyRating] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleBackPress = () => router.back();
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleRatingChange = async (rating: number) => {
    setMyRating(rating);
    try {
      await rate({ id, rating });
    } catch (error) {
      setMyRating(0);
      toast.error(t(apiErrorKey(error)));
    }
  };

  return (
    <UIPage>
      <UICollapsingHeader
        title={professor?.name ?? ""}
        isCompact={false}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
      />
      <ScrollView contentContainerStyle={styles.page(headerHeight)}>
        {isPending ? (
          <UISkeleton height={160} />
        ) : isError ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : (
          <UIGlass radius={16} style={styles.card}>
            <UIText color="secondary">
              {[
                professor.degree,
                UNIVERSITY_SHORT_NAMES[professor.universityId] ??
                  professor.universityId,
              ]
                .filter(Boolean)
                .join(" · ")}
            </UIText>
            <UIText weight="semibold">
              {professor.ratingAverage > 0
                ? t("study.ratingSummary", {
                    rating: professor.ratingAverage.toFixed(1),
                    votes: professor.ratingCount,
                  })
                : t("study.noRatings")}
            </UIText>
            <UIText size="sm" color="secondary">
              {t("study.yourRating")}
            </UIText>
            <RatingInput
              value={myRating}
              onChange={handleRatingChange}
              disabled={isRating}
            />
          </UIGlass>
        )}
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  page: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(40),
  }),
  card: {
    padding: theme.s(16),
    gap: theme.vs(8),
  },
}));
