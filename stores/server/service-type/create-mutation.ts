import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface CreateServiceTypePayload {
  serviceType: string;
  langEng: string;
  langMy: string;
}

const createServiceType = async (payload: CreateServiceTypePayload) => {
  const { data } = await axios.post("/service-type/create", {
    serviceType: payload.serviceType.trim(),
    langEng: payload.langEng.trim(),
    langMy: payload.langMy.trim(),
  });
  return data;
};

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createServiceType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-types"] });
    },
  });
}
