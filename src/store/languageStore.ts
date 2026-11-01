import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export const LANGUAGE_OPTIONS = [
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "uk", flag: "🇺🇦", label: "Українська" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "en", flag: "🇬🇧", label: "English" },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];
export const LANGUAGES: readonly Language[] = LANGUAGE_OPTIONS.map(
  ({ code }) => code,
);

const storage = createMMKV();

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.remove(name);
  },
};

interface LanguageState {
  language: Language | null;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => {
        set({ language });
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
