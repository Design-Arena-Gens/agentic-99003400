"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useDesktop } from "./DesktopContext";
import type { AppID } from "@/lib/types";

const DESKTOP_SHORTCUTS: { id: AppID; label: string }[] = [
  { id: "finder", label: "Macintosh HD" },
  { id: "photos", label: "Photos" },
  { id: "notes", label: "Notes" },
  { id: "terminal", label: "Terminal" },
  { id: "music", label: "Music" },
];

export default function DesktopCanvas() {
  const { openApp, photos, notifications } = useDesktop();

  const heroPhoto = useMemo(() => photos[0], [photos]);

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/10" />
      <div className="relative z-10 flex h-full w-full">
        <section className="flex flex-col gap-4 p-6">
          {DESKTOP_SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut.id}
              className="group flex w-28 flex-col items-center rounded-lg border border-white/10 bg-white/5 p-3 text-white/80 shadow-lg backdrop-blur transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              onClick={() => openApp(shortcut.id)}
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                {shortcut.label.slice(0, 1)}
              </span>
              <span className="text-center text-xs">{shortcut.label}</span>
            </button>
          ))}
        </section>
        <section className="ml-auto hidden w-64 flex-col gap-4 p-6 lg:flex">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-wide text-white/60">
              Up Next
            </p>
            <p className="mt-2 text-base text-white">
              Iterate on macOS clone polish
            </p>
            <p className="mt-4 text-sm text-white/70">
              {notifications.length > 0
                ? `${notifications.length} new notifications`
                : "Inbox zero — keep it up!"}
            </p>
          </div>
          {heroPhoto && (
            <button
              className="relative overflow-hidden rounded-3xl border border-white/10 shadow-lg transition hover:scale-[1.02]"
              onClick={() => openApp("photos")}
            >
              <Image
                src={heroPhoto.src}
                alt={heroPhoto.title}
                width={320}
                height={180}
                className="h-32 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
                <p className="text-sm font-semibold text-white">
                  {heroPhoto.title}
                </p>
                <p className="text-xs text-white/70">{heroPhoto.description}</p>
              </div>
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
