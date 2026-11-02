/**
 * Clipboard writes with honest success/failure feedback, shared by every Copy button on the site.
 * Framework-free so it can be unit tested; see `useCopyFeedback` for the React binding.
 */

export type CopyState = "idle" | "copied" | "failed";

/** How long the "Copied!" / "Copy failed" state stays visible. */
export const COPY_FEEDBACK_MS = 2000;

export type ClipboardWriter = (text: string) => Promise<boolean>;

/**
 * Writes `text` to the clipboard. Resolves `true` only when the browser confirms the write:
 * the async Clipboard API first, then the legacy `execCommand("copy")` path (insecure contexts,
 * older WebViews), which reports its own success.
 */
export const writeClipboardText: ClipboardWriter = async (text) => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or document not focused: try the legacy path below.
  }
  return legacyCopy(text);
};

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.opacity = "0";
  const previousFocus = document.activeElement as HTMLElement | null;
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  previousFocus?.focus?.();
  return ok;
}

export interface CopyFeedbackController {
  /** Copies and drives the state; resolves with whether the clipboard write succeeded. */
  copy(text: string | (() => string)): Promise<boolean>;
  dispose(): void;
}

/**
 * State machine behind a Copy button: idle → copied | failed → idle after `resetMs`.
 * A repeated click restarts the timer, and only the latest click decides the shown state.
 */
export function createCopyFeedbackController(options: {
  readonly onChange: (state: CopyState) => void;
  readonly write?: ClipboardWriter;
  readonly resetMs?: number;
}): CopyFeedbackController {
  const write = options.write ?? writeClipboardText;
  const resetMs = options.resetMs ?? COPY_FEEDBACK_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let disposed = false;

  return {
    async copy(source) {
      const current = ++attempt;
      let ok: boolean;
      try {
        ok = await write(typeof source === "function" ? source() : source);
      } catch {
        ok = false;
      }
      if (disposed || current !== attempt) return ok;
      if (timer !== undefined) clearTimeout(timer);
      options.onChange(ok ? "copied" : "failed");
      timer = setTimeout(() => {
        timer = undefined;
        if (!disposed) options.onChange("idle");
      }, resetMs);
      return ok;
    },
    dispose() {
      disposed = true;
      if (timer !== undefined) clearTimeout(timer);
    }
  };
}
