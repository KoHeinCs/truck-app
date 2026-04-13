import { useQuery } from "@tanstack/react-query";
import { axios } from "../api";

export type ProfileResponse = {
  code?: string;
  data?: {
    fullName?: string;
    role?: string;
  };
  message?: string;
};

const fetchProfile = async (): Promise<ProfileResponse | null> => {
  const endpoints = ["/auth/me", "/user/me"];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get<ProfileResponse>(endpoint);
      return response.data;
    } catch {
      // Try next endpoint for backend compatibility.
    }
  }

  return null;
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 60 * 1000,
  });
};
