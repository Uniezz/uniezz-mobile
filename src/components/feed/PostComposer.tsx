import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";
import type { FeedPost } from "@/@types/feed";

export function PostComposer({
  onPublish,
}: {
  onPublish: (post: FeedPost) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <UIGlass style={styles.card}>
      <UIText size="lg" weight="bold">
        New post
      </UIText>
      <UIInput
        captionText="Title"
        value={title}
        onChangeText={setTitle}
        maxLength={150}
      />
      <UIInput
        captionText="Details"
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={5000}
      />
      <UIButton
        disabled={!title.trim() || !body.trim()}
        onPress={() =>
          onPublish({
            type: "QUESTION",
            title: title.trim(),
            detail: "You · just now",
            body: body.trim(),
          })
        }
      >
        <UIText color="black" weight="semibold">
          Publish
        </UIText>
      </UIButton>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { padding: theme.s(16), gap: theme.vs(12) },
}));
