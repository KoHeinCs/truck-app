import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface TerminateProposalPayload {
  id: string;
  ownershipId: string;
  remark: string;
}

const terminateProposal = async (payload: TerminateProposalPayload) => {
  const { data } = await axios.post("/proposal/terminate-truck-cost", {
    id: payload.id,
    ownershipId: payload.ownershipId,
    remark: payload.remark.trim(),
  });
  return data;
};

export function useTerminateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: terminateProposal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposal"] });
    },
  });
}
