import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";
import { UNIVERSITY_LOGOS } from "@/utils";
import { UIText } from "./UIText";

type UIUniversityLogoProps = UnistylesVariants<typeof styles> & { id: string };

export function UIUniversityLogo({ id, size }: UIUniversityLogoProps) {
  styles.useVariants({ size });
  const source = UNIVERSITY_LOGOS[id.toLowerCase()];
  return (
    <View style={styles.logo(Boolean(source))}>
      {source ? (
        <Image
          source={source}
          contentFit="contain"
          style={styles.image}
          accessibilityLabel={`${id} logo`}
        />
      ) : (
        <UIText weight="bold" size="xs">
          {id.slice(0, 2).toUpperCase()}
        </UIText>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // logos are often dark on transparent, so they sit on a white tile
  logo: (hasImage: boolean) => ({
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.vs(8),
    padding: hasImage ? theme.vs(4) : 0,
    backgroundColor: hasImage ? theme.colors.white : theme.colors.blue20,
    variants: {
      size: {
        sm: { width: theme.s(32), height: theme.s(32) },
        default: { width: theme.s(40), height: theme.s(40) },
        lg: { width: theme.s(56), height: theme.s(56) },
      },
    },
  }),
  image: { width: "100%", height: "100%" },
}));
