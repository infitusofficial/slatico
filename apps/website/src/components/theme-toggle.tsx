"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "slatico-theme";

function resolveEffectiveDark(mode: ThemeMode): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }
  const isDark = resolveEffectiveDark(mode);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  root.setAttribute("data-theme-preference", mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const initial: ThemeMode =
        saved === "light" || saved === "dark" || saved === "system"
          ? saved
          : "system";
      setMode(initial);
      applyThemeToDocument(initial);
    } catch {
      applyThemeToDocument("system");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      try {
        const current =
          (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ??
          "system";
        if (current === "system") {
          applyThemeToDocument("system");
        }
      } catch {
        applyThemeToDocument("system");
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const selectMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
    applyThemeToDocument(nextMode);
  };

  const options: ReadonlyArray<{
    readonly id: ThemeMode;
    readonly label: string;
    readonly icon: React.ReactNode;
  }> = [
    {
      id: "light",
      label: "Light mode",
      icon: (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    },
    {
      id: "dark",
      label: "Dark mode",
      icon: (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    },
    {
      id: "system",
      label: "System theme",
      icon: (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )
    }
  ];

  return (
    <div
      role="group"
      aria-label="Color theme selector"
      className="inline-flex items-center rounded-[20px] squircle border border-border bg-surface-muted p-0.5"
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => selectMode(opt.id)}
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            className={`inline-flex items-center gap-1 rounded-[16px] squircle px-2 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.icon}
            <span className="hidden lg:inline capitalize">{opt.id}</span>
          </button>
        );
      })}
    </div>
  );
}
