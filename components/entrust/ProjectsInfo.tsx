"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { entrustAssets } from "./assets";
import { mineAssets } from "@/components/mine/assets";
import { teamAssets } from "@/components/team/assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";

export type ProjectsInfoProps = {
  open: boolean;
  onClose: () => void;
};

type InfoRow = {
  title: string;
  href: string;
  iconSrc?: string;
  iconBgSrc?: string;
  iconOverlaySrc?: string;
  iconOverlayClassName?: string;
  iconWrapperClassName?: string;
};

const SECTION_UNDERLINE =
  "mt-1 h-[5px] w-[44px] rounded-[21px] bg-gradient-to-b from-[#ff3636] to-[#c80000]";

const projectLinks = {
  youtube: "https://www.youtube.com/@AULONG_AU",
  x: "https://x.com/AUlong_",
  telegram: "https://t.me/AUlong_agent",
  paragraph:
    "https://paragraph.com/@reploglejasline@gmail.com?modal=subscribe",
  dapp: "https://www.aulong.pro/",
  linktree: "https://linktr.ee/AULONG_AU",
  driveZh:
    "https://drive.google.com/drive/folders/1QXVv1aM8AKSVbvqQG2YJTGzp4LCp4PG5?usp=drive_link",
  driveEn:
    "https://drive.google.com/drive/folders/1IIcgz5QXd1xxFyGL6VZZ4feeMoiAISko?usp=drive_link",
  driveVi:
    "https://drive.google.com/drive/folders/1NfWXqByj6LQ5qgGDaOqGv4Kyvkiqs4xI?usp=drive_link",
  driveKo:
    "https://drive.google.com/drive/folders/1Bg9_CDTjtPbFLus9WGRJzbip3EEnK8AH?usp=drive_link",
  notionZh:
    "https://www.notion.so/AULONG-36e682ba8895807087ecf0d277871463?source=copy_link",
  notionEn:
    "https://www.notion.so/AULONG-English-PACT-Database-36e682ba88958050893ee289a6453f1c?source=copy_link",
  notionKo:
    "https://app.notion.com/p/AULONG-36e682ba889580c88f84df889be19fa4?source=copy_link",
  notionVi:
    "https://app.notion.com/p/AULONG-C-s-d-li-u-ti-ng-Vi-t-36e682ba8895802a967edf3a0dd2e1a0?source=copy_link",
} as const;

