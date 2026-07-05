import * as SecureStore from "expo-secure-store";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

const secureStorage = {
    getItem: (name: string) => SecureStore.getItemAsync(name),
    setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
    removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export type AuthSession = {
    token: string;
    fullName: string;
    role: string;
    userId?: string | null;
    parentOwnerId?: string | null;
};

type AuthStore = {
    token: string | null;
    fullName: string | null;
    role: string | null;
    userId: string | null;
    parentOwnerId: string | null;
    signIn: (session: AuthSession) => void;
    signOut: () => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            fullName: null,
            role: null,
            userId: null,
            parentOwnerId: null,
            signIn: (session) =>
                set({
                    token: session.token,
                    fullName: session.fullName,
                    role: session.role,
                    userId: session.userId ?? null,
                    parentOwnerId: session.parentOwnerId ?? null
                }),
            signOut: () =>
                set({token: null, fullName: null, role: null, userId: null, parentOwnerId: null}),
        }),
        {
            name: "hero-auth-storage",
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                token: state.token,
                fullName: state.fullName,
                role: state.role,
                userId: state.userId,
                parentOwnerId: state.parentOwnerId,
            }),
        },
    ),
);
