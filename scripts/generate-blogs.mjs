import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const SITE_URL = "https://prasadgade.dev";
const AUTHOR_NAME = "Prasad Gade";
const AUTHOR_EMAIL = "prasadgade4405@gmail.com";
const GOOGLE_ANALYTICS_ID = "G-382G6DQ243";
const GOATCOUNTER_URL = "https://prasadgade05.goatcounter.com/count";

const BLOG_LIST_URL = `${SITE_URL}/blogs/blogs.json`;
const BLOG_RSS_URL = `${SITE_URL}/blogs/rss.xml`;

marked.setOptions({
  gfm: true,
});

function createPaths(rootDir = ROOT_DIR) {
  const publicDir = path.join(rootDir, "public");
  const blogsDir = path.join(publicDir, "blogs");

  return {
    sourceDir: path.join(rootDir, "blog-posts"),
    publicDir,
    blogsDir,
    blogAssetsDir: path.join(blogsDir, "assets"),
    blogListPath: path.join(blogsDir, "blogs.json"),
    blogRssPath: path.join(blogsDir, "rss.xml"),
    sitemapPath: path.join(publicDir, "sitemap.xml"),
    llmsPath: path.join(publicDir, "llms.txt"),
    llmsFullPath: path.join(publicDir, "llms-full.txt"),
  };
}

function syncBlogs({ rootDir = ROOT_DIR } = {}) {
  const paths = createPaths(rootDir);
  ensureDirectory(paths.sourceDir);
  ensureDirectory(paths.blogsDir);
  ensureDirectory(paths.blogAssetsDir);

  const posts = loadPosts(paths).sort(comparePostsNewestFirst);
  const removedDirectories = pruneGeneratedBlogDirectories(paths, posts);
  const removedAssets = pruneUnusedBlogAssets(paths, posts);
  const postResults = writeBlogPages(paths, posts);
  const outputs = {
    blogList: writeBlogList(paths, posts),
    rss: writeRssFeed(paths, posts),
    sitemap: updateSitemap(paths, posts),
    ...updateLlmsFiles(paths, posts),
  };

  return {
    posts,
    postResults,
    outputs,
    removedDirectories,
    removedAssets,
  };
}

function main() {
  const summary = syncBlogs();
  console.log(formatSyncSummary(summary));
}

function loadPosts(paths) {
  const folders = fs
    .readdirSync(paths.sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => compareSourceFolders(left.name, right.name));

  return folders.map((folder) => loadPost(paths, folder.name));
}

function loadPost(paths, folderName) {
  const folderPath = path.join(paths.sourceDir, folderName);
  const files = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !isIgnorableFile(entry.name));

  const markdownFiles = files.filter((file) => path.extname(file.name).toLowerCase() === ".md");
  const pngFiles = files.filter((file) => path.extname(file.name).toLowerCase() === ".png");

  if (markdownFiles.length !== 1 || pngFiles.length !== 1 || files.length !== 2) {
    throw new Error(
      `Expected exactly one .md file and one .png file in "${folderName}", found: ${files
        .map((file) => file.name)
        .join(", ")}`
    );
  }

  const markdownFile = markdownFiles[0];
  const imageFile = pngFiles[0];
  const markdownPath = path.join(folderPath, markdownFile.name);
  const imagePath = path.join(folderPath, imageFile.name);
  const rawMarkdown = fs.readFileSync(markdownPath, "utf8");
  const { data, content } = matter(rawMarkdown);

  const title = normalizeRequiredString(data.title, "title", folderName);
  const publishedDate = normalizeRequiredDate(data.date, folderName);
  const categories = normalizeCategories(data.category ?? data.categories, folderName);
  const slug = data.slug ? normalizeSlug(data.slug, folderName) : slugify(title);
  const thumbnail = normalizeThumbnail(data.thumbnail, imageFile.name, folderName);
  const bodyMarkdown = stripLeadingTitleHeading(content, title).trim();

  if (!bodyMarkdown) {
    throw new Error(`Blog "${folderName}" has no markdown body content.`);
  }

  const excerpt = trimText(extractParagraphText(bodyMarkdown, 1), 200);
  const summary = trimText(extractParagraphText(bodyMarkdown, 2), 360);
  const plainText = collapseWhitespace(stripMarkdown(bodyMarkdown));
  const wordCount = countWords(plainText);
  const readTime = Math.max(1, Math.ceil(wordCount / 225));
  const contentHtml = marked.parse(bodyMarkdown);
  const publishedDateLabel = formatDisplayDate(publishedDate);

  return {
    sourceFolder: folderName,
    sourceImagePath: imagePath,
    title,
    date: publishedDate,
    dateLabel: publishedDateLabel,
    categories,
    slug,
    thumbnail,
    excerpt,
    summary,
    wordCount,
    readTime,
    contentHtml,
    url: `/blogs/${slug}/`,
    absoluteUrl: `${SITE_URL}/blogs/${slug}/`,
    absoluteThumbnailUrl: `${SITE_URL}${thumbnail}`,
  };
}

