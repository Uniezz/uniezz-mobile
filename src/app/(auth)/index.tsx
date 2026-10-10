import { RowItem, RowPicker } from "@/components";
import { Icon, UIButton, UIPage, UIText } from "@/ui";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const items: RowItem[] = [
  {
    topText: "UMCS",
    bottomText: "USOS",
  },
  {
    topText: "KUL",
    bottomText: "Microsoft",
  },
  {
    topText: "Politechnika Lubelska",
    bottomText: "Microsoft",
  },
  {
    topText: "Uniwersytet Przyrodniczy",
    bottomText: "Microsoft",
  },
  {
    topText: "WSEI",
    bottomText: "Microsoft",
  },
];

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<number>(0);
  const handleContinuePress = () => {
    if (items[selected].bottomText === "Microsoft") {
      router.push("/otp");
    }
  };
  return (
    <UIPage style={styles.page}>
      {/* TODO: add here gradient */}
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
      <View style={styles.bottomContainer}>
        <View style={styles.chooseContainer}>
          <UIText weight="bold" size="lg" color="black">
            Choose your university
          </UIText>
          <UIText color="gray">
            You will finish signing in on its own page.
          </UIText>
        </View>
        <View style={styles.spaceContainer}>
          <RowPicker
            onItemPress={setSelected}
            items={items}
            selectedItem={selected}
          />
          <UIButton
            onPress={handleContinuePress}
            style={styles.continueButton}
            size="rg"
            radius="md"
          >
            <Icon name="shield-check" size={16} color={"white"} />
            <UIText weight="semibold" size="rg" color="white">
              Continue with {items[selected].bottomText}
            </UIText>
          </UIButton>
        </View>
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    paddingTop: 0,
  },
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
  bottomContainer: {
    flex: 3,
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
  continueButton: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  chooseContainer: {
    gap: theme.vs(5),
  },
}));
