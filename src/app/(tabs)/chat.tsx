import { router } from "expo-router";
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
      <ConversationList
        conversations={conversations}
        onOpen={handleOpen}
        onCreate={handleCreate}
      />
    </UIPage>
  );
}
