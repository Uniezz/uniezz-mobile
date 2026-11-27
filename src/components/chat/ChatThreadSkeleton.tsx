import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UISkeleton } from "@/ui";
import { CHAT_SKELETON_BUBBLES } from "@/utils";

type ChatThreadSkeletonProps = {
  /** the composer floating over the thread's bottom; the bubbles stay above it, as messages do */
  composerHeight: number;
};

// placeholder messages while a thread loads, shaped like ChatThread
export const ChatThreadSkeleton = ({
  composerHeight,
}: ChatThreadSkeletonProps) => (
  <View style={styles.thread(composerHeight)}>
    {CHAT_SKELETON_BUBBLES.map(({ isMine, width }, index) => (
      <UISkeleton
        key={index}
        width={width}
        height={56}
        borderRadius={16}
        style={styles.bubble(isMine)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  thread: (composerHeight: number) => ({
    flex: 1,
    justifyContent: "flex-end",
    // Message's 6pt gap under each bubble
    gap: theme.vs(6),
    paddingBottom: composerHeight + theme.vs(8),
  }),
  bubble: (isMine: boolean) => ({
    alignSelf: isMine ? "flex-end" : "flex-start",
  }),
}));
