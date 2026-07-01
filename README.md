# My Portfolio Site

**Live:** https://prasadgade.dev

---

## Repository Name

GitHub Pages uses `<username>.github.io` as the root site for a custom domain. This allows:

- `https://prasadgade.dev` → Portfolio (root)
- `https://prasadgade.dev/<project>` → Other hosted projects

## Other Projects Under This Setup

- Audio Visualizer — https://prasadgade.dev/audio_visualizer_app/
- Attendance Tracker — https://prasadgade.dev/attendance/
- Habit Tracker — https://prasadgade.dev/Habit-Tracker/

---

## Keyboard Shortcuts

Keyboard shortcuts are available in the app. Press `?` to open the in-app guide.

- `1` to `9`, `0` switch the main tabs
- `Arrow` keys move through interactive items in the active tab
- `Left` / `Right` in the movies modal switch between Movies and Web Shows
- `Home` / `End` jump to the first or last interactive item in the active tab
- `Enter` opens the focused card action or link
- `Space` makes the Minecraft skin jump when the viewer is focused
- `R` opens the resume
- `T` cycles themes, even while the help, movies, resume, or Minecraft modal is open
- `Esc` closes the current modal or overlay

---

## Blog Pipeline

- Source posts live in numbered folders under `blog-posts\`
- Each post folder must contain exactly one `.md` file and one `.png` thumbnail
- `npm run blogs:sync` validates posts, renders `public\blogs\<slug>\index.html`, copies changed thumbnails, rebuilds `public\blogs\blogs.json`, `public\blogs\rss.xml`, sitemap blog URLs, and LLM blog sections
- The pipeline uses write-if-changed caching, so unchanged pages, assets, and shared files are skipped
- `npm run build` runs `blogs:sync` through `prebuild`; `npm run deploy` is enough to regenerate and publish blogs

More detail: `docs\BLOG_PIPELINE.md`

---

## Agent Readiness

The agent-facing files live under `public\`:

```
public/
├── .well-known/
│   ├── agent.json                 # A2A Agent Card
│   ├── agents.json                # Agents Directory
│   ├── webmcp.json                # WebMCP Manifest
│   ├── webmcp                     # WebMCP Alias
│   ├── mcp.json                   # MCP Discovery
│   ├── api-catalog                # API Catalog
│   ├── agent-skills/
│   │   └── index.json             # Agent Skills Index
│   └── openapi                    # OpenAPI Alias
├── agent/
│   └── index.html                 # Agent Landing Page
├── api/
│   ├── resume.json                # Primary Slim Resume
│   ├── resume-master.json         # Detailed Master Resume
│   ├── projects.json              # Projects Portfolio
│   ├── skills.json                # Skills Taxonomy
│   ├── social.json                # Contact & Social
│   └── about.json                 # Personality, Shortcuts, Blog Pipeline
├── blogs/
│   ├── blogs.json                 # Blog Metadata
│   ├── rss.xml                    # RSS Feed
│   └── <slug>/
│       └── index.html             # Generated Static Blog Page
├── openapi.json                   # OpenAPI Specification
├── agents.json                    # Root Agents Directory
├── llms.txt                       # LLM Summary
├── llms-full.txt                  # LLM Full Content
├── robots.txt                     # Crawler Policy
├── sitemap.xml                    # XML Sitemap
└── Prasad_Gade_Resume.pdf         # PDF Resume
```

More detail: `docs\KEYBOARD_AND_AGENT_READINESS.md`
