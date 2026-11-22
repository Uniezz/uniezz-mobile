import { FlashList } from "@shopify/flash-list";
import { ScrollViewProps } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ApiChatMessage } from "@/@types";
import { Message } from "./Message";

// lifts the latest messages with the keyboard, like the post comments;
// the list ends above the home indicator (UIPage pads it), which the keyboard already covers
const ThreadScrollView = (props: ScrollViewProps) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} offset={bottom} />;
};

type ChatThreadProps = {
  /** oldest first */
  messages: ApiChatMessage[];
  /** the signed-in student, whose messages sit on the right */
  myId?: string;
  /** scrolled up to the oldest loaded message, e.g. to load older pages */
  onStartReached: () => void;
  /** a long press on one of the student's own messages, e.g. to delete it */
  onOwnMessageLongPress: (message: ApiChatMessage) => void;
};

export function ChatThread({
  messages,
  myId,
  onStartReached,
  onOwnMessageLongPress,
}: ChatThreadProps) {
  return (
    <FlashList
      renderScrollComponent={ThreadScrollView}
      data={messages}
      keyExtractor={(message) => message.id}
      // opens on the latest message and follows new ones while the reader is near the end
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      onStartReached={onStartReached}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <Message
          message={item}
          previous={messages[index - 1]}
          isMine={item.sender.id === myId}
          onOwnLongPress={onOwnMessageLongPress}
        />
      )}
    />
  );
}
