import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import {
  LANGUAGES,
  useLanguageStore,
  type Language,
} from "@/store/languageStore";

const resources = {
  en: { translation: require("./translations/en.json") },
  pl: { translation: require("./translations/pl.json") },
  ru: { translation: require("./translations/ru.json") },
  uk: { translation: require("./translations/uk.json") },
};

function isLanguage(language: unknown): language is Language {
  return (
    typeof language === "string" &&
    (LANGUAGES as readonly string[]).includes(language)
  );
}

const storedLanguage = useLanguageStore.getState().language;
const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const initialLanguage = isLanguage(storedLanguage)
  ? storedLanguage
  : isLanguage(deviceLanguage)
    ? deviceLanguage
    : "en";

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

useLanguageStore.subscribe((state) => {
  if (isLanguage(state.language) && i18n.language !== state.language) {
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.changeLanguage(state.language);
  }
});

if (storedLanguage && !isLanguage(storedLanguage)) {
  useLanguageStore.getState().setLanguage(initialLanguage);
}

export default i18n;
