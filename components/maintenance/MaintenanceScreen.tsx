import { AppImage } from "@/components/AppImage";
import { maintenanceAssets } from "./assets";

/**
 * 网站维护中全屏页 — 对齐 Figma 722:390（375×812）
 * 无顶栏/底栏，用于维护模式或 /maintenance 路由
 */
export function MaintenanceScreen() {
  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden bg-white md:mx-auto md:my-8 md:h-auto md:min-h-[812px] md:max-w-[430px] md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
      <AppImage
        src={maintenanceAssets.background}
        alt=""
        width={375}
        height={812}
        priority
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />

      <div className="relative flex h-full min-h-0 flex-col items-center px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-[max(env(safe-area-inset-top),79px)] md:min-h-[812px] md:pt-[79px]">
        <div className="relative h-[69px] w-[183px] shrink-0 overflow-hidden">
          <AppImage
            src={maintenanceAssets.logo}
            alt="Aulong"
            width={183}
            height={69}
            priority
            className="absolute max-w-none"
            style={{
              height: "161.39%",
              width: "125.34%",
              left: "-16.98%",
              top: "-29.7%",
            }}
          />
        </div>

        <div className="relative mt-[39px] size-[158px] shrink-0">
          <AppImage
            src={maintenanceAssets.illustration}
            alt=""
            width={158}
            height={158}
            priority
            className="size-full object-contain"
          />
        </div>

        <h1 className="mt-[53px] text-center font-[family-name:var(--font-noto-sc-black)] text-2xl font-black leading-normal text-black">
          <span className="block">Sorry! We&apos;re under</span>
          <span className="block">maintenance!</span>
        </h1>

        <p className="mt-[26px] max-w-[327px] text-center text-sm leading-normal text-black">
          <span className="block">Our platform is currently undergoing</span>
          <span className="block">scheduled maintenance.</span>
          <span className="block">
            We&apos;ll be back soon. Thank you for your patience.
          </span>
        </p>
      </div>
    </div>
  );
}
