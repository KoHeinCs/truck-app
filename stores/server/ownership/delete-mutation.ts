import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface DeleteOwnershipPayload {
  ownershipId: string;
  version: number;
  sellDate: string;
}

const deleteOwnership = async (payload: DeleteOwnershipPayload) => {
  const { data } = await axios.delete("/ownership/delete-ownership", {
    data: payload,
  });
  return data;
};

export function useDeleteOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOwnership,
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
