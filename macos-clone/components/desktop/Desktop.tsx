"use client";

import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DesktopContext } from "./DesktopContext";
import { APP_DEFINITIONS } from "@/data/apps";
import {
  DEFAULT_EVENTS,
  DEFAULT_FINDER_FILES,
  DEFAULT_MAIL,
  DEFAULT_MESSAGES,
  DEFAULT_NOTES,
  DEFAULT_PHOTOS,
  DEFAULT_PLAYLISTS,
  DEFAULT_TABS,
  DEFAULT_DOCUMENTS,
} from "@/data/system";
import type {
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
import MenuBar from "./MenuBar";
import DesktopCanvas from "./DesktopCanvas";
import Dock from "./Dock";
import WindowManager from "./WindowManager";
import SpotlightOverlay from "./SpotlightOverlay";
import NotificationCenter from "./NotificationCenter";

const WALLPAPERS = [
  {
    id: "ventura",
    name: "Ventura",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "sonoma",
    name: "Sonoma",
    url: "https://images.unsplash.com/photo-1600585154340-0ef3c08dcdb6?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "aurora",
    name: "Aurora",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "graphite",
    name: "Graphite",
    url: "linear-gradient(135deg, #0f172a, #1e293b, #020617)",
  },
];

const INITIAL_SETTINGS: SettingsState = {
  appearance: {
    wallpaper: WALLPAPERS[0]?.url ?? "",
    theme: "light",
    dockSize: 100,
  },
  display: {
    resolution: "2560 x 1600",
    brightness: 75,
    nightShift: false,
  },
  sound: {
    output: "Studio Display Speakers",
    input: "MacBook Pro Microphone",
    volume: 68,
    mute: false,
  },
  network: {
    wifiEnabled: true,
    selectedNetwork: "Design Lab",
    hotspotEnabled: false,
  },
  users: {
    currentUser: "Agentic",
    autoLogin: true,
  },
  accessibility: {
    voiceOver: false,
    zoom: false,
    increasedContrast: false,
  },
  updates: {
    autoUpdate: true,
    betaUpdates: false,
    lastChecked: "Today, 8:12 AM",
  },
};

const randomId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

interface DesktopDimensions {
  width: number;
  height: number;
}

const getViewport = (): DesktopDimensions => ({
  width: typeof window !== "undefined" ? window.innerWidth : 1440,
  height: typeof window !== "undefined" ? window.innerHeight : 900,
});

const clampWindow = (
  position: WindowPosition,
  size: WindowSize,
  viewport: DesktopDimensions,
): WindowPosition => {
  const padding = 16;
  const maxX = Math.max(viewport.width - size.width - padding, padding);
  const maxY = Math.max(viewport.height - size.height - padding, padding + 44);
  return {
    x: Math.min(Math.max(position.x, padding), maxX),
    y: Math.min(Math.max(position.y, padding + 28), maxY),
  };
};

export default function Desktop() {
  const [windows, setWindows] = useState<AppWindowState[]>([]);
  const [activeAppId, setActiveAppId] = useState<AppID | null>(null);
  const [viewport, setViewport] = useState<DesktopDimensions>(getViewport());
  const [settings, setSettings] =
    useState<SettingsState>(INITIAL_SETTINGS);
  const [finderFiles, setFinderFiles] =
    useState<FinderFile[]>(DEFAULT_FINDER_FILES);
  const [notes, setNotes] = useState<NoteEntry[]>(DEFAULT_NOTES);
  const [safariTabs, setSafariTabs] = useState<SafariTab[]>(DEFAULT_TABS);
  const [mail, setMail] = useState<MailMessage[]>(DEFAULT_MAIL);
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [messages, setMessages] = useState<MessageThread[]>(DEFAULT_MESSAGES);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>(DEFAULT_PLAYLISTS);
  const [documents, setDocuments] =
    useState<PreviewDocument[]>(DEFAULT_DOCUMENTS);
  const [terminalSessions, setTerminalSessions] = useState<
    Record<string, TerminalSession>
  >({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(
    INITIAL_SETTINGS.appearance.wallpaper,
  );

  const zCounter = useRef(10);
  const positionSeed = useRef({ x: 120, y: 120 });

  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewport());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === "Space") {
        event.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "m") {
        const activeWindow = [...windows]
          .sort((a, b) => b.zIndex - a.zIndex)
          .find((windowItem) => !windowItem.minimized);
        if (activeWindow) {
          setWindows((prev) =>
            prev.map((windowItem) =>
              windowItem.id === activeWindow.id
                ? { ...windowItem, minimized: true }
                : windowItem,
            ),
          );
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [windows]);

  const focusWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === windowId
          ? {
              ...windowItem,
              minimized: false,
              hidden: false,
              zIndex: zCounter.current++,
            }
          : windowItem,
      ),
    );
    const target = windows.find((win) => win.id === windowId);
    if (target) {
      setActiveAppId(target.appId);
    }
  }, [windows]);

  const openApp = useCallback(
    (appId: AppID, options?: Partial<AppWindowState>) => {
      const app = APP_DEFINITIONS.find((item) => item.id === appId);
      if (!app) {
        throw new Error(`Unknown app: ${appId}`);
      }

      let existingWindowId: string | null = null;
      if (app.singleton) {
        const existing = windows.find((windowItem) => windowItem.appId === appId);
        if (existing) {
          focusWindow(existing.id);
          existingWindowId = existing.id;
        }
      }

      if (existingWindowId) {
        return existingWindowId;
      }

      const windowId = randomId("window");
      const size = options?.size ?? app.defaultSize;
      const position = clampWindow(
        {
          x: options?.position?.x ?? positionSeed.current.x,
          y: options?.position?.y ?? positionSeed.current.y,
        },
        size,
        viewport,
      );

      positionSeed.current = {
        x: positionSeed.current.x + 28,
        y: positionSeed.current.y + 24,
      };
      if (positionSeed.current.x > viewport.width - 200) {
        positionSeed.current.x = 120;
      }
      if (positionSeed.current.y > viewport.height - 200) {
        positionSeed.current.y = 120;
      }

      const newWindow: AppWindowState = {
        id: windowId,
        appId,
        title: options?.title ?? app.name,
        position,
        size,
        minimized: false,
        maximized: false,
        hidden: false,
        zIndex: zCounter.current++,
        createdAt: Date.now(),
      };

      setWindows((prev) => [...prev, newWindow]);
      setActiveAppId(appId);
      return windowId;
    },
    [focusWindow, viewport, windows],
  );

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((windowItem) => windowItem.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === windowId
          ? { ...windowItem, minimized: true }
          : windowItem,
      ),
    );
  }, []);

  const toggleFullscreen = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === windowId
          ? { ...windowItem, maximized: !windowItem.maximized }
          : windowItem,
      ),
    );
  }, []);

  const updateWindowPosition = useCallback(
    (windowId: string, position: WindowPosition) => {
      setWindows((prev) =>
        prev.map((windowItem) =>
          windowItem.id === windowId
            ? {
                ...windowItem,
                position: clampWindow(position, windowItem.size, viewport),
              }
            : windowItem,
        ),
      );
    },
    [viewport],
  );

  const updateWindowSize = useCallback(
    (windowId: string, size: WindowSize) => {
      const minWidth = 380;
      const minHeight = 280;
      const nextSize = {
        width: Math.max(size.width, minWidth),
        height: Math.max(size.height, minHeight),
      };
      setWindows((prev) =>
        prev.map((windowItem) =>
          windowItem.id === windowId
            ? {
                ...windowItem,
                size: nextSize,
              }
            : windowItem,
        ),
      );
    },
    [],
  );

  const pushNotification = useCallback(
    (notification: {
      title: string;
      body: string;
      appId: AppID;
      timestamp?: number;
    }) => {
      const item: NotificationItem = {
        id: randomId("notification"),
        title: notification.title,
        body: notification.body,
        appId: notification.appId,
        timestamp: notification.timestamp ?? Date.now(),
      };
      setNotifications((prev) => [item, ...prev]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((current) => current.id !== item.id),
        );
      }, 8000);
    },
    [],
  );

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
  }, []);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }
  }, [notifications]);

  useEffect(() => {
    setWallpaper(settings.appearance.wallpaper);
  }, [settings.appearance.wallpaper]);

  useEffect(() => {
    const topWindow = [...windows].sort(
      (a, b) => b.zIndex - a.zIndex,
    )[0];
    setActiveAppId(topWindow?.appId ?? null);
  }, [windows]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      openApp("finder");
      openApp("safari", {
        position: { x: 340, y: 180 },
      } as Partial<AppWindowState>);
      openApp("notes", {
        position: { x: 560, y: 240 },
      } as Partial<AppWindowState>);
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({
      apps: APP_DEFINITIONS,
      windows,
      activeAppId,
      openApp,
      focusWindow,
      closeWindow,
      minimizeWindow,
      toggleFullscreen,
      updateWindowPosition,
      updateWindowSize,
      settings,
      setSettings,
      finderFiles,
      setFinderFiles,
      notes,
      setNotes,
      safariTabs,
      setSafariTabs,
      mail,
      setMail,
      events,
      setEvents,
      photos,
      setPhotos,
      messages,
      setMessages,
      playlists,
      setPlaylists,
      documents,
      setDocuments,
      terminalSessions,
      setTerminalSessions,
      notifications,
      pushNotification,
      dismissNotification,
      spotlightOpen,
      setSpotlightOpen,
      wallpaper,
      setWallpaper,
    }),
    [
      activeAppId,
      closeWindow,
      dismissNotification,
      events,
      finderFiles,
      focusWindow,
      mail,
      messages,
      minimizeWindow,
      notes,
      notifications,
      openApp,
      photos,
      playlists,
      documents,
      pushNotification,
      safariTabs,
      settings,
      spotlightOpen,
      terminalSessions,
      toggleFullscreen,
      updateWindowPosition,
      updateWindowSize,
      wallpaper,
      windows,
    ],
  );

  const wallpaperStyle =
    wallpaper.startsWith("http") || wallpaper.startsWith("https")
      ? {
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundImage: wallpaper,
        };

  return (
    <DesktopContext.Provider value={contextValue}>
      <div className="relative h-full w-full overflow-hidden font-[var(--font-sans)] text-sm text-white">
        <div
          className="absolute inset-0 transition-all duration-500"
          style={wallpaperStyle as React.CSSProperties}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="relative z-10 flex h-full w-full flex-col">
          <MenuBar />
          <DesktopCanvas />
          <WindowManager />
          <Dock wallpaperOptions={WALLPAPERS} />
          <SpotlightOverlay />
          <NotificationCenter />
        </div>
      </div>
    </DesktopContext.Provider>
  );
}
