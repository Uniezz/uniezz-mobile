import { AuthBrand } from "./AuthBrand";
import { UIPage, UIText } from "@/ui";
import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AuthPageProps = {
  children: ReactNode;
  topText: string;
  bottomText: string;
};

export const AuthPage = ({ children, topText, bottomText }: AuthPageProps) => {
  return (
    <UIPage style={styles.page}>
      <AuthBrand />
      <View style={styles.bottomContainer}>
        <View style={styles.textContainer}>
          <UIText weight="bold" size="lg" color="black">
            {topText}
          </UIText>
          <UIText color="gray">{bottomText}</UIText>
        </View>
        <View style={styles.spaceContainer}>{children}</View>
      </View>
    </UIPage>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    paddingTop: 0,
  },
  bottomContainer: {
    flex: 1.7,
    gap: theme.vs(14),
    backgroundColor: theme.colors.canvas,
    borderTopLeftRadius: theme.vs(20),
    borderTopRightRadius: theme.vs(20),
    marginTop: theme.vs(-20),
    paddingHorizontal: theme.s(20),
    paddingVertical: theme.vs(20),
  },
  spaceContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  textContainer: {
    gap: theme.vs(5),
  },
}));
