import { LANGUAGES, useLanguageStore } from "@/store/languageStore";
import { Icon, UIText } from "@/ui";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";

const LANGUAGE_OPTIONS = [
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "uk", flag: "🇺🇦", label: "Українська" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "en", flag: "🇬🇧", label: "English" },
] as const;

export const LanguagePicker = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const currentLanguage =
    (language && LANGUAGES.includes(language) ? language : undefined) ??
    LANGUAGES.find((item) => item === i18n.resolvedLanguage) ??
    "en";
  const currentOption = LANGUAGE_OPTIONS.find(
    (option) => option.code === currentLanguage,
  );

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={t("language.select")}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={styles.trigger}
      >
        <UIText>{currentOption?.flag ?? "🌐"}</UIText>
        <UIText size="sm" weight="semibold">
          {currentLanguage.toUpperCase()}
        </UIText>
        <View style={styles.chevronContainer}>
          <View style={styles.chevron(isOpen)} />
        </View>
      </Pressable>
      {isOpen ? (
        <View style={styles.menu}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.code === currentLanguage;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setLanguage(option.code);
                  setIsOpen(false);
                }}
                style={styles.option(isSelected)}
              >
                <UIText>{option.flag}</UIText>
                <UIText
                  size="sm"
                  weight={isSelected ? "bold" : "semibold"}
                  style={styles.optionLabel}
                >
                  {option.label}
                </UIText>
                {isSelected ? (
                  <Icon
                    name="check"
                    size={16}
                    uniProps={(theme) => ({ color: theme.colors.sky })}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "flex-end",
    zIndex: 10,
  },
  trigger: {
    minHeight: theme.vs(36),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(6),
    paddingHorizontal: theme.s(10),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  chevronContainer: {
    width: theme.s(14),
    height: theme.vs(14),
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: (isOpen: boolean) => ({
    width: theme.s(6),
    height: theme.vs(6),
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: theme.colors.white60,
    transform: [{ rotate: isOpen ? "225deg" : "45deg" }],
  }),
  menu: {
    position: "absolute",
    top: theme.vs(42),
    right: 0,
    zIndex: 20,
    width: theme.s(190),
    padding: theme.s(5),
    borderRadius: theme.vs(14),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: theme.vs(5) },
    shadowOpacity: 0.4,
    shadowRadius: theme.vs(12),
    elevation: 8,
  },
  option: (isSelected: boolean) => ({
    minHeight: theme.vs(40),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(9),
    paddingHorizontal: theme.s(8),
    borderRadius: theme.vs(9),
    backgroundColor: isSelected ? theme.colors.blue20 : "transparent",
  }),
  optionLabel: {
    flex: 1,
  },
}));
