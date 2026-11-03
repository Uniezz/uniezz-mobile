import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { PublicProgramme } from "@/@types/profile";
import { UIGlass, UIText } from "@/ui";

type ProgrammeCardProps = {
  programme: Pick<
    PublicProgramme,
    "programme" | "faculty" | "isPrimary" | "yearOfStudy" | "modeOfStudies"
  >;
  children?: ReactNode;
};

export const ProgrammeCard = ({ programme, children }: ProgrammeCardProps) => {
  const { t } = useTranslation();
  const mode =
    programme.modeOfStudies === "full_time"
      ? t("app.modeOfStudiesFullTime")
      : programme.modeOfStudies === "part_time"
        ? t("app.modeOfStudiesPartTime")
        : null;
  return (
    <UIGlass radius={24} style={styles.card}>
      {programme.isPrimary ? (
        <UIText size="xs" weight="semibold" color="brand">
          {t("app.primary")}
        </UIText>
      ) : null}
      <UIText size="md" weight="semibold">
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
      {children}
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.s(16),
    gap: theme.vs(10),
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(7),
  },
}));
