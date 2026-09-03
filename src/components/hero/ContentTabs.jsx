import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import "../../components/hero/MoviesModal.css";
import { movies, webShows } from "../../data/portfolioData";
import { splitGroups, tabs } from "./contentTabs/config";
import ContentTabPanes from "./contentTabs/ContentTabPanes";
import TabsHeader from "./contentTabs/TabsHeader";
import { useThemePicker } from "./contentTabs/useThemePicker";
import { focusShortcutBoundaryTarget, moveShortcutFocus } from "../../utils/keyboardShortcuts";

const MoviesModal = lazy(() => import("./MoviesModal"));

const ContentTabs = ({ onOpenMinecraft, onStartDoodle, onStartSmash, onBlogsActiveChange, onShortcutApiReady }) => {
  const [activeTabs, setActiveTabs] = useState(["projects"]);
  const [isMoviesModalOpen, setIsMoviesModalOpen] = useState(false);
  const contentRef = useRef(null);
  const pendingShortcutFocusRef = useRef(null);
  const {
    cycleTheme,
    pickerPos,
    showThemePicker,
    switchTheme,
    theme,
    themePickerRef,
    toggleBtnRef,
    toggleThemePicker,
  } = useThemePicker();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMoviesModalOpen) {
        setIsMoviesModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMoviesModalOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "blogs") {
      setActiveTabs(["blogs"]);
      onBlogsActiveChange?.(true);
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabClick = useCallback((tab) => {
    if (tab.id === "blogs") {
      setActiveTabs(["blogs"]);
      onBlogsActiveChange?.(true);
      return;
    }

    onBlogsActiveChange?.(false);

    if (tab.splitGroup && splitGroups[tab.splitGroup]) {
      setActiveTabs(splitGroups[tab.splitGroup]);
      return;
    }

    setActiveTabs([tab.id]);
  }, [onBlogsActiveChange]);

  const focusShortcutBoundary = useCallback((boundary) => (
    focusShortcutBoundaryTarget(contentRef.current, boundary)
  ), []);

  const movePaneShortcutFocus = useCallback((direction) => (
    moveShortcutFocus(contentRef.current, direction)
  ), []);

  const selectTabByIndex = useCallback((index, options = {}) => {
    const tab = tabs[index];
    if (tab) {
      pendingShortcutFocusRef.current = options.focusTarget ? "start" : null;
      handleTabClick(tab);
    }
  }, [handleTabClick]);

  useEffect(() => {
    const boundary = pendingShortcutFocusRef.current;
    if (!boundary) {
      return;
    }

    pendingShortcutFocusRef.current = null;
    focusShortcutBoundary(boundary);
  }, [activeTabs, focusShortcutBoundary]);

  useEffect(() => {
    onShortcutApiReady?.({
      cycleTheme,
      focusShortcutBoundary,
      isBlocked: isMoviesModalOpen,
      moveShortcutFocus: movePaneShortcutFocus,
      selectTabByIndex,
    });

    return () => onShortcutApiReady?.(null);
  }, [cycleTheme, focusShortcutBoundary, isMoviesModalOpen, movePaneShortcutFocus, onShortcutApiReady, selectTabByIndex]);

  return (
    <motion.div
      className="hero-right"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <TabsHeader
        activeTabs={activeTabs}
        onTabClick={handleTabClick}
        pickerPos={pickerPos}
        showThemePicker={showThemePicker}
        switchTheme={switchTheme}
        theme={theme}
        themePickerRef={themePickerRef}
        toggleBtnRef={toggleBtnRef}
        toggleThemePicker={toggleThemePicker}
        tabs={tabs}
      />

      <ContentTabPanes
        activeTabs={activeTabs}
        contentRef={contentRef}
        onOpenMinecraft={onOpenMinecraft}
        onOpenMovies={() => setIsMoviesModalOpen(true)}
        onStartDoodle={onStartDoodle}
        onStartSmash={onStartSmash}
      />

      <Suspense fallback={null}>
        {isMoviesModalOpen && (
          <MoviesModal
            isOpen={isMoviesModalOpen}
            onClose={() => setIsMoviesModalOpen(false)}
            movies={movies}
            shows={webShows}
          />
        )}
      </Suspense>
    </motion.div>
  );
};

export default ContentTabs;
