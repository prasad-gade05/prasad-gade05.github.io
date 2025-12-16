import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film, Tv } from "lucide-react";
import { MdMovie } from "react-icons/md";

const MoviesModal = ({ isOpen, onClose, movies, shows }) => {
  const [activeTab, setActiveTab] = useState("movies");

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
              onClick={() => setActiveTab("movies")}
            >
              <Film size={16} />
              <span>Movies</span>
              <span className="movies-count">{movies.length}</span>
            </button>
            <button
              className={`movies-tab-btn ${activeTab === "shows" ? "active" : ""}`}
              onClick={() => setActiveTab("shows")}
            >
              <Tv size={16} />
              <span>Web Shows</span>
              <span className="movies-count">{shows.length}</span>
            </button>
          </div>

          <div className="movies-modal-content">
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
