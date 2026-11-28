import { router } from "expo-router";
import { useState } from "react";
import { ConversationList } from "@/components/chat";
import { useChatConversations } from "@/hooks";
import { UIPage } from "@/ui";

export default function ChatScreen() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatConversations();
  const conversations = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const handleOpen = (id: string) =>
    router.push({ pathname: "/chat/[id]", params: { id } });
  const handleCreate = () => router.push("/chat/new");
  const handleRefresh = () => {
    setRefreshing(true);
    return refetch().finally(() => setRefreshing(false));
  };
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  return (
    <UIPage>
      <ConversationList
        conversations={conversations}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
        onOpen={handleOpen}
        onCreate={handleCreate}
      />
    </UIPage>
  );
}
