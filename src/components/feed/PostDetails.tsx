import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIGlass, UIInput, UIText } from "@/ui";
import { useState } from "react";
import type { FeedPost } from "@/@types/feed";

export function PostDetails({
  post,
  comments,
  onComment,
}: {
  post: FeedPost;
  comments: string[];
  onComment: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  return (
    <UIGlass style={styles.card}>
      <UIText size="lg" weight="bold">
        {post.title}
      </UIText>
      <UIText color="soft">{post.body}</UIText>
      <UIText color="secondary">Comments</UIText>
      {comments.map((item, index) => (
        <UIText key={index}>{item}</UIText>
      ))}
      <UIInput
        placeholder="Write a comment"
        value={comment}
        onChangeText={setComment}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (!comment.trim()) return;
          onComment(comment.trim());
          setComment("");
        }}
      >
        <UIText color="link">Post comment</UIText>
      </Pressable>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { padding: theme.s(16), gap: theme.vs(12) },
}));
