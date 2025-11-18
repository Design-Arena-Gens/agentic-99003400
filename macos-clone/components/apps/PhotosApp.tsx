"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

const COLLECTIONS = ["Library", "Memories", "Favorites", "People", "Places"];

export default function PhotosApp() {
  const { photos, pushNotification } = useDesktop();
  const [selectedId, setSelectedId] = useState<string | null>(photos[0]?.id ?? null);
  const [showInfo, setShowInfo] = useState(true);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedId),
    [photos, selectedId],
  );

  const toggleFavorite = (id: string) => {
    pushNotification({
      appId: "photos",
      title: "Added to Favorites",
      body: "Your moment has been marked.",
    });
    setSelectedId(id);
  };

  return (
    <div className="flex h-full bg-slate-900/90 text-white">
      <aside className="hidden w-48 flex-none border-r border-white/10 bg-black/30 p-4 text-sm text-white/70 md:block">
        <h3 className="text-xs uppercase tracking-[0.3em] text-white/40">
          Collections
        </h3>
        <ul className="mt-4 space-y-2">
          {COLLECTIONS.map((collection) => (
            <li
              key={collection}
              className="rounded-xl px-3 py-2 hover:bg-white/10 hover:text-white"
            >
              {collection}
            </li>
          ))}
        </ul>
      </aside>
      <section className="macos-scrollbar flex-1 overflow-auto bg-gradient-to-br from-black/40 via-slate-900/70 to-black/70 p-6">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className="group relative mb-4 block overflow-hidden rounded-3xl shadow-lg transition hover:scale-[1.02]"
              onClick={() => setSelectedId(photo.id)}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                width={480}
                height={360}
                className="w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-white/80 group-hover:block">
                <p className="text-sm font-medium">{photo.title}</p>
                <p className="text-xs text-white/60">{photo.takenAt}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {selectedPhoto && (
        <section className="hidden w-80 flex-none border-l border-white/10 bg-black/40 backdrop-blur-xl md:flex md:flex-col">
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4 border-t border-white/10 p-5 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-white/50">{selectedPhoto.takenAt}</p>
              </div>
              <button
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                onClick={() => toggleFavorite(selectedPhoto.id)}
              >
                ❤ Favorite
              </button>
            </div>
            {showInfo && selectedPhoto.description && (
              <p className="text-sm leading-relaxed text-white/70">
                {selectedPhoto.description}
              </p>
            )}
            <div className="rounded-2xl bg-white/10 p-3 text-xs text-white/60">
              <p>ISO 200 • ƒ/1.8 • 26 mm</p>
              <p>Apple ProRAW</p>
            </div>
            <button
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
              onClick={() => setShowInfo((prev) => !prev)}
            >
              {showInfo ? "Hide Info" : "Show Info"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
