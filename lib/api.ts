import Axios from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export const api = Axios.create({
  baseURL: process.env.EXPO_PUBLIC__API_URL,
});

let handlingUnauthorized = false;

function handleUnauthorized() {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  useAuthStore.getState().signOut();
  router.replace("/(auth)/login");
  queueMicrotask(() => {
    handlingUnauthorized = false;
  });
}

api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers?.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const rawUrl = error.config?.url;
    const url = typeof rawUrl === "string" ? rawUrl : "";

    if (status === 401 && !url.includes("/auth/")) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  code?: string;
  data?: {
    fullName?: string;
    role?: string;
  };
  message?: string;
  httpStatus?: number;
};

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  const tokenHeader = response.headers
    ? Object.entries(response.headers).find(
        ([key]) => key.toLowerCase() === "dnt-jwt-token",
      )
    : null;
  const tokenValue = tokenHeader?.[1] ?? null;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  return { body: response.data, token };
}

export type ProfileResponse = {
  code?: string;
  data?: {
    fullName?: string;
    role?: string;
  };
  message?: string;
};

export async function fetchProfile() {
  const endpoints = ["/auth/me", "/user/me"];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<ProfileResponse>(endpoint);
      return response.data;
    } catch {
      // Try the next endpoint to support backend differences.
    }
  }

  return null;
}
