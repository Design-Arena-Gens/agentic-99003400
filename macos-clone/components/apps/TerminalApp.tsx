"use client";

import { useEffect, useRef, useState } from "react";
import type { AppID, AppWindowState, TerminalRecord } from "@/lib/types";
import { useDesktop } from "../desktop/DesktopContext";

const FILE_SYSTEM: Record<string, string[]> = {
  "/": ["Applications", "Desktop", "Documents", "Downloads", "Library"],
  "/Applications": ["Safari.app", "Notes.app", "Music.app", "Mail.app"],
  "/Documents": ["LaunchPlan.md", "Ideas.txt", "Budget.xlsx"],
  "/Desktop": ["README.md", "Design.sketch"],
};

const COMMANDS = [
  "help",
  "clear",
  "ls",
  "cd",
  "pwd",
  "whoami",
  "open",
  "date",
  "echo",
  "cat",
  "brew install",
  "note",
];

const formatPrompt = (cwd: string) => `agentic@macos ${cwd} %`;

const initialSession = (windowId: string) => ({
  id: windowId,
  cwd: "/",
  history: [
    {
      id: `record-${Math.random().toString(36).slice(2, 9)}`,
      input: "welcome",
      output:
        "Welcome to the macOS web terminal. Type `help` to explore available commands.",
      timestamp: Date.now(),
    },
  ] satisfies TerminalRecord[],
});

interface TerminalAppProps {
  windowState: AppWindowState;
}

export default function TerminalApp({ windowState }: TerminalAppProps) {
  const { terminalSessions, setTerminalSessions, openApp } = useDesktop();
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const existingSession = terminalSessions[windowState.id];
  const session = existingSession ?? initialSession(windowState.id);

  useEffect(() => {
    if (!existingSession) {
      setTerminalSessions((prev) => ({
        ...prev,
        [windowState.id]: session,
      }));
    }
  }, [existingSession, session, setTerminalSessions, windowState.id]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session.history]);

  useEffect(() => {
    const win =
      typeof window === "undefined" ? undefined : (window as Window);
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setTerminalSessions((prev) => ({
          ...prev,
          [windowState.id]: {
            ...prev[windowState.id],
            history: [],
          },
        }));
      }
    };
    if (!win) {
      return;
    }
    win.addEventListener("keydown", handleKeyDown);
    return () => win.removeEventListener("keydown", handleKeyDown);
  }, [setTerminalSessions, windowState.id]);

  const appendHistory = (record: TerminalRecord) => {
    setTerminalSessions((prev) => {
      const current = prev[windowState.id] ?? initialSession(windowState.id);
      return {
        ...prev,
        [windowState.id]: {
          ...current,
          history: [...current.history, record],
        },
      };
    });
  };

  const updateCwd = (cwd: string) => {
    setTerminalSessions((prev) => {
      const current = prev[windowState.id] ?? initialSession(windowState.id);
      return {
        ...prev,
        [windowState.id]: {
          ...current,
          cwd,
        },
      };
    });
  };

  const executeCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) {
      appendHistory({
        id: `record-${Math.random().toString(36).slice(2, 9)}`,
        input: "",
        output: "",
        timestamp: Date.now(),
      });
      return;
    }

    const args = command.split(" ");
    const [rootCommand, ...rest] = args;
    const cwd = session.cwd;

    const respond = (output: string) =>
      appendHistory({
        id: `record-${Math.random().toString(36).slice(2, 9)}`,
        input: command,
        output,
        timestamp: Date.now(),
      });

    switch (rootCommand) {
      case "help":
        respond(
          [
            "Available commands:",
            COMMANDS.map((cmd) => `  • ${cmd}`).join("\n"),
            "",
            "Use `open <app>` to launch desktop apps.",
          ].join("\n"),
        );
        break;
      case "clear":
        setTerminalSessions((prev) => ({
          ...prev,
          [windowState.id]: {
            ...prev[windowState.id],
            history: [],
          },
        }));
        break;
      case "pwd":
        respond(cwd);
        break;
      case "whoami":
        respond("agentic");
        break;
      case "ls": {
        const target = rest[0]
          ? `${rest[0]}`.startsWith("/")
            ? rest[0]
            : `${cwd}/${rest[0]}`
          : cwd;
        const normalized = target.replaceAll("//", "/");
        const contents = FILE_SYSTEM[normalized];
        respond(
          contents
            ? contents.join("    ")
            : "ls: No such file or directory",
        );
        break;
      }
      case "cd": {
        const nextPath = rest[0];
        if (!nextPath) {
          updateCwd("/");
          respond("");
          break;
        }
        const candidate = nextPath.startsWith("/")
          ? nextPath
          : `${cwd}/${nextPath}`;
        const normalized = candidate.replaceAll("//", "/");
        if (FILE_SYSTEM[normalized]) {
          updateCwd(normalized);
          respond("");
        } else {
          respond(`cd: no such file or directory: ${nextPath}`);
        }
        break;
      }
      case "open": {
        const appName = rest[0];
        if (!appName) {
          respond("open: missing application id (e.g. open safari)");
          break;
        }
        const targetApp = appName.toLowerCase();
        const mapping: Record<string, AppID> = {
          safari: "safari",
          notes: "notes",
          finder: "finder",
          mail: "mail",
          photos: "photos",
          music: "music",
          messages: "messages",
          calendar: "calendar",
          terminal: "terminal",
          settings: "settings",
        };
        const appId = mapping[targetApp];
        if (appId) {
          openApp(appId);
          respond(`Launching ${targetApp}...`);
        } else {
          respond(`open: application ${targetApp} not found`);
        }
        break;
      }
      case "date":
        respond(new Date().toString());
        break;
      case "echo":
        respond(rest.join(" "));
        break;
      case "cat":
        respond("cat: file system is read-only in this environment.");
        break;
      case "brew":
        respond(
          `🍺 Homebrew (simulated): installing ${rest.slice(1).join(" ") || "formula"}...\nAll set!`,
        );
        break;
      case "note":
        openApp("notes");
        respond("Opening Notes.app…");
        break;
      default:
        respond(`command not found: ${rootCommand}`);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black text-[#e5e5e5]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-white/60">
        <span>Terminal — {session.cwd}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
          zsh
        </span>
      </header>
      <div
        ref={containerRef}
        className="macos-scrollbar flex-1 overflow-auto px-4 py-6 font-mono text-sm leading-relaxed"
      >
        {session.history.map((record) => (
          <div key={record.id} className="mb-3">
            {record.input && (
              <div className="text-white">
                {formatPrompt(session.cwd)} {record.input}
              </div>
            )}
            {record.output && (
              <pre className="mt-1 whitespace-pre-wrap text-[#8affef]">
                {record.output}
              </pre>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 text-white">
          <span>{formatPrompt(session.cwd)}</span>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              executeCommand(input);
              setInput("");
            }}
            className="grow"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="w-full bg-transparent outline-none"
              autoFocus
            />
          </form>
        </div>
      </div>
      <footer className="border-t border-white/10 px-4 py-2 text-xs text-white/40">
        Type `help` for available commands • Cmd+K to clear
      </footer>
    </div>
  );
}
