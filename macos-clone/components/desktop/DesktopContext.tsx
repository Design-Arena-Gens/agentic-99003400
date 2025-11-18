"use client";

import { createContext, useContext } from "react";
import {
  AppDefinition,
  AppID,
  AppWindowState,
  CalendarEvent,
  FinderFile,
  MailMessage,
  MessageThread,
  MusicPlaylist,
  NoteEntry,
  NotificationItem,
  PhotoItem,
  PreviewDocument,
  SafariTab,
  SettingsState,
  TerminalSession,
  WindowPosition,
  WindowSize,
} from "@/lib/types";

export interface DesktopContextValue {
  apps: AppDefinition[];
  windows: AppWindowState[];
  activeAppId: AppID | null;
  openApp: (appId: AppID, options?: Partial<AppWindowState>) => string;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  toggleFullscreen: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowSize: (windowId: string, size: WindowSize) => void;

  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;

  finderFiles: FinderFile[];
  setFinderFiles: React.Dispatch<React.SetStateAction<FinderFile[]>>;

  notes: NoteEntry[];
  setNotes: React.Dispatch<React.SetStateAction<NoteEntry[]>>;

  safariTabs: SafariTab[];
  setSafariTabs: React.Dispatch<React.SetStateAction<SafariTab[]>>;

  mail: MailMessage[];
  setMail: React.Dispatch<React.SetStateAction<MailMessage[]>>;

  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;

  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;

  messages: MessageThread[];
  setMessages: React.Dispatch<React.SetStateAction<MessageThread[]>>;

  playlists: MusicPlaylist[];
  setPlaylists: React.Dispatch<React.SetStateAction<MusicPlaylist[]>>;

  documents: PreviewDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<PreviewDocument[]>>;

  terminalSessions: Record<string, TerminalSession>;
  setTerminalSessions: React.Dispatch<
    React.SetStateAction<Record<string, TerminalSession>>
  >;

  notifications: NotificationItem[];
  pushNotification: (notification: {
    title: string;
    body: string;
    appId: AppID;
    timestamp?: number;
  }) => void;
  dismissNotification: (notificationId: string) => void;

  spotlightOpen: boolean;
  setSpotlightOpen: (open: boolean) => void;

  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
}

export const DesktopContext = createContext<DesktopContextValue | null>(null);

export const useDesktop = () => {
  const ctx = useContext(DesktopContext);
  if (!ctx) {
    throw new Error("useDesktop must be used within DesktopProvider");
  }
  return ctx;
};
