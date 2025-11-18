"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";
import type { SafariTab } from "@/lib/types";

const BOOKMARKS = [
  { label: "Vercel", url: "https://vercel.com" },
  { label: "Next.js", url: "https://nextjs.org" },
  { label: "Apple Newsroom", url: "https://www.apple.com/newsroom/" },
  { label: "GitHub", url: "https://github.com" },
];

export default function SafariApp() {
  const { safariTabs, setSafariTabs, pushNotification } = useDesktop();
  const [activeTabId, setActiveTabId] = useState(() => safariTabs[0]?.id);
  const [addressBar, setAddressBar] = useState(
    safariTabs[0]?.url ?? "https://www.apple.com",
  );

  const activeTab = useMemo(() => {
    return safariTabs.find((tab) => tab.id === activeTabId) ?? safariTabs[0];
  }, [activeTabId, safariTabs]);

  const updateTab = (tabId: string, data: Partial<SafariTab>) => {
    setSafariTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, ...data } : tab)),
    );
  };

  const addTab = (url?: string) => {
    const id = `tab-${Math.random().toString(36).slice(2, 8)}`;
    const newTab: SafariTab = {
      id,
      url: url ?? "https://www.google.com",
      title: url ?? "New Tab",
    };
    setSafariTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    setAddressBar(newTab.url);
  };

  const closeTab = (tabId: string) => {
    const nextTabs = safariTabs.filter((tab) => tab.id !== tabId);
    setSafariTabs(nextTabs);
    if (activeTabId === tabId) {
      const fallback = nextTabs[0];
      setActiveTabId(fallback?.id);
      setAddressBar(fallback?.url ?? "https://www.apple.com");
    }
  };

  const handleNavigate = (event: React.FormEvent) => {
    event.preventDefault();
    const targetTabId = activeTab?.id ?? activeTabId;
    if (!targetTabId) return;
    const formatted = addressBar.startsWith("http")
      ? addressBar
      : `https://${addressBar}`;
    updateTab(targetTabId, {
      url: formatted,
      title: formatted,
    });
    setActiveTabId(targetTabId);
    pushNotification({
      appId: "safari",
      title: "Navigation started",
      body: formatted,
    });
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/90">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200/70 px-3 py-2">
        {safariTabs.map((tab) => (
          <button
            key={tab.id}
            className={`group flex items-center gap-2 rounded-2xl px-3 py-1 text-sm ${tab.id === activeTabId ? "bg-white text-slate-900" : "text-slate-500 hover:bg-white/70"}`}
            onClick={() => {
              setActiveTabId(tab.id);
              setAddressBar(tab.url);
            }}
          >
            <span className="truncate max-w-[160px]">{tab.title}</span>
            <span
              className="hidden text-xs text-slate-400 transition group-hover:block"
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </span>
          </button>
        ))}
        <button
          className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          onClick={() => addTab()}
        >
          +
        </button>
      </div>
      <form
        className="flex items-center gap-3 px-4 py-3"
        onSubmit={handleNavigate}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-inner">
          <span className="text-slate-400">🔒</span>
          <input
            value={addressBar}
            onChange={(event) => setAddressBar(event.target.value)}
            className="w-[480px] max-w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Search or enter website name"
          />
        </div>
        <button
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          type="submit"
        >
          Go
        </button>
      </form>
      <div className="flex gap-6 px-4 py-3">
        {BOOKMARKS.map((bookmark) => (
          <button
            key={bookmark.url}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white/70 px-4 py-3 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={() => addTab(bookmark.url)}
          >
            <span className="text-lg">⭐</span>
            <span>{bookmark.label}</span>
          </button>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden rounded-t-3xl border-t border-slate-200/70 bg-white">
        {activeTab ? (
          <iframe
            key={activeTab.id}
            src={activeTab.url}
            className="h-full w-full"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            title={activeTab.title}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <p>No tabs open</p>
            <button
              className="rounded-full bg-slate-900 px-4 py-2 text-white"
              onClick={() => addTab()}
            >
              New Tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
