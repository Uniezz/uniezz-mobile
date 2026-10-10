import { Icon, UIText } from "@/ui";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

{
}

export const AuthBrand = () => {
  return (
    /* TODO: add here gradient */

    <View style={styles.topContainer}>
      <View style={styles.uniezzContainer}>
        <View style={styles.iconContainer}>
          <Icon name="graduation-cap" size={19} color={"white"} />
        </View>
        <UIText weight="bold" size="lg" color="white">
          Uniezz
        </UIText>
      </View>

      <UIText weight="bold" size="xl" color="white">
        One platform for every student in Lublin.
      </UIText>
      <UIText color="gray">
        Your password stays on your university own login page.
      </UIText>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  topContainer: {
    flex: 1,
    backgroundColor: theme.colors.abyss,
    paddingTop: rt.insets.top,
    gap: theme.vs(12),
    paddingHorizontal: theme.s(24),
    paddingVertical: theme.vs(24),
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
