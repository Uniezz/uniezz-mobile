import { useLocalSearchParams, router } from "expo-router";
import { ScrollView, Pressable } from "react-native";
import { useFeedPost } from "@/hooks/useFeed";
import { useFeedComments } from "@/hooks/useFeedComments";
import { UIPage, UIText, UIQueryError, UISkeleton, UIGlass } from "@/ui";

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { data: comments } = useFeedComments(id);
  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <UIText color="link">‹ Back</UIText>
        </Pressable>
        {isPending ? (
          <UISkeleton height={180} />
        ) : isError || !post ? (
          <UIQueryError message="Couldn’t load post" onRetry={refetch} />
        ) : (
          <UIGlass style={{ padding: 18, gap: 12 }}>
            <UIText size="lg" weight="bold">
              {post.title}
            </UIText>
            <UIText>{post.content}</UIText>
            <UIText color="secondary">
              {post.likesCount} likes · {post.commentsCount} comments
            </UIText>
          </UIGlass>
        )}
        {comments?.pages
          .flatMap((page) => page.items ?? [])
          .map((comment) => (
            <UIGlass key={comment.id} style={{ padding: 14, gap: 8 }}>
              <UIText>{comment.content}</UIText>
            </UIGlass>
          ))}
      </ScrollView>
    </UIPage>
  );
}
