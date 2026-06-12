import { create } from "zustand";

type EntrustUiState = {
  pendingOpenAIStrategy: boolean;
  requestOpenAIStrategy: () => void;
  clearPendingOpenAIStrategy: () => void;
};

export const useEntrustUiStore = create<EntrustUiState>((set) => ({
  pendingOpenAIStrategy: false,
  requestOpenAIStrategy: () => set({ pendingOpenAIStrategy: true }),
  clearPendingOpenAIStrategy: () => set({ pendingOpenAIStrategy: false }),
}));
