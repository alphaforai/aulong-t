import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  /** 钱包已连接但尚未绑定邀请关系，需展示绑定弹窗 */
  needsInviteRegister: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setNeedsInviteRegister: (needsInviteRegister: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  needsInviteRegister: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setNeedsInviteRegister: (needsInviteRegister) => set({ needsInviteRegister }),
}));
