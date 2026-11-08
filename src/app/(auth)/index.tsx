import { AuthPage, RowPicker } from "@/components";
import { useUniversities } from "@/hooks";
import { Icon, UIButton, UIText, UIUniversityLogo } from "@/ui";
import { UNIVERSITY_SHORT_NAMES } from "@/utils";
import { router } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

const buttonEntering = FadeInDown.duration(380).delay(400);
// fade height, and how far from either end of the list a fade starts to disappear, in pt
const LIST_FADE_DISTANCE = 48;

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
    leading: <UIUniversityLogo id={id} size="sm" />,
    topText: UNIVERSITY_SHORT_NAMES[id] ?? name,
    bottomText: UNIVERSITY_SHORT_NAMES[id] ? name : undefined,
  }));

  const listRef = useAnimatedRef<Animated.ScrollView>();
  const listOffset = useScrollOffset(listRef);
  const listHeight = useSharedValue(0);
  const listContentHeight = useSharedValue(0);
  // each fade shows only while rows are hidden past its edge
  const listTopFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      listOffset.value,
      [0, LIST_FADE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const listBottomFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      listContentHeight.value - listHeight.value - listOffset.value,
      [0, LIST_FADE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const handleListLayout = (event: LayoutChangeEvent) => {
    listHeight.value = event.nativeEvent.layout.height;
  };

  const handleListContentSizeChange = (_width: number, height: number) => {
    listContentHeight.value = height;
  };

  const handleRetryPress = () => refetch();

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
        <UIButton onPress={handleRetryPress} type="secondary">
          <UIText>{t("auth.universitiesLoadError")}</UIText>
        </UIButton>
      ) : items.length === 0 ? (
        <UIText color="gray">{t("auth.noUniversities")}</UIText>
      ) : (
        <View style={styles.list}>
          <Animated.ScrollView
            ref={listRef}
            showsVerticalScrollIndicator={false}
            onLayout={handleListLayout}
            onContentSizeChange={handleListContentSizeChange}
          >
            <RowPicker
              appearance="inset"
              onItemPress={setSelected}
              items={items}
              selectedItem={selected}
            />
          </Animated.ScrollView>
          <Animated.View style={[styles.listFade("top"), listTopFadeStyle]} />
          <Animated.View
            style={[styles.listFade("bottom"), listBottomFadeStyle]}
          />
        </View>
      )}
      <Animated.View entering={buttonEntering}>
        <UIButton
          onPress={handleContinuePress}
          disabled={!selectedUniversity}
          style={styles.continueButton}
          size="rg"
          radius="sm"
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
      <UIText size="sm" color="secondary" style={styles.note}>
        {t("auth.passwordPrivacy")}
      </UIText>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  continueButton: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: theme.vs(16),
  },
  // rows fade into the page toward `edge`
  listFade: (edge: "top" | "bottom") => ({
    position: "absolute",
    left: 0,
    right: 0,
    [edge]: 0,
    height: theme.vs(LIST_FADE_DISTANCE),
    pointerEvents: "none",
    experimental_backgroundImage: `linear-gradient(to ${edge}, ${theme.colors.ink0}, ${theme.colors.ink})`,
  }),
  note: {
    textAlign: "center",
    paddingTop: theme.vs(14),
    paddingBottom: theme.vs(8),
  },
}));
