"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr: false prevents SSR window/AudioContext crashes on Vercel
const MarNostocEditor = dynamic(() => import("@/components/MarNostocEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#08080a] text-cyan-400">
      <div className="w-9 h-9 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
      <span className="text-xs font-bold tracking-widest uppercase">
        Initializing Mar Nostoc Editor...
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col overflow-hidden bg-[#08080a]">
      <MarNostocEditor />
    </main>
  );
}