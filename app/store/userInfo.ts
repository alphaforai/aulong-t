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
  isActiveStaker: number;
  activeTime: string;
  vipLevel: number;
  status: number;
  isBot: number;
};

const initialUserInfo: UserInfo = {
  id: "0",
  parentId: "0",
  parentBindAt: "",
  walletAddress: "",
  inviteCode: "",
  nickname: "",
  totalStakeAmount: 0,
  directValidUserCount: 0,
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
  userInfo: initialUserInfo,
  setUserInfo: (patch) =>
    set((state) => ({
      userInfo: { ...state.userInfo, ...patch },
    })),
  resetUserInfo: () => set({ userInfo: initialUserInfo }),
}));
