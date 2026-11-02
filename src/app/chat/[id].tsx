import { router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ChatThread } from "@/components/chat";
import { useChatStore } from "@/store/chat";
import { UIPage, UIText } from "@/ui";
import type { ChatMessage } from "@/@types/chat";

const emptyMessages: ChatMessage[] = [];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useChatStore((state) =>
    state.conversations.find((item) => item.id === id),
  );
  const messages = useChatStore((state) => state.messages[id] ?? emptyMessages);
  const sendMessages = useChatStore((state) => state.sendMessages);

  return (
    <UIPage backdrop="city">
      <View style={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)/chat")
          }
        >
          <UIText size="md">‹ {conversation?.name ?? "Chat"}</UIText>
        </Pressable>
        {conversation ? (
          <ChatThread
            messages={messages}
            onSend={(sent) => sendMessages(id, sent)}
          />
        ) : (
          <UIText color="secondary">Conversation not found</UIText>
        )}
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    gap: theme.vs(16),
  },
}));
