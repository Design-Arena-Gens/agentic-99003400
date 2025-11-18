"use client";

import { useMemo } from "react";
import { useDesktop } from "./DesktopContext";

export default function NotificationCenter() {
  const { notifications, dismissNotification, apps } = useDesktop();

  const enriched = useMemo(
    () =>
      notifications.map((notification) => {
        const app = apps.find((item) => item.id === notification.appId);
        return {
          ...notification,
          appName: app?.name ?? "System",
          icon: app?.icon ?? "🔔",
        };
      }),
    [apps, notifications],
  );

  return (
    <aside className="pointer-events-none absolute right-4 top-16 z-30 flex w-80 flex-col gap-3">
      {enriched.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-4 text-slate-800 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-lg">{notification.icon}</span>
                <span>{notification.appName}</span>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {notification.body}
              </p>
            </div>
            <button
              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-200"
              onClick={() => dismissNotification(notification.id)}
            >
              Close
            </button>
          </div>
          <div className="mt-3 text-right text-[11px] uppercase tracking-wide text-slate-400">
            {new Date(notification.timestamp).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
