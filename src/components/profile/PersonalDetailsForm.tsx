import { useState } from "react";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";

export function PersonalDetailsForm({
  firstName,
  lastName,
  onSaved,
}: {
  firstName: string;
  lastName: string;
  onSaved: () => void;
}) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const { mutateAsync: update, isPending } = useUpdateMyProfile();
  return (
    <UIGlass style={styles.editor}>
      <UIInput
        captionText="First name"
        value={first}
        onChangeText={setFirst}
        maxLength={100}
      />
      <UIInput
        captionText="Last name"
        value={last}
        onChangeText={setLast}
        maxLength={100}
      />
      <UIButton
        disabled={isPending || !first.trim() || !last.trim()}
        onPress={async () => {
          try {
            await update({ firstName: first.trim(), lastName: last.trim() });
            onSaved();
          } catch {
            Toast.show({ type: "error", text1: "Couldn’t save profile" });
          }
        }}
      >
        <UIText color="black" weight="semibold">
          Save changes
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  editor: { padding: theme.s(16), gap: theme.vs(12) },
}));
