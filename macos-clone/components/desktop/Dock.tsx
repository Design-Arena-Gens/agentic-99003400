"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "./DesktopContext";
import type { AppID } from "@/lib/types";
import clsx from "clsx";

interface DockProps {
  wallpaperOptions: { id: string; name: string; url: string }[];
}

export default function Dock({ wallpaperOptions }: DockProps) {
  const {
    apps,
    windows,
    openApp,
    minimizeWindow,
    focusWindow,
    setSettings,
    settings,
    setWallpaper,
  } = useDesktop();
  const [hoveredApp, setHoveredApp] = useState<AppID | null>(null);

  const runningApps = useMemo(() => {
    const map = new Map<AppID, boolean>();
    for (const win of windows) {
      map.set(win.appId, !win.minimized);
    }
    return map;
  }, [windows]);

  const dockSize = settings.appearance.dockSize;
  const iconDimension = Math.round(dockSize * 0.7);

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex items-end gap-2 rounded-3xl bg-black/40 px-5 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {apps.map((app) => {
          const isRunning = runningApps.get(app.id) ?? false;
          const isHovered = hoveredApp === app.id;
          const appWindows = windows.filter((win) => win.appId === app.id);
          const openWindow = appWindows[0];
          return (
            <button
              key={app.id}
              className={clsx(
                "flex flex-col items-center text-xs text-white/80 transition-transform",
                isHovered && "scale-110",
              )}
              style={{ width: iconDimension, alignItems: "center" }}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
              onClick={() => {
                if (isRunning && openWindow) {
                  if (openWindow.minimized) {
                    focusWindow(openWindow.id);
                  } else {
                    minimizeWindow(openWindow.id);
                  }
                } else {
                  openApp(app.id);
                }
              }}
            >
              <span
                className={clsx(
                  "mb-2 flex items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg shadow-black/30 transition",
                  app.accent || "from-slate-600 to-slate-800",
                )}
                style={{
                  width: iconDimension,
                  height: iconDimension,
                }}
              >
                <span
                  className={clsx(
                    "flex items-center justify-center rounded-2xl bg-white/10 text-2xl",
                  )}
                  style={{
                    width: iconDimension - 12,
                    height: iconDimension - 12,
                  }}
                >
                  {app.icon}
                </span>
              </span>
              <span className="text-[11px] text-white/80">{app.name}</span>
              {isRunning && <span className="mt-1 h-1 w-1 rounded-full bg-white" />}
            </button>
          );
        })}
        <div className="mx-4 hidden h-12 w-px bg-white/20 sm:block" />
        <div className="hidden flex-col gap-2 text-[11px] text-white/70 sm:flex">
          <div className="flex items-center gap-2">
            <label htmlFor="dock-size" className="whitespace-nowrap">
              Dock size
            </label>
            <input
              id="dock-size"
              type="range"
              min={72}
              max={132}
              value={dockSize}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  appearance: {
                    ...prev.appearance,
                    dockSize: Number(event.target.value),
                  },
                }))
              }
              className="accent-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {wallpaperOptions.map((option) => (
              <button
                key={option.id}
                className="h-8 w-12 overflow-hidden rounded-lg border border-white/20 shadow hover:ring-2 hover:ring-white/80"
                onClick={() => {
                  setWallpaper(option.url);
                  setSettings((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      wallpaper: option.url,
                    },
                  }));
                }}
              >
                <span
                  className="block h-full w-full"
                  style={{
                    backgroundImage: option.url.startsWith("http")
                      ? `url(${option.url})`
                      : option.url,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
