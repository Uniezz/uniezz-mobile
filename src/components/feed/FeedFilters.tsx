import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilterValues } from "@/@types/feed";
import { useUniversities } from "@/hooks/useUniversities";
import { UIChip, UIFilterRow } from "@/ui";
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
          <UIFilterRow label={t("feed.type")}>
            {FEED_TYPES.map((type) => (
              <UIChip
                key={type}
                label={t(FEED_TYPE_LABELS[type])}
                selected={field.value === type}
                onPress={() => field.onChange(type)}
              />
            ))}
          </UIFilterRow>
        )}
      />
      <Controller
        control={control}
        name="university"
        render={({ field }) => (
          <UIFilterRow label={t("app.university")}>
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
          </UIFilterRow>
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <UIFilterRow label={t("feed.date")}>
            {DATE_PRESETS.map(([date, label]) => (
              <UIChip
                key={date}
                label={t(label)}
                selected={field.value === date}
                onPress={() => field.onChange(date)}
              />
            ))}
          </UIFilterRow>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
  },
}));
