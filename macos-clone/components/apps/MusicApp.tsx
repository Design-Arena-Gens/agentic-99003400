"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

export default function MusicApp() {
  const { playlists } = useDesktop();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(
    playlists[0]?.id ?? "",
  );
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedPlaylistId),
    [playlists, selectedPlaylistId],
  );

  return (
    <div className="flex h-full bg-[#0A0A0F] text-white">
      <aside className="hidden w-52 flex-none border-r border-white/10 bg-white/5 p-4 text-sm text-white/70 md:block">
        <h3 className="text-xs uppercase tracking-[0.3em] text-white/40">
          Library
        </h3>
        <ul className="mt-4 space-y-1">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <button
                className={`w-full rounded-2xl px-3 py-2 text-left transition ${playlist.id === selectedPlaylistId ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
                onClick={() => setSelectedPlaylistId(playlist.id)}
              >
                {playlist.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex flex-1 flex-col bg-gradient-to-br from-[#13131F] to-[#08080D]">
        {selectedPlaylist ? (
          <>
            <header className="flex items-center gap-6 px-8 py-10">
              <div className="relative h-44 w-44 overflow-hidden rounded-3xl shadow-xl shadow-black/50">
                <Image
                  src={selectedPlaylist.artwork}
                  alt={selectedPlaylist.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                  Playlist
                </p>
                <h1 className="mt-2 text-4xl font-bold text-white">
                  {selectedPlaylist.title}
                </h1>
                <p className="mt-4 max-w-xl text-base text-white/70">
                  {selectedPlaylist.description}
                </p>
                <button className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black">
                  Play
                </button>
              </div>
            </header>
            <section className="flex-1 overflow-auto px-8 pb-6">
              <table className="w-full table-fixed text-left text-sm text-white/70">
                <thead className="sticky top-0 bg-[#13131F] text-xs uppercase tracking-wide text-white/40">
                  <tr>
                    <th className="w-20 px-2 py-3">#</th>
                    <th className="px-2 py-3">Title</th>
                    <th className="px-2 py-3">Artist</th>
                    <th className="w-24 px-2 py-3 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlaylist.tracks.map((track, index) => (
                    <tr
                      key={track.id}
                      className={`group cursor-pointer rounded-2xl transition ${currentTrackId === track.id ? "bg-white/5 text-white" : "hover:bg-white/5"}`}
                      onClick={() => setCurrentTrackId(track.id)}
                    >
                      <td className="px-2 py-3 text-center text-white/40 group-hover:text-white">
                        {currentTrackId === track.id ? "▶" : index + 1}
                      </td>
                      <td className="px-2 py-3">{track.title}</td>
                      <td className="px-2 py-3 text-white/50">{track.artist}</td>
                      <td className="px-2 py-3 text-right text-white/40">
                        {track.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">
            Select a playlist to begin listening.
          </div>
        )}
        <footer className="flex items-center justify-between border-t border-white/10 bg-black/30 px-6 py-4 text-sm text-white/60">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">
              Now Playing
            </span>
            <span className="text-white">
              {
                selectedPlaylist?.tracks.find(
                  (track) => track.id === currentTrackId,
                )?.title ?? "—"
              }
            </span>
          </div>
          <div className="flex items-center gap-4 text-lg">
            <button>⏮</button>
            <button className="text-2xl">⏯</button>
            <button>⏭</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
