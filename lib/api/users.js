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
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"vipLevel": 0,                      // 当前VIP等级
// 		"smallAreaStake": 0,                // 小区业绩(USDT)
// 		"nextVipLevel": 0,                  // 下一档VIP等级
// 		"nextLevelSmallAreaStake": 0,       // 下一档VIP小区业绩门槛(USDT)
// 		"teamTotalCount": 0,                // 团队总注册人数
// 		"teamWhitelistCount": 0,            // 团队总白名单数
// 		"teamStakerCount": 0,               // 团队总委托人数
// 		"personalStake": 0,                 // 个人委托数量
// 		"directValidUserCount": 0,          // 直推委托人数
// 		"teamTodayWhitelistCount": 0,        // 今日新增白名单人数
// 		"bigAreaStake": 0,                  // 大区业绩(USDT)
// 		"teamTotalStake": 0,                // 团队委托总额
// 		"todayTotalStake": 0,               // 今日委托总额
// 		"smallAreaStakeYesterdayDelta": 0,  // 小区业绩昨日变化(USDT)
// 		"smallAreaStakeChangeRate": 0,      // 小区业绩昨日变化(%)
// 		"bigAreaStakeYesterdayDelta": 0,    // 大区业绩昨日变化(USDT)
// 		"bigAreaStakeChangeRate": 0,        // 大区业绩昨日变化(%)
// 		"teamTotalStakeYesterdayDelta": 0,  // 团队委托总额昨日变化(USDT)
// 		"teamTotalStakeChangeRate": 0       // 团队委托总额昨日变化(%)
// 	},
// 	"success": true
// }
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


// 获取用户质押列表
// /api/stake/list
// post application/json
// 请求示例 {
//     "page": 0,                   // 当前页码
//     "limit": 10,                  // 每页条数
//     "searchCount": true,         // 是否查询总数 
//     "lastId": 0,                 // 上一次查询的最后一条ID
//     "userId": 0,                  // 质押用户ID
//     "planId": 0,                  // 质押方案ID
//     "status": 0,                  // 状态：1质押中 2已解押 3解押中
//     "walletAddress": "",          // 钱包地址（模糊）
//     "txHash": "",                  // 链上交易哈希（模糊）
//     "statuses": [],                // 状态：1质押中 2已解押 3解押中
//     "minEndTime": "",              // 最小结束时间
//     "maxEndTime": "",              // 最大结束时间
//     "maxStartTime": ""             // 最大开始时间
//   }

// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": [
// 		{
// 			"id": 0,                            // 部署单ID
// 			"planId": 0,                         // 方案ID
// 			"planName": "",                       // 策略名称
// 			"planImageUrl": "",                    // 方案图片 URL
// 			"planIntro": "",                       // 方案介绍
// 			"amount": 0,                           // 质押金额  
// 			"accumulatedEarnings": 0,              // 累计收益
// 			"laseAccumulatedEarnings": 0,          // 上次累计收益
// 			"status": 0,                            // 状态码
// 			"statusLabel": "",                     // 状态文案：已部署/已结束/已赎回
// 			"startedAt": "",                       // 开始时间
// 			"endAt": "",                           // 结束时间
// 			"runDays": 0,                          // 已运行天数
// 			"remainDays": 0,                       // 剩余天数
// 			"progressPercent": 0,                   // 进度百分比 0-100
// 			"canRedeem": true,                     // 是否可点击赎回
// 			"redeemCountdownSeconds": 0            // 距可赎回秒数，canRedeem=false 时有值
// 		}
// 	],
// 	"success": true
// }
export async function getStakeList({
  page,
  limit,
  searchCount,
  lastId,
  userId,
  planId,
  status,
  walletAddress,
  txHash,
  statuses,
  minEndTime,
  maxEndTime,
  maxStartTime,
} = {}) {
  const response = await request("/api/stake/list", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount,
      lastId,
      userId,
      planId,
      status,
      walletAddress,
      txHash,
      statuses,
      minEndTime,
      maxEndTime,
      maxStartTime,
    },
  });
  return response;
}


