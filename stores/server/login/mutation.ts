import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { axios } from "../api";

export interface LoginPayload {
  username: string;
  password: string;
}

type LoginResponse = {
  code?: string;
  data?: {
    fullName?: string;
    role?: string;
  };
  message?: string;
};

const login = async (payload: LoginPayload) => {
  const response = await axios.post<LoginResponse>("/auth/login", payload);

  const tokenHeader = response?.headers
    ? Object.entries(response.headers).find(
        ([key]) => key.toLowerCase() === "dnt-jwt-token",
      )
    : null;

  const tokenValue = tokenHeader?.[1] ?? null;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  return { body: response.data, token };
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: ({ body, token }) => {
      if (
        body?.code === "MSG6001" &&
        token &&
        typeof body?.data?.fullName === "string" &&
        typeof body?.data?.role === "string"
      ) {
        useAuthStore.getState().signIn({
          token,
          fullName: body.data.fullName,
          role: body.data.role,
        });
        router.replace("/(tabs)");
      }
    },
  });
};
