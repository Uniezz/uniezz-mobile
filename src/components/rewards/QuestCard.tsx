import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DailyQuests } from "@/@types";
import { Icon, UIGlass, UIText } from "@/ui";
import { QUEST_LABELS } from "@/utils";

type QuestCardProps = {
  quests: DailyQuests;
};

// today's quests with their progress; the reward is paid once every quest is done
export const QuestCard = ({ quests }: QuestCardProps) => {
  const { t, i18n } = useTranslation();
  const resetsAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    timeStyle: "short",
  }).format(new Date(quests.resetsAt));

  return (
    <UIGlass radius={16} style={styles.card}>
      <View style={styles.header}>
        <UIText weight="semibold" style={styles.title}>
          {t("rewards.questsTitle")}
        </UIText>
        <UIText size="xs" color="secondary">
          {t("rewards.questsResets", { time: resetsAt })}
        </UIText>
      </View>
      {(quests.quests ?? []).map((quest) => (
        <View key={quest.quest} style={styles.quest}>
          <View style={styles.row}>
            <Icon
              name={quest.done ? "check" : "timer"}
              size={16}
              uniProps={(theme) => ({
                color: quest.done ? theme.colors.green : theme.colors.white60,
              })}
            />
            <UIText style={styles.title}>
              {t(QUEST_LABELS[quest.quest] ?? "rewards.questOther")}
            </UIText>
            <UIText size="sm" color="secondary">
              {Math.min(quest.progress, quest.target)}/{quest.target}
            </UIText>
          </View>
          <View style={styles.track}>
            <View
              style={styles.fill(
                quest.target > 0
                  ? Math.min(quest.progress / quest.target, 1)
                  : 0,
                quest.done,
              )}
            />
          </View>
        </View>
      ))}
      <UIText size="sm" color={quests.completed ? "success" : "secondary"}>
        {t(quests.completed ? "rewards.questsDone" : "rewards.questsReward", {
          count: quests.reward,
        })}
      </UIText>
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.vs(14),
    padding: theme.s(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  title: { flex: 1 },
  quest: { gap: theme.vs(8) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  track: {
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
