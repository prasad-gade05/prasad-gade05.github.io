import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, Play, Plus, Save } from "lucide-react";
import confetti from "canvas-confetti";
import { codeCardData } from "../../data/portfolioData";

const MENU_ITEMS = ["File", "Edit", "View", "Insert", "Cell", "Widgets"];
const CELL_RUN_MS = 700;

const JupyterLogo = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <circle cx="12" cy="5.5" r="3.6" fill="#F37726" opacity="0.9" />
    <circle cx="5.6" cy="17.5" r="3.6" fill="#2BB6E0" opacity="0.9" />
    <circle cx="18.4" cy="17.5" r="3.6" fill="#9E5AC8" opacity="0.9" />
  </svg>
);

const CodeCard = ({ onOpenResume, onOpenHelp }) => {
  const [kernelState, setKernelState] = useState("idle");
  const [runningCellId, setRunningCellId] = useState(null);
  const [kernelMenuOpen, setKernelMenuOpen] = useState(false);
  const [kernelMenuPos, setKernelMenuPos] = useState(null);
  const kernelMenuAnchorRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 70,
      spread: 90,
      origin: { x: 0.35, y: 0.65 },
      zIndex: 200000,
    });
  }, []);

  const runNotebook = useCallback(() => {
    if (timersRef.current.length > 0) return;
    setKernelState("busy");
    const cells = codeCardData.cells;
    cells.forEach((cell, index) => {
      timersRef.current.push(
        setTimeout(() => setRunningCellId(cell.id), index * CELL_RUN_MS),
      );
    });
    timersRef.current.push(
      setTimeout(() => {
        setRunningCellId(null);
        setKernelState("idle");
        timersRef.current = [];
        fireConfetti();
      }, cells.length * CELL_RUN_MS),
    );
  }, [fireConfetti]);

  const restartKernel = useCallback(() => {
    clearTimers();
    setRunningCellId(null);
    setKernelState("idle");
    setKernelMenuOpen(false);
  }, [clearTimers]);

  const restartAndRunAll = useCallback(() => {
    setKernelMenuOpen(false);
    clearTimers();
    setRunningCellId(null);
    runNotebook();
  }, [clearTimers, runNotebook]);

  const toggleKernelMenu = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setKernelMenuPos(
      rect && rect.width > 0
        ? { top: rect.bottom + 6, left: rect.left }
        : null,
    );
    setKernelMenuOpen((open) => !open);
  };

  useEffect(() => {
    if (!kernelMenuOpen) return;
    const onPointerDown = (event) => {
      if (kernelMenuAnchorRef.current?.contains(event.target)) return;
      setKernelMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setKernelMenuOpen(false);
    };
    const closeOnMove = () => setKernelMenuOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", closeOnMove, true);
    window.addEventListener("resize", closeOnMove);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", closeOnMove, true);
      window.removeEventListener("resize", closeOnMove);
    };
  }, [kernelMenuOpen]);

  return (
    <motion.div
      className="code-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="code-header">
        <div className="nb-menu">
          <span className="nb-logo" aria-hidden="true">
            <JupyterLogo />
          </span>
          {MENU_ITEMS.map((item) => (
            <span key={item} className="nb-menu-item" aria-hidden="true">
              {item}
            </span>
          ))}
          <button
            type="button"
            ref={kernelMenuAnchorRef}
            className="nb-menu-item"
            onClick={toggleKernelMenu}
            aria-haspopup="menu"
            aria-expanded={kernelMenuOpen}
          >
            Kernel
          </button>
          <button
            type="button"
            className="nb-menu-item nb-menu-help"
            onClick={onOpenHelp}
            title="Keyboard shortcuts (?)"
          >
            Help
          </button>
          <button
            type="button"
            className={`nb-kernel${kernelState === "busy" ? " busy" : ""}`}
            onClick={restartAndRunAll}
            title="Restart & Run All"
          >
            <span className="nb-kernel-dot" />
            Python 3
            <span className="nb-kernel-status">
              {kernelState === "busy" ? "busy" : "idle"}
            </span>
          </button>
        </div>
        <div className="nb-toolbar">
          <button
            type="button"
            className="nb-tool"
            onClick={runNotebook}
            disabled={kernelState === "busy"}
            title="Run all cells"
          >
            <Play size={12} />
          </button>
          <span className="nb-tool" aria-hidden="true" title="Insert cell below">
            <Plus size={12} />
          </span>
          <span className="nb-tool" aria-hidden="true" title="Save notebook">
            <Save size={12} />
          </span>
          <span className="nb-filename">
            <FileText size={11} aria-hidden="true" />
            {codeCardData.filename}
          </span>
          <a
            href={codeCardData.resumeLink}
            onClick={(e) => {
              if (onOpenResume) {
                e.preventDefault();
                onOpenResume();
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="resume-btn"
          >
            <FileText size={12} />
            Resume
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
      {kernelMenuOpen && kernelMenuPos && (
        <div
          className="nb-dropdown"
          role="menu"
          style={{ top: kernelMenuPos.top, left: kernelMenuPos.left }}
        >
          <button
            type="button"
            role="menuitem"
            className="nb-dropdown-item"
            onClick={restartKernel}
          >
            Restart
          </button>
          <button
            type="button"
            role="menuitem"
            className="nb-dropdown-item"
            onClick={restartAndRunAll}
          >
            Restart &amp; Run All
          </button>
        </div>
      )}
      <pre className="code-content">
        <code>
          {codeCardData.cells.map((cell) => (
            <span key={cell.id} className="nb-cell">
              <span className="nb-row">
                <span
                  className={`nb-prompt${runningCellId === cell.id ? " busy" : ""}`}
                >
                  In [{runningCellId === cell.id ? "*" : cell.executionCount}]:
                </span>
                <span className="nb-input">
                  {cell.lines.map((line, li) => (
                    <span key={li} className="line">
                      {line.tokens.map((token, i) => (
                        <span key={i} className={token.type}>
                          {token.content}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </span>
              {cell.output && (
                <span className="nb-row">
                  <span className="nb-prompt out">
                    Out[{cell.executionCount}]:
                  </span>
                  <span className="nb-output">
                    {cell.output.map((line, li) => (
                      <span key={li} className="line">
                        {line.tokens.map((token, i) => (
                          <span key={i} className={token.type}>
                            {token.content}
                          </span>
                        ))}
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </span>
          ))}
        </code>
      </pre>
    </motion.div>
  );
};

export default CodeCard;
