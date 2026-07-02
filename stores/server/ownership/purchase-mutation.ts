import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../api";

export interface PurchaseOwnershipPayload {
  ownerId: string|undefined;
  plateNo: string;
  model: string;
  modelYear: number;
  feet: number;
  fuelType: string;
  frontTire: string;
  backTire: string;
  chassisNo?: string;
  engineNo?: string;
  equipmentName: string;
  buyDate: string;
  licenseCity: string;
  licenseEndDate: string;
  estimatedSellAmt?: string;
  purchasePlace: string;
  notes?: string;
}

const purchaseOwnership = async (payload: PurchaseOwnershipPayload) => {
  const body: Record<string, unknown> = { ...payload };
  if (!String(payload.chassisNo ?? "").trim()) {
    delete body.chassisNo;
  }
  if (!String(payload.engineNo ?? "").trim()) {
    delete body.engineNo;
  }
  if (!String(payload.estimatedSellAmt ?? "").trim()) {
    delete body.estimatedSellAmt;
  }
  if (!String(payload.notes ?? "").trim()) {
    delete body.notes;
  }
  const { data } = await axios.post("/ownership/purchase-ownership", body);
  return data;
};

export function usePurchaseOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseOwnership,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ownership", "infinite"] });
    },
  });
}
