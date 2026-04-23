import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface UpdateServiceTypePayload {
  id: string | number;
  version: number;
  serviceType: string;
  langEng: string;
  langMy: string;
  active: boolean;
}

const updateServiceType = async (payload: UpdateServiceTypePayload) => {
  const { id, ...rest } = payload;
  const { data } = await axios.put(`/service-type/update/${id}`, {
    version: rest.version,
    serviceType: rest.serviceType.trim(),
    langEng: rest.langEng.trim(),
    langMy: rest.langMy.trim(),
    active: rest.active,
  });
  return data;
};

export function useUpdateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateServiceType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-types"] });
    },
  });
}
