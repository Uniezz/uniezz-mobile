import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export const LANGUAGES = ["pl", "uk", "ru", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

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
