import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const fullName = useAuthStore((state) => state.fullName);
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);

  return {
    token,
    fullName,
    role,
    userId,
    signIn,
    signOut,
  };
}
