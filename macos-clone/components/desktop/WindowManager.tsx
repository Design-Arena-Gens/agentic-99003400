"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useDesktop } from "./DesktopContext";
import type { AppID, AppWindowState } from "@/lib/types";
import WindowShell from "./WindowShell";

type WindowComponent = React.ComponentType<{ windowState: AppWindowState }>;

const FinderApp = dynamic(() => import("../apps/FinderApp")) as WindowComponent;
const SafariApp = dynamic(() => import("../apps/SafariApp")) as WindowComponent;
const NotesApp = dynamic(() => import("../apps/NotesApp")) as WindowComponent;
const CalendarApp = dynamic(
  () => import("../apps/CalendarApp"),
) as WindowComponent;
const MailApp = dynamic(() => import("../apps/MailApp")) as WindowComponent;
const PhotosApp = dynamic(() => import("../apps/PhotosApp")) as WindowComponent;
const TerminalApp = dynamic(
  () => import("../apps/TerminalApp"),
) as WindowComponent;
const SettingsApp = dynamic(
  () => import("../apps/SettingsApp"),
) as WindowComponent;
const MusicApp = dynamic(() => import("../apps/MusicApp")) as WindowComponent;
const MessagesApp = dynamic(
  () => import("../apps/MessagesApp"),
) as WindowComponent;
const PreviewApp = dynamic(
  () => import("../apps/PreviewApp"),
) as WindowComponent;

const APP_COMPONENTS: Record<AppID, WindowComponent> = {
  finder: FinderApp,
  safari: SafariApp,
  notes: NotesApp,
  calendar: CalendarApp,
  mail: MailApp,
  photos: PhotosApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  music: MusicApp,
  messages: MessagesApp,
  preview: PreviewApp,
};

export default function WindowManager() {
  const { windows } = useDesktop();

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {sortedWindows.map((windowItem) => {
        const Component = APP_COMPONENTS[windowItem.appId];
        if (!Component) {
          return null;
        }
        return (
          <WindowShell key={windowItem.id} windowItem={windowItem}>
            <Component windowState={windowItem} />
          </WindowShell>
        );
      })}
    </div>
  );
}
