import { entrustAssets } from "./assets";
import { EntrustImg } from "./EntrustImg";

export function TopBar() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-center px-3">
      <div className="flex h-14 w-full max-w-[351px] items-center justify-between">
        <div className="relative h-11 w-[115px] overflow-hidden">
          <EntrustImg
            src={entrustAssets.logo}
            alt="Aulong"
            width={144}
            height={71}
            className="absolute max-w-none"
            style={{
              height: "161.39%",
              width: "125.34%",
              left: "-16.98%",
              top: "-29.7%",
            }}
            priority
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="切换语言"
            className="relative grid size-[30px] place-items-center"
          >
            <EntrustImg
              src={entrustAssets.langGlow}
              alt=""
              width={30}
              height={30}
              className="col-start-1 row-start-1 size-[30px] scale-[2.8] object-contain"
            />
            <EntrustImg
              src={entrustAssets.langIcon}
              alt=""
              width={22}
              height={22}
              className="col-start-1 row-start-1 ml-1 mt-1"
            />
          </button>

          <button
            type="button"
            className="flex h-[30px] w-[108px] items-center justify-center gap-[5px] rounded-[7px] border border-black/20 px-3 py-2"
          >
            <EntrustImg
              src={entrustAssets.walletDot}
              alt=""
              width={7}
              height={7}
              className="shrink-0"
            />
            <span className="text-sm leading-5 tracking-[0.1px] text-[#141414]">
              0x71...05
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
