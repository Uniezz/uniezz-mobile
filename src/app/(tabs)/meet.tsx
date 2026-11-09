import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Icon, UIAvatar, UIEmpty, UIGlass, UIPage, UIText } from "@/ui";

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
  const student = students[index];
  const { data: profile } = useMyProfile();
  const handleStudentsPress = () => router.push("/students");
  const next = () => {
    setIndex(index + 1);
    setConnected(false);
  };

  return (
    <UIPage>
      <View style={styles.page}>
        <View style={styles.header}>
          <UIText size="xl" weight="bold" style={styles.title}>
            {t("tabs.connections")}
          </UIText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.searchStudents")}
            onPress={handleStudentsPress}
          >
            <UIGlass radius={16} style={styles.students}>
              <Icon name="search" size={18} />
              <UIText size="sm" weight="semibold">
                {t("app.students")}
              </UIText>
            </UIGlass>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.profile")}
            onPress={() => router.push("/profile")}
          >
            <UIAvatar imageSrc={profile?.avatarUrl} />
          </Pressable>
        </View>
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
            <View style={styles.empty}>
              <UIEmpty>
                <UIText size="title1" weight="bold" style={styles.emptyText}>
                  {t("connections.emptyTitle")}
                </UIText>
                <UIText color="soft" style={styles.emptyText}>
                  {t("connections.emptyDescription")}
                </UIText>
              </UIEmpty>
            </View>
          )}
          {student ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.pass")}
                onPress={next}
                style={styles.action}
              >
                <UIGlass radius={32} style={styles.actionCircle}>
                  <Icon
                    name="x"
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.red })}
                  />
                </UIGlass>
                <UIText size="sm" color="soft">
                  {t("app.pass")}
                </UIText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.connect")}
                onPress={() => setConnected(true)}
                style={styles.action}
              >
                <View style={[styles.actionCircle, styles.connect]}>
                  <Icon
                    name={connected ? "check" : "heart"}
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.ink })}
                  />
                </View>
                <UIText size="sm" color="soft">
                  {t("app.connect")}
                </UIText>
              </Pressable>
            </View>
          ) : null}
          {connected ? (
            <UIText color="success" style={styles.notice}>
              {t("app.connected")}
            </UIText>
          ) : null}
        </>
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    paddingTop: theme.vs(4),
    paddingHorizontal: theme.s(16),
    // the tab bar floats ~40pt above this page's bottom (UIPage pads the home indicator); +12 keeps the actions just above it, as in the design
    paddingBottom: theme.vs(52),
    gap: theme.vs(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  students: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
    paddingHorizontal: theme.s(12),
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
    // a border on every chip (white when selected, like UIChip) so selecting one doesn't change its size
    borderWidth: 1,
    borderColor: selected ? theme.colors.white : theme.colors.white10,
  }),
  card: {
    // fills the space between the modes and the actions, so the screen fits without scrolling
    flex: 1,
    borderRadius: theme.vs(16),
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
    backgroundColor: theme.colors.ink70,
  },
  answerText: {
    lineHeight: theme.vs(15 * 1.35),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(28),
  },
  action: {
    alignItems: "center",
    gap: theme.vs(8),
  },
  actionCircle: {
    width: theme.vs(64),
    height: theme.vs(64),
    borderRadius: theme.vs(32),
    alignItems: "center",
    justifyContent: "center",
  },
  connect: {
    backgroundColor: theme.colors.white,
  },
  // centres the cat in the card's space, like the web empty state
  empty: {
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  notice: {
    textAlign: "center",
  },
}));
