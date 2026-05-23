import { EntrustImg } from "@/components/entrust/EntrustImg";
import { navAssets, type NavTabId } from "./assets";

type NavIconProps = {
  tab: NavTabId;
  active?: boolean;
};

export function NavIcon({ tab, active = false }: NavIconProps) {
  if (!active) {
    const src = NAV_INACTIVE[tab];
    return (
      <EntrustImg src={src} alt="" width={24} height={24} className="size-6 shrink-0" />
    );
  }

  switch (tab) {
    case "earnings":
      return (
        <div className="relative size-6 shrink-0 overflow-hidden">
          <EntrustImg
            src={navAssets.earningsActiveBottom}
            alt=""
            width={24}
            height={24}
            className="absolute inset-0 size-full max-w-none object-contain"
          />
          <EntrustImg
            src={navAssets.earningsActiveTop}
            alt=""
            width={24}
            height={24}
            className="absolute inset-0 size-full max-w-none object-contain"
          />
        </div>
      );
    case "entrust":
      return (
        <div className="relative size-6 shrink-0 overflow-hidden">
          <EntrustImg
            src={navAssets.entrustActive}
            alt=""
            width={29}
            height={28}
            className="absolute max-w-none"
            style={{
              height: "114.58%",
              width: "120.83%",
              left: "6.5%",
              top: "9.33%",
            }}
          />
        </div>
      );
    case "mine":
      return (
        <EntrustImg
          src={navAssets.mineActive}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      );
    case "team":
      return (
        <EntrustImg
          src={navAssets.teamActive}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      );
    default:
      return null;
  }
}

const NAV_INACTIVE: Record<NavTabId, string> = {
  entrust: navAssets.entrustInactive,
  earnings: navAssets.earningsInactive,
  mine: navAssets.mineInactive,
  team: navAssets.teamInactive,
};
