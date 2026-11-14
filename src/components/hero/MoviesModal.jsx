import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film, Tv } from "lucide-react";
import { MdMovie } from "react-icons/md";
import { hasKeyboardModifier, isEditableShortcutTarget } from "../../utils/keyboardShortcuts";

const MoviesModal = ({ isOpen, onClose, movies, shows }) => {
  const [activeTab, setActiveTab] = useState("movies");
  const contentRef = useRef(null);

  const focusContent = useCallback(() => {
    contentRef.current?.focus();
  }, []);

  const setActiveTabAndFocus = useCallback((nextTab) => {
    setActiveTab(nextTab);
    focusContent();
  }, [focusContent]);

  const scrollContent = useCallback((direction) => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    const distance = Math.max(160, Math.round(content.clientHeight * 0.8));
    content.scrollBy({
      top: distance * direction,
      behavior: "smooth",
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    focusContent();
  }, [focusContent, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    focusContent();

    const handleKeyDown = (event) => {
      if (hasKeyboardModifier(event)) {
        return;
      }

      if (isEditableShortcutTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveTabAndFocus("movies");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveTabAndFocus("shows");
        return;
      }

      const isSpaceKey = event.code === "Space" || event.key === " " || event.key === "Spacebar";
      if (isSpaceKey) {
        if (event.target instanceof HTMLElement && event.target.closest('button, a, [role="button"]')) {
          return;
        }

        event.preventDefault();
        scrollContent(event.shiftKey ? -1 : 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusContent, isOpen, scrollContent, setActiveTabAndFocus]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="movies-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="movies-modal-card"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="movies-modal-header">
            <div className="movies-modal-title">
              <MdMovie size={24} />
              <h3>Binge Watching Collection</h3>
            </div>
            <button className="movies-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="movies-modal-tabs">
            <button
              className={`movies-tab-btn ${activeTab === "movies" ? "active" : ""}`}
                onClick={() => setActiveTabAndFocus("movies")}
              >
              <Film size={16} />
              <span>Movies</span>
              <span className="movies-count">{movies.length}</span>
            </button>
            <button
              className={`movies-tab-btn ${activeTab === "shows" ? "active" : ""}`}
                onClick={() => setActiveTabAndFocus("shows")}
              >
              <Tv size={16} />
              <span>Web Shows</span>
              <span className="movies-count">{shows.length}</span>
            </button>
          </div>

          <div className="movies-modal-content" ref={contentRef} tabIndex={0}>
            <AnimatePresence mode="wait">
              {activeTab === "movies" && (
                <motion.div
                  key="movies"
                  className="movies-grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {movies.map((movie, index) => (
                    <motion.div
                      key={index}
                      className="movie-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="movie-item-header">
                        <Film size={18} />
                      </div>
                      <h4 className="movie-title">{movie.title}</h4>
                      {movie.year && <span className="movie-year">{movie.year}</span>}
                      {movie.genre && (
                        <div className="movie-genres">
                          {movie.genre.split(", ").map((g, i) => (
                            <span key={i} className="genre-tag">{g}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === "shows" && (
                <motion.div
                  key="shows"
                  className="movies-grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {shows.map((show, index) => (
                    <motion.div
                      key={index}
                      className="movie-item show-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="movie-item-header">
                        <Tv size={18} />
                      </div>
                      <h4 className="movie-title">{show.title}</h4>
                      {show.seasons && (
                        <span className="movie-year">{show.seasons} Season{show.seasons > 1 ? 's' : ''}</span>
                      )}
                      {show.genre && (
                        <div className="movie-genres">
                          {show.genre.split(", ").map((g, i) => (
                            <span key={i} className="genre-tag">{g}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MoviesModal;
