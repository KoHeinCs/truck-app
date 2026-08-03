import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";
import { markOwnershipRunningBalanceRefresh } from "@/stores/client/ownership-running-balance-refresh-store";

export interface TerminateProposalPayload {
  id: string;
  ownershipId: string;
  remark: string;
  version: number;
}

const terminateProposal = async (payload: TerminateProposalPayload) => {
  const { data } = await axios.post("/proposal/terminate-truck-cost", {
    id: payload.id,
    version: payload.version,
    ownershipId: payload.ownershipId,
    remark: payload.remark.trim(),
  });
  return data;
};

export function useTerminateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: terminateProposal,
    onSuccess: async (_data, variables) => {
      await qc.resetQueries({
        queryKey: ["proposal", "infinite"] ,
        exact:false
      });
      markOwnershipRunningBalanceRefresh(variables.ownershipId);
    },
  });
}
