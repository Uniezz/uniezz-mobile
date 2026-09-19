import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { useLanguageStore } from "@/store/languageStore";

const resources = {
  en: { translation: require("./translations/en.json") },
  pl: { translation: require("./translations/pl.json") },
  es: { translation: require("./translations/es.json") },
  ru: { translation: require("./translations/ru.json") },
  uk: { translation: require("./translations/uk.json") },
};

const initialLanguage =
  useLanguageStore.getState().language ||
  Localization.getLocales()[0].languageCode ||
  "en";

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
