import { Image } from "expo-image";
import { View } from "react-native";
import Animated, { css } from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import {
  SPLASH_LOGO_BOX as BOX,
  SPLASH_LOGO_PATH as LOGO_PATH,
  SPLASH_NATIVE_IMAGE_WIDTH,
  SPLASH_SHINE_COUNT,
  SPLASH_SHINE_DELAY_MS,
  SPLASH_SHINE_MS,
  SPLASH_SHINE_WIDTH as SHINE_WIDTH,
} from "@/utils";

// Reanimated 4 CSS keyframes animate the SVG Rect's x on the UI thread;
// the band is skewed 45°, so it also travels BOX.height to clear the bottom corner
const shineSweep = css.keyframes({
  from: { x: BOX.x - SHINE_WIDTH },
  to: { x: BOX.x + BOX.width + BOX.height },
});
const shineStyle = css.create({
  sweep: {
    animationName: shineSweep,
    animationDuration: SPLASH_SHINE_MS,
    animationDelay: SPLASH_SHINE_DELAY_MS,
    animationIterationCount: SPLASH_SHINE_COUNT,
    animationTimingFunction: "ease-in-out",
    animationFillMode: "both",
  },
});

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// react-native-svg reads stopColor from <Stop> element props directly, so the
// theme color goes to the gradient wrapper instead of a withUnistyles(Stop)
const ShineGradient = withUnistyles(
  ({ color }: { color?: string }) => (
    <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor={color} stopOpacity={0} />
      <Stop offset="0.5" stopColor={color} stopOpacity={0.85} />
      <Stop offset="1" stopColor={color} stopOpacity={0} />
    </LinearGradient>
  ),
  (theme) => ({ color: theme.colors.iconMuted }),
);

type SplashLogoProps = {
  onDisplay?: () => void;
};

// draws the same png at the same size as the native splash, so the handoff is pixel-identical;
// the svg only adds the shine, clipped to the traced logo shape
export const SplashLogo = ({ onDisplay }: SplashLogoProps) => {
  return (
    <View
      style={styles.canvas}
      accessibilityRole="image"
      accessibilityLabel="uniezz"
    >
      <Image
        source={require("../../../assets/images/splash-screen.png")}
        style={styles.fill}
        onDisplay={onDisplay}
      />
      <Svg style={styles.fill} viewBox="0 0 1024 1024">
        <Defs>
          <ShineGradient />
          <ClipPath id="logo">
            <Path d={LOGO_PATH} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#logo)">
          {/* fill lives on the G: Reanimated's CSS props builder rejects url() colors on the animated Rect */}
          <G transform={`translate(0 ${BOX.y}) skewX(-45)`} fill="url(#shine)">
            <AnimatedRect
              animatedProps={shineStyle.sweep}
              x={BOX.x - SHINE_WIDTH}
              y={0}
              width={SHINE_WIDTH}
              height={BOX.height}
            />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: SPLASH_NATIVE_IMAGE_WIDTH,
    height: SPLASH_NATIVE_IMAGE_WIDTH,
  },
  fill: StyleSheet.absoluteFillObject,
});
