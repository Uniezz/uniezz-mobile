import { Image } from "expo-image";
import { View, ViewProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type UIAvatarProps = UnistylesVariants<typeof styles> & {
  imageSrc?: string | number | null;
} & ViewProps;

const FALLBACK_AVATAR = require("../../assets/profile-cat.png");

export const UIAvatar = ({
  imageSrc,
  color,
  size,
  style,
  rounded,
  ...props
}: UIAvatarProps) => {
  styles.useVariants({ size, color, rounded });
  return (
    <View style={[styles.avatar, styles.container, style]} {...props}>
      <Image
        style={styles.container}
        cachePolicy={"memory-disk"}
        contentFit="cover"
        source={
          !imageSrc
            ? FALLBACK_AVATAR
            : typeof imageSrc === "number"
              ? imageSrc
              : { uri: imageSrc }
        }
      />
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
        xxs: {},
        xs: {},
        sm: {},
        default: {},
        lg: {},
        xl: {},
        xxl: {},
      },
      color: {
        default: {
          borderWidth: 1,
          borderColor: theme.colors.white10,
        },
      },
    },
  },
  container: {
    variants: {
      size: {
        xxs: {
          width: theme.vs(20),
          height: theme.vs(20),
        },
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
        xxl: {
          width: theme.vs(112),
          height: theme.vs(112),
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
}));
