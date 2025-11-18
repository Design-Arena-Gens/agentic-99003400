"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDesktop } from "./DesktopContext";

export default function SpotlightOverlay() {
  const {
    apps,
    spotlightOpen,
    setSpotlightOpen,
    openApp,
    notes,
    mail,
    events,
  } = useDesktop();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const globalWindow =
      typeof window === "undefined" ? undefined : (window as Window);
    if (!globalWindow) {
      return;
    }
    if (spotlightOpen) {
      const focusTimer = globalWindow.setTimeout(
        () => inputRef.current?.focus(),
        10,
      );
      return () => globalWindow.clearTimeout(focusTimer);
    }
    const resetTimer = globalWindow.setTimeout(() => setQuery(""), 0);
    return () => globalWindow.clearTimeout(resetTimer);
  }, [spotlightOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && spotlightOpen) {
        setSpotlightOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [spotlightOpen, setSpotlightOpen]);

  const results = useMemo(() => {
    if (!query) {
      return apps.map((app) => ({
        id: app.id,
        title: app.name,
        subtitle: app.description,
        action: () => openApp(app.id),
      }));
    }
    const lower = query.toLowerCase();
    const appResults = apps
      .filter(
        (app) =>
          app.name.toLowerCase().includes(lower) ||
          app.description.toLowerCase().includes(lower),
      )
      .map((app) => ({
        id: `app-${app.id}`,
        title: app.name,
        subtitle: app.description,
        action: () => openApp(app.id),
      }));
    const noteResults = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(lower) ||
          note.content.toLowerCase().includes(lower),
      )
      .map((note) => ({
        id: `note-${note.id}`,
        title: note.title,
        subtitle: note.content.slice(0, 60),
        action: () => openApp("notes"),
      }));
    const mailResults = mail
      .filter(
        (message) =>
          message.subject.toLowerCase().includes(lower) ||
          message.from.toLowerCase().includes(lower),
      )
      .map((message) => ({
        id: `mail-${message.id}`,
        title: message.subject,
        subtitle: `From ${message.from}`,
        action: () => openApp("mail"),
      }));
    const eventResults = events
      .filter((event) => event.title.toLowerCase().includes(lower))
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        subtitle: `${event.date} • ${event.time}`,
        action: () => openApp("calendar"),
      }));
    return [...appResults, ...noteResults, ...mailResults, ...eventResults];
  }, [apps, events, mail, notes, openApp, query]);

  if (!spotlightOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-black/40 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
          <span className="text-lg text-slate-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Spotlight Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 border-0 bg-transparent text-lg text-slate-800 outline-none"
          />
          <kbd className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
            esc
          </kbd>
        </div>
        <ul className="macos-scrollbar mt-4 max-h-72 overflow-y-auto rounded-2xl border border-white/40 bg-white/70">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              No results found. Try searching for an app, note, or event.
            </li>
          ) : (
            results.map((result) => (
              <li key={result.id}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    setSpotlightOpen(false);
                    result.action();
                  }}
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {result.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {result.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">Open</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