function writeBlogPages(paths, posts) {
  const results = [];

  for (const post of posts) {
    const postDirectory = path.join(paths.blogsDir, post.slug);
    ensureDirectory(postDirectory);
    const assetPath = path.join(paths.blogAssetsDir, path.basename(post.thumbnail));
    const pagePath = path.join(postDirectory, "index.html");

    results.push({
      slug: post.slug,
      asset: copyFileIfChanged(post.sourceImagePath, assetPath),
      page: writeFileIfChanged(pagePath, renderBlogPage(post)),
    });
  }

  return results;
}

function writeBlogList(paths, posts) {
  const payload = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    thumbnail: post.thumbnail,
    categories: post.categories,
    excerpt: post.excerpt,
    readTime: post.readTime,
    url: post.url,
  }));

  return writeFileIfChanged(paths.blogListPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeRssFeed(paths, posts) {
  const lastBuildDate = posts[0] ? formatRssDate(posts[0].date) : formatRssDate(new Date().toISOString().slice(0, 10));
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.absoluteUrl)}</link>
      <guid isPermaLink="true">${escapeXml(post.absoluteUrl)}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${escapeXml(formatRssDate(post.date))}</pubDate>
      <author>${escapeXml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</author>
${post.categories.map((category) => `      <category>${escapeXml(category)}</category>`).join("\n")}
      <enclosure url="${escapeXml(post.absoluteThumbnailUrl)}" type="image/png" length="0" />
    </item>`
    )
    .join("\n\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Prasad Gade — Blog</title>
    <link>${SITE_URL}/?tab=blogs</link>
    <description>100% human written thoughts on tech, data, building things, and whatever else catches my attention. No AI content. No fluff. Just honest writing.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <managingEditor>${escapeXml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</managingEditor>
    <webMaster>${escapeXml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</webMaster>
    <atom:link href="${SITE_URL}/blogs/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/profile.jpg</url>
      <title>Prasad Gade — Blog</title>
      <link>${SITE_URL}/?tab=blogs</link>
    </image>

${items}
  </channel>
</rss>
`;

  return writeFileIfChanged(paths.blogRssPath, rss);
}

function updateSitemap(paths, posts) {
  let sitemap = fs.readFileSync(paths.sitemapPath, "utf8");
  const rootLastmod = posts[0]?.date ?? new Date().toISOString().slice(0, 10);

  sitemap = sitemap.replace(
    /(<url>\s*<loc>https:\/\/prasadgade\.dev\/<\/loc>\s*<lastmod>)([^<]+)(<\/lastmod>[\s\S]*?<\/url>)/,
    `$1${rootLastmod}$3`
  );

  sitemap = removeSitemapEntries(sitemap, [BLOG_LIST_URL, BLOG_RSS_URL]);
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/prasadgade\.dev\/blogs\/[^<]+\/<\/loc>[\s\S]*?<\/url>/g, "");

  const blogEntries = [
    {
      loc: BLOG_LIST_URL,
      lastmod: rootLastmod,
      changefreq: "monthly",
      priority: "0.5",
    },
    {
      loc: BLOG_RSS_URL,
      lastmod: rootLastmod,
      changefreq: "monthly",
      priority: "0.5",
    },
    ...posts.map((post) => ({
      loc: post.absoluteUrl,
      lastmod: post.date,
      changefreq: "yearly",
      priority: "0.8",
    })),
  ]
    .map(formatSitemapEntry)
    .join("\n");

  sitemap = sitemap.replace(
    /(<url>\s*<loc>https:\/\/prasadgade\.dev\/<\/loc>[\s\S]*?<\/url>)/,
    (_, rootBlock) => `${rootBlock}\n${blogEntries}`
  );

  return writeFileIfChanged(paths.sitemapPath, `${sitemap.trim()}\n`);
}

