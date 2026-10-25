import { UIText } from "@/ui";
import Animated, { FadeInDown } from "react-native-reanimated";

const wordmarkEntering = FadeInDown.duration(380);

export const AuthWordmark = () => {
  return (
    <Animated.View entering={wordmarkEntering}>
      <UIText weight="semibold" size="lg">
        Uniezz
      </UIText>
    </Animated.View>
  );
};
