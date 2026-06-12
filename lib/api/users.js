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



// /api/stake/plans
// post
// 请求示例
// {
//     "page": 0,
//     "limit": 0,
//     "searchCount": true,
//     "lastId": 0,
//     "name": "",                  // 方案名称模糊
//     "status": 0,                  // 状态 1有效 0无效
//     "planType": 0                  // 方案类型 1理财 2挖矿
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": [
// 		{
// 			"id": 0,                            // 方案ID
// 			"name": "",                         // 策略名称
// 			"planImageUrl": "",                 // 方案图片 URL
// 			"planIntro": "",                    // 方案简介
// 			"displayApr": "",                   // 展示年化 APR 范围，如 70%-180%
// 			"displayAprMin": 0,                 // 展示年化 APR 下限(%)
// 			"displayAprMax": 0,                 // 显展示年化 APR 上限(%)
// 			"periodDays": 0,                    // 运行周期(天)
// 			"dailyRate": 0,                     // 日化收益率(%)
// 			"minAmount": 0,                     // 最小存入 USDT
// 			"maxAmount": 0,                     // 最最大存入 USDT，0 表示不限制
// 			"dailyStakeLimit": 0,               // 单日部署额度 USDT，0 表示不限制
// 			"accountMaxAmount": 0,              // 单账户封顶 USDT，0 表示不限制
// 			"apr": 0                             // 年化收益率 APR(%)
// 		}
// 	],
// 	"success": true
// }

export async function getStakePlans({ page, limit, searchCount, lastId, name, status, planType }) {
  const response = await request("/api/stake/plans", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount,
      lastId,
      name,
      status,
      planType,
    },
  });
  return response;
}


// /api/stake/deploy/mine
// post
// 请求示例
// {
//     "planId": 0,
//     "amount": 0
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": 0,
// 	"success": true
// }

export async function deployStake({ planId, amount }) {
  const response = await request("/api/stake/deploy/mine", {
    method: "POST",
    body: {
      planId,
      amount,
    },
  });
  return response;
}


// 获取公告文章列表
// /api/article/list
// post
// 请求示例
// {
//     "page": 0,                           // 当前页码
//     "limit": 0,                           // 每页条数
//     "searchCount": true,                  // 是否查询总数
//     "lastId": 0,                          // 上一次查询的最后一条ID
//     "keyword": "",                        // 关键词
//     "type": 0,                            // 类型    type=1 是公告
//     "status": 0                           // 状态
//   }
// 响应示例
//{
// 	"code": 0,
// 	"msg": "",
// 	"data": [
// 		{
// 			"id": 0,                        // 文章ID
// 			"createdAt": "",                // 创建时间
// 			"updatedAt": "",                // 更新时间
// 			"type": 0,                      // 类型    type=1 是公告
// 			"title": "",                    // 标题
// 			"picUrl": "",                   // 图片URL
// 			"videoUrl": "",                 // 视频URL
// 			"summary": "",                  // 摘要
// 			"content": "",                  // 内容
// 			"sort": 0,                      // 排序
// 			"status": 0,                    // 状态
// 			"i18n": {}                      // 多语言内容
//          "isTop": 0,                    // 是否置顶, 1 是置顶，0 是不置顶
// 		}
// 	],
// 	"success": true
// }
export async function getArticleList({ page, limit, searchCount, lastId, keyword, type, status }) {
  const response = await request("/api/article/list", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount,
      lastId,
      keyword,
      type,
      status,
    },
  });
  return response;
}


// 链上理财校验
// /api/stake/deploy/invest/preview
// post
// 请求示例
// {
//     "periodDays": 0,
//     "amount": 0
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"planId": 0,                    // 方案ID
// 		"periodDays": 0,            // 运行周期(天)
// 		"minAmount": 0,             // 最小存入 USDT
// 		"maxAmount": 0,             // 最大存入 USDT
// 		"dailyStakeLimit": 0,       // 单日部署额度 USDT，0 表示不限制
// 		"accountMaxAmount": 0       // 单账户封顶 USDT，0 表示不限制
// 	},
// 	"success": true
// }
export async function getStakeDeployInvestPreview({ periodDays, amount }) {
  const response = await request("/api/stake/deploy/invest/preview", {
    method: "POST",
    body: {
      periodDays,
      amount,
    },
  });
  return response;
}