function formatSitemapEntry(entry) {
  return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

function removeSitemapEntries(sitemap, urls) {
  return urls.reduce(
    (currentSitemap, url) =>
      currentSitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${escapeRegExp(url)}</loc>[\\s\\S]*?</url>`, "g"), ""),
    sitemap
  );
}

function updateLlmsFiles(paths, posts) {
  const llmsBlogSection = `Prasad writes a personal blog at prasadgade.dev. All written content is 100% human-written. Thumbnails are AI-generated. The blog pipeline reads strict source folders from blog-posts/, validates one Markdown file and one PNG per post, renders static pages, rebuilds blogs.json and RSS, updates sitemap and LLM files, prunes stale generated output, and skips unchanged pages/assets/shared files through write-if-changed caching.

- Blog listing: ${SITE_URL}/?tab=blogs
- Blog metadata (JSON): ${SITE_URL}/blogs/blogs.json
- RSS feed: ${SITE_URL}/blogs/rss.xml

### Published Posts

${posts
  .map((post) => `- ${post.title}: ${post.absoluteUrl}`)
  .join("\n")}`;

  const llmsFullBlogSection = `Prasad writes a personal blog at prasadgade.dev. All written content is 100% human-written. Thumbnails are AI-generated.

Blog pipeline:
- Source: one subfolder per post under blog-posts/, with exactly one Markdown file and one PNG file
- Validation: npm run blogs:sync fails if a post folder has missing, extra, or mismatched files/frontmatter
- Outputs: static post pages, public/blogs/blogs.json, public/blogs/rss.xml, sitemap blog URLs, and the blog sections in llms.txt and llms-full.txt
- Caching: generated pages, thumbnails, and shared files are written only when their content changes; unchanged outputs are skipped and stale generated post folders/assets are pruned
- Build hook: npm run build runs npm run blogs:sync first through prebuild, so npm run deploy publishes regenerated blog output

- Blog listing: ${SITE_URL}/?tab=blogs
- Blog metadata (JSON): ${SITE_URL}/blogs/blogs.json
- RSS feed: ${SITE_URL}/blogs/rss.xml

### Published Posts

${posts
  .map(
    (post) => `#### ${post.title}
- URL: ${post.absoluteUrl}
- Date: ${post.dateLabel}
- ${post.categories.length === 1 ? "Category" : "Categories"}: ${post.categories.join(", ")}
- Read time: ${post.readTime} min
- Summary: ${post.summary}`
  )
  .join("\n\n")}`;

  const llmsSource = fs.readFileSync(paths.llmsPath, "utf8");
  const llmsFullSource = fs.readFileSync(paths.llmsFullPath, "utf8");

  return {
    llms: writeFileIfChanged(
      paths.llmsPath,
      replaceMarkdownHeadingSection(llmsSource, "Blogs", llmsBlogSection, path.basename(paths.llmsPath))
    ),
    llmsFull: writeFileIfChanged(
      paths.llmsFullPath,
      replaceMarkdownHeadingSection(llmsFullSource, "Blogs", llmsFullBlogSection, path.basename(paths.llmsFullPath))
    ),
  };
}

function replaceMarkdownHeadingSection(source, heading, replacementBody, sourceLabel = "source") {
  const normalizedSource = source.replace(/\r\n/g, "\n");
  const sectionPattern = new RegExp(`## ${escapeRegExp(heading)}\\n\\n[\\s\\S]*?(?=\\n## |$)`);

  if (!sectionPattern.test(normalizedSource)) {
    throw new Error(`Could not find "## ${heading}" section in ${sourceLabel}.`);
  }

  return normalizedSource.replace(sectionPattern, `## ${heading}\n\n${replacementBody.trim()}\n`);
}

function pruneGeneratedBlogDirectories(paths, posts) {
  const activeSlugs = new Set(posts.map((post) => post.slug));
  const entries = fs.readdirSync(paths.blogsDir, { withFileTypes: true });
  const removed = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === "assets" || entry.name === "content") {
      continue;
    }

    if (activeSlugs.has(entry.name)) {
      continue;
    }

    fs.rmSync(path.join(paths.blogsDir, entry.name), { recursive: true, force: true });
    removed.push(entry.name);
  }

  return removed;
}

