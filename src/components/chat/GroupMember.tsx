import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import type { ApiChatMember } from "@/@types";
import { Icon, UIAvatar, UIGlass, UIIconButton, UIText } from "@/ui";
import { chatStudentName } from "@/utils";

type GroupMemberProps = {
  member: ApiChatMember;
  /** shows a remove button, for the owner on everyone but themselves */
  canRemove: boolean;
  onRemove: (userId: string, name: string) => void;
};

// one member of a group: avatar, name and the owner mark
export const GroupMember = ({
  member,
  canRemove,
  onRemove,
}: GroupMemberProps) => {
  const { t } = useTranslation();
  const { student } = member;
  const name = chatStudentName(student, t);
  // a deleted account has no id, and nothing to remove
  const userId = student.id;
  const handleRemovePress = () => userId && onRemove(userId, name);

  return (
    <UIGlass radius={12} style={styles.row}>
      <UIAvatar imageSrc={student.avatarUrl} />
      <UIText weight="semibold" numberOfLines={1} style={styles.name}>
        {name}
      </UIText>
      {member.role === "owner" ? (
        <UIText size="xs" weight="semibold" color="secondary">
          {t("chat.owner")}
        </UIText>
      ) : null}
      {canRemove && userId ? (
        <UIIconButton
          size="sm"
          accessibilityRole="button"
          accessibilityLabel={t("chat.removeMemberTitle", { name })}
          onPress={handleRemovePress}
        >
          <Icon name="x" size={14} />
        </UIIconButton>
      ) : null}
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
    marginBottom: theme.vs(8),
  },
  name: { flex: 1 },
}));