// 收益挖矿部署报错
// /api/stake/deploy/mine/preview
// post
// 请求示例
// {
//     "planId": 0,
//     "amount": 0
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"planId": 0,                        // 方案ID
// 		"availableStakeUsdtIncome": 0,      // 可用质押收益余额
// 		"amount": 0,                        // 本次部署金额
// 		"minAmount": 0,                     // 最小部署金额
// 		"maxAmount": 0,                     // 最大部署金额
// 		"dailyStakeLimit": 0,               // 单日部署额度上限，0 表示不限制
// 		"accountMaxAmount": 0,              // 单账户部署封顶，0 表示不限制
// 	},
// 	"success": true
// }
export async function getStakeDeployMinePreview({ planId, amount }) {
  const response = await request("/api/stake/deploy/mine/preview", {
    method: "POST",
    body: {
      planId,
      amount,
    },
  });
  return response;
}


// 提现试算
// /api/withdrawal/preview
// post
// 请求示例
// {
//     "currency": "",
//     "amount": 0,
//     "txHash": ""
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"currency": "",                     // 提现币种
// 		"withdrawAll": true,                 // 是否全部提现
// 		"requestAmount": 0,                 // 申请提现数量
// 		"feeRatePercent": 0,                 // 总手续费比例（%）
// 		"feeRateUsdt": 0,                     // USDT 手续费比例快照(%)
// 		"feeRateX": 0,                         // X 币手续费比例快照(%)
// 		"feeAmountUsdt": 0,                     // USDT 手续费（从平台 USDT 余额扣，仅提现 USDT 时有值）
// 		"feeAmountWalletX": 0,                 // 链上钱包 X 手续费（提现 USDT 时，从绑定钱包扣）   
// 		"feeAmountPlatformX": 0,            // 平台 代币手续费（提现 X 时，从 x_coin_balance 扣）
// 		"actualAmount": 0,                     // 实际到账数量（与提现币种一致）
// 		"usdtBalance": 0,                     // 平台 USDT 余额
// 		"walletXBalance": 0,                     // 用户绑定钱包链上 代币余额
// 		"usdtSufficient": true,                 // 平台 USDT 余额是否足够（申请额，含 USDT 手续费部分）
// 		"walletXFeeSufficient": true,             // 链上钱包 代币是否足够支付手续费（仅提现 USDT 时）
// 		"xcoinBalance": 0,                         // 可用余额 X
// 		"xcoinPrice": 0,                         // X 价格
// 		"xcoinSufficient": true
// 	},
// 	"success": true
// }
export async function getWithdrawalPreview({ currency, amount, txHash }) {
  const response = await request("/api/withdrawal/preview", {
    method: "POST",
    body: {
      currency,
      amount,
      txHash,
    },
  });
  return response;
}


// 提现记录分页查询
// /api/withdrawal/page
// post
// 请求示例
// {
//     "page": 0,                       // 当前页码
//     "limit": 10,                     // 每页条数
//     "searchCount": true,             // 是否查询总数
//     "status": 0,                     // 状态：1待审核 2成功 3已驳回，0或不传表示全部
//     "createdAtStart": "",            // 创建时间起（含当日）
//     "createdAtEnd": ""               // 创建时间止（含当日）
//   }
// 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"total": 0,
// 		"list": [
// 			{
// 				"id": 0,
// 				"status": 0,                     // 1待审核 2成功 3已驳回
// 				"statusDesc": "",                // 状态描述
// 				"amount": 0,                     // 变动金额，提现为负，驳回退回为正
// 				"currency": "",                  // 提现币种，如 USDT/AUL
// 				"feeAmountAul": 0,               // AUL 手续费
// 				"feeAmountUsdt": 0,              // USDT 手续费
// 				"balanceAfter": 0,               // 变动后余额
// 				"balanceCurrency": "",           // 余额币种
// 				"rejectReason": "",              // 驳回原因
// 				"createdAt": ""                  // 创建时间
// 			}
// 		]
// 	},
// 	"success": true
// }
/**
 * @param {{ page?: number; limit?: number; searchCount?: boolean; status?: number; createdAtStart?: string; createdAtEnd?: string }} [params]
 */
export async function getWithdrawalPage({
  page = 0,
  limit = 10,
  searchCount = true,
  status,
  createdAtStart,
  createdAtEnd,
} = {}) {
  const response = await request("/api/withdrawal/page", {
    method: "POST",
    body: {
      page,
      limit,
      searchCount: Boolean(searchCount),
      status,
      createdAtStart,
      createdAtEnd,
    },
  });
  return response;
}

// 提现状态列表
// GET /api/withdrawal/status
// 响应示例
// {
//   "code": 0,
//   "msg": "",
//   "data": [
//     { "code": "1", "name": "待审核" },
//     { "code": "2", "name": "成功" },
//     { "code": "3", "name": "已驳回" }
//   ],
//   "success": true
// }
export async function getStatusList() {
  const response = await request("/api/withdrawal/status", {
    method: "GET",
  });
  return response;
}
