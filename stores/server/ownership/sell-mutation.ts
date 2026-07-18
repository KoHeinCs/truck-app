import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface SellOwnershipPayload {
  ownershipId: string;
  proposalAmount: number;
  sellDate: string;
  soldPlace: string;
}

const sellOwnership = async (payload: SellOwnershipPayload) => {
  const { data } = await axios.post("/ownership/sell-ownership", payload);
  return data;
};

export function useSellOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sellOwnership,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ownership", "infinite"] });
      qc.invalidateQueries({
        queryKey: ["ownership", "find", variables.ownershipId],
      });
      qc.invalidateQueries({
        queryKey: ["ownership", "runningBalance", variables.ownershipId],
      });
    },
  });
}
