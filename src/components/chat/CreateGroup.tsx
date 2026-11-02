import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIAvatar, UIInput, UIText } from "@/ui";

const suggestions = ["Kateryna Melnyk", "Taras Hnatiuk", "Anna Nowak"];

export function CreateGroup({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (name: string, members: string[]) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  return (
    <>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <UIText color="link">‹ Back to chat</UIText>
      </Pressable>
      <UIText size="lg" weight="bold">
        New group
      </UIText>
      <UIInput
        captionText="Group name"
        value={groupName}
        onChangeText={setGroupName}
        maxLength={80}
      />
      <UIText color="secondary">Add people</UIText>
      {suggestions.map((name) => (
        <Pressable
          key={name}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: members.includes(name) }}
          style={styles.row}
          onPress={() =>
            setMembers((current) =>
              current.includes(name)
                ? current.filter((item) => item !== name)
                : [...current, name],
            )
          }
        >
          <UIAvatar placeholderText={name[0]} />
          <UIText style={styles.name}>{name}</UIText>
          <UIText color="link">{members.includes(name) ? "✓" : "+"}</UIText>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        disabled={!groupName.trim() || members.length === 0}
        onPress={() => onCreate(groupName.trim(), members)}
      >
        <UIText color="link" weight="bold">
          Create group
        </UIText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.vs(72),
    gap: theme.s(12),
    paddingHorizontal: theme.s(8),
  },
  name: { flex: 1 },
}));
