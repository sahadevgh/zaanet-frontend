import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProvidersConfig from "./ProvidersConfig";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZaaNet",
  description: "Decentralized WiFi Sharing Platform",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {
  const cookie = (await headers()).get("cookie") || null; // Handle null case
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ProvidersConfig cookie={cookie}>{children}</ProvidersConfig>
      </body>
    </html>
  );
}