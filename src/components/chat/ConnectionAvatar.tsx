import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import type { Connection } from "@/@types";
import { UIAvatar, UIPressable, UIText } from "@/ui";

type ConnectionAvatarProps = {
  connection: Connection;
  /** a tap, e.g. to open the direct conversation */
  onOpen: (connection: Connection) => void;
  /** a long press, e.g. to remove the connection */
  onRemove: (connection: Connection) => void;
};

// one match in the chat tab's row: avatar, first name and how you connected
export const ConnectionAvatar = ({
  connection,
  onOpen,
  onRemove,
}: ConnectionAvatarProps) => {
  const { t } = useTranslation();
  const { profile, mode } = connection;
  const name = profile.firstName ?? t("apiState.student");
  const handlePress = () => onOpen(connection);
  const handleLongPress = () => onRemove(connection);

  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityHint={t("connections.removeHint")}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.match}
    >
      <UIAvatar size="lg" imageSrc={profile.avatarUrl} />
      <UIText size="xs" numberOfLines={1}>
        {name}
      </UIText>
      <UIText size="xs" color="secondary" numberOfLines={1}>
        {t(`app.${mode}`)}
      </UIText>
    </UIPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  match: {
    width: theme.s(64),
    // FlashList ignores gap, so each match keeps its own spacing
    marginRight: theme.s(14),
    alignItems: "center",
    gap: theme.vs(2),
  },
}));
