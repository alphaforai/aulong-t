import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Mulish,
  Noto_Sans,
  Noto_Sans_SC,
} from "next/font/google";
import { Provider } from "@/components/Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

/** 横幅标题用，接近 Figma HYYakuHei 85W */
const notoSansScBlack = Noto_Sans_SC({
  variable: "--font-noto-sc-black",
  subsets: ["latin"],
  weight: "900",
});

/** 越南语 / 马来语正文与标题（拉丁 + 越南文声调） */
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://aulong.australianlobster.xyz"),
    title: "Aulong",
    description:
      "Aulong Official website",
    openGraph: {
      title: "Aulong Official website",
      description:
        "Aulong description",
      images: ["/assets/entrust/logo.png"],
      siteName: "Aulong Official website",
      type: "website",
    },
    icons: {
      icon: "/assets/entrust/logo.png",
    },
  };

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${notoSansScBlack.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white md:bg-[#f5f5f5]">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
