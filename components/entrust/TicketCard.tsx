import { entrustAssets } from "./assets";
import { AppImage } from "@/components/AppImage";
import { ImageButton } from "./ImageButton";

export function TicketCard() {
  return (
    <section className="relative h-[180px] w-full overflow-hidden rounded-[12px] border border-white bg-linear-to-b from-white/45 to-white/90 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="relative z-10 flex w-full min-w-0 flex-col gap-[10px]">
        <div className="relative flex w-full min-w-0 flex-col gap-[5px]">
          <div className="flex h-[27px] w-[129px] items-center gap-[3px] overflow-hidden">
            <AppImage
              src={entrustAssets.ticketIcon}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 object-cover"
            />
            <span className="text-base font-semibold leading-[22px] text-black">
              购买门票
            </span>
            <div className="relative h-5 w-[21px] shrink-0 overflow-hidden">
              <AppImage
                src={entrustAssets.hot}
                alt=""
                width={21}
                height={20}
                className="absolute left-0 top-[-2.9%] h-[105.8%] w-full max-w-none"
              />
            </div>
          </div>

          <button
            type="button"
            className="absolute right-0 top-1 flex w-[74px] items-center justify-end"
          >
            <span className="text-xs leading-[19px] text-[#ffe6d9]">规则说明</span>
            <AppImage
              src={entrustAssets.rulesArrow}
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
          </button>

          <div className="flex flex-col gap-[3px]">
            <p className="text-black">
              <span className="font-[family-name:var(--font-mulish)] text-[38px] font-bold leading-[19px]">
                0.03{" "}
              </span>
              <span className="text-sm leading-[19px]">BNB</span>
            </p>
            <p className="text-sm leading-[19px] text-black">
              花费0.03BNB，可获取1000x币的空投
            </p>
          </div>
        </div>

        <ImageButton variant="whitelist" className="mt-2">
          购买白名单
        </ImageButton>
      </div>

      <div className="pointer-events-none absolute -right-16 top-0 size-[219px] opacity-60">
        <AppImage
          src={entrustAssets.ticketDeco}
          alt=""
          width={219}
          height={219}
          className="size-full object-cover"
        />
      </div>
    </section>
  );
}
