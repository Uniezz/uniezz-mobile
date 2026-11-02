import { useState } from "react";
import { Pressable } from "react-native";
import { UIGlass, UIInput, UIText } from "@/ui";
import { StyleSheet } from "react-native-unistyles";
import type { Material } from "@/@types/study";

export function AddMaterial({
  onSave,
}: {
  onSave: (material: Material) => void;
}) {
  const [subject, setSubject] = useState("");
  const [university, setUniversity] = useState("");
  return (
    <UIGlass style={styles.card}>
      <UIText size="md" weight="bold">
        Add material details
      </UIText>
      <UIText size="sm" color="secondary">
        This saves details only. File upload is not available yet.
      </UIText>
      <UIInput
        captionText="Subject"
        value={subject}
        onChangeText={setSubject}
        maxLength={120}
      />
      <UIInput
        captionText="University"
        value={university}
        onChangeText={setUniversity}
        maxLength={120}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!subject.trim() || !university.trim()}
        onPress={() =>
          onSave({
            subject: subject.trim(),
            university: university.trim(),
            type: "Exam",
            author: "You",
            rating: "—",
          })
        }
      >
        <UIText color="link" weight="semibold">
          Save details
        </UIText>
      </Pressable>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { padding: theme.s(16), gap: theme.vs(8) },
}));
