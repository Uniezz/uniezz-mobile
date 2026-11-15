import { Image } from "expo-image";
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type UICoinProps = UnistylesVariants<typeof styles>;

// the Uniezz coin, wherever a balance or a payout is shown
export const UICoin = ({ size }: UICoinProps) => {
  styles.useVariants({ size });

  return (
    <Image
      source={require("../../assets/images/coin.png")}
      style={styles.coin}
      accessibilityIgnoresInvertColors
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  coin: {
    variants: {
      size: {
        xs: { width: theme.vs(14), height: theme.vs(14) },
        sm: { width: theme.vs(20), height: theme.vs(20) },
        default: { width: theme.vs(24), height: theme.vs(24) },
        lg: { width: theme.vs(36), height: theme.vs(36) },
      },
    },
  },
}));
