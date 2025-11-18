"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";
import type { FinderFile } from "@/lib/types";

const SIDEBAR_ITEMS = [
  { id: "favorites", label: "Favorites", children: ["AirDrop", "Recents", "Applications", "Downloads"] },
  { id: "icloud", label: "iCloud", children: ["iCloud Drive", "Desktop", "Documents"] },
  { id: "locations", label: "Locations", children: ["Macintosh HD", "Network"] },
];

export default function FinderApp() {
  const { finderFiles, pushNotification } = useDesktop();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof FinderFile>("name");
  const [ascending, setAscending] = useState(true);

  const visibleFiles = useMemo(() => {
    const filtered = finderFiles.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ascending, finderFiles, searchTerm, sortKey]);

  const toggleSort = (key: keyof FinderFile) => {
    if (sortKey === key) {
      setAscending((prev) => !prev);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  };

  return (
    <div className="flex h-full w-full">
      <aside className="hidden w-48 flex-none border-r border-slate-200/70 bg-slate-50/80 p-4 backdrop-blur-xl md:block">
        {SIDEBAR_ITEMS.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {group.children.map((item) => (
                <li
                  key={item}
                  className="rounded-lg px-2 py-1 transition hover:bg-white hover:text-slate-900"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      <section className="flex min-w-0 flex-1 flex-col bg-white/80">
        <header className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              Columns
            </button>
            <button className="rounded-full px-3 py-1 text-slate-400 hover:bg-slate-100">
              Gallery
            </button>
            <button className="rounded-full px-3 py-1 text-slate-400 hover:bg-slate-100">
              List
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-slate-200/70 bg-white px-3 py-1">
              <span className="text-slate-400">🔍</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                className="ml-2 border-0 bg-transparent text-sm text-slate-600 outline-none"
              />
            </div>
            <button
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
              onClick={() =>
                pushNotification({
                  appId: "finder",
                  title: "Connected to AirDrop",
                  body: "Nearby device discovered.",
                })
              }
            >
              AirDrop
            </button>
          </div>
        </header>
        <div className="macos-scrollbar flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200/70 text-sm text-slate-600">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th
                  className="cursor-pointer px-4 py-2 text-left"
                  onClick={() => toggleSort("name")}
                >
                  Name
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left"
                  onClick={() => toggleSort("kind")}
                >
                  Kind
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left"
                  onClick={() => toggleSort("size")}
                >
                  Size
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left"
                  onClick={() => toggleSort("modified")}
                >
                  Date Modified
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white/70">
              {visibleFiles.map((file) => (
                <tr key={file.id} className="transition hover:bg-blue-50/60">
                  <td className="px-4 py-2 font-medium text-slate-700">
                    {file.name}
                  </td>
                  <td className="px-4 py-2">{file.kind}</td>
                  <td className="px-4 py-2">{file.size}</td>
                  <td className="px-4 py-2 text-slate-500">{file.modified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
