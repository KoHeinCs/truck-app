import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markOwnershipRunningBalanceRefresh } from "@/stores/client/ownership-running-balance-refresh-store";
import { axios } from "../api";

export interface ApproveProposalPayload {
  id: string;
  version: number;
  ownershipId: string;
  proposalAmount: number;
  serviceType: string;
  serviceDate: string;
  remark?: string;
}

const approveProposal = async (payload: ApproveProposalPayload) => {
  const body: Record<string, unknown> = {
    id: payload.id,
    version: payload.version,
    ownershipId: payload.ownershipId,
    proposalAmount: payload.proposalAmount,
    serviceType: payload.serviceType,
    serviceDate: payload.serviceDate,
  };

  if (payload.remark?.trim()) {
    body.remark = payload.remark.trim();
  }

  const { data } = await axios.post("/proposal/approve-truck-cost", body);
  return data;
};

export function useApproveProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveProposal,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["proposal"] });
      markOwnershipRunningBalanceRefresh(variables.ownershipId);
    },
  });
}
