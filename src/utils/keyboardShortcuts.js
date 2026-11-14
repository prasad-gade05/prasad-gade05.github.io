export const TAB_SHORTCUT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
export const IN_PANE_FOCUS_NEXT_KEYS = ["ArrowDown", "ArrowRight", "j"];
export const IN_PANE_FOCUS_PREV_KEYS = ["ArrowUp", "ArrowLeft", "k"];
export const SHORTCUT_TARGET_SELECTOR = '[data-shortcut-target="true"]';

export const getTabIndexForShortcutKey = (key) => {
  if (!TAB_SHORTCUT_KEYS.includes(key)) {
    return null;
  }

  return key === "0" ? 9 : Number(key) - 1;
};

export const hasKeyboardModifier = (event) =>
  Boolean(event && (event.ctrlKey || event.metaKey || event.altKey));

export const isEditableShortcutTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  const contentEditable = target.getAttribute("contenteditable");

  return (
    target.isContentEditable ||
    target.contentEditable === "true" ||
    contentEditable === "" ||
    contentEditable === "true" ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
};

export const getShortcutTargets = (scope) => {
  if (!(scope instanceof HTMLElement)) {
    return [];
  }

  return Array.from(scope.querySelectorAll(SHORTCUT_TARGET_SELECTOR)).filter((target) => {
    if (!(target instanceof HTMLElement) || !target.isConnected || target.hidden) {
      return false;
    }

    if (target.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const style = window.getComputedStyle(target);
    return style.display !== "none" && style.visibility !== "hidden";
  });
};

const getActiveShortcutTarget = (scope) => {
  if (!(scope instanceof HTMLElement)) {
    return null;
  }

  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement) || !scope.contains(activeElement)) {
    return null;
  }

  const target = activeElement.closest(SHORTCUT_TARGET_SELECTOR);
  return target instanceof HTMLElement && scope.contains(target) ? target : null;
};

const focusShortcutTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  target.focus();
  target.scrollIntoView?.({
    block: "nearest",
    inline: "nearest",
  });

  return document.activeElement === target;
};

export const moveShortcutFocus = (scope, direction) => {
  const targets = getShortcutTargets(scope);
  if (targets.length === 0) {
    return false;
  }

  const currentTarget = getActiveShortcutTarget(scope);
  const currentIndex = currentTarget ? targets.indexOf(currentTarget) : -1;

  if (currentIndex === -1) {
    return focusShortcutTarget(direction < 0 ? targets.at(-1) : targets[0]);
  }

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= targets.length) {
    return false;
  }

  return focusShortcutTarget(targets[nextIndex]);
};

export const focusShortcutBoundaryTarget = (scope, boundary = "start") => {
  const targets = getShortcutTargets(scope);
  if (targets.length === 0) {
    return false;
  }

  return focusShortcutTarget(boundary === "end" ? targets.at(-1) : targets[0]);
};
