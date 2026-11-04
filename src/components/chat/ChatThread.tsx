import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  Bubble,
  Day,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { StyleSheet } from "react-native-unistyles";
import type { ChatMessage } from "@/@types/chat";
import { Icon } from "@/ui";

export function ChatThread({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (messages: ChatMessage[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <GiftedChat<ChatMessage>
      messages={messages}
      onSend={onSend}
      user={{ _id: "me" }}
      colorScheme="dark"
      renderAvatar={null}
      textInputProps={{
        placeholder: t("app.message"),
        placeholderTextColor: styles.placeholder.color,
        style: styles.input,
      }}
      renderDay={(props) => (
        <Day {...props} textProps={{ style: styles.dayText }} />
      )}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{ left: styles.bubbleLeft, right: styles.bubbleRight }}
          textStyle={{ left: styles.bubbleText, right: styles.bubbleText }}
        />
      )}
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={styles.toolbar}
          primaryStyle={styles.toolbarRow}
        />
      )}
      renderSend={(props) => (
        <Send
          {...props}
          isSendButtonAlwaysVisible
          containerStyle={styles.sendContainer}
          sendButtonProps={{ accessibilityLabel: t("app.send") }}
        >
          <View style={styles.send}>
            <Icon
              name="arrow-up"
              size={18}
              uniProps={(theme) => ({ color: theme.colors.ink })}
            />
          </View>
        </Send>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  dayText: {
    color: theme.colors.white60,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(12),
    fontWeight: "500",
  },
  bubbleLeft: {
    backgroundColor: theme.colors.surface60,
    borderWidth: 1,
    borderColor: theme.colors.white10,
    borderRadius: theme.vs(20),
    paddingVertical: theme.vs(4),
    paddingHorizontal: theme.s(4),
    maxWidth: theme.s(260),
  },
  bubbleRight: {
    backgroundColor: theme.colors.blue,
    borderRadius: theme.vs(20),
    paddingVertical: theme.vs(4),
    paddingHorizontal: theme.s(4),
    maxWidth: theme.s(260),
  },
  bubbleText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
    lineHeight: theme.vs(15 * 1.4),
  },
  toolbar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
  },
  toolbarRow: {
    alignItems: "center",
    gap: theme.s(8),
  },
  input: {
    flex: 1,
    minHeight: theme.vs(44),
    borderRadius: theme.vs(22),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(12),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
  placeholder: { color: theme.colors.white60 },
  sendContainer: {
    justifyContent: "center",
  },
  send: {
    width: theme.vs(44),
    height: theme.vs(44),
    borderRadius: theme.vs(22),
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
}));
