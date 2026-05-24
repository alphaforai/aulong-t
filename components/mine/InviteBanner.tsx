import { EntrustImg } from "@/components/entrust/EntrustImg";
import { mineAssets } from "./assets";

export function InviteBanner() {
  return (
    <section className="relative h-[88px] w-full shrink-0 overflow-hidden rounded-[12px] border border-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="absolute inset-0 overflow-hidden rounded-[12px] backdrop-blur-[7px]">
        <EntrustImg
          src={mineAssets.inviteBannerBg}
          alt=""
          width={351}
          height={88}
          className="absolute max-w-none"
          style={{
            height: "152%",
            width: "114.57%",
            left: "-7.41%",
            top: "-25%",
          }}
        />
      </div>

      <div className="relative z-10 ml-[120px] mt-[17px]">
        <h2 className="-skew-x-[10deg] font-[family-name:var(--font-noto-sc-black)] text-[32px] font-black leading-normal text-black">
          <span>邀请</span>
          <span className="text-[#f82a2a]">好友</span>
        </h2>
        <p className="mt-1 text-[10px] leading-normal tracking-[0.5px] text-[#8b8b8b]">
          专属邀请奖励,分享链接赢福利
        </p>
      </div>
    </section>
  );
}