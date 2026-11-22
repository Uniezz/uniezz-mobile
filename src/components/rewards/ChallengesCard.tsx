import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { MyChallenge } from "@/@types";
import { Icon, UICoin, UIGlass, UIText } from "@/ui";
import { CHALLENGE_PERIOD_LABELS, challengeText } from "@/utils";

type ChallengesCardProps = {
  challenges: MyChallenge[];
};

// running challenges with their progress; each pays its reward once its target is reached in the period
export const ChallengesCard = ({ challenges }: ChallengesCardProps) => {
  const { t, i18n } = useTranslation();
  const formatDate = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "medium",
  });

  return (
    <UIGlass radius={16} style={styles.card}>
      <UIText weight="semibold">{t("rewards.challengesTitle")}</UIText>
      {challenges.map((challenge) => {
        const text = challengeText(challenge.texts, i18n.resolvedLanguage);
        const periodLabel = CHALLENGE_PERIOD_LABELS[challenge.period];
        const meta = [
          periodLabel ? t(periodLabel) : null,
          challenge.endsAt
            ? t("rewards.challengeEnds", {
                date: formatDate.format(new Date(challenge.endsAt)),
              })
            : null,
        ].filter(Boolean);
        return (
          <View key={challenge.id} style={styles.challenge}>
            <View style={styles.row}>
              <Icon
                name={challenge.completed ? "check" : "timer"}
                size={16}
                uniProps={(theme) => ({
                  color: challenge.completed
                    ? theme.colors.green
                    : theme.colors.white60,
                })}
              />
              <UIText style={styles.title}>{text?.title}</UIText>
              <View style={styles.reward}>
                <UICoin />
                <UIText size="sm" weight="semibold" style={styles.coins}>
                  {challenge.reward}
                </UIText>
              </View>
            </View>
            {text?.description ? (
              <UIText size="sm" color="secondary">
                {text.description}
              </UIText>
            ) : null}
            <View style={styles.row}>
              <View style={styles.track}>
                <View
                  style={styles.fill(
                    challenge.target > 0
                      ? Math.min(challenge.progress / challenge.target, 1)
                      : 0,
                    challenge.completed,
                  )}
                />
              </View>
              <UIText size="sm" color="secondary">
                {Math.min(challenge.progress, challenge.target)}/
                {challenge.target}
              </UIText>
            </View>
            {meta.length ? (
              <UIText size="xs" color="secondary">
                {meta.join(" · ")}
              </UIText>
            ) : null}
          </View>
        );
      })}
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.vs(16),
    padding: theme.s(16),
  },
  challenge: { gap: theme.vs(8) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  title: { flex: 1 },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(4),
  },
  coins: { color: theme.colors.amber },
  track: {
    flex: 1,
    height: theme.vs(6),
    borderRadius: theme.vs(3),
    overflow: "hidden",
    backgroundColor: theme.colors.white10,
  },
  fill: (ratio: number, isDone: boolean) => ({
    width: `${ratio * 100}%`,
    height: "100%",
    backgroundColor: isDone ? theme.colors.green : theme.colors.amber,
  }),
}));
