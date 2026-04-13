import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLocale = "en" | "mm";

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "mm",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => {
        const next = get().locale === "en" ? "mm" : "en";
        set({ locale: next });
      },
    }),
    {
      name: "hero-locale-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);
