import { create } from "zustand";

type ProposalListRefreshState = {
  pending: boolean;
  markPending: () => void;
  takePending: () => boolean;
};

export const useProposalListRefreshStore = create<ProposalListRefreshState>(
  (set, get) => ({
    pending: false,
    markPending: () => set({ pending: true }),
    takePending: () => {
      if (!get().pending) return false;
      set({ pending: false });
      return true;
    },
  }),
);
