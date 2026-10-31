"use client";

import { useState } from "react";

export function DocsCodeBlock({
  title,
  code,
  language = "ts"
}: {
  readonly title?: string;
  readonly code: string;
  readonly language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-4 max-w-full overflow-hidden rounded-[24px] squircle border border-code-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-border px-4 py-2 text-xs text-code-fg/80">
        <span className="font-mono font-medium">
          {title ?? language.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-code-border bg-white/5 px-2.5 py-1 font-mono text-[11px] font-semibold text-code-fg transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-4 font-mono text-xs leading-relaxed text-code-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
