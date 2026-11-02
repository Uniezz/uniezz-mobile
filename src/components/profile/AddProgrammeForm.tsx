import { useState } from "react";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useAddMyProgramme } from "@/hooks/useMyProfile";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";

export function AddProgrammeForm({
  isPrimary,
  onSaved,
}: {
  isPrimary: boolean;
  onSaved: () => void;
}) {
  const [programme, setProgramme] = useState("");
  const [faculty, setFaculty] = useState("");
  const { mutateAsync: addProgramme, isPending } = useAddMyProgramme();
  return (
    <UIGlass style={styles.editor}>
      <UIInput
        captionText="Programme"
        value={programme}
        onChangeText={setProgramme}
        maxLength={120}
      />
      <UIInput
        captionText="Faculty"
        value={faculty}
        onChangeText={setFaculty}
        maxLength={120}
      />
      <UIButton
        disabled={isPending || !programme.trim() || !faculty.trim()}
        onPress={async () => {
          try {
            await addProgramme({
              programme: programme.trim(),
              faculty: faculty.trim(),
              status: "active",
              isPrimary,
            });
            onSaved();
          } catch {
            Toast.show({ type: "error", text1: "Couldn’t add programme" });
          }
        }}
      >
        <UIText color="black" weight="semibold">
          Add programme
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  editor: { padding: theme.s(16), gap: theme.vs(12) },
}));
