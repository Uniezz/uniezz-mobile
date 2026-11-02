import { StyleSheet } from "react-native-unistyles";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import type { ChatMessage } from "@/@types/chat";
import { UIText } from "@/ui";

export function ChatThread({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (messages: ChatMessage[]) => void;
}) {
  return (
    <GiftedChat<ChatMessage>
      messages={messages}
      onSend={onSend}
      user={{ _id: "me" }}
      colorScheme="dark"
      textInputProps={{
        placeholder: "Message",
        placeholderTextColor: styles.placeholder.color,
        style: styles.inputText,
      }}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            left: styles.bubbleLeft,
            right: styles.bubbleRight,
          }}
          textStyle={{ left: styles.bubbleText, right: styles.bubbleText }}
        />
      )}
      renderInputToolbar={(props) => (
        <InputToolbar {...props} containerStyle={styles.toolbar} />
      )}
      renderSend={(props) => (
        <Send
          {...props}
          containerStyle={styles.send}
          sendButtonProps={{ accessibilityLabel: "Send message" }}
        >
          <UIText color="link" weight="semibold">
            Send
          </UIText>
        </Send>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  bubbleLeft: { backgroundColor: theme.colors.surface },
  bubbleRight: { backgroundColor: theme.colors.blue },
  bubbleText: { color: theme.colors.white, fontFamily: theme.fonts.Geist },
  toolbar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.white20,
    borderTopWidth: 1,
    borderRadius: theme.vs(16),
  },
  inputText: { color: theme.colors.white, fontFamily: theme.fonts.Geist },
  placeholder: { color: theme.colors.white40 },
  send: { paddingRight: theme.s(12), paddingBottom: theme.vs(10) },
}));
