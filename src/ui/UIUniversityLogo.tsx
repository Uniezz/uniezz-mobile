import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";
import { UNIVERSITY_LOGOS } from "@/utils";
import { UIText } from "./UIText";

type UIUniversityLogoProps = UnistylesVariants<typeof styles> & { id: string };

export function UIUniversityLogo({ id, size }: UIUniversityLogoProps) {
  styles.useVariants({ size });
  const source = UNIVERSITY_LOGOS[id.toLowerCase()];
  return source ? (
    <Image
      source={source}
      contentFit="contain"
      style={styles.logo}
      accessibilityLabel={`${id} logo`}
    />
  ) : (
    <View style={[styles.logo, styles.fallback]}>
      <UIText weight="bold">{id.slice(0, 2).toUpperCase()}</UIText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  logo: {
    variants: {
      size: {
        sm: { width: theme.s(32), height: theme.s(32) },
        default: { width: theme.s(40), height: theme.s(40) },
        lg: { width: theme.s(56), height: theme.s(56) },
      },
    },
  },
  fallback: { alignItems: "center", justifyContent: "center" },
}));
