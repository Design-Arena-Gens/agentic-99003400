"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useDesktop } from "./DesktopContext";
import type { AppWindowState } from "@/lib/types";

interface DragState {
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
}

interface ResizeState {
  startX: number;
  startY: number;
  initialWidth: number;
  initialHeight: number;
}

interface WindowShellProps {
  windowItem: AppWindowState;
  children: React.ReactNode;
}

export default function WindowShell({
  windowItem,
  children,
}: WindowShellProps) {
  const {
    apps,
    closeWindow,
    minimizeWindow,
    toggleFullscreen,
    updateWindowPosition,
    updateWindowSize,
    focusWindow,
  } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const appMeta = useMemo(
    () => apps.find((item) => item.id === windowItem.appId),
    [apps, windowItem.appId],
  );

  useEffect(() => {
    if (!isDragging && !isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (isDragging && dragState.current) {
        const deltaX = event.clientX - dragState.current.startX;
        const deltaY = event.clientY - dragState.current.startY;
        updateWindowPosition(windowItem.id, {
          x: dragState.current.initialLeft + deltaX,
          y: dragState.current.initialTop + deltaY,
        });
      }
      if (isResizing && resizeState.current) {
        const deltaX = event.clientX - resizeState.current.startX;
        const deltaY = event.clientY - resizeState.current.startY;
        updateWindowSize(windowItem.id, {
          width: resizeState.current.initialWidth + deltaX,
          height: resizeState.current.initialHeight + deltaY,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragState.current = null;
      resizeState.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    isDragging,
    isResizing,
    updateWindowPosition,
    updateWindowSize,
    windowItem.id,
  ]);

  const handleHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (windowItem.maximized) {
      return;
    }
    event.preventDefault();
    setIsDragging(true);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialLeft: windowItem.position.x,
      initialTop: windowItem.position.y,
    };
    headerRef.current?.setPointerCapture(event.pointerId);
    focusWindow(windowItem.id);
  };

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    setIsResizing(true);
    resizeState.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialWidth: windowItem.size.width,
      initialHeight: windowItem.size.height,
    };
    focusWindow(windowItem.id);
  };

  const handleDoubleClick = () => {
    toggleFullscreen(windowItem.id);
  };

  const baseStyle = windowItem.maximized
    ? {
        inset: "44px 0 72px 0",
      }
    : {
        transform: `translate(${windowItem.position.x}px, ${windowItem.position.y}px)`,
        width: windowItem.size.width,
        height: windowItem.size.height,
      };

  const shellClass = clsx(
    "pointer-events-auto absolute rounded-3xl border border-white/20 bg-white/70 text-slate-900 shadow-2xl backdrop-blur-2xl transition duration-200",
    windowItem.maximized && "rounded-none border-white/10 bg-white/60",
    windowItem.minimized && "pointer-events-none opacity-0 scale-95",
  );

  const headerClass = clsx(
    "flex items-center justify-between rounded-t-[20px] px-4 py-2 text-xs font-medium text-slate-700",
    "bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-lg border-b border-white/30",
  );

  return (
    <div
      className={shellClass}
      style={{
        ...baseStyle,
        zIndex: windowItem.zIndex,
      }}
      onPointerDown={() => focusWindow(windowItem.id)}
    >
      <div
        ref={headerRef}
        className={headerClass}
        onPointerDown={handleHeaderPointerDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-red-900"
              onClick={(event) => {
                event.stopPropagation();
                closeWindow(windowItem.id);
              }}
            >
              ×
            </button>
            <button
              className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-[10px] text-amber-900"
              onClick={(event) => {
                event.stopPropagation();
                minimizeWindow(windowItem.id);
              }}
            >
              –
            </button>
            <button
              className="flex h-3 w-3 items-center justify-center rounded-full bg-green-400 text-[10px] text-green-950"
              onClick={(event) => {
                event.stopPropagation();
                toggleFullscreen(windowItem.id);
              }}
            >
              ⤢
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {appMeta?.name ?? "App"}
            </span>
            <span className="text-slate-500">{windowItem.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="hidden rounded px-2 py-1 text-[11px] font-medium lg:block">
            {windowItem.size.width} × {windowItem.size.height}
          </span>
        </div>
      </div>
      <div className="flex h-[calc(100%-44px)] flex-col overflow-hidden rounded-b-[24px] bg-white/80 backdrop-blur-xl">
        <div className="relative flex-1 overflow-hidden">{children}</div>
        {!windowItem.maximized && (
          <div
            className="absolute bottom-1 right-1 h-4 w-4 cursor-nwse-resize rounded-lg border border-transparent"
            onPointerDown={handleResizePointerDown}
          />
        )}
      </div>
    </div>
  );
}
