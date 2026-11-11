import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { CourseComment } from "@/@types/study";
import { Icon, UIIconButton, UIText } from "@/ui";
import { chatTime } from "@/utils";

type CourseCommentItemProps = {
  comment: CourseComment;
  onDeletePress: (comment: CourseComment) => void;
};

// course comments are anonymous: no author, likes or replies
export function CourseCommentItem({
  comment,
  onDeletePress,
}: CourseCommentItemProps) {
  const { t, i18n } = useTranslation();
  const handleDeletePress = () => onDeletePress(comment);

  return (
    <View style={styles.item}>
      <View style={styles.text}>
        <UIText>{comment.content}</UIText>
        <UIText size="xs" color="secondary">
          {chatTime(
            Date.parse(comment.createdAt),
            i18n.resolvedLanguage ?? "en",
          )}
        </UIText>
      </View>
      {comment.isMine ? (
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("app.remove")}
          onPress={handleDeletePress}
        >
          <Icon name="trash" size={16} />
        </UIIconButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.s(8),
    paddingVertical: theme.vs(10),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white10,
  },
  text: { flex: 1, gap: theme.vs(4) },
}));
