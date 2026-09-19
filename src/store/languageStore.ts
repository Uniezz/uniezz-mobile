import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import i18n from "@/internationalization";

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
  language: string | null;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => {
        set({ language });
        try {
          i18n.changeLanguage(language);
        } catch {
          // i18n might not be fully initialized
        }
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
