import { AuthPage, RowItem, RowPicker } from "@/components";
import { Icon, UIButton, UIText } from "@/ui";
import { router } from "expo-router";
import { useState } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
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

const buttonEntering = FadeInDown.duration(380).delay(items.length * 70 + 50);

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<number>(0);
  const handleContinuePress = () => {
    if (items[selected].bottomText === "Microsoft") {
      router.push("/otp");
    }
  };
  return (
    <AuthPage
      topText="Choose your university"
      bottomText="You will finish signing in on its own page."
    >
      <RowPicker
        onItemPress={setSelected}
        items={items}
        selectedItem={selected}
      />
      <Animated.View entering={buttonEntering}>
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
      </Animated.View>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    paddingTop: 0,
  },
  continueButton: {
    flexDirection: "row",
    gap: theme.s(8),
  },
}));
