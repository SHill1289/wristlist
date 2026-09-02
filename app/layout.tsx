import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wristlist | Collect watches, not charges",
  description: "A fantasy watch collecting experience. Discover, acquire, and curate without spending real money.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
