import { AuthPage, RowPicker } from "@/components";
import { useUniversities } from "@/hooks";
import { Icon, UIButton, UIText } from "@/ui";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import Toast from "react-native-toast-message";

const buttonEntering = FadeInDown.duration(380).delay(400);

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<number>(0);
  const {
    data: universities = [],
    isPending,
    isError,
    refetch,
  } = useUniversities();
  const selectedUniversity = universities[selected];
  const items = universities.map(({ name, authMethod }) => ({
    topText: name,
    bottomText: authMethod === "OTP" ? "Email OTP" : authMethod,
  }));

  const handleContinuePress = () => {
    if (!selectedUniversity) {
      return;
    }

    if (selectedUniversity.authMethod === "USOS") {
      router.push({
        pathname: "/usos",
        params: { university: selectedUniversity.id },
      });
      return;
    }

    Toast.show({
      type: "info",
      text1: "Email OTP sign-in isn’t available yet.",
      text2: "For now, sign in with a USOS university.",
    });
  };
  return (
    <AuthPage
      topText="Choose your university"
      bottomText="You will finish signing in on its own page."
    >
      {isPending ? (
        <UIText color="gray">Loading universities...</UIText>
      ) : isError ? (
        <UIButton onPress={() => void refetch()} type="secondary">
          <UIText color="black">Couldn’t load universities. Try again.</UIText>
        </UIButton>
      ) : items.length === 0 ? (
        <UIText color="gray">No universities available.</UIText>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          <RowPicker
            onItemPress={setSelected}
            items={items}
            selectedItem={selected}
          />
        </ScrollView>
      )}
      <Animated.View entering={buttonEntering}>
        <UIButton
          onPress={handleContinuePress}
          disabled={!selectedUniversity}
          style={styles.continueButton}
          size="rg"
          radius="md"
        >
          <Icon name="shield-check" size={16} color={"white"} />
          <UIText weight="semibold" size="rg" color="white">
            {`Continue with ${items[selected]?.bottomText ?? "university"}`}
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
  list: {
    flex: 1,
    marginBottom: theme.vs(14),
  },
}));
