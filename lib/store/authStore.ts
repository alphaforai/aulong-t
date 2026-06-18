import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  /** 钱包已连接但尚未绑定邀请关系，需展示绑定弹窗 */
  needsInviteRegister: boolean;
  /**
   * 递增后通知 WhitelistGate 立即尝试唤起钱包支付（绑码成功、或需重试自动支付时使用）。
   */
  whitelistPurchaseTrigger: number;
  setAccessToken: (accessToken: string | null) => void;
  setNeedsInviteRegister: (needsInviteRegister: boolean) => void;
  requestWhitelistPurchase: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  needsInviteRegister: false,
  whitelistPurchaseTrigger: 0,
  setAccessToken: (accessToken) => set({ accessToken }),
  setNeedsInviteRegister: (needsInviteRegister) => set({ needsInviteRegister }),
  requestWhitelistPurchase: () =>
    set((state) => ({
      whitelistPurchaseTrigger: state.whitelistPurchaseTrigger + 1,
    })),
}));
