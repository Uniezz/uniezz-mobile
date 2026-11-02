import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIAvatar, UIGlass, UIInput, UIText } from "@/ui";

const students = [
  {
    name: "Anna Nowak",
    meta: "KUL · Economics",
    about: "Coffee and city walks",
  },
  {
    name: "Piotr Lewandowski",
    meta: "Przyrodniczy · Biology",
    about: "Weekend hikes and photography",
  },
  {
    name: "Julia Wójcik",
    meta: "WSEI · Computer Science",
    about: "Design and coding",
  },
];

export function StudentDirectory({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const profile = students.find((student) => student.name === selected);
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => (selected ? setSelected(null) : onBack())}
      >
        <UIText color="link">‹ {selected ? "All students" : "Meet"}</UIText>
      </Pressable>
      <UIText size="lg" weight="bold">
        {profile ? profile.name : "All students"}
      </UIText>
      {profile ? (
        <UIGlass style={styles.card}>
          <UIAvatar size="xl" placeholderText={profile.name[0]} />
          <UIText color="secondary">{profile.meta}</UIText>
          <UIText>{profile.about}</UIText>
        </UIGlass>
      ) : (
        <>
          <UIInput
            placeholder="Search students"
            value={search}
            onChangeText={setSearch}
          />
          {students
            .filter((student) =>
              student.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((student) => (
              <Pressable
                key={student.name}
                accessibilityRole="button"
                onPress={() => setSelected(student.name)}
              >
                <UIGlass style={styles.row}>
                  <UIAvatar placeholderText={student.name[0]} />
                  <View style={styles.label}>
                    <UIText weight="semibold">{student.name}</UIText>
                    <UIText size="sm" color="secondary">
                      {student.meta}
                    </UIText>
                  </View>
                  <UIText color="secondary">›</UIText>
                </UIGlass>
              </Pressable>
            ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.vs(14) },
  card: { padding: theme.s(18), gap: theme.vs(12) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  label: { flex: 1, gap: theme.vs(4) },
}));
