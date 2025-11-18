"use client";

import { useEffect, useMemo, useState } from "react";
import { useDesktop } from "./DesktopContext";
import type { AppID } from "@/lib/types";

const APP_MENUS: Record<AppID | "apple", string[]> = {
  apple: ["About This Mac", "System Settings", "App Store", "Recent Items"],
  finder: [
    "About Finder",
    "Preferences",
    "Empty Trash",
    "Services",
    "Hide Finder",
  ],
  safari: [
    "About Safari",
    "Preferences",
    "Clear History",
    "Hide Safari",
    "Quit Safari",
  ],
  notes: ["About Notes", "Preferences", "Accounts", "Hide Notes", "Quit Notes"],
  calendar: ["About Calendar", "Preferences", "Accounts", "Hide Calendar"],
  mail: ["About Mail", "Preferences", "Accounts", "Add Account…", "Hide Mail"],
  photos: ["About Photos", "Preferences", "Accounts", "Hide Photos"],
  terminal: ["About Terminal", "Preferences", "Secure Keyboard Entry", "Services"],
  settings: ["About System Settings", "Preferences", "Accounts"],
  music: ["About Music", "Preferences", "Hide Music", "Quit Music"],
  messages: ["About Messages", "Preferences", "Accounts", "Hide Messages"],
  preview: ["About Preview", "Preferences", "Hide Preview", "Quit Preview"],
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDate = (date: Date) =>
  date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function MenuBar() {
  const {
    apps,
    activeAppId,
    openApp,
    setSpotlightOpen,
    notifications,
    settings,
  } = useDesktop();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const appName = useMemo(() => {
    return (
      apps.find((app) => app.id === activeAppId)?.name ?? "Finder"
    );
  }, [activeAppId, apps]);

  const menuItems = useMemo(() => {
    const currentMenu = APP_MENUS[activeAppId ?? "finder"];
    return currentMenu ?? ["About This App"];
  }, [activeAppId]);

  return (
    <header className="relative z-20 flex h-10 flex-none items-center justify-between bg-black/40 px-3 text-[13px] font-medium backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          className="rounded px-2 py-1 text-white/90 transition hover:bg-white/10"
          onClick={() => openApp("finder")}
        >
          
        </button>
        <span className="text-white">{appName}</span>
        <nav className="hidden items-center gap-3 lg:flex">
          {menuItems.map((item) => (
            <button
              key={item}
              className="rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 text-white/80">
        <button
          className="rounded px-3 py-1 transition hover:bg-white/10 hover:text-white"
          onClick={() => openApp("settings")}
        >
          ☰
        </button>
        <button
          className="rounded px-3 py-1 transition hover:bg-white/10 hover:text-white"
          onClick={() => setSpotlightOpen(true)}
        >
          🔍
        </button>
        <span className="rounded px-2 py-1">
          {notifications.length > 0 ? "🔔" : "🔕"}
        </span>
        <div className="flex flex-col items-end leading-tight text-right text-white">
          <span>{formatTime(clock)}</span>
          <span className="text-[11px] text-white/70">{formatDate(clock)}</span>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded px-3 py-1 text-[12px] text-white/80 hover:bg-white/10 sm:flex">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          {settings.users.currentUser}
        </div>
      </div>
    </header>
  );
}
