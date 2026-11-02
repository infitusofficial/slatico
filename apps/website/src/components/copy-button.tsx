"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode
} from "react";
import {
  createCopyFeedbackController,
  type CopyFeedbackController,
  type CopyState
} from "../lib/copy-feedback";

/** React binding for the copy state machine (one controller per mounted button). */
export function useCopyFeedback(): {
  readonly state: CopyState;
  readonly copy: (text: string | (() => string)) => Promise<boolean>;
} {
  const [state, setState] = useState<CopyState>("idle");
  const controllerRef = useRef<CopyFeedbackController | null>(null);
  useEffect(() => {
    const controller = createCopyFeedbackController({ onChange: setState });
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);
  const copy = useCallback(
    (text: string | (() => string)) =>
      controllerRef.current?.copy(text) ?? Promise.resolve(false),
    []
  );
  return { state, copy };
}

/** Minimal UI glyphs (not catalog icons) drawn like the drawer's close button. */
function CopyGlyph({ state, size }: { readonly state: CopyState; readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {state === "copied" ? (
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      ) : state === "failed" ? (
        <path d="M17 7 7 17M7 7l10 10" />
      ) : (
        <>
          <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
          <path d="M15.5 8.5V6.5A2 2 0 0 0 13.5 4.5H6.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
        </>
      )}
    </svg>
  );
}

export interface CopyButtonProps {
  /** Text to copy, or a function evaluated at click time (always copied verbatim). */
  readonly text: string | (() => string);
  readonly label: ReactNode;
  readonly copiedLabel?: string;
  readonly failedLabel?: string;
  /** Screen-reader announcement on success, e.g. "SVG copied to clipboard". */
  readonly announcement?: string;
  readonly className?: string;
  /** Extra classes while in the copied state (subtle success tint). */
  readonly copiedClassName?: string;
  readonly failedClassName?: string;
  readonly iconSize?: number;
  readonly showIcon?: boolean;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly stopPropagation?: boolean;
}

/**
 * The site's one Copy button: real clipboard write, Copy → Check icon, "Copied!" for ~2 s,
 * "Copy failed" on errors, polite screen-reader announcement, and no layout shift (all labels
 * share one grid cell, so the button is always as wide as its longest label).
 */
export function CopyButton({
  text,
  label,
  copiedLabel = "Copied!",
  failedLabel = "Copy failed",
  announcement,
  className,
  copiedClassName = "",
  failedClassName = "",
  iconSize = 14,
  showIcon = true,
  disabled,
  ariaLabel,
  stopPropagation
}: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation();
    void copy(text);
  };
  const stateClass =
    state === "copied" ? copiedClassName : state === "failed" ? failedClassName : "";
  const labels: ReadonlyArray<readonly [CopyState, ReactNode]> = [
    ["idle", label],
    ["copied", copiedLabel],
    ["failed", failedLabel]
  ];

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-copy-state={state}
        className={`${className ?? ""} ${stateClass}`.trim()}
      >
        {showIcon && <CopyGlyph state={state} size={iconSize} />}
        <span className="inline-grid">
          {labels.map(([key, text]) => (
            <span
              key={key}
              className={`col-start-1 row-start-1 text-center ${key === state ? "" : "invisible"}`}
              aria-hidden={key === state ? undefined : true}
            >
              {text}
            </span>
          ))}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied"
          ? (announcement ?? "Copied to clipboard")
          : state === "failed"
            ? "Copy failed. Your browser blocked clipboard access."
            : ""}
      </span>
    </>
  );
}
