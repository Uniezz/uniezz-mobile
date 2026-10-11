import { Icon, UIText } from "@/ui";
import { View, StyleSheet as RNStyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { MeshGradientView } from "expo-mesh-gradient";
import { GRADIENT_COLORS, GRADIENT_POINTS } from "@/utils";

const brandEntering = FadeInDown.duration(380);
const headlineEntering = FadeInDown.duration(380).delay(70);
const subtitleEntering = FadeInDown.duration(380).delay(140);

export const AuthBrand = () => {
  return (
    <View style={styles.container}>
      <MeshGradientView
        style={RNStyleSheet.absoluteFill}
        columns={3}
        rows={3}
        colors={GRADIENT_COLORS}
        points={GRADIENT_POINTS}
      />

      <View style={styles.content}>
        <Animated.View entering={brandEntering} style={styles.uniezzContainer}>
          <View style={styles.iconContainer}>
            <Icon name="graduation-cap" size={19} color="white" />
          </View>
          <UIText weight="bold" size="lg" color="white">
            Uniezz
          </UIText>
        </Animated.View>

        <Animated.View entering={headlineEntering}>
          <UIText weight="bold" size="xl" color="white">
            One platform for every student in Lublin.
          </UIText>
        </Animated.View>

        <Animated.View entering={subtitleEntering}>
          <UIText color="white">
            Your password stays on your university&apos;s own login page.
          </UIText>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  content: {
    paddingTop: rt.insets.top + theme.vs(4),
    paddingHorizontal: theme.s(24),
    paddingVertical: theme.vs(24),
    gap: theme.vs(12),
    backgroundColor: "transparent",
  },
  uniezzContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.vs(10),
    width: theme.s(34),
    height: theme.vs(34),
    backgroundColor: theme.colors.brand,
  },
}));
