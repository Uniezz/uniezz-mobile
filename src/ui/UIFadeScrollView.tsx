import { LayoutChangeEvent, ScrollViewProps, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { s, vs } from "@/theme/scale";

// fade size, and how far from either end of the content a fade starts to disappear (scaled per axis)
const FADE_DISTANCE = 40;

type Edge = "top" | "bottom" | "left" | "right";
type FadeColor = "ink" | "surface";

type UIFadeScrollViewProps = Omit<
  ScrollViewProps,
  "onLayout" | "onContentSizeChange"
> & {
  /** the background the content fades into */
  fadeColor?: FadeColor;
};

// a ScrollView whose content fades out at an edge only while more of it is hidden past that edge
export const UIFadeScrollView = ({
  horizontal,
  fadeColor = "ink",
  style,
  children,
  ...props
}: UIFadeScrollViewProps) => {
  const fadeDistance = horizontal ? s(FADE_DISTANCE) : vs(FADE_DISTANCE);
  const ref = useAnimatedRef<Animated.ScrollView>();
  const offset = useScrollOffset(ref);
  const size = useSharedValue(0);
  const contentSize = useSharedValue(0);
  const startFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      offset.value,
      [0, fadeDistance],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const endFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      contentSize.value - size.value - offset.value,
      [0, fadeDistance],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    size.value = horizontal ? width : height;
  };

  const handleContentSizeChange = (width: number, height: number) => {
    contentSize.value = horizontal ? width : height;
  };

  return (
    <View style={style}>
      <Animated.ScrollView
        ref={ref}
        horizontal={horizontal}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        {...props}
      >
        {children}
      </Animated.ScrollView>
      <Animated.View
        style={[
          styles.fade(horizontal ? "left" : "top", fadeColor),
          startFadeStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.fade(horizontal ? "right" : "bottom", fadeColor),
          endFadeStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  fade: (edge: Edge, color: FadeColor) => {
    const isVertical = edge === "top" || edge === "bottom";
    return {
      position: "absolute",
      pointerEvents: "none",
      [edge]: 0,
      ...(isVertical
        ? { left: 0, right: 0, height: theme.vs(FADE_DISTANCE) }
        : { top: 0, bottom: 0, width: theme.s(FADE_DISTANCE) }),
      experimental_backgroundImage: `linear-gradient(to ${edge}, ${theme.colors[`${color}0`]}, ${theme.colors[color]})`,
    };
  },
}));
