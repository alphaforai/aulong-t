import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance — Aulong",
  description:
    "Aulong is undergoing scheduled maintenance. We will be back soon.",
  robots: { index: false, follow: false },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh min-h-dvh w-full bg-white md:flex md:justify-center md:bg-[#f5f5f5]">
      {children}
    </div>
  );
}