export function ProjectsInfo({ open, onClose }: ProjectsInfoProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  if (!open) return null;

  const socialRows: InfoRow[] = [
    {
      title: t("entrust.projectsInfo.socialYoutube"),
      iconSrc: entrustAssets.projectsSocialYoutube,
      href: projectLinks.youtube,
    },
    {
      title: t("entrust.projectsInfo.socialX"),
      iconSrc: entrustAssets.projectsSocialX,
      href: projectLinks.x,
    },
    {
      title: t("entrust.projectsInfo.socialTelegram"),
      iconSrc: entrustAssets.projectsSocialTelegram,
      href: projectLinks.telegram,
    },
    {
      title: t("entrust.projectsInfo.socialParagraph"),
      iconSrc: entrustAssets.projectsSocialParagraph,
      href: projectLinks.paragraph,
    },
    {
      title: t("entrust.projectsInfo.socialDapp"),
      iconSrc: entrustAssets.projectsSocialDapp,
      href: projectLinks.dapp,
    },
    {
      title: t("entrust.projectsInfo.socialLinktree"),
      iconSrc: entrustAssets.projectsSocialLinktree,
      href: projectLinks.linktree,
    },
  ];

  const aboutRows: InfoRow[] = [
    {
      title: t("entrust.projectsInfo.aboutDriveZh"),
      iconSrc: entrustAssets.projectsAboutDrive,
      href: projectLinks.driveZh,
    },
    {
      title: t("entrust.projectsInfo.aboutDriveEn"),
      iconSrc: entrustAssets.projectsAboutDrive,
      href: projectLinks.driveEn,
    },
    {
      title: t("entrust.projectsInfo.aboutDriveKo"),
      iconSrc: entrustAssets.projectsAboutDrive,
      href: projectLinks.driveKo,
    },
    {
      title: t("entrust.projectsInfo.aboutDriveVi"),
      iconSrc: entrustAssets.projectsAboutDrive,
      href: projectLinks.driveVi,
    },
    {
      title: t("entrust.projectsInfo.aboutNotionZh"),
      iconSrc: entrustAssets.projectsAboutNotion,
      href: projectLinks.notionZh,
      iconWrapperClassName: "rounded-full",
    },
    {
      title: t("entrust.projectsInfo.aboutNotionEn"),
      iconSrc: entrustAssets.projectsAboutNotion,
      href: projectLinks.notionEn,
      iconWrapperClassName: "rounded-full",
    },
    {
      title: t("entrust.projectsInfo.aboutNotionKo"),
      iconSrc: entrustAssets.projectsAboutNotion,
      href: projectLinks.notionKo,
      iconWrapperClassName: "rounded-full",
    },
    {
      title: t("entrust.projectsInfo.aboutNotionVi"),
      iconSrc: entrustAssets.projectsAboutNotion,
      href: projectLinks.notionVi,
      iconWrapperClassName: "rounded-full",
    },
  ];

  return (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="projects-info-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`absolute inset-0 isolate flex w-full flex-col bg-[#f7eff1] transition-transform duration-300 ease-out ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entrustAssets.projectsHeroBg}
              alt=""
              className="absolute left-1/2 top-0 h-auto min-h-full w-full -translate-x-1/2 object-cover object-top"
            />
          </div>

          <div className="relative z-20 h-11 shrink-0 bg-white" aria-hidden />
          <div className="relative z-30">
            <AulongHeader />
          </div>

          <header className="relative z-20 flex h-12 shrink-0 items-center justify-center bg-white px-3">
            <button
              type="button"
              aria-label={t("common.back")}
              onClick={closePanel}
              className="absolute left-3 flex size-6 items-center justify-center"
            >
              <AppImage
                src={teamAssets.directBack}
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </button>
            <h1
              id="projects-info-title"
              className="text-lg font-medium leading-6 text-[#272727]"
            >
              {t("entrust.projectsInfo.panelTitle")}
            </h1>
          </header>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
            <section className="rounded-[12px] px-0 pb-0 pt-2">
              <div className="relative h-[132px]">
                <div className="relative z-10 max-w-[286px] bg-transparent px-1 pt-[36px]">
                  <h2 className="text-[27.96px] font-semibold leading-[1.02] text-black">
                    <span className="font-black text-[#d81f1f]">
                      {t("entrust.projectsInfo.heroBrand")}
                    </span>{" "}
                    {t("entrust.projectsInfo.heroFinance")}
                  </h2>
                  <p className="mt-0.5 bg-transparent text-[23.3px] font-semibold leading-[1.08] text-black">
                    {t("entrust.projectsInfo.heroSubtitle")}
                  </p>
                  <p className="mt-[6px] text-[12px] font-medium leading-tight text-[#4e4e4e]">
                    {t("entrust.projectsInfo.heroDescPrefix")}{" "}
                    <span className="font-semibold text-[#e02626]">
                      {t("entrust.projectsInfo.heroDescEmphasis")}
                    </span>
                  </p>
                  <div className="mt-2 h-[5px] w-[44px] rounded-[21px] bg-linear-to-b from-[#ff3636] to-[#c80000]" />
                </div>
              </div>

              <FeatureCard
                className="mt-3"
                imageSrc={entrustAssets.projectsFeatureAgentCube}
                iconBgSrc={entrustAssets.projectsFeatureAgentCircle}
                title=""
                content={t("entrust.projectsInfo.featureAgentContent")}
                compactIcon
              />

              <div className="mt-3 grid grid-cols-3 gap-[7px]">
                <MiniRoleCard
                  iconSrc={entrustAssets.projectsRoleUser}
                  title={t("entrust.projectsInfo.roleUserTitle")}
                  bullets={[
                    t("entrust.projectsInfo.roleUserBullet1"),
                    t("entrust.projectsInfo.roleUserBullet2"),
                    t("entrust.projectsInfo.roleUserBullet3"),
                  ]}
                />
                <MiniRoleCard
                  iconSrc={entrustAssets.projectsRoleBrain}
                  title={t("entrust.projectsInfo.roleBrainTitle")}
                  bullets={[
                    t("entrust.projectsInfo.roleBrainBullet1"),
                    t("entrust.projectsInfo.roleBrainBullet2"),
                    t("entrust.projectsInfo.roleBrainBullet3"),
                  ]}
                />
                <MiniRoleCard
                  iconSrc={entrustAssets.projectsRoleOs}
                  title={t("entrust.projectsInfo.roleOsTitle")}
                  bullets={[
                    t("entrust.projectsInfo.roleOsBullet1"),
                    t("entrust.projectsInfo.roleOsBullet2"),
                    t("entrust.projectsInfo.roleOsBullet3"),
                  ]}
                />
              </div>

              <FeatureCard
                className="mt-3"
                imageSrc={entrustAssets.projectsFeatureValue}
                title={t("entrust.projectsInfo.featureValueTitle")}
                content={t("entrust.projectsInfo.featureValueContent")}
              />

              <div className="mt-4 flex items-center justify-center gap-[5px] text-[20px] leading-none">
                <span className="text-[#ff4d4d]">✦</span>
                <p className="text-center text-[22px] font-semibold leading-[1.05] tracking-[-0.01em] text-black">
                  {t("entrust.projectsInfo.joinPrefix")}
                  <span className="text-[#f40000]">
                    {t("entrust.projectsInfo.joinEmphasis")}
                  </span>
                </p>
                <span className="text-[#ff4d4d]">✦</span>
              </div>
              <p className="mt-1 text-center text-[14px] leading-tight text-[#2e2e2e]">
                {t("entrust.projectsInfo.bottomPrefix")}{" "}
                <span className="font-semibold text-[#e60000]">AULONG</span>{" "}
                {t("entrust.projectsInfo.bottomSuffix")}
              </p>
            </section>

            <div className="mt-3 flex flex-col gap-4">
              <InfoListCard
                title={t("entrust.projectsInfo.socialSectionTitle")}
                rows={socialRows}
              />
              <InfoListCard
                title={t("entrust.projectsInfo.aboutSectionTitle")}
                rows={aboutRows}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRoleCard({
  iconSrc,
  title,
  bullets,
}: {
  iconSrc: string;
  title: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-[8px] border border-white bg-white px-2 pb-2 pt-1.5 shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="mx-auto size-[51px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" className="size-full object-contain" />
      </div>
      <p className="mt-1 text-center text-[12px] font-semibold text-black">{title}</p>
      <div className="mx-auto mt-2 h-1 w-6 rounded-[22px] bg-[#ffa2a2]" />
      <ul className="mx-auto mt-[6px] w-fit list-disc pl-4 text-left text-[12px] leading-[1.65] text-[#272727]">
        {bullets.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

function InfoListCard({ title, rows }: { title: string; rows: InfoRow[] }) {
  return (
    <section className="rounded-[12px] border border-white bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="mb-2">
        <h3 className="text-[18px] font-semibold leading-tight text-[#333]">{title}</h3>
        <div className={SECTION_UNDERLINE} />
      </div>
      <ul>
        {rows.map((row, index) => (
          <li key={`${row.title}-${index}`}>
            <button
              type="button"
              onClick={() => window.open(row.href, "_blank", "noopener,noreferrer")}
              className="flex w-full items-center justify-between py-[10px] text-left"
            >
              <div className="flex items-center gap-4">
                <InfoRowIcon row={row} />
                <span className="text-[14px] text-black">{row.title}</span>
              </div>
              <AppImage
                src={mineAssets.pageChevronRight}
                alt=""
                width={12}
                height={12}
                className="size-3"
              />
            </button>
            {index < rows.length - 1 ? (
              <div className="h-px w-full bg-[rgba(0,0,0,0.08)]" />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InfoRowIcon({ row }: { row: InfoRow }) {
  return (
    <span
      className={`relative inline-flex size-[43px] shrink-0 items-center justify-center overflow-hidden rounded-full ${row.iconWrapperClassName ?? ""}`}
    >
      {row.iconBgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.iconBgSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {row.iconOverlaySrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.iconOverlaySrc}
          alt=""
          className={row.iconOverlayClassName ?? "absolute inset-0 size-full object-contain"}
        />
      ) : null}
      {row.iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.iconSrc} alt="" className="size-full object-contain" />
      ) : null}
    </span>
  );
}

function FeatureCard({
  className,
  imageSrc,
  iconBgSrc,
  title,
  content,
  compactIcon = false,
}: {
  className?: string;
  imageSrc: string;
  iconBgSrc?: string;
  title: string;
  content: string;
  compactIcon?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] border border-white bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] ${className ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute left-3 top-3 ${
          compactIcon
            ? "size-[58px]"
            : "h-[108px] w-[109px] top-9"
        }`}
      >
        {compactIcon ? (
          <div className="relative size-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconBgSrc ?? ""}
              alt=""
              className="absolute inset-0 size-full object-contain"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="absolute left-1/2 top-1/2 h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt="" className="size-full object-contain" />
        )}
      </div>
      <div className={compactIcon ? "pl-[80px]" : "pl-[116px] pt-1"}>
        {title ? (
          <h4 className="text-[18px] font-bold text-[#e53030]">
            {title}
          </h4>
        ) : null}
        <p className={`text-[14px] leading-[1.52] text-[#272727] ${title ? "mt-2" : ""}`}>
          {content}
        </p>
      </div>
    </div>
  );
}
