import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export type AuthSession = {
  token: string;
  fullName: string;
  role: string;
};

type AuthStore = {
  token: string | null;
  fullName: string | null;
  role: string | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      fullName: null,
      role: null,
      signIn: (session) =>
        set({
          token: session.token,
          fullName: session.fullName,
          role: session.role,
        }),
      signOut: () => set({ token: null, fullName: null, role: null }),
    }),
    {
      name: "hero-auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        fullName: state.fullName,
        role: state.role,
      }),
    },
  ),
);
