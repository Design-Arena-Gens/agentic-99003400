"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

export default function PreviewApp() {
  const { documents } = useDesktop();
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id ?? "");
  const [activePage, setActivePage] = useState(0);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocId),
    [activeDocId, documents],
  );

  return (
    <div className="flex h-full bg-slate-200/60">
      <aside className="hidden w-48 flex-none border-r border-slate-200 bg-white/80 p-4 text-sm text-slate-500 md:block">
        <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Recents
        </h3>
        <ul className="mt-4 space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                className={`w-full rounded-xl px-3 py-2 text-left transition ${doc.id === activeDocId ? "bg-slate-900 text-white shadow" : "hover:bg-white"}`}
                onClick={() => {
                  setActiveDocId(doc.id);
                  setActivePage(0);
                }}
              >
                {doc.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex flex-1 flex-col bg-slate-100/80">
        {activeDocument ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeDocument.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Page {activePage + 1} of {activeDocument.pages.length}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button className="rounded-full bg-white px-3 py-1">Markup</button>
                <button className="rounded-full bg-white px-3 py-1">
                  Share
                </button>
              </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
              <nav className="hidden w-40 flex-none border-r border-slate-200 bg-white/80 p-4 text-sm text-slate-500 lg:block">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Pages
                </h3>
                <ul className="mt-3 space-y-2">
                  {activeDocument.pages.map((_, index) => (
                    <li key={index}>
                      <button
                        className={`w-full rounded-xl px-3 py-2 text-left transition ${index === activePage ? "bg-slate-900 text-white" : "hover:bg-white"}`}
                        onClick={() => setActivePage(index)}
                      >
                        Page {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <section className="macos-scrollbar flex-1 overflow-auto bg-gray-200/40 p-6">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-300 bg-white p-8 shadow-lg">
                  <pre className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                    {activeDocument.pages[activePage]}
                  </pre>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            Select a document to preview.
          </div>
        )}
      </main>
    </div>
  );
}
