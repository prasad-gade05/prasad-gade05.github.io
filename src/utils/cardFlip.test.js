import { afterEach, describe, expect, it, vi } from "vitest";

import { canStartCardFlip } from "./cardFlip";

const mockCompactMatch = (matches) => {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe("card flip guards", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows mouse dragging on wide screens", () => {
    mockCompactMatch(false);
    expect(canStartCardFlip({ pointerType: "mouse" })).toBe(true);
    expect(canStartCardFlip({})).toBe(true);
  });

  it("never starts from touch or pen input", () => {
    mockCompactMatch(false);
    expect(canStartCardFlip({ pointerType: "touch" })).toBe(false);
    expect(canStartCardFlip({ pointerType: "pen" })).toBe(false);
  });

  it("blocks compact and touch-first layouts", () => {
    mockCompactMatch(true);
    expect(canStartCardFlip({ pointerType: "mouse" })).toBe(false);
  });
});