function pruneUnusedBlogAssets(paths, posts) {
  ensureDirectory(paths.blogAssetsDir);

  const activeAssets = new Set(posts.map((post) => path.basename(post.thumbnail)));
  const entries = fs.readdirSync(paths.blogAssetsDir, { withFileTypes: true });
  const removed = [];

  for (const entry of entries) {
    if (!entry.isFile() || isIgnorableFile(entry.name) || activeAssets.has(entry.name)) {
      continue;
    }

    fs.rmSync(path.join(paths.blogAssetsDir, entry.name), { force: true });
    removed.push(entry.name);
  }

  return removed;
}

function renderBlogPage(post) {
  const metaDescription = escapeHtml(post.excerpt);
  const title = escapeHtml(post.title);
  const categoryTags = post.categories
    .map((category) => `<span class="category-tag">${escapeHtml(category)}</span>`)
    .join("\n          ");
  const articleTags = post.categories
    .map((category) => `  <meta property="article:tag" content="${escapeHtml(category)}" />`)
    .join("\n");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.absoluteThumbnailUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    description: post.summary,
    url: post.absoluteUrl,
    keywords: [...post.categories, "Blog"],
    wordCount: post.wordCount,
    timeRequired: `PT${post.readTime}M`,
  };
  const analyticsLoaderScript = `(() => {
    const schedule = (callback) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 2000 });
        return;
      }

      window.setTimeout(callback, 1200);
    };

    const appendScript = (attributes) => {
      const script = document.createElement('script');
      Object.entries(attributes).forEach(([key, value]) => {
        if (value === true) {
          script.setAttribute(key, '');
          return;
        }

        script.setAttribute(key, value);
      });
      document.head.appendChild(script);
    };

    schedule(() => {
      appendScript({
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}',
      });

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', '${GOOGLE_ANALYTICS_ID}');

      appendScript({
        async: true,
        'data-goatcounter': '${GOATCOUNTER_URL}',
        src: '//gc.zgo.at/count.js',
      });
    });
  })();`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ${AUTHOR_NAME}</title>

  <!-- SEO -->
  <meta name="description" content="${metaDescription}" />
  <meta name="author" content="${AUTHOR_NAME}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${post.absoluteUrl}" />

  <!-- OpenGraph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${post.absoluteUrl}" />
  <meta property="og:title" content="${title} — ${AUTHOR_NAME}" />
  <meta property="og:description" content="${escapeHtml(post.summary)}" />
  <meta property="og:image" content="${post.absoluteThumbnailUrl}" />
  <meta property="og:site_name" content="${AUTHOR_NAME} — Blog" />
  <meta property="article:author" content="${AUTHOR_NAME}" />
  <meta property="article:published_time" content="${post.date}" />
  <meta property="article:section" content="${escapeHtml(post.categories[0])}" />
${articleTags}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@prasad_gade05" />
  <meta name="twitter:creator" content="@prasad_gade05" />
  <meta name="twitter:title" content="${title} — ${AUTHOR_NAME}" />
  <meta name="twitter:description" content="${escapeHtml(post.summary)}" />
  <meta name="twitter:image" content="${post.absoluteThumbnailUrl}" />

  <!-- RSS Feed -->
  <link rel="alternate" type="application/rss+xml" title="${AUTHOR_NAME} — Blog RSS" href="${SITE_URL}/blogs/rss.xml" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preload" as="image" href="${post.thumbnail}" fetchpriority="high" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
  />
  <script>
    (function() {
      var portfolioTheme = null;
      var blogTheme = null;
      try {
        portfolioTheme = localStorage.getItem('portfolio-theme');
        blogTheme = localStorage.getItem('blog-theme');
      } catch (_) {}

      var theme = null;
      if (portfolioTheme) {
        theme = portfolioTheme === 'light' || portfolioTheme === 'arcade-light' ? 'light' : 'dark';
      }
      if (!theme) theme = blogTheme;
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    })();
  </script>
  <script>${analyticsLoaderScript}</script>
  <link rel="stylesheet" href="/blogs/blog.css" />

  <!-- Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <div class="reading-progress" id="reading-progress"></div>

  <nav class="blog-nav" aria-label="Blog navigation">
    <a href="${SITE_URL}/?tab=blogs" class="nav-logo" id="all-blogs-link">← All Blogs</a>
    <div class="nav-actions">
      <button class="theme-toggle" onclick="toggleTheme()" id="theme-btn" aria-label="Toggle theme">☀ Light</button>
      <button class="share-btn" onclick="sharePost()" id="share-btn" aria-label="Share this post">⇪ Share</button>
    </div>
  </nav>

  <main>
    <article>
      <header class="blog-header">
        <div class="blog-categories">
          ${categoryTags}
        </div>
        <h1 class="blog-title">${title}</h1>
        <div class="blog-meta">
          <span class="author">${AUTHOR_NAME}</span>
          <span class="separator">·</span>
          <time datetime="${post.date}">${post.dateLabel}</time>
          <span class="separator">·</span>
          <span>${post.readTime} min read</span>
        </div>
        <div class="blog-thumbnail">
          <img
            src="${post.thumbnail}"
            alt="${title} thumbnail"
            width="1376"
            height="768"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </header>

      <div class="blog-content">
