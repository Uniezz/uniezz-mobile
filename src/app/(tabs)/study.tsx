import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AddMaterial, MaterialList } from "@/components/study";
import type { Material } from "@/@types/study";
import { UIAvatar, UIGlass, UIPage, UIText } from "@/ui";

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

export default function StudyScreen() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState(initialMaterials);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const header = (
    <>
      <View style={styles.header}>
        <View style={styles.title}>
          <ScreenHeader title={t("exams.title")} style={styles.screenHeader} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push("/profile")}
        >
          <UIAvatar imageSrc={require("../../../assets/profile-cat.png")} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => setAdding(!adding)}>
        <UIText color="link">{adding ? "Cancel" : "+ Add material"}</UIText>
      </Pressable>
      {adding && (
        <AddMaterial
          onSave={(material) => {
            setMaterials((current) => [material, ...current]);
            setAdding(false);
          }}
        />
      )}
      <UIGlass style={styles.exam}>
        <UIText size="sm" color="secondary">
          YOUR NEXT EXAM
        </UIText>
        <View style={styles.examRow}>
          <UIText size="xxl" weight="bold">
            12
          </UIText>
          <UIText color="secondary">days</UIText>
        </View>
        <UIText size="lg" weight="semibold">
          Thermodynamics
        </UIText>
        <UIText color="secondary">7 Oct, 9:00 · 4 past papers</UIText>
      </UIGlass>
    </>
  );
  return (
    <UIPage backdrop="city">
      {selected ? (
        <ScrollView contentContainerStyle={styles.page}>
          {header}
          <UIGlass style={styles.card}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelected(null)}
            >
              <UIText color="link">‹ Back to materials</UIText>
            </Pressable>
            <UIText size="lg" weight="bold">
              {selected}
            </UIText>
            <UIText color="secondary">
              Material details and student ratings
            </UIText>
          </UIGlass>
        </ScrollView>
      ) : (
        <MaterialList
          header={header}
          materials={materials}
          onOpen={setSelected}
        />
      )}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(100),
    gap: theme.vs(16),
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1 },
  screenHeader: { paddingHorizontal: 0, paddingTop: 0 },
  exam: { padding: theme.s(20), gap: theme.vs(8) },
  examRow: { flexDirection: "row", alignItems: "baseline", gap: theme.s(8) },
  card: { padding: theme.s(16), gap: theme.vs(8) },
}));
