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
    bottomText: authMethod === "OTP" ? "Email code" : authMethod,
  }));

  const handleContinuePress = () => {
    if (!selectedUniversity) {
      return;
    }

    router.push({
      pathname: selectedUniversity.authMethod === "USOS" ? "/usos" : "/otp",
      params: { university: selectedUniversity.id },
    });
  };
  return (
    <AuthPage
      topText="Sign in"
      bottomText="Choose your university to sign in with USOS or a university email code."
    >
      {isPending ? (
        <UIText color="gray">Loading universities...</UIText>
      ) : isError ? (
        <UIButton onPress={() => void refetch()} type="secondary">
          <UIText>Couldn’t load universities. Try again.</UIText>
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
        >
          <Icon
            name="shield-check"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
          <UIText weight="semibold" size="md" color="black">
            {`Continue with ${items[selected]?.bottomText ?? "university"}`}
          </UIText>
        </UIButton>
      </Animated.View>
      <UIText size="sm" color="gray" style={styles.note}>
        Uniezz never sees your university password.
      </UIText>
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
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: theme.vs(16),
  },
  note: {
    textAlign: "center",
    paddingTop: theme.vs(14),
    paddingBottom: theme.vs(8),
  },
}));