// 赎回申请
// /api/stake/redeem/apply
// post application/json
// 请求示例 {
//     "stakeId": 0
//   }

// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {},
// 	"success": true
// }

export async function applyRedeem({ stakeId }) {
  const response = await request("/api/stake/redeem/apply", {
    method: "POST",
    body: {
      stakeId,
    },
  });
  return response;
}



// 资金流水明细分页查询
// /api/asset-ledger/page
// post
// 请求示例
// {
//     "page": 0,                       // 当前页码
//     "limit": 0,                       // 每页条数
//     "searchCount": true,             // 	是否查询总数
//     "lastId": 0,                      // 上一次查询的最后一条ID
//     "userId": 0,                      // 用户ID
//     "walletAddress": "",              // 钱包地址
//     "currency": "",                   // 币种，如 USDT/AUL
//     "changeType": "",                // 变动类型，如 WITHDRAW_APPLY
//     "referenceId": 0,                // 关联业务记录ID
//     "createdAtStart": "",            // 创建时间起（含当日）
//     "createdAtEnd": ""               // 创建时间止（含当日）
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"total": 0,                      // 总条数
// 		"list": [
// 			{
// 				"id": 0,                           // 流水ID
// 				"currency": "",                   // 币种，如 USDT/AUL  
// 				"changeType": "",                // 变动类型，如 WITHDRAW_APPLY
// 				"changeTypeDesc": "",            // 变动类型名称
// 				"amount": 0,                    // 变动金额 USDT/AUL
// 				"balanceAfter": 0,               // 变动后余额
// 				"referenceId": 0,                // 关联业务记录ID
// 				"createdAt": ""                  // 创建时间
// 			}
// 		]
// 	},
// 	"success": true
// }
export async function getAssetLedgerPage({ page, limit, searchCount, lastId, userId, walletAddress, currency, changeType, referenceId, createdAtStart, createdAtEnd }) {
  const response = await request("/api/asset-ledger/page", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount,
      lastId,
      userId,
      walletAddress,
      currency,
      changeType,
      referenceId,
      createdAtStart,
      createdAtEnd,
    },
  });
  return response;
}


// 获取账单类型
// /api/asset-ledger/change-types 
// GET
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": [
// 		{
// 			"code": "",
// 			"name": ""
// 		}
// 	],
// 	"success": true
// }

export async function getAssetLedgerChangeTypes() {
  const response = await request("/api/asset-ledger/change-types", {
    method: "GET",
  });
  return response;
}


// 获取交易记录分页
// /api/solanablockinfo/page
// psot
// 请求示例
// {
//     "page": 0,                       // 当前页码
//     "limit": 0,                       // 每页条数
//     "searchCount": true,             // 是否查询总数
//     "lastId": 0,                      // 上一次查询的最后一条ID
//     "slot": 0,                        // 区块槽位号
//     "blockHash": "",                  // 区块哈希
//     "leader": ""                      // 区块领导者
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"total": 0,                          // 总条数
// 		"list": [
// 			{
// 				"id": 0,                            // 交易记录ID
// 				"slot": 0,                          // 区块槽位号
// 				"blockHash": "",                    // 区块哈希
// 				"leader": "",                       // 区块领导者
// 				"txCount": 0,                       // 交易数量
// 				"totalFee": 0,                      // 总手续费
// 				"totalReward": 0,                   // 总奖励
// 				"relatedTxCount": 0,                // 关联交易数量
// 				"relatedTotalFee": 0,               // 关联总手续费
// 				"relatedTotalReward": 0,            // 关联总奖励
// 				"blockTime": 0,                     // 区块时间
// 				"blockTimeAt": "",                  // 区块时间戳
// 				"createdAt": ""                    // 创建时间
// 			}
// 		]
// 	},
// 	"success": true
// }
export async function getSolanablockinfoPage({ page, limit, searchCount, lastId, slot, blockHash, leader }) {
  const response = await request("/api/solanablockinfo/page", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount,
      lastId,
      slot,
      blockHash,
      leader,
    },
  });
  return response;
}