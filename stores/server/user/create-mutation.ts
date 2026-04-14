import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export type CreateUserRole = "ADMIN" | "OWNER" | "WORKER" | "VIEWER";

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  joinDate: string;
  role: CreateUserRole;
  fullIdNo?: string;
  parentOwnerId?: string;
}

const createUser = async (payload: CreateUserPayload) => {
  const body: Record<string, unknown> = { ...payload };

  if (!String(payload.fullIdNo ?? "").trim()) {
    delete body.fullIdNo;
  }
  if (payload.role !== "VIEWER") {
    delete body.parentOwnerId;
  }

  const { data } = await axios.post("/user/create", body);
  return data;
};

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
