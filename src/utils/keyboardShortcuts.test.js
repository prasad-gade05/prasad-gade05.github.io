import { describe, expect, it } from "vitest";

import {
  focusShortcutBoundaryTarget,
  getShortcutTargets,
  getTabIndexForShortcutKey,
  hasKeyboardModifier,
  IN_PANE_FOCUS_NEXT_KEYS,
  IN_PANE_FOCUS_PREV_KEYS,
  isEditableShortcutTarget,
  moveShortcutFocus,
  SHORTCUT_TARGET_SELECTOR,
  TAB_SHORTCUT_KEYS,
} from "./keyboardShortcuts";

describe("keyboard shortcut helpers", () => {
  it("maps number keys to the correct tab indexes", () => {
    expect(TAB_SHORTCUT_KEYS).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
    expect(IN_PANE_FOCUS_NEXT_KEYS).toEqual(["ArrowDown", "ArrowRight", "j"]);
    expect(IN_PANE_FOCUS_PREV_KEYS).toEqual(["ArrowUp", "ArrowLeft", "k"]);
    expect(getTabIndexForShortcutKey("1")).toBe(0);
    expect(getTabIndexForShortcutKey("5")).toBe(4);
    expect(getTabIndexForShortcutKey("0")).toBe(9);
    expect(getTabIndexForShortcutKey("r")).toBeNull();
  });

  it("flags modifier combos so browser and OS shortcuts stay untouched", () => {
    expect(hasKeyboardModifier({ ctrlKey: true })).toBe(true);
    expect(hasKeyboardModifier({ metaKey: true })).toBe(true);
    expect(hasKeyboardModifier({ altKey: true })).toBe(true);
    expect(hasKeyboardModifier({ shiftKey: true })).toBe(false);
    expect(hasKeyboardModifier({})).toBe(false);
    expect(hasKeyboardModifier(null)).toBe(false);
  });

  it("detects editable targets so shortcuts can be ignored while typing", () => {
    expect(isEditableShortcutTarget(document.createElement("input"))).toBe(true);
    expect(isEditableShortcutTarget(document.createElement("textarea"))).toBe(true);
    expect(isEditableShortcutTarget(document.createElement("select"))).toBe(true);
    expect(isEditableShortcutTarget(document.createElement("button"))).toBe(false);

    const editable = document.createElement("div");
    editable.contentEditable = "true";
    expect(isEditableShortcutTarget(editable)).toBe(true);
  });

  it("collects only visible shortcut targets and moves focus through them", () => {
    const scope = document.createElement("div");
    const first = document.createElement("button");
    first.type = "button";
    first.dataset.shortcutTarget = "true";

    const second = document.createElement("div");
    second.dataset.shortcutTarget = "true";
    second.tabIndex = -1;

    const hidden = document.createElement("button");
    hidden.type = "button";
    hidden.dataset.shortcutTarget = "true";
    hidden.hidden = true;

    scope.append(first, second, hidden);
    document.body.appendChild(scope);

    expect(SHORTCUT_TARGET_SELECTOR).toBe('[data-shortcut-target="true"]');
    expect(getShortcutTargets(scope)).toEqual([first, second]);

    expect(moveShortcutFocus(scope, 1)).toBe(true);
    expect(document.activeElement).toBe(first);

    expect(moveShortcutFocus(scope, 1)).toBe(true);
    expect(document.activeElement).toBe(second);

    expect(moveShortcutFocus(scope, 1)).toBe(false);
    expect(document.activeElement).toBe(second);

    expect(focusShortcutBoundaryTarget(scope, "start")).toBe(true);
    expect(document.activeElement).toBe(first);

    expect(focusShortcutBoundaryTarget(scope, "end")).toBe(true);
    expect(document.activeElement).toBe(second);

    scope.remove();
  });
});
