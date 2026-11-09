import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilterValues } from "@/@types/feed";
import { useUniversities } from "@/hooks/useUniversities";
import { UIChip, UIFadeScrollView, UIText } from "@/ui";
import { DATE_PRESETS, FEED_TYPE_LABELS, FEED_TYPES } from "@/utils";

type FeedFiltersProps = {
  control: Control<FeedFilterValues>;
};

export const FeedFilters = ({ control }: FeedFiltersProps) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <FilterRow label={t("feed.type")}>
            {FEED_TYPES.map((type) => (
              <UIChip
                key={type}
                label={t(FEED_TYPE_LABELS[type])}
                selected={field.value === type}
                onPress={() => field.onChange(type)}
              />
            ))}
          </FilterRow>
        )}
      />
      <Controller
        control={control}
        name="university"
        render={({ field }) => (
          <FilterRow label={t("app.university")}>
            <UIChip
              label={t("app.all")}
              selected={field.value === null}
              onPress={() => field.onChange(null)}
            />
            {universities.map(({ id }) => (
              <UIChip
                key={id}
                label={id.toUpperCase()}
                selected={field.value === id}
                onPress={() => field.onChange(id)}
              />
            ))}
          </FilterRow>
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <FilterRow label={t("feed.date")}>
            {DATE_PRESETS.map(([date, label]) => (
              <UIChip
                key={date}
                label={t(label)}
                selected={field.value === date}
                onPress={() => field.onChange(date)}
              />
            ))}
          </FilterRow>
        )}
      />
    </View>
  );
};

const FilterRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={styles.row}>
    <UIText size="xs" weight="semibold" color="secondary" style={styles.label}>
      {label}
    </UIText>
    <UIFadeScrollView
      horizontal
      fadeColor="surface"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {children}
    </UIFadeScrollView>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
  },
  row: {
    gap: theme.vs(6),
  },
  // rows run edge to edge so chips scroll under the fades instead of being cut at the inset
  label: {
    paddingHorizontal: theme.s(16),
  },
  chips: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
}));
