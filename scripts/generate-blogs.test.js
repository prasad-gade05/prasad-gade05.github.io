import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { syncBlogs } from "./generate-blogs.mjs";

const createdRoots = [];

function createFixtureRoot() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-blog-sync-"));
  createdRoots.push(rootDir);

  fs.mkdirSync(path.join(rootDir, "blog-posts"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "public", "blogs"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "public", "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://prasadgade.dev/</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(rootDir, "public", "llms.txt"),
    `# Fixture

## Blogs

Placeholder

## Links

- Example
`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(rootDir, "public", "llms-full.txt"),
    `# Fixture Full

## Blogs

Placeholder

## Contact

- Example
`,
    "utf8"
  );

  return rootDir;
}

function writePost(rootDir, folderName, { markdownName, imageName, title, date, categories, slug, body, imageBytes }) {
  const folderPath = path.join(rootDir, "blog-posts", folderName);
  fs.mkdirSync(folderPath, { recursive: true });

  const frontmatter = [
    "---",
    `title: "${title}"`,
    `date: "${date}"`,
    `thumbnail: "/blogs/assets/${imageName}"`,
    Array.isArray(categories)
      ? `category: [${categories.map((category) => `"${category}"`).join(", ")}]`
      : `category: "${categories}"`,
    `slug: "${slug}"`,
    "---",
    "",
    `# ${title}`,
    "",
    body,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(folderPath, markdownName), frontmatter, "utf8");
  fs.writeFileSync(path.join(folderPath, imageName), Buffer.from(imageBytes), "utf8");
}

afterEach(() => {
  while (createdRoots.length > 0) {
    fs.rmSync(createdRoots.pop(), { recursive: true, force: true });
  }
});

describe("generate-blogs", () => {
  it("skips unchanged blog pages, assets, and shared files on repeat runs", () => {
    const rootDir = createFixtureRoot();

    writePost(rootDir, "1", {
      markdownName: "first.md",
      imageName: "first.png",
      title: "First Post",
      date: "2026-05-01",
      categories: ["Technical"],
      slug: "first-post",
      body: "This is the first paragraph.\n\nThis is the second paragraph.",
      imageBytes: [1, 2, 3, 4],
    });

    const firstRun = syncBlogs({ rootDir });
    const secondRun = syncBlogs({ rootDir });

    expect(firstRun.postResults).toEqual([
      expect.objectContaining({ slug: "first-post", page: "created", asset: "created" }),
    ]);
    expect(secondRun.postResults).toEqual([
      expect.objectContaining({ slug: "first-post", page: "unchanged", asset: "unchanged" }),
    ]);
    expect(secondRun.outputs).toEqual({
      blogList: "unchanged",
      rss: "unchanged",
      sitemap: "unchanged",
      llms: "unchanged",
      llmsFull: "unchanged",
    });
  });

  it("updates only the changed blog while leaving unchanged blogs alone", () => {
    const rootDir = createFixtureRoot();

    writePost(rootDir, "1", {
      markdownName: "first.md",
      imageName: "first.png",
      title: "First Post",
      date: "2026-05-01",
      categories: ["Technical"],
      slug: "first-post",
      body: "Original first paragraph.\n\nOriginal second paragraph.",
      imageBytes: [1, 2, 3, 4],
    });
    writePost(rootDir, "2", {
      markdownName: "second.md",
      imageName: "second.png",
      title: "Second Post",
      date: "2026-05-02",
      categories: ["Personal"],
      slug: "second-post",
      body: "Second post paragraph.\n\nAnother second post paragraph.",
      imageBytes: [5, 6, 7, 8],
    });

    syncBlogs({ rootDir });

    writePost(rootDir, "2", {
      markdownName: "second.md",
      imageName: "second.png",
      title: "Second Post",
      date: "2026-05-02",
      categories: ["Personal"],
      slug: "second-post",
      body: "Second post paragraph changed.\n\nAnother second post paragraph.",
      imageBytes: [5, 6, 7, 8],
    });

    const summary = syncBlogs({ rootDir });
    expect(summary.postResults).toEqual([
      expect.objectContaining({ slug: "second-post", page: "updated", asset: "unchanged" }),
      expect.objectContaining({ slug: "first-post", page: "unchanged", asset: "unchanged" }),
    ]);
    expect(summary.outputs.blogList).toBe("updated");
    expect(summary.outputs.rss).toBe("updated");
  });

  it("prunes stale generated blog directories and assets when a source blog is removed", () => {
    const rootDir = createFixtureRoot();

    writePost(rootDir, "1", {
      markdownName: "first.md",
      imageName: "first.png",
      title: "First Post",
      date: "2026-05-01",
      categories: ["Technical"],
      slug: "first-post",
      body: "One paragraph.\n\nSecond paragraph.",
      imageBytes: [1, 2, 3, 4],
    });
    writePost(rootDir, "2", {
      markdownName: "second.md",
      imageName: "second.png",
      title: "Second Post",
      date: "2026-05-02",
      categories: ["Personal"],
      slug: "second-post",
      body: "Another paragraph.\n\nMore body text.",
      imageBytes: [5, 6, 7, 8],
    });

    syncBlogs({ rootDir });
    fs.rmSync(path.join(rootDir, "blog-posts", "1"), { recursive: true, force: true });

    const summary = syncBlogs({ rootDir });

    expect(summary.removedDirectories).toEqual(["first-post"]);
    expect(summary.removedAssets).toEqual(["first.png"]);
    expect(fs.existsSync(path.join(rootDir, "public", "blogs", "first-post"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, "public", "blogs", "assets", "first.png"))).toBe(false);
  });

  it("emits rss with real enclosure byte lengths and a ttl hint", () => {
    const rootDir = createFixtureRoot();

    writePost(rootDir, "1", {
      markdownName: "first.md",
      imageName: "first.png",
      title: "First Post",
      date: "2026-05-01",
      categories: ["Technical"],
      slug: "first-post",
      body: "One paragraph.\n\nSecond paragraph.",
      imageBytes: [1, 2, 3, 4],
    });

    syncBlogs({ rootDir });

    const rss = fs.readFileSync(path.join(rootDir, "public", "blogs", "rss.xml"), "utf8");
    expect(rss).toContain("<ttl>60</ttl>");
    expect(rss).toContain(
      '<enclosure url="https://prasadgade.dev/blogs/assets/first.png" type="image/png" length="4" />'
    );
    expect(rss).not.toContain('length="0"');
  });
});
