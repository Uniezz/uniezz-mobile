import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { Material } from "@/@types/study";
import { AddMaterial, MaterialList } from "@/components/study";
import { Icon, UIAvatar, UIGlass, UIIconButton, UIPage, UIText } from "@/ui";

const Glow = withUnistyles(Stop, (theme) => ({ stopColor: theme.colors.blue }));

// shortcut: preview materials and exam until the backend has an exams endpoint
const initialMaterials: Material[] = [
  {
    subject: "Mathematical Analysis II",
    university: "Politechnika",
    type: "Exam",
    author: "Marek Zieliński",
    rating: "4.8",
  },
  {
    subject: "Data Structures & Algorithms",
    university: "Politechnika",
    type: "Exam",
    author: "Taras Hnatiuk",
    rating: "4.5",
  },
  {
    subject: "Thermodynamics, 2024 and 2025",
    university: "Politechnika",
    type: "Exam",
    author: "Piotr Lewandowski",
    rating: "4.9",
  },
  {
    subject: "Constitutional Law, final",
    university: "UMCS",
    type: "Exam",
    author: "Kateryna Melnyk",
    rating: "4.6",
  },
];
const nextExam = { days: 12, name: "Thermodynamics", meta: "7 Oct, 9:00" };

export default function StudyScreen() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState(initialMaterials);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const header = (
    <>
      <View style={styles.header}>
        <UIText size="xl" weight="bold" style={styles.title}>
          {t("tabs.exams")}
        </UIText>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("app.searchMaterials")}
          onPress={() => setIsSearching(!isSearching)}
        >
          <Icon name="search" size={18} />
        </UIIconButton>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("exams.action")}
          onPress={() => setAdding(!adding)}
        >
          <Icon name={adding ? "x" : "upload"} size={18} />
        </UIIconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.profile")}
          onPress={() => router.push("/profile")}
        >
          <UIAvatar />
        </Pressable>
      </View>
      {adding ? (
        <AddMaterial
          onSave={(material) => {
            setMaterials((current) => [material, ...current]);
            setAdding(false);
          }}
        />
      ) : null}
      <UIGlass radius={24} style={styles.exam}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
              <Glow offset="0" stopOpacity={0.4} />
              <Glow offset="0.7" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#glow)" />
        </Svg>
        <View style={styles.count}>
          <UIText size="display" weight="bold" style={styles.days}>
            {nextExam.days}
          </UIText>
          <UIText size="xs" color="secondary">
            {t("exams.days", { count: nextExam.days })}
          </UIText>
        </View>
        <View style={styles.separator} />
        <View style={styles.info}>
          <UIText size="xs" weight="semibold" color="link">
            {t("exams.nextExam")}
          </UIText>
          <UIText size="title3" weight="semibold">
            {nextExam.name}
          </UIText>
          <UIText size="sm" color="soft">
            {nextExam.meta}
          </UIText>
        </View>
        <Icon
          name="chevron-right"
          size={18}
          uniProps={(theme) => ({ color: theme.colors.white60 })}
        />
      </UIGlass>
    </>
  );
  return (
    <UIPage>
      {selected ? (
        <ScrollView contentContainerStyle={styles.page}>
          {header}
          <UIGlass radius={24} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelected(null)}
            >
              <UIText color="link">{t("app.back")}</UIText>
            </Pressable>
            <UIText size="title3" weight="semibold">
              {selected}
            </UIText>
          </UIGlass>
        </ScrollView>
      ) : (
        <MaterialList
          header={header}
          materials={materials}
          isSearching={isSearching}
          onOpen={setSelected}
        />
      )}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingTop: theme.vs(4),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
    gap: theme.vs(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
    paddingTop: theme.vs(4),
  },
  title: {
    flex: 1,
    lineHeight: theme.vs(30),
  },
  exam: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(14),
    padding: theme.s(16),
  },
  count: {
    width: theme.s(64),
    alignItems: "center",
  },
  days: {
    letterSpacing: -2,
    lineHeight: theme.vs(40),
  },
  separator: {
    width: 1,
    height: theme.vs(48),
    backgroundColor: theme.colors.white10,
  },
  info: {
    flex: 1,
    gap: theme.vs(3),
  },
  card: {
    padding: theme.s(16),
    gap: theme.vs(8),
  },
}));
