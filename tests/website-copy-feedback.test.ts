import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COPY_FEEDBACK_MS,
  createCopyFeedbackController,
  type CopyState
} from "../apps/website/src/lib/copy-feedback";

const WEBSITE_SRC = path.resolve(__dirname, "..", "apps", "website", "src");

function setup(write: (text: string) => Promise<boolean>) {
  const states: CopyState[] = [];
  const writes: string[] = [];
  const controller = createCopyFeedbackController({
    onChange: (state) => states.push(state),
    write: (text) => {
      writes.push(text);
      return write(text);
    }
  });
  return { states, writes, controller };
}

describe("copy feedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows Copied only after a successful write, then resets after ~2 s", async () => {
    const { states, writes, controller } = setup(async () => true);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M1 1"/>\n</svg>';
    await expect(controller.copy(svg)).resolves.toBe(true);
    expect(writes).toEqual([svg]); // copied verbatim, formatting preserved
    expect(states).toEqual(["copied"]);
    vi.advanceTimersByTime(COPY_FEEDBACK_MS - 1);
    expect(states).toEqual(["copied"]);
    vi.advanceTimersByTime(1);
    expect(states).toEqual(["copied", "idle"]);
    expect(COPY_FEEDBACK_MS).toBe(2000);
  });

  it("shows Copy failed (never Copied) when the clipboard rejects or throws", async () => {
    const rejected = setup(async () => false);
    await expect(rejected.controller.copy("x")).resolves.toBe(false);
    expect(rejected.states).toEqual(["failed"]);
    vi.advanceTimersByTime(COPY_FEEDBACK_MS);
    expect(rejected.states).toEqual(["failed", "idle"]);

    const thrown = setup(async () => {
      throw new Error("NotAllowedError");
    });
    await expect(thrown.controller.copy("x")).resolves.toBe(false);
    expect(thrown.states).toEqual(["failed"]);
  });

  it("restarts the feedback duration on repeated clicks", async () => {
    const { states, controller } = setup(async () => true);
    await controller.copy("a");
    vi.advanceTimersByTime(1500);
    await controller.copy("a");
    vi.advanceTimersByTime(1500);
    expect(states).toEqual(["copied", "copied"]); // still showing: timer was reset
    vi.advanceTimersByTime(500);
    expect(states).toEqual(["copied", "copied", "idle"]);
  });

  it("lets only the latest click decide the state when writes overlap", async () => {
    let releaseFirst: (ok: boolean) => void = () => undefined;
    let call = 0;
    const { states, controller } = setup(
      () => (++call === 1 ? new Promise<boolean>((resolve) => (releaseFirst = resolve)) : Promise.resolve(true))
    );
    const first = controller.copy("slow");
    await controller.copy("fast");
    releaseFirst(false); // the stale failure must not overwrite the newer success
    await first;
    expect(states).toEqual(["copied"]);
  });

  it("evaluates lazy text at click time and stops after dispose", async () => {
    const { states, writes, controller } = setup(async () => true);
    let url = "https://slatico.dev/icons/bell";
    const source = () => url;
    url = "https://slatico.dev/icons/wallet";
    await controller.copy(source);
    expect(writes).toEqual(["https://slatico.dev/icons/wallet"]);
    controller.dispose();
    vi.advanceTimersByTime(COPY_FEEDBACK_MS);
    expect(states).toEqual(["copied"]); // no update after unmount
  });

  it("routes every website clipboard write through the shared helper", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(entry) && !full.endsWith(path.join("lib", "copy-feedback.ts"))) {
          if (readFileSync(full, "utf8").includes("navigator.clipboard")) offenders.push(path.relative(WEBSITE_SRC, full));
        }
      }
    };
    walk(WEBSITE_SRC);
    expect(offenders).toEqual([]);
  });
});
