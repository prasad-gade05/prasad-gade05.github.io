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
          {codeCardData.codeLines.map((line) => (
            <span key={line.lineNum} className="line">
              {line.lineNum && <span className="ln">{line.lineNum}</span>}
              {line.tokens.map((token, i) => (
                <span key={i} className={token.type}>
                  {token.content}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </motion.div>
  );
};

export default CodeCard;
