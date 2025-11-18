"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

export default function MessagesApp() {
  const { messages, setMessages, pushNotification } = useDesktop();
  const [selectedThreadId, setSelectedThreadId] = useState(
    messages[0]?.id ?? "",
  );
  const [composer, setComposer] = useState("");

  const selectedThread = useMemo(
    () => messages.find((thread) => thread.id === selectedThreadId),
    [messages, selectedThreadId],
  );

  const sendMessage = () => {
    if (!selectedThread || !composer.trim()) {
      return;
    }
    const body = composer.trim();
    setMessages((prev) =>
      prev.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              lastMessage: body,
              messages: [
                ...thread.messages,
                {
                  id: `msg-${Math.random().toString(36).slice(2, 9)}`,
                  from: "You",
                  body,
                  timestamp: "Now",
                },
              ],
            }
          : thread,
      ),
    );
    setComposer("");
    pushNotification({
      appId: "messages",
      title: `Message sent to ${selectedThread.contact}`,
      body,
    });
  };

  return (
    <div className="flex h-full bg-[#0F0F1A] text-white">
      <aside className="w-64 flex-none border-r border-white/10 bg-white/5">
        <header className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">
            Messages
          </span>
          <button className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            New
          </button>
        </header>
        <div className="macos-scrollbar flex-1 overflow-auto">
          {messages.map((thread) => (
            <button
              key={thread.id}
              className={`w-full border-b border-white/5 px-4 py-4 text-left transition ${thread.id === selectedThreadId ? "bg-white/10" : "hover:bg-white/5"}`}
              onClick={() => setSelectedThreadId(thread.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {thread.contact}
                </h3>
                <span className="text-xs text-white/40">{thread.timestamp}</span>
              </div>
              <p className="mt-1 text-sm text-white/60">{thread.lastMessage}</p>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex flex-1 flex-col bg-gradient-to-br from-[#121229] to-[#070712]">
        {selectedThread ? (
          <>
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {selectedThread.contact}
                </h2>
                <p className="text-xs text-white/50">Online now</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <button className="rounded-full bg-white/10 px-3 py-1">
                  Audio
                </button>
                <button className="rounded-full bg-white/10 px-3 py-1">
                  FaceTime
                </button>
              </div>
            </header>
            <div className="macos-scrollbar flex-1 space-y-3 overflow-auto px-6 py-6">
              {selectedThread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.from === "You" ? "bg-[#5E5CE6]" : "bg-white/10"}`}
                  >
                    <p>{message.body}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <footer className="border-t border-white/10 bg-black/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <input
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  placeholder="iMessage"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <button
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">
            Select a conversation to continue.
          </div>
        )}
      </main>
    </div>
  );
}
