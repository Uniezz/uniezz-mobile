import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DiscoverCard as DiscoverCardData } from "@/@types/connections";
import { InterestChips } from "@/components/profile";
import { Icon, UIIconButton, UIText } from "@/ui";
import { STUDY_LEVELS, UNIVERSITY_SHORT_NAMES } from "@/utils";

type DiscoverCardProps = {
  card: DiscoverCardData;
  onReportPress: () => void;
};

// anonymous until a match: no name, photo, faculty or year
export function DiscoverCard({ card, onReportPress }: DiscoverCardProps) {
  const { t } = useTranslation();
  const level = STUDY_LEVELS.find(([value]) => value === card.level)?.[1];
  const facts = [
    card.age === null ? null : String(card.age),
    level ? t(level) : null,
    UNIVERSITY_SHORT_NAMES[card.universityId] ?? card.universityId,
  ].filter(Boolean);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <UIText size="body" weight="medium" color="soft" style={styles.facts}>
          {facts.join(" · ")}
        </UIText>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("report.candidate")}
          onPress={onReportPress}
        >
          <Icon name="flag" size={18} />
        </UIIconButton>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {card.intent ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="link">
              {t("connections.lookingFor")}
            </UIText>
            <UIText size="xl" weight="bold">
              {card.intent}
            </UIText>
          </View>
        ) : null}
        {card.bio ? (
          <UIText size="rg" color="soft" style={styles.bio}>
            {card.bio}
          </UIText>
        ) : null}
        {card.sharedInterests?.length ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="link">
              {t("connections.inCommon")}
            </UIText>
            <InterestChips interests={card.sharedInterests} />
          </View>
        ) : null}
        {card.interests?.length ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="secondary">
              {t("connections.interests")}
            </UIText>
            <InterestChips interests={card.interests} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    // fills the space between the modes and the actions, so the screen fits without scrolling
    flex: 1,
    gap: theme.vs(12),
    padding: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  facts: { flex: 1 },
  content: { gap: theme.vs(16) },
  section: { gap: theme.vs(6) },
  bio: { lineHeight: theme.vs(24) },
}));
