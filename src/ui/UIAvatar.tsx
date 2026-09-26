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
  ...props
}: UIAvatarProps) => {
  styles.useVariants({ size, color });
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
        <UIText weight="bold" color="white" size={size}>
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
      size: {
        //unistyles asks to do so :( https://unistyl.es/v3/references/variants/#defining-the-same-variant-across-multiple-styles
        xs: {},
        sm: {},
        default: {},
        lg: {},
        xl: {},
      },
      color: {
        default: { backgroundColor: theme.colors.abyss },
        indigo: { backgroundColor: theme.colors.indigo },
        violet: { backgroundColor: theme.colors.violet },
        lagoon: { backgroundColor: theme.colors.lagoon },
        ember: { backgroundColor: theme.colors.ember },
        green: { backgroundColor: theme.colors.green },
        periwinkle: { backgroundColor: theme.colors.periwinkle },
      },
    },
  },
  container: {
    borderRadius: theme.vs(999),
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
        indigo: {},
        violet: {},
        lagoon: {},
        ember: {},
        green: {},
        periwinkle: {},
      },
    },
  },
}));
