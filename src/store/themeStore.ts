import { createMMKV } from "react-native-mmkv";
import { UnistylesRuntime } from "react-native-unistyles";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export type AppTheme = "light" | "dark" | "gold";

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

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // Default theme
      setTheme: (theme) => {
        set({ theme });
        try {
          if (UnistylesRuntime.themeName !== theme) {
            UnistylesRuntime.setTheme(theme);
          }
        } catch {
          // Runtime might not be ready yet
        }
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
