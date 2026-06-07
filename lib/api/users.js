import { request } from "@/lib/api/request";
import { useUserInfoStore } from "@/lib/store/userInfo";

// 绑定用户上级
// /api/user/bind-referrer
export async function bindReferrer({ inviteCode }) {
  if (!inviteCode) {
    throw new Error("inviteCode is required");
  }
  const response = await request("/api/user/bind-referrer", {
    method: "POST",
    body: {
      inviteCode: String(inviteCode).trim(),
    },
  });
  return response;
}


// 查询用户信息，并将结果存入useUserInfoStore
// /api/user/me
export async function getUserInfo() {
  const response = await request("/api/user/me", {
    method: "GET",
  });
  const userInfo = response?.data ?? {};

  // 直接存入useUserInfoStore
  useUserInfoStore.getState().setUserInfo(userInfo);
  return userInfo;
}



// /api/user/assets
// get
export async function getUserAssets() {
  const response = await request("/api/user/assets", {
    method: "GET",
  });
  return response;
}



// /api/xprice/current
// get
export async function getXcoinPrice() {
  const response = await request("/api/xprice/current", {
    method: "GET",
  });
  return response;
}


// /api/user/team/overview
// get
export async function getTeamOverview() {
  const response = await request("/api/user/team/overview", {
    method: "GET",
  });
  return response;
}


// /api/user/team/direct/page
// 组件内 page 从 0 起；后端 page 从 1 起，请求前会 +1
/**
 * @param {{ page?: number; limit?: number; searchCount?: boolean }} [params]
 */
export async function getTeamDirectPage({
  page = 0,
  limit = 10,
  searchCount = true,
} = {}) {
  const response = await request("/api/user/team/direct/page", {
    method: "POST",
    body: {
      page: page + 1,
      limit,
      searchCount: Boolean(searchCount),
    },
  });
  return response;
}


// /api/xprice/overview
// post
// 请求示例
// {
//     "granularity": ""
//   }
// granularity可取的值：MINUTE,HOUR,DAY
export async function getXpriceOverview({granularity = "DAY"}) {
  const response = await request("/api/xprice/overview", {
    method: "POST",
    body: {
      granularity,
    },
  });
  return response;
}


// /api/withdrawal/apply
// post
// {
//   "currency": "USDT",
//   "amount": 1,
//   "txHash": "0x..."
// }
export async function applyWithdrawal({ currency, amount, txHash }) {
  const response = await request("/api/withdrawal/apply", {
    method: "POST",
    body: {
      currency,
      amount,
      txHash,
    },
  });
  return response;
}