${post.contentHtml.trim()}
      </div>
    </article>
  </main>

  <footer class="blog-footer">
    <p class="human-written-note">All written content is 100% human written · Thumbnail generated by AI</p>
    <div class="footer-links">
      <a href="${SITE_URL}" rel="noopener noreferrer">Portfolio</a>
      <a href="${SITE_URL}/?tab=blogs" rel="noopener noreferrer" id="footer-all-blogs-link">All Blogs</a>
      <a href="https://github.com/prasad-gade05" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="mailto:${AUTHOR_EMAIL}">Mail</a>
    </div>
  </footer>

  <script>
    const progressBar = document.getElementById('reading-progress');
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';
    }, { passive: true });

    const THEME_KEY = 'blog-theme';
    const PORTFOLIO_THEME_KEY = 'portfolio-theme';
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-btn');
    const allBlogsLinks = [
      document.getElementById('all-blogs-link'),
      document.getElementById('footer-all-blogs-link'),
    ].filter(Boolean);
    let portfolioTheme = null;

    const resolvePortfolioTheme = (theme) => {
      if (portfolioTheme === 'arcade-dark' || portfolioTheme === 'arcade-light') {
        return theme === 'light' ? 'arcade-light' : 'arcade-dark';
      }
      return theme;
    };

    const syncAllBlogsLinks = () => {
      const href = '${SITE_URL}/?tab=blogs&theme=' + encodeURIComponent(portfolioTheme || 'dark');
      allBlogsLinks.forEach((link) => {
        link.href = href;
      });
    };

    const applyTheme = (theme) => {
      html.setAttribute('data-theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
      portfolioTheme = resolvePortfolioTheme(theme);
      syncAllBlogsLinks();
      try {
        localStorage.setItem(THEME_KEY, theme);
        localStorage.setItem(PORTFOLIO_THEME_KEY, portfolioTheme);
      } catch (_) {}
    };

    const savedTheme = (() => {
      try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
    })();
    portfolioTheme = (() => {
      try { return localStorage.getItem(PORTFOLIO_THEME_KEY); } catch (_) { return null; }
    })();
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme((portfolioTheme === 'light' || portfolioTheme === 'arcade-light' ? 'light' : portfolioTheme ? 'dark' : null) || savedTheme || (systemDark ? 'dark' : 'light'));

    const toggleTheme = () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    };

    const shareBtn = document.getElementById('share-btn');
    const sharePost = () => {
      const url = '${post.absoluteUrl}';
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.textContent = '✓ Copied!';
        shareBtn.classList.add('copied');
        setTimeout(() => {
          shareBtn.textContent = '⇪ Share';
          shareBtn.classList.remove('copied');
        }, 2200);
      }).catch(() => {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        shareBtn.textContent = '✓ Copied!';
        setTimeout(() => { shareBtn.textContent = '⇪ Share'; }, 2200);
      });
    };
  </script>
</body>
</html>
`;
}

function normalizeRequiredString(value, fieldName, folderName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Blog "${folderName}" is missing a valid "${fieldName}" frontmatter field.`);
  }

  return value.trim();
}

function normalizeRequiredDate(value, folderName) {
  const dateValue = normalizeRequiredString(value, "date", folderName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error(`Blog "${folderName}" has an invalid date "${dateValue}". Use YYYY-MM-DD.`);
  }

  return dateValue;
}

function normalizeCategories(value, folderName) {
  const categories = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const cleaned = categories
    .flatMap((category) => category?.toString().split(",") ?? [])
    .map((category) => category.trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    throw new Error(`Blog "${folderName}" must define at least one category.`);
  }

  return cleaned;
}

