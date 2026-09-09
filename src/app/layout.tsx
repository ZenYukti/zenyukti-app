import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Caveat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif for section/hero headings on the public ZenCard page
// (app/u/[username]) — everything else in the app stays Geist Sans.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

// Handwritten/script accent — the ZenCard sidebar's quote signature only.
// Not used anywhere else in the app.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.zenyukti.in"),
  title: "ZenYukti",
  description: "Learn. Build. Share. — the internal home of ZenYukti.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
