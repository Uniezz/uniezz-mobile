import { FlashList } from "@shopify/flash-list";
import { ScrollViewProps } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { ApiChatMessage } from "@/@types";
import { Message } from "./Message";

// lifts the latest messages with the keyboard, like the post comments; inverted, as the list is.
// The list ends above the home indicator (UIPage pads it), which the keyboard already covers
const ThreadScrollView = (props: ScrollViewProps) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} inverted offset={bottom} />;
};

type ChatThreadProps = {
  /** newest first, as the API pages them */
  messages: ApiChatMessage[];
  /** the signed-in student, whose messages sit on the right */
  myId?: string;
  /** the composer floating over the list's bottom; the newest message stays above it */
  composerHeight: number;
  /** scrolled up to the oldest loaded message, e.g. to load older pages */
  onEndReached: () => void;
  /** the other student's read position in a direct chat; the latest own message it covers shows "Read" */
  peerReadSeq?: number;
  /** a long press on a message that is not deleted */
  onMessageLongPress: (message: ApiChatMessage) => void;
  /** a photo in a message failed to load */
  onPhotoError: (message: ApiChatMessage) => void;
};

// inverted, so the newest message sits at the bottom and the list starts there, with room for the
// composer that floats over it; messages scroll on under the composer
export function ChatThread({
  messages,
  myId,
  composerHeight,
  onEndReached,
  peerReadSeq = 0,
  onMessageLongPress,
  onPhotoError,
}: ChatThreadProps) {
  // only the newest of the student's own messages carries the "Read" mark
  const lastOwnIndex = messages.findIndex(
    (message) =>
      message.sender.id === myId &&
      message.kind !== "system" &&
      !message.deletedAt,
  );

  return (
    <FlashList
      inverted
      // FlashList keeps what is on screen in place when items arrive at the start, and its autoscroll
      // exists only for the end; here the start is the bottom, so a new message would land out of view.
      // Without it, offset 0 is the bottom and a new message shows while the reader is there; older
      // pages join at the end, above, and move nothing
      maintainVisibleContentPosition={{ disabled: true }}
      renderScrollComponent={ThreadScrollView}
      data={messages}
      keyExtractor={(message) => message.id}
      onEndReached={onEndReached}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list(composerHeight)}
      renderItem={({ item, index }) => (
        <Message
          message={item}
          // the message shown above this one is the older one, next in the array
          previous={messages[index + 1]}
          isMine={item.sender.id === myId}
          isReadByPeer={index === lastOwnIndex && item.seq <= peerReadSeq}
          onLongPress={onMessageLongPress}
          onPhotoError={onPhotoError}
        />
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  // the list is flipped: its top padding is the room left under the newest message for the composer
  list: (composerHeight: number) => ({
    paddingTop: composerHeight + theme.vs(8),
  }),
}));
