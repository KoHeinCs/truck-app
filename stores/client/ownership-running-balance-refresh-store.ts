import { create } from "zustand";

type OwnershipRunningBalanceRefreshState = {
  pendingOwnershipId: string | null;
  markPending: (ownershipId: string) => void;
  takePending: (ownershipId: string) => boolean;
};

export const useOwnershipRunningBalanceRefreshStore =
  create<OwnershipRunningBalanceRefreshState>((set, get) => ({
    pendingOwnershipId: null,
    markPending: (ownershipId) => {
      const normalizedId = ownershipId.trim();
      if (!normalizedId) return;
      set({ pendingOwnershipId: normalizedId });
    },
    takePending: (ownershipId) => {
      const normalizedId = ownershipId.trim();
      if (!normalizedId || get().pendingOwnershipId !== normalizedId) {
        return false;
      }
      set({ pendingOwnershipId: null });
      return true;
    },
  }));

export function markOwnershipRunningBalanceRefresh(ownershipId: string) {
  useOwnershipRunningBalanceRefreshStore.getState().markPending(ownershipId);
}
