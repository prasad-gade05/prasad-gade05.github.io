import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import { codeCardData } from "../../data/portfolioData";

const CodeCard = ({ onOpenResume }) => {
  return (
    <motion.div
      className="code-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="code-header">
        <div className="code-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <span className="code-filename">{codeCardData.filename}</span>
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
