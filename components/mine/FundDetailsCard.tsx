import { AppImage } from "@/components/AppImage";
import { mineAssets } from "./assets";

type FundRecord = {
  title: string;
  currency: string;
  time: string;
  amount: string;
  amountTone: "positive" | "negative";
  balance: string;
};

const FUND_RECORDS: FundRecord[] = [];
//   {
//     title: "启动AI",
//     currency: "USDT",
//     time: "2024-03-24 19:33",
//     amount: "+3,597.30",
//     amountTone: "positive",
//     balance: "余额：1598455.24 USDT",
//   },
//   {
//     title: "购买白名单",
//     currency: "X",
//     time: "2024-03-24 19:33",
//     amount: "+26,119.94",
//     amountTone: "positive",
//     balance: "余额：1598455.24 X",
//   }

const FILTERS = ["账单类型", "币种", "时间"] as const;

export function FundDetailsCard() {
  const hasRecords = FUND_RECORDS.length > 0;

  return (
    <section className="flex min-h-[540px] w-full min-w-0 flex-col gap-[10px] overflow-hidden rounded-[12px] bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex h-[27px] w-[129px] items-center gap-[3px] overflow-hidden">
        <div className="relative size-[22px] shrink-0 overflow-hidden">
          <AppImage
            src={mineAssets.fundIcon}
            alt=""
            width={22}
            height={22}
            className="absolute h-[135.06%] w-[136.84%] max-w-none -left-[18.42%] -top-[16.88%]"
          />
        </div>
        <h2 className="text-base font-semibold leading-[22px] text-black/80">
          资金明细
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-1 text-sm leading-normal text-[#333]"
          >
            {label}
            <AppImage
              src={mineAssets.chevronDown}
              alt=""
              width={12}
              height={12}
              className="block h-2 w-2 shrink-0"
            />
          </button>
        ))}
      </div>

      <div className="relative h-0 w-full shrink-0">
        <AppImage
          src={mineAssets.fundDividerH}
          alt=""
          width={327}
          height={1}
          className="absolute inset-x-0 top-0 h-px w-full"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!hasRecords ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
            暂无资金明细
          </div>
        ) : (
          FUND_RECORDS.map((record, index) => (
            <div
              key={`${record.title}-${index}`}
              className={`flex w-full flex-col ${index < FUND_RECORDS.length - 1 ? "gap-4" : ""}`}
            >
              <FundRecordRow {...record} />
              {index < FUND_RECORDS.length - 1 ? <RowDivider /> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RowDivider() {
  return (
    <div className="relative h-0 w-full shrink-0">
      <AppImage
        src={mineAssets.fundDividerRow}
        alt=""
        width={327}
        height={1}
        className="absolute inset-x-0 top-0 h-px w-full"
      />
    </div>
  );
}

function FundRecordRow({
  title,
  currency,
  time,
  amount,
  amountTone,
  balance,
}: FundRecord) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex w-[106px] shrink-0 flex-col gap-0.5 leading-normal">
        <p className="text-sm font-semibold text-[#333]">{title}</p>
        <p className="text-xs text-[#9e6f6f]">{currency}</p>
        <p className="text-xs text-[#707070]">{time}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-3 text-right">
        <p
          className={`font-[family-name:var(--font-mulish)] text-base font-semibold leading-normal whitespace-nowrap ${
            amountTone === "positive" ? "text-[#ea4747]" : "text-[#129a48]"
          }`}
        >
          {amount}
        </p>
        <p className="text-xs leading-none text-[#707070]">{balance}</p>
      </div>
    </div>
  );
}
