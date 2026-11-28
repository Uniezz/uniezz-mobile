import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiChatMember } from "@/@types";
import { Icon, UIAvatar, UIIconButton, UIText, UIUniversityLogo } from "@/ui";
import { chatStudentName } from "@/utils";

type GroupMemberProps = {
  member: ApiChatMember;
  /** shows a remove button, for the owner on everyone but themselves */
  canRemove: boolean;
  onRemove: (userId: string, name: string) => void;
  /** the first and last rows close the panel the rows draw together */
  isFirst: boolean;
  isLast: boolean;
};

// one member of a group: avatar, name, university and the owner mark, drawn as a slice of one
// inset panel like the people picker, so the virtualized rows read as one list
export const GroupMember = ({
  member,
  canRemove,
  onRemove,
  isFirst,
  isLast,
}: GroupMemberProps) => {
  const { t } = useTranslation();
  const { student } = member;
  const name = chatStudentName(student, t);
  // a deleted account has no id, and nothing to remove
  const userId = student.id;
  const handleRemovePress = () => userId && onRemove(userId, name);

  return (
    <View style={styles.panel(isFirst, isLast)}>
      <View style={styles.row(isLast)}>
        <UIAvatar imageSrc={student.avatarUrl} />
        <View style={styles.text}>
          <UIText weight="semibold" size="rg" numberOfLines={1}>
            {name}
          </UIText>
          {student.universityId ? (
            <View style={styles.university}>
              <UIUniversityLogo id={student.universityId} size="xxs" />
              <UIText
                size="sm"
                color="secondary"
                numberOfLines={1}
                style={styles.universityCode}
              >
                {student.universityId.toUpperCase()}
              </UIText>
            </View>
          ) : null}
        </View>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // the same panel slice as the people picker in chat/new
  panel: (isFirst: boolean, isLast: boolean) => ({
    paddingHorizontal: theme.s(6),
    paddingTop: isFirst ? theme.vs(6) : 0,
    paddingBottom: isLast ? theme.vs(6) : theme.vs(2),
    backgroundColor: theme.colors.white3,
    borderColor: theme.colors.white12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: isFirst ? 1 : 0,
    borderBottomWidth: isLast ? 1 : 0,
    borderTopLeftRadius: isFirst ? theme.vs(24) : 0,
    borderTopRightRadius: isFirst ? theme.vs(24) : 0,
    borderBottomLeftRadius: isLast ? theme.vs(24) : 0,
    borderBottomRightRadius: isLast ? theme.vs(24) : 0,
  }),
  // the RowPicker "inset" row: a divider under every row but the last
  row: (isLast: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingVertical: theme.vs(11),
    paddingHorizontal: theme.s(10),
    borderBottomWidth: 1,
    borderBottomColor: isLast ? "transparent" : theme.colors.white5,
  }),
  text: {
    flex: 1,
    gap: theme.vs(2),
  },
  university: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  // Geist's caps sit below the middle of its line box, so beside the logo the text looks low
  universityCode: {
    transform: [{ translateY: -theme.vs(1) }],
  },
}));
