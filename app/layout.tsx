import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mar Nostoc Editor - Pro Studio",
  description: "Next-Generation Client-Side Video Suite with VFX, Keyframes, Audio Synthesis, and Transitions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#08080a] text-white">
        {children}
      </body>
    </html>
  );
}