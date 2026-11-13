import type { ComponentProps } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Icon, UIGlass, UIText } from "@/ui";
import { RatingInput } from "./RatingInput";

const ThemedSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.amber,
}));

type StudyRowProps = {
  icon?: ComponentProps<typeof Icon>["name"];
  title: string;
  subtitle: string;
  university?: string;
  difficulty?: number;
  /** average from 1 to 5; 0 means nobody rated yet */
  rating?: number;
  ratingCount?: number;
  onRate?: (rating: number) => void;
  isRating?: boolean;
  onPress: () => void;
};

// one glass card per file, course or professor, 8pt apart, as in the design
export function StudyRow({
  icon,
  title,
  subtitle,
  university,
  difficulty,
  rating,
  ratingCount,
  onRate,
  isRating,
  onPress,
}: StudyRowProps) {
  const { t } = useTranslation();
  const [myRating, setMyRating] = useState(0);
  const handleRatingChange = (value: number) => {
    setMyRating(value);
    onRate?.(value);
  };

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.cell}>
      <UIGlass radius={16} style={styles.row(rating !== undefined)}>
        {icon ? (
          <View style={styles.tile}>
            <Icon
              name={icon}
              size={18}
              uniProps={(theme) => ({ color: theme.colors.white80 })}
            />
          </View>
        ) : null}
        <View style={styles.text(rating !== undefined)}>
          <UIText weight="semibold" numberOfLines={1}>
            {title}
          </UIText>
          {university ? (
            <UIText size="xs" color="secondary" numberOfLines={1}>
              {university}
            </UIText>
          ) : null}
          <View style={styles.details}>
            <UIText
              size="xs"
              color="secondary"
              numberOfLines={1}
              style={styles.subtitle}
            >
              {subtitle}
            </UIText>
            {difficulty === undefined ? null : (
              <View style={styles.difficulty}>
                {Array.from({ length: 5 }, (_, index) => (
                  <ThemedSymbol
                    key={index}
                    name={{
                      ios: "flame.fill",
                      android: "local_fire_department",
                      web: "local_fire_department",
                    }}
                    size={14}
                    style={styles.flame(index < difficulty)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
        {rating === undefined ? null : (
          <View style={styles.ratingRow}>
            <View style={styles.ratingSummary}>
              <UIText size="xs" color="secondary">
                {t("study.averageRating")}
              </UIText>
              {rating > 0 ? (
                <View style={styles.average}>
                  <UIText size="xs" style={styles.star}>
                    ★
                  </UIText>
                  <UIText size="xs" color="secondary">
                    {t("study.ratingSummary", {
                      rating: rating.toFixed(1),
                      votes: ratingCount ?? 0,
                    })}
                  </UIText>
                </View>
              ) : (
                <UIText size="xs" color="secondary">
                  {t("study.noRatings")}
                </UIText>
              )}
            </View>
            {onRate ? (
              <View style={styles.myRating}>
                <UIText size="xs" color="secondary">
                  {t("study.yourRating")}
                </UIText>
                <RatingInput
                  value={myRating}
                  onChange={handleRatingChange}
                  disabled={isRating}
                  size="compact"
                />
              </View>
            ) : null}
          </View>
        )}
      </UIGlass>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: { paddingBottom: theme.vs(8) },
  row: (hasRating: boolean) => ({
    flexDirection: hasRating ? "column" : "row",
    alignItems: hasRating ? "stretch" : "center",
    gap: theme.s(12),
    padding: theme.s(12),
  }),
  tile: {
    width: theme.vs(40),
    height: theme.vs(40),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    alignItems: "center",
    justifyContent: "center",
  },
  text: (hasRating: boolean) => ({
    flex: hasRating ? undefined : 1,
    gap: theme.vs(3),
  }),
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  subtitle: { flex: 1 },
  difficulty: { flexDirection: "row", gap: theme.s(2) },
  flame: (filled: boolean) => ({ opacity: filled ? 1 : 0.25 }),
  ratingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.s(8),
  },
  ratingSummary: { gap: theme.vs(2) },
  myRating: { alignItems: "flex-end", gap: theme.vs(2) },
  average: { flexDirection: "row", alignItems: "center", gap: theme.s(4) },
  star: { color: theme.colors.amber },
}));
