import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";

const CodeCard = () => {
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
        <span className="code-filename">prasad_gade.py</span>
        <a
          href="https://drive.google.com/file/d/134zdT9FaQX6siuHMxnICxBqZrK_R3YXV/view?usp=sharing"
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
          <span className="line">
            <span className="ln">1</span>
            <span className="kw">class</span>{" "}
            <span className="cls">DataScientist</span>
            <span className="p">:</span>
          </span>
          <span className="line">
            <span className="ln">2</span>
            {"    "}
            <span className="kw">def</span>{" "}
            <span className="fn">__init__</span>
            <span className="p">(</span>
            <span className="sf">self</span>
            <span className="p">):</span>
          </span>
          <span className="line">
            <span className="ln">3</span>
            {"        "}
            <span className="sf">self</span>
            <span className="p">.</span>
            <span className="pr">name</span> <span className="op">=</span>{" "}
            <span className="st">"Prasad Gade"</span>
          </span>
          <span className="line">
            <span className="ln">4</span>
            {"        "}
            <span className="sf">self</span>
            <span className="p">.</span>
            <span className="pr">role</span> <span className="op">=</span>{" "}
            <span className="st">"DS | ML | DA"</span>
          </span>
          <span className="line">
            <span className="ln">5</span>
            {"        "}
            <span className="sf">self</span>
            <span className="p">.</span>
            <span className="pr">skills</span>{" "}
            <span className="op">=</span> <span className="p">[</span>
            <span className="st">"Python"</span>
            <span className="p">,</span>{" "}
            <span className="st">"Machine Learning"</span>
            <span className="p">]</span>
          </span>
          <span className="line">
            <span className="ln">6</span>
          </span>
          <span className="line">
            <span className="ln">7</span>
            {"    "}
            <span className="kw">def</span>{" "}
            <span className="fn">transform</span>
            <span className="p">(</span>
            <span className="sf">self</span>
            <span className="p">,</span> <span className="pm">data</span>
            <span className="p">):</span>
          </span>
          <span className="line">
            <span className="ln">8</span>
            {"        "}
            <span className="kw">return</span>{" "}
            <span className="sf">self</span>
            <span className="p">.</span>
            <span className="fn">insights</span>
            <span className="p">(</span>
            <span className="pm">data</span>
            <span className="p">)</span>
          </span>
        </code>
      </pre>
    </motion.div>
  );
};

export default CodeCard;
