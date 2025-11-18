"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

export default function MailApp() {
  const { mail, setMail, pushNotification } = useDesktop();
  const [selectedId, setSelectedId] = useState(mail[0]?.id ?? "");
  const [composeMode, setComposeMode] = useState(false);

  const selectedMessage = useMemo(
    () => mail.find((message) => message.id === selectedId) ?? mail[0],
    [mail, selectedId],
  );

  const markAsRead = (messageId: string) => {
    setMail((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, unread: false } : message,
      ),
    );
  };

  const handleSelect = (messageId: string) => {
    setSelectedId(messageId);
    markAsRead(messageId);
  };

  const unreadCount = mail.filter((message) => message.unread).length;

  return (
    <div className="flex h-full bg-slate-50">
      <aside className="hidden w-52 flex-none border-r border-slate-200/70 bg-white/60 p-5 text-sm text-slate-500 lg:block">
        <button
          className="flex w-full items-center justify-center rounded-2xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30"
          onClick={() => {
            setComposeMode(true);
            pushNotification({
              appId: "mail",
              title: "Compose ready",
              body: "Start drafting your message.",
            });
          }}
        >
          New Message
        </button>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            Inbox <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">{unreadCount}</span>
          </div>
          <p>VIP</p>
          <p>Drafts</p>
          <p>Archive</p>
          <p>Sent</p>
        </div>
      </aside>
      <section className="flex w-72 flex-none flex-col border-r border-slate-200/60 bg-white/90">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>All Inboxes</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
            Sorted by Date
          </span>
        </header>
        <div className="macos-scrollbar flex-1 overflow-auto">
          {mail.map((message) => (
            <button
              key={message.id}
              className={`w-full border-b border-slate-200 px-4 py-4 text-left transition ${message.id === selectedMessage?.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
              onClick={() => handleSelect(message.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {message.from}
                </h3>
                <span className="text-xs text-slate-400">{message.timestamp}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {message.subject}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {message.snippet}
              </p>
              {message.unread && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                  • Unread
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
      <section className="relative flex flex-1 flex-col bg-white">
        {composeMode ? (
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                New Message
              </h2>
              <button
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500"
                onClick={() => setComposeMode(false)}
              >
                Close
              </button>
            </header>
            <div className="flex flex-col gap-3 px-6 py-4 text-sm text-slate-600">
              <input
                placeholder="To"
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
              <input
                placeholder="Subject"
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
              <textarea
                className="h-full min-h-[240px] rounded-2xl border border-slate-200 px-4 py-3 text-base"
                placeholder="Write your message..."
              />
            </div>
            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button className="rounded-full bg-white px-3 py-1">Attach</button>
                <button className="rounded-full bg-white px-3 py-1">Format</button>
              </div>
              <button className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">
                Send
              </button>
            </footer>
          </div>
        ) : selectedMessage ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedMessage.subject}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedMessage.from} • {selectedMessage.timestamp}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button className="rounded-full bg-slate-100 px-3 py-1">
                  Reply
                </button>
                <button className="rounded-full bg-slate-100 px-3 py-1">
                  Archive
                </button>
              </div>
            </header>
            <article className="macos-scrollbar flex-1 space-y-4 overflow-auto px-6 py-6 text-sm leading-relaxed text-slate-700">
              {selectedMessage.body.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
            <p>Select a message to view details.</p>
            <button
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setComposeMode(true)}
            >
              Compose
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
