import { Fragment } from "react";
import { EntrustImg } from "@/components/entrust/EntrustImg";
import { earningsAssets } from "./assets";

type Transaction = {
  address: string;
  amount: string;
  currency: string;
  time: string;
};

const TRANSACTIONS: Transaction[] = [
  { address: "0x715523...e605", amount: "+8,858.65", currency: "USDT", time: "2025.5.6 12:22:53" },
  { address: "0x715523...e605", amount: "+8,858.65", currency: "USDT", time: "2025.5.6 12:22:53" },
  { address: "0x715523...e605", amount: "+8,858.65", currency: "USDT", time: "2025.5.6 12:22:53" },
  { address: "0x715523...e605", amount: "+8,858.65", currency: "USDT", time: "2025.5.6 12:22:53" },
  { address: "0x715523...e605", amount: "+588.65", currency: "USDT", time: "2025.5.6 12:22:53" },
  { address: "0x715523...e605", amount: "+588.65", currency: "USDT", time: "2025.5.6 12:22:53" },
];

export function TransactionRecordCard() {
  return (
    <section className="flex h-[436px] w-full min-w-0 flex-col gap-[10px] overflow-hidden rounded-[12px] bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex h-[27px] shrink-0 items-center gap-[3px] overflow-hidden">
        <div className="relative size-[22px] shrink-0 overflow-hidden">
          <EntrustImg
            src={earningsAssets.txIcon}
            alt=""
            width={22}
            height={22}
            className="absolute h-[135.06%] w-[136.84%] max-w-none -left-[18.42%] -top-[16.88%]"
          />
        </div>
        <h2 className="text-base font-semibold leading-[22px] text-black/80">
          交易记录
        </h2>
      </div>

      <RecordDivider />

      {TRANSACTIONS.map((tx, index) => (
        <Fragment key={index}>
          <TransactionRow {...tx} />
          {index < TRANSACTIONS.length - 1 ? <RecordDivider /> : null}
        </Fragment>
      ))}
    </section>
  );
}

function RecordDivider() {
  return (
    <div className="relative h-0 w-full shrink-0">
      <EntrustImg
        src={earningsAssets.txDivider}
        alt=""
        width={327}
        height={1}
        className="absolute inset-x-0 top-0 h-px w-full"
      />
    </div>
  );
}

function TransactionRow({ address, amount, currency, time }: Transaction) {
  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <div className="flex flex-col gap-px">
        <p className="text-xs leading-5 tracking-[0.1px] text-black">{address}</p>
        <div className="flex items-end gap-1.5 leading-normal">
          <span className="font-[family-name:var(--font-mulish)] text-lg font-semibold text-[#138144]">
            {amount}
          </span>
          <span className="text-xs text-black/70">{currency}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-xs leading-normal">
        <span className="text-black">交易时间</span>
        <span className="text-black/70">{time}</span>
      </div>
    </div>
  );
}
