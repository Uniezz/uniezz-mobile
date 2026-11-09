import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useFeedLike } from "@/hooks/useFeed";
import { Icon, UIText } from "@/ui";

type LikeButtonProps = {
  id: string;
  kind: "post" | "comment";
  liked: boolean;
  count: number;
};

export const LikeButton = ({ id, kind, liked, count }: LikeButtonProps) => {
  const { t } = useTranslation();
  const { mutateAsync: setLike, isPending } = useFeedLike();

  const scale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePress = async () => {
    // a quick bump on tap, before the server answers
    if (!liked) {
      scale.set(
        withSequence(
          withTiming(1.3, { duration: 90 }),
          withTiming(1, { duration: 120 }),
        ),
      );
    }
    try {
      await setLike({ id, kind, liked: !liked });
    } catch {
      toast.error(t("apiState.error"));
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(liked ? "apiState.unlike" : "apiState.like")}
      accessibilityState={{ selected: liked }}
      disabled={isPending}
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <Animated.View style={heartStyle}>
        <Icon
          name={liked ? "heart-filled" : "heart"}
          size={14}
          uniProps={(theme) => ({
            color: liked ? theme.colors.red : theme.colors.white60,
          })}
        />
      </Animated.View>
      <UIText size="sm" weight="semibold" color={liked ? "error" : "secondary"}>
        {count}
      </UIText>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
  },
}));
