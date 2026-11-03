import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { StudentDirectory } from "@/components/meet";
import { Icon, UIAvatar, UIGlass, UIIconButton, UIPage, UIText } from "@/ui";

const Shade = withUnistyles(Stop, (theme) => ({ stopColor: theme.colors.ink }));

const MODES = [
  ["friends", "app.friends", "face-slightly-smiling"],
  ["study", "app.studyBuddy", "book-open"],
  ["dating", "app.dating", "heart"],
] as const;

// shortcut: preview profiles until the backend has a matching endpoint
const students = [
  {
    name: "Zofia, 21",
    study: "UMCS, Journalism, 3rd year",
    about: "Someone to try Lublin's cafés with and practise Polish.",
    portrait: require("../../../assets/meet-zofia.jpg"),
  },
  {
    name: "Marek, 22",
    study: "Politechnika, Computer Science",
    about: "A study buddy for algorithms and new friends.",
    portrait: require("../../../assets/meet-student.jpg"),
  },
];

export default function MeetScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("friends");
  const [index, setIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const [directory, setDirectory] = useState(false);
  const student = students[index];
  const next = () => {
    setIndex(index + 1);
    setConnected(false);
  };

  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <UIText size="xl" weight="bold" style={styles.title}>
            {t("tabs.connections")}
          </UIText>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.searchStudents")}
            onPress={() => setDirectory(!directory)}
          >
            <Icon name="sliders-horizontal" size={18} />
          </UIIconButton>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.profile")}
            onPress={() => router.push("/profile")}
          >
            <UIAvatar />
          </Pressable>
        </View>
        {directory ? (
          <StudentDirectory onBack={() => setDirectory(false)} />
        ) : (
          <>
            <View style={styles.modes}>
              {MODES.map(([value, label, icon]) => {
                const selected = mode === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMode(value)}
                    style={styles.mode(selected)}
                  >
                    <Icon
                      name={icon}
                      size={14}
                      uniProps={(theme) => ({
                        color: selected ? theme.colors.ink : theme.colors.white,
                      })}
                    />
                    <UIText
                      size="sm"
                      weight="semibold"
                      color={selected ? "black" : "white"}
                    >
                      {t(label)}
                    </UIText>
                  </Pressable>
                );
              })}
            </View>
            {student ? (
              <View style={styles.card}>
                <Image
                  source={student.portrait}
                  contentFit="cover"
                  style={StyleSheet.absoluteFill}
                  accessibilityLabel={student.name}
                />
                <Svg style={styles.shade}>
                  <Defs>
                    <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                      <Shade offset="0" stopOpacity={0} />
                      <Shade offset="1" stopOpacity={0.9} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#shade)" />
                </Svg>
                <View style={styles.details}>
                  <UIText size="xl" weight="bold">
                    {student.name}
                  </UIText>
                  <UIText size="body" weight="medium" color="soft">
                    {student.study}
                  </UIText>
                  <View style={styles.answer}>
                    <UIText size="xs" weight="semibold" color="link">
                      {t("connections.lookingFor")}
                    </UIText>
                    <UIText weight="medium" style={styles.answerText}>
                      {student.about}
                    </UIText>
                  </View>
                </View>
              </View>
            ) : (
              <UIGlass radius={24} style={styles.empty}>
                <UIText size="lg" weight="semibold">
                  {t("connections.emptyTitle")}
                </UIText>
                <UIText color="secondary">
                  {t("connections.emptyDescription")}
                </UIText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setIndex(0);
                    setConnected(false);
                  }}
                >
                  <UIText color="link" weight="semibold">
                    {t("connections.resetFilters")}
                  </UIText>
                </Pressable>
              </UIGlass>
            )}
            {student ? (
              <View style={styles.actions}>
                <UIIconButton
                  size="xl"
                  accessibilityRole="button"
                  accessibilityLabel={t("app.pass")}
                  onPress={next}
                >
                  <Icon name="x" size={24} />
                </UIIconButton>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("app.connect")}
                  onPress={() => setConnected(true)}
                  style={styles.connect}
                >
                  <Icon
                    name={connected ? "check" : "heart"}
                    size={28}
                    uniProps={(theme) => ({ color: theme.colors.ink })}
                  />
                </Pressable>
                <UIIconButton
                  size="xl"
                  accessibilityRole="button"
                  accessibilityLabel={t("app.message")}
                  onPress={() => router.push("/(tabs)/chat")}
                >
                  <Icon name="message-circle" size={24} />
                </UIIconButton>
              </View>
            ) : null}
            {connected ? (
              <UIText color="success" style={styles.notice}>
                {t("app.connected")}
              </UIText>
            ) : null}
          </>
        )}
      </ScrollView>
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
  },
  title: {
    flex: 1,
    lineHeight: theme.vs(30),
  },
  modes: {
    flexDirection: "row",
    gap: theme.s(6),
  },
  mode: (selected: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(7),
    paddingHorizontal: theme.s(13),
    borderRadius: theme.vs(999),
    backgroundColor: selected ? theme.colors.white : theme.colors.white5,
    borderWidth: selected ? 0 : 1,
    borderColor: theme.colors.white10,
  }),
  card: {
    height: theme.vs(470),
    borderRadius: theme.vs(24),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: theme.s(14),
    backgroundColor: theme.colors.surface60,
  },
  shade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: theme.vs(280),
  },
  details: {
    gap: theme.vs(10),
  },
  answer: {
    gap: theme.vs(4),
    paddingVertical: theme.vs(12),
    paddingHorizontal: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.ink40,
  },
  answerText: {
    lineHeight: theme.vs(15 * 1.35),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(20),
  },
  connect: {
    width: theme.vs(68),
    height: theme.vs(68),
    borderRadius: theme.vs(34),
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: theme.s(24),
    gap: theme.vs(12),
  },
  notice: {
    textAlign: "center",
  },
}));