function normalizeThumbnail(value, imageFileName, folderName) {
  const thumbnail = normalizeRequiredString(value, "thumbnail", folderName);

  if (thumbnail !== `/blogs/assets/${imageFileName}`) {
    throw new Error(
      `Blog "${folderName}" thumbnail must be "/blogs/assets/${imageFileName}" to match the source PNG file.`
    );
  }

  return thumbnail;
}

function normalizeSlug(value, folderName) {
  const rawSlug = normalizeRequiredString(value, "slug", folderName);
  const cleaned = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleaned) {
    throw new Error(`Blog "${folderName}" has an invalid slug "${rawSlug}".`);
  }

  return cleaned;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripLeadingTitleHeading(markdown, title) {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);

  while (lines.length > 0 && !lines[0].trim()) {
    lines.shift();
  }

  const firstLine = lines[0]?.trim() ?? "";
  if (firstLine === `# ${title}`) {
    lines.shift();
    while (lines.length > 0 && !lines[0].trim()) {
      lines.shift();
    }
  }

  return lines.join("\n");
}

function extractParagraphText(markdown, count) {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => {
      const firstLine = chunk.split(/\r?\n/, 1)[0].trim();
      return !/^([#>`*-]|\d+\.)/.test(firstLine) && !/^```/.test(firstLine);
    })
    .slice(0, count)
    .map((chunk) => collapseWhitespace(stripMarkdown(chunk)));

  return paragraphs.join(" ");
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>+\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/<\/?[^>]+>/g, " ");
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function trimText(text, maxLength) {
  const normalized = collapseWhitespace(text);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const shortened = normalized.slice(0, maxLength);
  const trimmed = shortened.slice(0, shortened.lastIndexOf(" "));
  return `${(trimmed || shortened).trim()}...`;
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function formatDisplayDate(isoDate) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function formatRssDate(isoDate) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(`${isoDate}T00:00:00+05:30`)).map((part) => [part.type, part.value])
  );

  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second} +0530`;
}

function comparePostsNewestFirst(left, right) {
  if (left.date !== right.date) {
    return right.date.localeCompare(left.date);
  }

  return compareSourceFolders(left.sourceFolder, right.sourceFolder);
}

function compareSourceFolders(left, right) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeFileIfChanged(filePath, nextContent) {
  ensureDirectory(path.dirname(filePath));

  if (fs.existsSync(filePath)) {
    const currentContent = fs.readFileSync(filePath, "utf8");
    if (currentContent === nextContent) {
      return "unchanged";
    }

    fs.writeFileSync(filePath, nextContent, "utf8");
    return "updated";
  }

  fs.writeFileSync(filePath, nextContent, "utf8");
  return "created";
}

function copyFileIfChanged(sourcePath, targetPath) {
  ensureDirectory(path.dirname(targetPath));
  const sourceBuffer = fs.readFileSync(sourcePath);

  if (fs.existsSync(targetPath)) {
    const targetBuffer = fs.readFileSync(targetPath);
    if (sourceBuffer.equals(targetBuffer)) {
      return "unchanged";
    }

    fs.writeFileSync(targetPath, sourceBuffer);
    return "updated";
  }

  fs.writeFileSync(targetPath, sourceBuffer);
  return "created";
}

function isIgnorableFile(fileName) {
  return fileName.startsWith(".") || fileName.toLowerCase() === "thumbs.db";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatSyncSummary(summary) {
  const pageCounts = countStatuses(summary.postResults.map((result) => result.page));
  const assetCounts = countStatuses(summary.postResults.map((result) => result.asset));
  const outputCounts = countStatuses(Object.values(summary.outputs));

  return [
    `Processed ${summary.posts.length} blog post(s).`,
    `Pages: ${pageCounts.created} created, ${pageCounts.updated} updated, ${pageCounts.unchanged} unchanged.`,
    `Assets: ${assetCounts.created} created, ${assetCounts.updated} updated, ${assetCounts.unchanged} unchanged.`,
    `Shared files: ${outputCounts.created} created, ${outputCounts.updated} updated, ${outputCounts.unchanged} unchanged.`,
    `Pruned ${summary.removedDirectories.length} stale blog director${summary.removedDirectories.length === 1 ? "y" : "ies"} and ${summary.removedAssets.length} stale asset(s).`,
  ].join(" ");
}

function countStatuses(statuses) {
  return statuses.reduce(
    (counts, status) => {
      counts[status] += 1;
      return counts;
    },
    { created: 0, updated: 0, unchanged: 0 }
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}

export { syncBlogs };
