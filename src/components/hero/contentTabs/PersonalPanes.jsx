import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Hammer, Headphones, Music, Pencil, Tv } from "lucide-react";
import { FaSpotify } from "react-icons/fa";
import { GiBookCover, GiCricketBat } from "react-icons/gi";
import { MdMovie } from "react-icons/md";
import { TbBrandMinecraft } from "react-icons/tb";
import { handleCardTilt, resetCardTilt } from "../../../utils/cardTilt";
import { hobbies } from "../../../data/portfolioData";
import { getListItemKey, getRenderableListValues } from "../../../utils/listRendering";
import { prefetchSmashRoom } from "../../smash/elementCapture";
import { tabPaneMotionProps } from "./motion";

const BlogsPane = lazy(() => import("../BlogsPane"));

export const HobbiesPane = ({ isSplit, onOpenMinecraft, onOpenMovies, onStartDoodle, onStartSmash }) => (
  <motion.div
    key="hobbies"
    className={`tab-pane hobbies-pane ${isSplit ? "split" : ""}`}
    {...tabPaneMotionProps}
  >
    <div className="pane-header">
      <Music size={16} />
      <span>Hobbies & Interests</span>
    </div>
    <div className="hobbies-grid">
      <div
        className="hobby-card hobby-sports"
        data-shortcut-target="true"
        aria-label="Sports and gaming card"
        role="group"
        tabIndex={-1}
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
      >
        <div className="hobby-card-header">
          <div className="hobby-card-icon">
            <Gamepad2 size={20} />
          </div>
          <h4>Sports & Gaming</h4>
        </div>
        <div className="hobby-card-content">
          <div className="hobby-activities">
            <div className="hobby-activity-item">
              <GiCricketBat size={18} />
              <span>{hobbies.sports.cricket}</span>
            </div>
            <button
              type="button"
              className="hobby-activity-item minecraft-clickable"
              data-shortcut-target="true"
              onClick={onOpenMinecraft}
            >
              <TbBrandMinecraft size={18} />
              <span>{hobbies.sports.minecraft}</span>
            </button>
            <button
              type="button"
              className="hobby-activity-item minecraft-clickable doodle-clickable"
              data-shortcut-target="true"
              onClick={onStartDoodle}
            >
              <Pencil size={18} />
              <span>Paper Playground</span>
            </button>
            <button
              type="button"
              className="hobby-activity-item minecraft-clickable doodle-clickable"
              data-shortcut-target="true"
              onClick={onStartSmash}
              onMouseEnter={prefetchSmashRoom}
              onFocus={prefetchSmashRoom}
            >
              <Hammer size={18} />
              <span>Smash Room</span>
            </button>
          </div>
        </div>
        <div className="hobby-card-decoration"></div>
      </div>

      <div
        className="hobby-card hobby-reading"
        data-shortcut-target="true"
        aria-label="Currently reading card"
        role="group"
        tabIndex={-1}
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
      >
        <div className="hobby-card-header">
          <div className="hobby-card-icon">
            <GiBookCover size={20} />
          </div>
          <h4>Currently Reading</h4>
        </div>
        <div className="hobby-card-content">
          <div className="book-info">
            <span className="book-title">{hobbies.book.title}</span>
            <span className="book-author">by {hobbies.book.author}</span>
          </div>
        </div>
        <div className="hobby-card-decoration"></div>
      </div>

      <div
        className="hobby-card hobby-music"
        data-shortcut-target="true"
        aria-label="Favorite tracks card"
        role="group"
        tabIndex={-1}
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
      >
        <div className="hobby-card-header">
          <div className="hobby-card-icon">
            <Headphones size={20} />
          </div>
          <h4>Favorite Tracks</h4>
          <div className="equalizer">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
        <div className="hobby-card-content">
          <div className="hobby-songs">
            {hobbies.songs.map((song, index) => (
              <a
                key={song.link || getListItemKey("song-link", song.name, index)}
                href={song.link}
                target="_blank"
                rel="noopener noreferrer"
                className="song-link"
                data-shortcut-target="true"
              >
                <FaSpotify size={14} />
                <span>{song.name}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="hobby-card-decoration"></div>
      </div>

      <div
        className="hobby-card hobby-series"
        data-shortcut-target="true"
        aria-label="Binge watching card"
        role="group"
        tabIndex={-1}
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
      >
        <div className="hobby-card-header">
          <div className="hobby-card-icon">
            <Tv size={20} />
          </div>
          <h4>Binge Watching</h4>
        </div>
        <div className="hobby-card-content">
          <div className="hobby-tags">
            {getRenderableListValues(hobbies.series).map((series, index) => (
              <span key={getListItemKey("series-tag", series, index)} className="series-tag">
                <MdMovie size={14} />
                {series}
              </span>
            ))}
          </div>
          <button className="see-more-btn" type="button" data-shortcut-target="true" onClick={onOpenMovies}>
            <MdMovie size={14} />
            <span>See All Movies & Shows</span>
          </button>
        </div>
        <div className="hobby-card-decoration"></div>
      </div>
    </div>
  </motion.div>
);

export const BlogsTabPane = () => (
  <motion.div key="blogs" className="tab-pane blogs-tab-pane" {...tabPaneMotionProps}>
    <Suspense fallback={<div style={{ padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>Loading blogs...</div>}>
      <BlogsPane />
    </Suspense>
  </motion.div>
);
