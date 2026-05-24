import { create } from "zustand";

type InviteCodeState = {
  inviteCode: string;
  setInviteCode: (inviteCode: string) => void;
};

export const useInviteCodeStore = create<InviteCodeState>((set) => ({
  inviteCode: "",
  setInviteCode: (inviteCode) => set({ inviteCode }),
}));
