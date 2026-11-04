import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ConversationList, CreateGroup } from "@/components/chat";
import { useChatStore } from "@/store/chat";
import { UIPage } from "@/ui";

export default function ChatScreen() {
  const conversations = useChatStore((state) => state.conversations);
  const createGroup = useChatStore((state) => state.createGroup);
  const [creatingGroup, setCreatingGroup] = useState(false);

  return (
    <UIPage backdrop="city">
      <View style={styles.page}>
        {creatingGroup ? (
          <CreateGroup
            onBack={() => setCreatingGroup(false)}
            onCreate={(name, members) => {
              const id = createGroup(name, members);
              setCreatingGroup(false);
              router.push({ pathname: "/chat/[id]", params: { id } });
            }}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            onOpen={(id) =>
              router.push({ pathname: "/chat/[id]", params: { id } })
            }
            onCreate={() => setCreatingGroup(true)}
          />
        )}
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
