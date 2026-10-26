import { Image } from "expo-image";
import { View, ViewProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { UIText } from "./UIText";

type UIAvatarProps = UnistylesVariants<typeof styles> & {
  imageSrc?: string;
  placeholderText?: string;
} & ViewProps;

export const UIAvatar = ({
  imageSrc,
  placeholderText,
  color,
  size,
  style,
  rounded,
  ...props
}: UIAvatarProps) => {
  styles.useVariants({ size, color, rounded });
  return (
    <View style={[styles.avatar, styles.container, style]} {...props}>
      {imageSrc ? (
        <Image
          style={styles.container}
          cachePolicy={"memory-disk"}
          contentFit="cover"
          source={{ uri: imageSrc }}
        />
      ) : (
        <UIText weight="bold" style={styles.initials}>
          {placeholderText}
        </UIText>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    variants: {
      rounded: {
        default: {},
        lg: {},
      },
      size: {
        //unistyles asks to do so :( https://unistyl.es/v3/references/variants/#defining-the-same-variant-across-multiple-styles
        xs: {},
        sm: {},
        default: {},
        lg: {},
        xl: {},
      },
      color: {
        default: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.white10,
        },
      },
    },
  },
  container: {
    variants: {
      size: {
        xs: {
          width: theme.vs(24),
          height: theme.vs(24),
        },
        sm: {
          width: theme.vs(32),
          height: theme.vs(32),
        },
        default: {
          width: theme.vs(40),
          height: theme.vs(40),
        },
        lg: {
          width: theme.vs(48),
          height: theme.vs(48),
        },
        xl: {
          width: theme.vs(64),
          height: theme.vs(64),
        },
      },
      color: {
        // here too :(  https://unistyl.es/v3/references/variants/#defining-the-same-variant-across-multiple-styles
        default: {},
      },
      rounded: {
        default: { borderRadius: theme.vs(999) },
        lg: { borderRadius: theme.vs(10) },
      },
    },
  },
  initials: {
    variants: {
      size: {
        xs: { fontSize: theme.vs(9) },
        sm: { fontSize: theme.vs(11) },
        default: { fontSize: theme.vs(14) },
        lg: { fontSize: theme.vs(17) },
        xl: { fontSize: theme.vs(22) },
      },
      // same-variant rule again: https://unistyl.es/v3/references/variants/#defining-the-same-variant-across-multiple-styles
      color: { default: {} },
      rounded: { default: {}, lg: {} },
    },
  },
}));
