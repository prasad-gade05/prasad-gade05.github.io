import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { themes } from "./config";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const THEME_SWITCH_CLASS = "theme-switching";
// Longer than the 500ms reveal so the class outlives the transition.
const THEME_SWITCH_SUPPRESS_MS = 550;

const prefersReducedMotion = () => (
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches
);

export const useThemePicker = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "arcade-light";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, right: 0 });
  const themePickerRef = useRef(null);
  const toggleBtnRef = useRef(null);
  // Latest requested theme, readable synchronously so fast presses cycle
  // from the newest value instead of a stale render closure.
  const themeRef = useRef(theme);
  // Only one View Transition may run at a time. Every call captures a
  // full-page snapshot pair; letting calls overlap makes Chromium abort
  // (and re-create) those snapshots until the renderer process dies.
  const viewTransitionRef = useRef(null);
  const themeSwitchTimerRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => () => {
    window.clearTimeout(themeSwitchTimerRef.current);
    document.documentElement.classList.remove(THEME_SWITCH_CLASS);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themePickerRef.current && !themePickerRef.current.contains(event.target)) {
        setShowThemePicker(false);
      }
    };

    if (showThemePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showThemePicker]);

  const toggleThemePicker = () => {
    if (!showThemePicker && toggleBtnRef.current) {
      const rect = toggleBtnRef.current.getBoundingClientRect();
      setPickerPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }

    setShowThemePicker((prev) => !prev);
  };

  const switchTheme = useCallback((newThemeId, event) => {
    setShowThemePicker(false);

    if (newThemeId === themeRef.current) {
      return;
    }

    themeRef.current = newThemeId;

    // Hold component transitions still while the new palette lands, then
    // release them once the reveal is over. Presses during the window
    // extend the hold instead of stacking more transitions.
    const root = document.documentElement;
    root.classList.add(THEME_SWITCH_CLASS);
    window.clearTimeout(themeSwitchTimerRef.current);
    themeSwitchTimerRef.current = window.setTimeout(() => {
      root.classList.remove(THEME_SWITCH_CLASS);
    }, THEME_SWITCH_SUPPRESS_MS);

    const applyTheme = () => setTheme(newThemeId);

    const supportsViewTransitions = typeof document.startViewTransition === "function";
    const transitionInFlight = viewTransitionRef.current !== null;

    // Skip the reveal for unsupported browsers, reduced-motion users, and
    // presses that arrive while a snapshot pair is still being animated.
    // Applying the state directly keeps cycling responsive without ever
    // stacking a second full-page transition on top of the first.
    if (!supportsViewTransitions || transitionInFlight || prefersReducedMotion()) {
      applyTheme();
      return;
    }

    const toggleRect = toggleBtnRef.current?.getBoundingClientRect();
    const x = event?.clientX ?? (toggleRect ? toggleRect.left + toggleRect.width / 2 : window.innerWidth / 2);
    const y = event?.clientY ?? (toggleRect ? toggleRect.top + toggleRect.height / 2 : window.innerHeight / 2);
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    let transition;
    try {
      transition = document.startViewTransition(() => {
        // flushSync commits the theme while the browser is capturing the
        // "new" snapshot, so both snapshots always describe real states.
        flushSync(applyTheme);
      });
    } catch {
      applyTheme();
      return;
    }

    viewTransitionRef.current = transition;

    const releaseTransition = () => {
      if (viewTransitionRef.current === transition) {
        viewTransitionRef.current = null;
      }
    };

    // A skipped or interrupted transition rejects these promises; without
    // handlers they surface as unhandled rejections on every rapid press.
    if (transition.finished && typeof transition.finished.catch === "function") {
      transition.finished.catch(() => {}).finally(releaseTransition);
    } else {
      releaseTransition();
    }

    if (!transition.ready || typeof transition.ready.then !== "function") {
      return;
    }

    transition.ready
      .then(() => {
        if (typeof document.documentElement.animate !== "function") {
          return;
        }

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        // Expected whenever the browser skips or interrupts the reveal.
      });
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = themes.findIndex((themeOption) => themeOption.id === themeRef.current);
    const nextThemeId = themes[(currentIndex + 1 + themes.length) % themes.length].id;
    switchTheme(nextThemeId);
  }, [switchTheme]);

  return {
    cycleTheme,
    pickerPos,
    showThemePicker,
    switchTheme,
    theme,
    themePickerRef,
    toggleBtnRef,
    toggleThemePicker,
  };
};
