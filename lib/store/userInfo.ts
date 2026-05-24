import { create } from "zustand";

export type UserInfo = {
  id: string;
  parentId: string;
  parentBindAt: string;
  walletAddress: string;
  inviteCode: string;
  nickname: string;
  totalStakeAmount: number;
  directValidUserCount: number;
  hasTicket: number;
  ticketTime: string;
  isActiveStaker: number;
  activeTime: string;
  vipLevel: number;
  status: number;
  isBot: number;
};

const initialUserInfo: Partial<UserInfo> = {
  id: "0",
  parentId: "0",
  parentBindAt: "",
  walletAddress: "",
  inviteCode: "",
  nickname: "",
  totalStakeAmount: 0,
  directValidUserCount: 0,
  hasTicket: 0,
  ticketTime: "",
  isActiveStaker: 0,
  activeTime: "",
  vipLevel: 0,
  status: 0,
  isBot: 0,
};

type UserInfoState = {
  userInfo: UserInfo;
  setUserInfo: (patch: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
};

export const useUserInfoStore = create<UserInfoState>((set) => ({
  userInfo: initialUserInfo as UserInfo,
  setUserInfo: (patch) =>
    set((state) => ({
      userInfo: { ...state.userInfo, ...patch },
    })),
  resetUserInfo: () => set({ userInfo: initialUserInfo as UserInfo }),
}));
