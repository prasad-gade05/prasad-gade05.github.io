import { useState, useMemo, useEffect, useRef } from "react";
import { ExternalLink, Share2, Check, ChevronDown, Eye } from "lucide-react";
import blogsData from "../../../public/blogs/blogs.json";
import "./BlogsPane.css";
import { handleCardTilt, resetCardTilt } from "../../utils/cardTilt";
import { getListItemKey, getRenderableListValues } from "../../utils/listRendering";
import { useGoatCounterViews } from "./useGoatCounterViews";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const ALL_CATEGORIES = [
  "All",
  ...Array.from(new Set(blogsData.flatMap((blog) => getRenderableListValues(blog.categories)))),
];

const BlogCard = ({ blog }) => {
  const [copied, setCopied] = useState(false);
  const categories = getRenderableListValues(blog.categories);
  const views = useGoatCounterViews(blog.url);
  const blogViews = views[blog.url];

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `https://prasadgade.dev${blog.url}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCardClick = () => {
    // Stamp ?tab=blogs on current history entry so browser back returns to blogs tab
    window.history.replaceState({}, '', '/?tab=blogs');
    window.location.href = `https://prasadgade.dev${blog.url}`;
  };

  const handleCardKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleCardClick();
  };

  return (
    <div
      className="blog-card"
      data-shortcut-target="true"
      onClick={handleCardClick}
      role="article"
      tabIndex={0}
      aria-label={`Open blog ${blog.title}`}
      onKeyDown={handleCardKeyDown}
    >
      <div className="blog-card-thumb-wrap">
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="blog-card-thumb"
          loading="lazy"
        />
        <button
          className={`blog-card-share ${copied ? "copied" : ""}`}
          onClick={handleShare}
          title={copied ? "Link copied!" : "Copy link"}
          aria-label="Copy blog link"
          data-shortcut-target="true"
        >
          {copied ? <Check size={13} /> : <Share2 size={13} />}
        </button>
      </div>
      <div className="blog-card-body">
        <div className="blog-card-categories">
          {categories.map((cat, index) => (
            <span
              key={getListItemKey(`${blog.slug || blog.title || "blog"}-category`, cat, index)}
              className="blog-category-tag"
            >
              {cat}
            </span>
          ))}
        </div>
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-excerpt">{blog.excerpt}</p>
        <div className="blog-card-meta">
          <time dateTime={blog.date}>{formatDate(blog.date)}</time>
          <span className="meta-dot">·</span>
          <span>{blog.readTime} min read</span>
          {typeof blogViews === "string" && (
            <>
              <span className="meta-dot">·</span>
              <span className="blog-card-views" title="All-time views">
                <Eye size={11} />
                {blogViews}
              </span>
            </>
          )}
          <span className="blog-card-read-more">
            Read <ExternalLink size={11} />
          </span>
        </div>
      </div>
    </div>
  );
};

const BlogsPane = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    if (showSort) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSort]);

  const results = useMemo(() => {
    let list = [...blogsData];

    if (activeCategory !== "All") {
      list = list.filter((blog) => getRenderableListValues(blog.categories).includes(activeCategory));
    }

    list.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOrder === "newest" ? db - da : da - db;
    });

    return list;
  }, [activeCategory, sortOrder]);

  return (
    <div className="blogs-pane">
      {/* Manifesto */}
      <div
        className="blogs-manifesto"
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
      >
        <span className="manifesto-label">About this space</span>
        <p className="manifesto-intro">
          Welcome to my blog space — a place for my thoughts on tech, data, and life.
        </p>
        <ul className="manifesto-bullets">
          <li>From automated data pipelines to insightful 3 AM thoughts</li>
          <li>No fluff · 100% human-written</li>
          <li>Just my journey, shared honestly</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="blogs-controls">
        <div className="blogs-filters-row">
          <div className="blogs-categories">
            {ALL_CATEGORIES.map((cat, index) => (
              <button
                key={getListItemKey("blog-filter", cat, index)}
                className={`cat-chip ${activeCategory === cat ? "active" : ""}`}
                data-shortcut-target="true"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-dropdown-wrap" ref={sortRef}>
            <button
              className="sort-btn"
              onClick={() => setShowSort((p) => !p)}
              aria-label="Sort blogs"
              data-shortcut-target="true"
            >
              {sortOrder === "newest" ? "Newest" : "Oldest"}
              <ChevronDown size={13} style={{ transform: showSort ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showSort && (
              <div className="sort-menu">
                <button
                  className={`sort-option ${sortOrder === "newest" ? "active" : ""}`}
                  data-shortcut-target="true"
                  onClick={() => { setSortOrder("newest"); setShowSort(false); }}
                >
                  Newest First
                </button>
                <button
                  className={`sort-option ${sortOrder === "oldest" ? "active" : ""}`}
                  data-shortcut-target="true"
                  onClick={() => { setSortOrder("oldest"); setShowSort(false); }}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="blogs-grid">
        {results.length > 0 ? (
          results.map((blog, index) => (
            <BlogCard key={blog.slug || `${blog.title || "blog"}-${index}`} blog={blog} />
          ))
        ) : (
          <div className="blogs-empty">
            <p>No blogs in this category yet.</p>
            <button className="blogs-empty-clear" data-shortcut-target="true" onClick={() => setActiveCategory("All")}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPane;
