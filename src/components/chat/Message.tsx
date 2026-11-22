import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiChatMessage } from "@/@types";
import { UIImage, UIPressable, UIText } from "@/ui";
import { chatDay, chatMessageText, isSameDay, previewImages } from "@/utils";

type MessageProps = {
  message: ApiChatMessage;
  /** the message above, so a new day gets its date line */
  previous?: ApiChatMessage;
  /** sent by the signed-in student: on the right, and a long press reaches `onOwnLongPress` */
  isMine: boolean;
  onOwnLongPress: (message: ApiChatMessage) => void;
};

// one message in a thread: a bubble with its photos and text, or a centred system line
export const Message = ({
  message,
  previous,
  isMine,
  onOwnLongPress,
}: MessageProps) => {
  const { t, i18n } = useTranslation();
  const createdAt = Date.parse(message.createdAt);
  const isNewDay =
    !previous || !isSameDay(Date.parse(previous.createdAt), createdAt);
  const urls = (message.attachments ?? []).map(({ url }) => url);
  const handleLongPress = () => onOwnLongPress(message);

  return (
    <View style={styles.item}>
      {isNewDay ? (
        <UIText size="xs" weight="medium" color="secondary" style={styles.day}>
          {chatDay(createdAt, i18n.resolvedLanguage ?? "en", t("feed.today"))}
        </UIText>
      ) : null}
      {message.kind === "system" ? (
        <UIText size="xs" color="secondary" style={styles.system}>
          {chatMessageText(message, t)}
        </UIText>
      ) : (
        <UIPressable
          accessibilityRole="text"
          disabled={!isMine || Boolean(message.deletedAt)}
          onLongPress={handleLongPress}
          style={styles.bubble(isMine)}
        >
          {urls.map((url, index) => (
            <UIPressable
              key={url}
              accessibilityRole="imagebutton"
              accessibilityLabel={t("app.openImage")}
              onPress={() => previewImages(urls, index)}
              style={styles.photo}
            >
              <UIImage
                source={{ uri: url }}
                fallback={undefined}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
            </UIPressable>
          ))}
          {message.deletedAt || message.body ? (
            <UIText color={message.deletedAt ? "secondary" : "white"}>
              {chatMessageText(message, t)}
            </UIText>
          ) : null}
        </UIPressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    paddingBottom: theme.vs(6),
  },
  day: {
    alignSelf: "center",
    paddingBottom: theme.vs(8),
  },
  system: {
    alignSelf: "center",
    textAlign: "center",
    paddingHorizontal: theme.s(24),
  },
  bubble: (mine: boolean) => ({
    alignSelf: mine ? "flex-end" : "flex-start",
    maxWidth: theme.s(260),
    gap: theme.vs(6),
    paddingVertical: theme.vs(10),
    paddingHorizontal: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: mine ? 0 : 1,
    borderColor: theme.colors.white10,
    backgroundColor: mine ? theme.colors.blue : theme.colors.surface60,
  }),
  photo: {
    width: theme.s(220),
    height: theme.s(220),
    borderRadius: theme.vs(10),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
  },
}));
