"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";
import type { NoteEntry } from "@/lib/types";

export default function NotesApp() {
  const { notes, setNotes, pushNotification } = useDesktop();
  const [selectedId, setSelectedId] = useState<string>(notes[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = useMemo(() => {
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [notes, searchTerm]);

  const selectedNote = filteredNotes.find((note) => note.id === selectedId) ??
    filteredNotes[0];

  const updateNote = (noteId: string, partial: Partial<NoteEntry>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, ...partial } : note,
      ),
    );
  };

  const addNote = () => {
    const id = `note-${Math.random().toString(36).slice(2, 9)}`;
    const newNote: NoteEntry = {
      id,
      title: "Untitled Note",
      content: "",
      updatedAt: "Just now",
      folder: "All iCloud",
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(id);
    pushNotification({
      appId: "notes",
      title: "New note created",
      body: "Start typing to capture your thoughts.",
    });
  };

  return (
    <div className="flex h-full bg-[#F5F5F7]">
      <aside className="hidden w-48 flex-none border-r border-slate-200/60 bg-slate-200/30 p-4 text-sm text-slate-500 md:block">
        <button
          className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow"
          onClick={addNote}
        >
          New Note
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs">⌘N</span>
        </button>
        <ul className="mt-4 space-y-2">
          <li className="rounded-lg bg-white px-3 py-2 text-slate-800 shadow-sm">
            All iCloud
          </li>
          <li className="rounded-lg px-3 py-2 transition hover:bg-white">
            Quick Notes
          </li>
        </ul>
      </aside>
      <section className="flex w-64 flex-none flex-col border-r border-slate-200/60 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <div className="flex flex-1 items-center rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
            🔍
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
              className="ml-3 w-full border-0 bg-transparent text-sm text-slate-600 outline-none"
            />
          </div>
        </div>
        <div className="macos-scrollbar flex-1 overflow-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              className={`w-full border-b border-slate-200 px-4 py-4 text-left transition ${note.id === selectedNote?.id ? "bg-[#F5F5F7]" : "hover:bg-slate-50"}`}
              onClick={() => setSelectedId(note.id)}
            >
              <h3 className="font-semibold text-slate-900">{note.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {note.content || "No additional text"}
              </p>
              <span className="mt-2 block text-xs uppercase tracking-wide text-slate-400">
                {note.updatedAt}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="flex flex-1 flex-col bg-white">
        {selectedNote ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <input
                className="w-2/3 border-0 bg-transparent text-2xl font-semibold text-slate-900 outline-none"
                value={selectedNote.title}
                onChange={(event) =>
                  updateNote(selectedNote.id, {
                    title: event.target.value,
                    updatedAt: "Just now",
                  })
                }
              />
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button className="rounded-full bg-slate-100 px-3 py-1">
                  Share
                </button>
                <button className="rounded-full bg-slate-100 px-3 py-1">
                  Pin
                </button>
              </div>
            </header>
            <textarea
              className="macos-scrollbar h-full flex-1 resize-none bg-transparent px-6 py-6 text-lg leading-relaxed text-slate-800 outline-none"
              value={selectedNote.content}
              onChange={(event) =>
                updateNote(selectedNote.id, {
                  content: event.target.value,
                  updatedAt: "Just now",
                })
              }
              placeholder="Start typing…"
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <p>Select a note to begin.</p>
            <button
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={addNote}
            >
              Create Note
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
