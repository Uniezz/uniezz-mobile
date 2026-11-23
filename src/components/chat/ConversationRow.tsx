import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiConversation } from "@/@types";
import { UIAvatar, UIPressable, UIText } from "@/ui";
import { chatMessageText, chatTime, conversationTitle } from "@/utils";

type ConversationRowProps = {
  conversation: ApiConversation;
  onOpen: (id: string) => void;
};

// one conversation in the chat list: who, when, the last message and the unread count
export const ConversationRow = ({
  conversation,
  onOpen,
}: ConversationRowProps) => {
  const { t, i18n } = useTranslation();
  const { lastMessage, unreadCount } = conversation;
  const title = conversationTitle(conversation, t);
  const handlePress = () => onOpen(conversation.id);

  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={handlePress}
    >
      <View style={styles.row}>
        <UIAvatar size="lg" imageSrc={conversation.peer?.avatarUrl} />
        <View style={styles.text}>
          <View style={styles.line}>
            <UIText
              size="rg"
              weight="semibold"
              numberOfLines={1}
              style={styles.name}
            >
              {title}
            </UIText>
            <UIText size="sm" color="secondary">
              {chatTime(
                Date.parse(lastMessage?.createdAt ?? conversation.createdAt),
                i18n.resolvedLanguage ?? "en",
              )}
            </UIText>
          </View>
          <View style={styles.line}>
            <UIText
              size="body"
              color={unreadCount > 0 ? "white" : "secondary"}
              numberOfLines={1}
              style={styles.preview}
            >
              {lastMessage ? chatMessageText(lastMessage, t) : ""}
            </UIText>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <UIText size="xs" weight="semibold">
                  {unreadCount}
                </UIText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </UIPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    // lines up with the filters; the page already pads the sides
    paddingVertical: theme.vs(10),
  },
  text: {
    flex: 1,
    gap: theme.vs(3),
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  name: {
    flex: 1,
  },
  // badge sits right after the preview, not pinned to the edge
  preview: {
    flexShrink: 1,
  },
  badge: {
    paddingVertical: theme.vs(1),
    paddingHorizontal: theme.s(7),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.blue,
  },
}));
