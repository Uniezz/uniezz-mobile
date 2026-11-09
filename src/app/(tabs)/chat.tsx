import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ConversationList } from "@/components/chat";
import { useChatStore } from "@/store/chat";
import { UIPage } from "@/ui";

export default function ChatScreen() {
  const conversations = useChatStore((state) => state.conversations);

  const handleOpen = (id: string) =>
    router.push({ pathname: "/chat/[id]", params: { id } });
  const handleCreate = () => router.push("/chat/new");

  return (
    <UIPage>
      <View style={styles.page}>
        <ConversationList
          conversations={conversations}
          onOpen={handleOpen}
          onCreate={handleCreate}
        />
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(4),
    gap: theme.vs(16),
  },
}));
