import { useTranslation } from "react-i18next";
import { View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const ThemedStarRating = withUnistyles(StarRating, (theme) => ({
  color: theme.colors.amber,
  emptyColor: theme.colors.white20,
}));

type RatingInputProps = {
  /** 0 when nothing is picked yet */
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: "default" | "compact";
};

// whole stars from 1 to 5, as the API accepts
export function RatingInput({
  value,
  onChange,
  disabled,
  size = "default",
}: RatingInputProps) {
  const { t } = useTranslation();
  // swiping to the far left reports 0, which the API rejects
  const handleChange = (rating: number) => {
    if (rating >= 1) onChange(rating);
  };

  return (
    <View pointerEvents={disabled ? "none" : "auto"} style={styles.row}>
      <ThemedStarRating
        rating={value}
        onChange={handleChange}
        maxStars={5}
        step="full"
        starSize={size === "compact" ? 20 : 28}
        starStyle={size === "compact" ? styles.compactStar : undefined}
        accessibilityLabel={t("study.rateValue", { rating: "%value%" })}
        accessibilityAdjustmentLabel={t("study.rateValue", {
          rating: "%value%",
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { alignSelf: "flex-start" },
  compactStar: { marginHorizontal: theme.s(2) },
}));
