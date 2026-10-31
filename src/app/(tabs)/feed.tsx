import { UIPage, UIInput, UIChip, Icon } from "@/ui";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/components";

const FILTERS = ["all", "events", "people", "news", "campus"] as const;

export default function FeedScreen() {
  const { t } = useTranslation();
  const [querry, setQuerry] = useState("");
  const [selected, setSelected] = useState(0);

  return (
    <UIPage backdrop="city">
      <View style={styles.header}>
        <ScreenHeader title={t("tabs.feed")} style={styles.titleRow} />

        <UIInput
          placeholder={t("feed.search")}
          value={querry}
          onChangeText={setQuerry}
          leftIcon={
            <Icon
              name="search"
              size={16}
              uniProps={(theme) => ({ color: theme.colors.white40 })}
            />
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((filter, index) => (
            <UIChip
              key={filter}
              label={t(`feed.filters.${filter}`)}
              selected={selected === index}
              onPress={() => setSelected(index)}
            />
          ))}
        </ScrollView>
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.vs(12),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
  },
  chips: {
    flexDirection: "row",
    gap: theme.s(8),
    paddingVertical: theme.vs(4),
  },
  titleRow: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
}));
