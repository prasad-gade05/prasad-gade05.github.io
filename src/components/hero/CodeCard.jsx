import { motion } from "framer-motion";
import { FileText, ExternalLink, Play, Plus, Save } from "lucide-react";
import { codeCardData } from "../../data/portfolioData";

const MENU_ITEMS = ["File", "Edit", "View", "Insert", "Cell", "Kernel", "Widgets"];

const JupyterLogo = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <circle cx="12" cy="5.5" r="3.6" fill="#F37726" opacity="0.9" />
    <circle cx="5.6" cy="17.5" r="3.6" fill="#2BB6E0" opacity="0.9" />
    <circle cx="18.4" cy="17.5" r="3.6" fill="#9E5AC8" opacity="0.9" />
  </svg>
);

const CodeCard = ({ onOpenResume, onOpenHelp }) => {
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
            className="nb-menu-item nb-menu-help"
            onClick={onOpenHelp}
            title="Keyboard shortcuts (?)"
          >
            Help
          </button>
          <span className="nb-kernel" aria-hidden="true">
            <span className="nb-kernel-dot" />
            Python 3
          </span>
        </div>
        <div className="nb-toolbar">
          <span className="nb-tool" aria-hidden="true" title="Run">
            <Play size={12} />
          </span>
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
      <pre className="code-content">
        <code>
          {codeCardData.cells.map((cell) => (
            <span key={cell.id} className="nb-cell">
              <span className="nb-row">
                <span className="nb-prompt">In [{cell.executionCount}]:</span>
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
