import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface UpdateOwnershipPayload {
  ownershipId: string;
  version: number;
  equipmentName: string;
  buyDate: string;
  licenseCity: string;
  licenseEndDate: string;
  estimatedSellAmt?: string;
  purchasePlace: string;
  notes?: string;
}

const updateOwnership = async (payload: UpdateOwnershipPayload) => {
  const body: Record<string, unknown> = { ...payload };
  if (!String(payload.estimatedSellAmt ?? "").trim()) {
    delete body.estimatedSellAmt;
  }
  if (!String(payload.notes ?? "").trim()) {
    delete body.notes;
  }
  const { data } = await axios.put("/ownership/update-ownership", body);
  return data;
};

export function useUpdateOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateOwnership,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ownership", "infinite"] });
      qc.invalidateQueries({
        queryKey: ["ownership", "find", variables.ownershipId],
      });
    },
  });
}
