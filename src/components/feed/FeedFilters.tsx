import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilterValues } from "@/@types";
import { useUniversities } from "@/hooks";
import { UIChip, UIFilterRow, UIUniversityFilterRow } from "@/ui";
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
        render={({ field }) => {
          const handleAllPress = () => field.onChange(null);
          const handleUniversityPress = (id: string) => field.onChange(id);
          return (
            <UIUniversityFilterRow
              universities={universities}
              selectedIds={field.value ? [field.value] : []}
              allLabel={t("app.all")}
              isAllSelected={field.value === null}
              onAllPress={handleAllPress}
              onUniversityPress={handleUniversityPress}
            />
          );
        }}
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
