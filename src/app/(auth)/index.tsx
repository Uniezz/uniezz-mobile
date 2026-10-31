import { AuthPage, RowPicker } from "@/components";
import { useUniversities } from "@/hooks";
import { Icon, UIButton, UIText } from "@/ui";
import { router } from "expo-router";
import { UNIVERSITY_LOGOS } from "@/utils";
import { useState } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

const buttonEntering = FadeInDown.duration(380).delay(400);

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number>(0);
  const {
    data: universities = [],
    isPending,
    isError,
    refetch,
  } = useUniversities();
  const selectedUniversity = universities[selected];
  const selectedAuthMethod = selectedUniversity?.authMethod;
  const items = universities.map(({ id, name }) => ({
    topText: name,
    iconText: id.toUpperCase().slice(0, 3),
    image: UNIVERSITY_LOGOS[id],
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
      topText={t("auth.signIn")}
      bottomText={t("auth.chooseUniversity")}
    >
      {isPending ? (
        <UIText color="gray">{t("auth.loadingUniversities")}</UIText>
      ) : isError ? (
        <UIButton onPress={() => void refetch()} type="secondary">
          <UIText>{t("auth.universitiesLoadError")}</UIText>
        </UIButton>
      ) : items.length === 0 ? (
        <UIText color="gray">{t("auth.noUniversities")}</UIText>
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
            {t("auth.continueWith", {
              method:
                selectedAuthMethod === "OTP"
                  ? t("auth.emailCode")
                  : (selectedAuthMethod ?? t("auth.university")),
            })}
          </UIText>
        </UIButton>
      </Animated.View>
      <UIText size="sm" color="gray" style={styles.note}>
        {t("auth.passwordPrivacy")}
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
