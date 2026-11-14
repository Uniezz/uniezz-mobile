import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useFeedSave } from "@/hooks/useFeed";
import { Icon } from "@/ui";

type SaveButtonProps = {
  id: string;
  saved: boolean;
};

export const SaveButton = ({ id, saved }: SaveButtonProps) => {
  const { t } = useTranslation();
  const { mutateAsync: setSave, isPending } = useFeedSave();

  const handlePress = async () => {
    try {
      await setSave({ id, saved: !saved });
    } catch {
      toast.error(t("apiState.error"));
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(saved ? "apiState.unsave" : "apiState.save")}
      accessibilityState={{ selected: saved }}
      disabled={isPending}
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <Icon
        name={saved ? "bookmark-filled" : "bookmark"}
        size={14}
        uniProps={(theme) => ({
          color: saved ? theme.colors.sky : theme.colors.white60,
        })}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
  },
}));
