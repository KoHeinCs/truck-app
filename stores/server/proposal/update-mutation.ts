import {useMutation, useQueryClient} from "@tanstack/react-query";
import { axios } from "../api";

export interface UpdateProposalPayload {
  id: string;
  version: number;
  proposalNo:string;
  ownershipId: string;
  proposalAmount: number;
  serviceType: string;
  serviceShop: string;
  serviceDate: string;
  description: string;
  remark: string;
}

const updateProposal = async (payload: UpdateProposalPayload) => {
  const { data } = await axios.put("/proposal/update-truck-cost", {
    id: payload.id,
    version: payload.version,
    ownershipId: payload.ownershipId,
    proposalAmount: payload.proposalAmount,
    serviceType: payload.serviceType,
    serviceShop: payload.serviceShop.trim(),
    serviceDate: payload.serviceDate,
    description: payload.description.trim(),
    remark: payload.remark.trim(),
  });
  return data;
};

export function useUpdateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProposal,
    onSuccess: async (data,variables) =>{
      const { proposalNo, ownershipId } = variables;

      await qc.invalidateQueries({
        queryKey: ["proposal", "detail", proposalNo, ownershipId],
        exact: true,
      });

      await qc.invalidateQueries({
        queryKey: ["proposal", "history", proposalNo, ownershipId],
        exact: true,
      });

    }
  });
}
