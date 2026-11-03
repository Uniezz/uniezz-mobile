import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenHeader } from "@/components/ScreenHeader";
import { UIAvatar, UIChip, UIGlass, UIPage, UIText } from "@/ui";
import { StudentDirectory } from "@/components/meet";

const students = [
  {
    name: "Zofia, 21",
    study: "UMCS · Journalism · 3rd year",
    about: "Coffee, good books, and discovering Lublin.",
  },
  {
    name: "Marek, 22",
    study: "Politechnika · Computer Science",
    about: "Looking for a study buddy and new friends.",
  },
];
const portraits = [
  require("../../../assets/meet-zofia.jpg"),
  require("../../../assets/meet-student.jpg"),
];

export default function MeetScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("Friends");
  const [index, setIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const [directory, setDirectory] = useState(false);
  const student = students[index];
  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.title}>
            <ScreenHeader
              title={t("tabs.connections")}
              style={styles.screenHeader}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => router.push("/profile")}
          >
            <UIAvatar imageSrc={require("../../../assets/profile-cat.png")} />
          </Pressable>
        </View>
        {directory ? (
          <StudentDirectory onBack={() => setDirectory(false)} />
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDirectory(true)}
            >
              <UIText color="link">Browse all students ›</UIText>
            </Pressable>
            <View style={styles.modes}>
              {["Friends", "Study buddy", "Dating"].map((item) => (
                <UIChip
                  key={item}
                  label={item}
                  selected={mode === item}
                  onPress={() => setMode(item)}
                />
              ))}
            </View>
            {student ? (
              <UIGlass style={styles.card}>
                <Image
                  source={portraits[index]}
                  contentFit="cover"
                  style={styles.portrait}
                  accessibilityLabel={student.name}
                />
                <View style={styles.details}>
                  <UIText size="xl" weight="bold">
                    {student.name}
                  </UIText>
                  <UIText color="secondary">{student.study}</UIText>
                  <UIText color="soft">{student.about}</UIText>
                </View>
              </UIGlass>
            ) : (
              <UIGlass style={styles.empty}>
                <UIText size="lg" weight="bold">
                  You’re all caught up
                </UIText>
                <UIText color="secondary">
                  Come back later to meet more students.
                </UIText>
                <Pressable
                  onPress={() => {
                    setIndex(0);
                    setConnected(false);
                  }}
                >
                  <UIText color="link">Start again</UIText>
                </Pressable>
              </UIGlass>
            )}
            {student && (
              <View style={styles.actions}>
                <Pressable
                  style={styles.action}
                  accessibilityRole="button"
                  accessibilityLabel="Pass"
                  onPress={() => {
                    setIndex(index + 1);
                    setConnected(false);
                  }}
                >
                  <UIText size="lg">✕</UIText>
                </Pressable>
                <Pressable
                  style={[styles.action, styles.connect]}
                  accessibilityRole="button"
                  accessibilityLabel="Connect"
                  onPress={() => setConnected(true)}
                >
                  <UIText size="lg" color="black">
                    {connected ? "✓" : "♥"}
                  </UIText>
                </Pressable>
              </View>
            )}
            {connected && (
              <UIText color="success" style={styles.notice}>
                Added to your preview connections
              </UIText>
            )}
          </>
        )}
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(100),
    gap: theme.vs(18),
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1 },
  screenHeader: { paddingHorizontal: 0, paddingTop: 0 },
  modes: { flexDirection: "row", gap: theme.s(7) },
  card: { overflow: "hidden" },
  portrait: {
    height: theme.vs(310),
    backgroundColor: theme.colors.blue40,
    alignItems: "center",
    justifyContent: "center",
  },
  details: { padding: theme.s(20), gap: theme.vs(8) },
  actions: { flexDirection: "row", justifyContent: "center", gap: theme.s(24) },
  action: {
    width: theme.s(64),
    height: theme.s(64),
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.white20,
    alignItems: "center",
    justifyContent: "center",
  },
  connect: { backgroundColor: theme.colors.white },
  empty: { padding: theme.s(24), gap: theme.vs(12) },
  notice: { textAlign: "center" },
}));
