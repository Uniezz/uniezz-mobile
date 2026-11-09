import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { PublicProgramme } from "@/@types/profile";
import { UIText } from "@/ui";

type ProgrammeCardProps = {
  programme: Pick<
    PublicProgramme,
    "programme" | "faculty" | "isPrimary" | "yearOfStudy" | "modeOfStudies"
  >;
};

export const ProgrammeCard = ({ programme }: ProgrammeCardProps) => {
  const { t } = useTranslation();
  const mode =
    programme.modeOfStudies === "full_time"
      ? t("app.modeOfStudiesFullTime")
      : programme.modeOfStudies === "part_time"
        ? t("app.modeOfStudiesPartTime")
        : null;
  return (
    <View style={styles.card}>
      {programme.isPrimary ? (
        <UIText size="xs" weight="medium" color="secondary">
          {t("app.primary")}
        </UIText>
      ) : null}
      <UIText size="xl" weight="semibold" style={styles.name}>
        {programme.programme}
      </UIText>
      {programme.faculty ? (
        <UIText size="sm" weight="medium" color="secondary">
          {programme.faculty}
        </UIText>
      ) : null}
      {programme.yearOfStudy || mode ? (
        <View style={styles.details}>
          {programme.yearOfStudy ? (
            <UIText size="sm" weight="semibold">
              {t("app.studyYear", { year: programme.yearOfStudy })}
            </UIText>
          ) : null}
          {programme.yearOfStudy && mode ? (
            <UIText size="sm" color="secondary">
              ·
            </UIText>
          ) : null}
          {mode ? (
            <UIText size="sm" weight="medium" color="secondary">
              {mode}
            </UIText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.s(20),
    gap: theme.vs(14),
    borderRadius: theme.vs(20),
    borderWidth: 1,
    borderColor: theme.colors.white14,
    backgroundColor: theme.colors.white3,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.white5}, ${theme.colors.white0} 65%)`,
  },
  name: {
    fontSize: theme.vs(24),
    letterSpacing: -0.5,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: theme.vs(14),
    borderTopWidth: 1,
    borderTopColor: theme.colors.white8,
  },
}));
