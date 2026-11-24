import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { AnonymousComment } from "@/@types";
import { Icon, UIPressable, UIText } from "@/ui";
import { chatTime } from "@/utils";

type CourseCommentItemProps<T extends AnonymousComment> = {
  comment: T;
  onDeletePress: (comment: T) => void;
  /** someone else's comment can be reported */
  onReportPress: (comment: T) => void;
};

// course comments and professor reviews are anonymous: no author, likes or replies
export function CourseCommentItem<T extends AnonymousComment>({
  comment,
  onDeletePress,
  onReportPress,
}: CourseCommentItemProps<T>) {
  const { t, i18n } = useTranslation();
  const handleDeletePress = () => onDeletePress(comment);
  const handleReportPress = () => onReportPress(comment);

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
      {/* a bare icon, not a glass button: it sits quietly beside the text, here and in a sheet */}
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel={
          comment.isMine ? t("app.remove") : t("report.course_comment")
        }
        onPress={comment.isMine ? handleDeletePress : handleReportPress}
        hitSlop={10}
        style={styles.action}
      >
        <Icon
          name={comment.isMine ? "trash" : "flag"}
          size={16}
          uniProps={(theme) => ({ color: theme.colors.white40 })}
        />
      </UIPressable>
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
  // level with the text's first line
  action: { paddingTop: theme.vs(3) },
}));
