import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbBrandMinecraft } from "react-icons/tb";
import { Move3D } from "lucide-react";
import "./Hero.css";
import "./MinecraftSkinViewer.css";
import ProfileSection from "./hero/ProfileSection";
import CodeCard from "./hero/CodeCard";
import SocialLinks from "./hero/SocialLinks";
import ContentTabs from "./hero/ContentTabs";
import ClickSparkle from "./ClickSparkle";
import {
  getTabIndexForShortcutKey,
  IN_PANE_FOCUS_NEXT_KEYS,
  IN_PANE_FOCUS_PREV_KEYS,
  isEditableShortcutTarget,
} from "../utils/keyboardShortcuts";

const ResumeViewer = lazy(() => import("./ResumeViewer"));
const MinecraftSkinViewer = lazy(() => import("./MinecraftSkinViewer"));

const Hero = ({ onStartDoodle }) => {
  const [showMinecraftModal, setShowMinecraftModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isBlogsActive, setIsBlogsActive] = useState(false);
  const shortcutApiRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const normalizedKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (e.key === 'Escape') {
        if (showHelpModal) {
          setShowHelpModal(false);
          return;
        }
        if (showResumeModal) {
          setShowResumeModal(false);
          return;
        }
        if (showMinecraftModal) {
          setShowMinecraftModal(false);
          return;
        }
      }

      if (isEditableShortcutTarget(e.target)) {
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        if (showResumeModal || showMinecraftModal) {
          return;
        }
        e.preventDefault();
        setShowHelpModal((prev) => !prev);
        return;
      }

      if (normalizedKey === 't') {
        e.preventDefault();
        shortcutApiRef.current?.cycleTheme?.();
        return;
      }

      if (showHelpModal || showResumeModal || showMinecraftModal || shortcutApiRef.current?.isBlocked) {
        return;
      }

      const tabIndex = getTabIndexForShortcutKey(e.key);
      if (tabIndex !== null) {
        e.preventDefault();
        shortcutApiRef.current?.selectTabByIndex?.(tabIndex, { focusTarget: true });
        return;
      }

      if (normalizedKey === 'r') {
        e.preventDefault();
        setShowResumeModal(true);
        return;
      }

      if (IN_PANE_FOCUS_NEXT_KEYS.includes(normalizedKey)) {
        const handled = shortcutApiRef.current?.moveShortcutFocus?.(1);
        if (handled) {
          e.preventDefault();
        }
        return;
      }

      if (IN_PANE_FOCUS_PREV_KEYS.includes(normalizedKey)) {
        const handled = shortcutApiRef.current?.moveShortcutFocus?.(-1);
        if (handled) {
          e.preventDefault();
        }
        return;
      }

      if (normalizedKey === 'Home') {
        const handled = shortcutApiRef.current?.focusShortcutBoundary?.('start');
        if (handled) {
          e.preventDefault();
        }
        return;
      }

      if (normalizedKey === 'End') {
        const handled = shortcutApiRef.current?.focusShortcutBoundary?.('end');
        if (handled) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelpModal, showResumeModal, showMinecraftModal]);

  return (
    <section className="hero">
      <ClickSparkle />
      <div className={`hero-grid${isBlogsActive ? ' blogs-mode' : ''}`}>
        {/* Left Column — always visible on desktop, hidden on mobile when blogs is active */}
        <div className={`hero-left${isBlogsActive ? ' blogs-hidden' : ''}`}>
          <ProfileSection
            onOpenHelp={() => setShowHelpModal(true)}
            onCloseHelp={() => setShowHelpModal(false)}
            showHelpModal={showHelpModal}
          />
          <CodeCard
            onOpenResume={() => setShowResumeModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
          />
          <SocialLinks />
        </div>

        {/* Right Column - Tabbed Content */}
        <ContentTabs
          onOpenMinecraft={() => setShowMinecraftModal(true)}
          onStartDoodle={onStartDoodle}
          onBlogsActiveChange={setIsBlogsActive}
          onShortcutApiReady={(api) => {
            shortcutApiRef.current = api;
          }}
        />
      </div>

      {/* Minecraft Skin Modal - Centrally Managed */}
      <AnimatePresence>
        {showResumeModal && (
          <motion.div
            key="resume-modal"
            className="resume-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResumeModal(false)}
          >
            <motion.div
              className="resume-modal-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Suspense fallback={<div style={{color: 'white', padding: '20px'}}>Loading PDF Viewer...</div>}>
                  <ResumeViewer 
                    pdfUrl={`${import.meta.env.BASE_URL}Prasad_Gade_Resume.pdf`}
                    onClose={() => setShowResumeModal(false)}
                  />
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showMinecraftModal && (
          <motion.div
            key="minecraft-modal"
            className="minecraft-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMinecraftModal(false)}
          >
            <motion.div
              className="minecraft-modal-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="minecraft-modal-header">
                <TbBrandMinecraft />
                <h3>My Minecraft Skin</h3>
                <span className="minecraft-gamertag">prasadgade05</span>
              </div>
              <div className="minecraft-skin-container">
                <Suspense fallback={<div style={{color: 'white', padding: '20px'}}>Loading 3D Viewer...</div>}>
                  <MinecraftSkinViewer
                    skinUrl={`${import.meta.env.BASE_URL}minecraft-skin.png`}
                    width={280}
                    height={400}
                  />
                </Suspense>
                <div className="minecraft-controls-hint">
                  <Move3D />
                  <span>Drag to rotate • Scroll to zoom</span>
                </div>
              </div>
              <button
                className="minecraft-modal-close"
                onClick={() => setShowMinecraftModal(false)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
