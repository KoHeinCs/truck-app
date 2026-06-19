import Axios from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export const axios = Axios.create({
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

axios.interceptors.request.use(
  async (config) => {
    const rawUrl = config.url;
    const url = typeof rawUrl === "string" ? rawUrl : "";
    const isLoginRequest = url.includes("/auth/login");

    if (!isLoginRequest) {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers?.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
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
