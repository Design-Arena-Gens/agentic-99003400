"use client";

import { useState } from "react";
import type { SettingsState } from "@/lib/types";
import { useDesktop } from "../desktop/DesktopContext";

const PANES = [
  "General",
  "Appearance",
  "Display",
  "Sound",
  "Network",
  "Users",
  "Accessibility",
  "Software Update",
] as const;

type Pane = (typeof PANES)[number];

export default function SettingsApp() {
  const {
    settings,
    setSettings,
    setSpotlightOpen,
    setWallpaper,
    pushNotification,
  } = useDesktop();
  const [activePane, setActivePane] = useState<Pane>("General");

  const updateSettings = (path: string, value: unknown) => {
    setSettings((prev) => {
      const segments = path.split(".");
      const next: SettingsState = {
        ...prev,
        appearance: { ...prev.appearance },
        display: { ...prev.display },
        sound: { ...prev.sound },
        network: { ...prev.network },
        users: { ...prev.users },
        accessibility: { ...prev.accessibility },
        updates: { ...prev.updates },
      };
      let cursor: Record<string, unknown> = next as unknown as Record<
        string,
        unknown
      >;
      for (let i = 0; i < segments.length - 1; i += 1) {
        const segment = segments[i];
        const currentValue = cursor[segment];
        if (
          typeof currentValue === "object" &&
          currentValue !== null &&
          !Array.isArray(currentValue)
        ) {
          cursor[segment] = {
            ...(currentValue as Record<string, unknown>),
          };
          cursor = cursor[segment] as Record<string, unknown>;
        }
      }
      cursor[segments[segments.length - 1]] = value as unknown;
      return next;
    });
  };

  const renderPane = () => {
    switch (activePane) {
      case "General":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">About</h3>
              <p className="mt-1 text-sm text-slate-500">
                macOS Ventura — Version 14.0 (Agentic build)
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Model Name
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    MacBook Pro (Web Edition)
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Memory
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">32 GB</p>
                </div>
              </div>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Spotlight
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search for anything instantly with ⌘ + Space.
              </p>
              <button
                className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setSpotlightOpen(true)}
              >
                Open Spotlight
              </button>
            </section>
          </div>
        );
      case "Appearance":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Appearance
                  </h3>
                  <p className="text-sm text-slate-500">
                    Choose between light and dark interface styles.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                  <button
                    className={`rounded-full px-3 py-1 text-sm ${settings.appearance.theme === "light" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
                    onClick={() => updateSettings("appearance.theme", "light")}
                  >
                    Light
                  </button>
                  <button
                    className={`rounded-full px-3 py-1 text-sm ${settings.appearance.theme === "dark" ? "bg-slate-900 text-white shadow" : "text-slate-500"}`}
                    onClick={() => updateSettings("appearance.theme", "dark")}
                  >
                    Dark
                  </button>
                </div>
              </header>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="block rounded-3xl border border-slate-200 p-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Wallpaper URL
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={settings.appearance.wallpaper}
                    onChange={(event) => {
                      updateSettings("appearance.wallpaper", event.target.value);
                      setWallpaper(event.target.value);
                    }}
                  />
                </label>
                <label className="block rounded-3xl border border-slate-200 p-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Dock Magnification
                  </span>
                  <input
                    type="range"
                    min={72}
                    max={132}
                    value={settings.appearance.dockSize}
                    onChange={(event) =>
                      updateSettings(
                        "appearance.dockSize",
                        Number(event.target.value),
                      )
                    }
                    className="mt-4 w-full accent-slate-900"
                  />
                </label>
              </div>
            </section>
          </div>
        );
      case "Display":
        return (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Display</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Resolution</p>
                  <p className="text-xs text-slate-500">
                    Matches Retina display scaling.
                  </p>
                </div>
                <select
                  value={settings.display.resolution}
                  onChange={(event) =>
                    updateSettings("display.resolution", event.target.value)
                  }
                  className="rounded-full border border-slate-200 px-4 py-2"
                >
                  <option value="2560 x 1600">Default</option>
                  <option value="2048 x 1280">Larger Text</option>
                  <option value="2880 x 1800">More Space</option>
                </select>
              </label>
              <label className="block rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Brightness</p>
                  <span className="text-sm text-slate-500">
                    {settings.display.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  value={settings.display.brightness}
                  onChange={(event) =>
                    updateSettings(
                      "display.brightness",
                      Number(event.target.value),
                    )
                  }
                  className="mt-3 w-full accent-slate-900"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Night Shift</p>
                  <p className="text-xs text-slate-500">
                    Automatically adjust colors for evening hours.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.display.nightShift}
                  onChange={(event) =>
                    updateSettings("display.nightShift", event.target.checked)
                  }
                  className="h-5 w-10 rounded-full bg-slate-300"
                />
              </label>
            </div>
          </section>
        );
      case "Sound":
        return (
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Sound</h3>
            <label className="block rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Output</span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2"
                value={settings.sound.output}
                onChange={(event) =>
                  updateSettings("sound.output", event.target.value)
                }
              >
                <option>Studio Display Speakers</option>
                <option>MacBook Pro Speakers</option>
                <option>AirPods Pro</option>
              </select>
            </label>
            <label className="block rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Volume</span>
              <input
                type="range"
                value={settings.sound.volume}
                onChange={(event) =>
                  updateSettings("sound.volume", Number(event.target.value))
                }
                className="mt-3 w-full accent-slate-900"
              />
            </label>
          </section>
        );
      case "Network":
        return (
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Network</h3>
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Wi-Fi</p>
                <p className="text-xs text-slate-500">
                  Connected to {settings.network.selectedNetwork}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.network.wifiEnabled}
                onChange={(event) =>
                  updateSettings("network.wifiEnabled", event.target.checked)
                }
              />
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              value={settings.network.selectedNetwork}
              onChange={(event) =>
                updateSettings("network.selectedNetwork", event.target.value)
              }
            >
              <option>Design Lab</option>
              <option>Build Pipeline</option>
              <option>Guest Network</option>
            </select>
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                Personal Hotspot
              </span>
              <input
                type="checkbox"
                checked={settings.network.hotspotEnabled}
                onChange={(event) =>
                  updateSettings("network.hotspotEnabled", event.target.checked)
                }
              />
            </label>
          </section>
        );
      case "Users":
        return (
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Users & Accounts
            </h3>
            <label className="block rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Current user</span>
              <input
                value={settings.users.currentUser}
                onChange={(event) =>
                  updateSettings("users.currentUser", event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Automatic login</span>
              <input
                type="checkbox"
                checked={settings.users.autoLogin}
                onChange={(event) =>
                  updateSettings("users.autoLogin", event.target.checked)
                }
              />
            </label>
          </section>
        );
      case "Accessibility":
        return (
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Accessibility
            </h3>
            {Object.entries(settings.accessibility).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"
              >
                <span className="font-semibold text-slate-900">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) =>
                    updateSettings(`accessibility.${key}`, event.target.checked)
                  }
                />
              </label>
            ))}
          </section>
        );
      case "Software Update":
        return (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Software Update
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Last checked {settings.updates.lastChecked}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow"
                onClick={() =>
                  pushNotification({
                    appId: "settings",
                    title: "System updated",
                    body: "Your Mac is running the latest beta build.",
                  })
                }
              >
                Check for updates
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={settings.updates.autoUpdate}
                  onChange={(event) =>
                    updateSettings("updates.autoUpdate", event.target.checked)
                  }
                />
                Install updates automatically
              </label>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-slate-100/70">
      <nav className="hidden w-52 flex-none border-r border-slate-200 bg-white/80 p-4 text-sm text-slate-600 md:block">
        <div className="space-y-1">
          {PANES.map((pane) => (
            <button
              key={pane}
              className={`w-full rounded-2xl px-4 py-3 text-left transition ${pane === activePane ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-100"}`}
              onClick={() => setActivePane(pane)}
            >
              {pane}
            </button>
          ))}
        </div>
      </nav>
      <section className="flex-1 overflow-auto bg-slate-100/60 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">{activePane}</h2>
        <div className="mt-6">{renderPane()}</div>
      </section>
    </div>
  );
}
