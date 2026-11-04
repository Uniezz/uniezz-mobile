import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilterValues } from "@/@types/feed";
import { useUniversities } from "@/hooks/useUniversities";
import { UIChip, UIText } from "@/ui";
import { DATE_PRESETS, FEED_TYPE_LABELS, FEED_TYPES } from "@/utils";

type FeedFiltersProps = {
  value: FeedFilterValues;
  onChange: (value: FeedFilterValues) => void;
};

export const FeedFilters = ({ value, onChange }: FeedFiltersProps) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const rows = [
    {
      label: t("feed.type"),
      options: FEED_TYPES.map((type) => ({
        key: type,
        label: t(FEED_TYPE_LABELS[type]),
        selected: value.type === type,
        next: { ...value, type },
      })),
    },
    {
      label: t("app.university"),
      options: [
        {
          key: "all",
          label: t("app.all"),
          selected: value.university === null,
          next: { ...value, university: null },
        },
        ...universities.map(({ id }) => ({
          key: id,
          label: id.toUpperCase(),
          selected: value.university === id,
          next: { ...value, university: id },
        })),
      ],
    },
    {
      label: t("feed.date"),
      options: DATE_PRESETS.map(([date, label]) => ({
        key: date,
        label: t(label),
        selected: value.date === date,
        next: { ...value, date },
      })),
    },
  ];

  return (
    <View style={styles.container}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <UIText size="xs" weight="semibold" color="secondary">
            {row.label}
          </UIText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {row.options.map((option) => (
              <UIChip
                key={option.key}
                label={option.label}
                selected={option.selected}
                onPress={() => onChange(option.next)}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
  },
  row: {
    gap: theme.vs(6),
  },
  chips: {
    gap: theme.s(6),
  },
}));
