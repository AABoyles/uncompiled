# Copilot Instructions for `uncompiled`

## Project Overview

`uncompiled` is a static, client-side Markdown blog/website platform. There is **no build step, no package manager, and no server-side logic**. All content is rendered in the browser at page-load time using JavaScript libraries loaded from CDNs.

## Repository Structure

| File/Directory | Purpose |
| --- | --- |
| `index.html` | The single HTML entry point; loads all CDN dependencies and `index.js` |
| `index.js` | Core JavaScript: fetches `config.json`, renders the navigation header, reads the `?q=` URL parameter, fetches the target Markdown file, converts it to HTML via Showdown, applies syntax highlighting (highlight.js) and math rendering (KaTeX) |
| `config.json` | Site-level configuration: title, base URL, navigation menu items, GitHub API URL |
| `style.css` | Custom style overrides on top of Tufte CSS |
| `README.md` | Default page loaded when no `?q=` parameter is provided; also the project documentation |
| `pages/` | Additional Markdown content pages |
| `favicon.ico` | Site favicon |
| `images/` | Static image assets |

## Key Dependencies (all loaded from CDNs — no local installs)

- **[Showdown](https://showdownjs.com/)** — Markdown → HTML converter
- **[showdown-tufte](https://github.com/jez/showdown-tufte)** — Showdown extension that converts `[text](sidenote)` / `[text](marginnote)` syntax into Tufte CSS sidenote/marginnote markup
- **[Tufte CSS](https://edwardtufte.github.io/tufte-css/)** — Base stylesheet providing the Tufte-style layout
- **[highlight.js](https://highlightjs.org/)** — Syntax highlighting for fenced code blocks
- **[KaTeX](https://katex.org/)** — LaTeX math rendering (`$...$` inline, `$$...$$` display)

## Coding Conventions

- Vanilla JavaScript only — no frameworks, no TypeScript.
- All JS lives in `index.js` (wrapped in an IIFE).
- Markdown content pages use standard CommonMark syntax with the following extensions:
  - `[note text](sidenote)` — numbered sidenote
  - `[note text](marginnote)` — unnumbered margin note
  - Links inside notes must be written in HTML (nested markdown links are not supported)
  - Fenced code blocks with language identifiers for syntax highlighting (e.g. ` ```javascript `)
  - `$...$` for inline math, `$$...$$` for display math
- `config.json` controls the site title, base URL, and navigation menu; update it when changing site-level metadata.
- No linter, formatter, or test runner is configured — changes can be verified by opening `index.html` in a browser (or via a local static file server).

## How to Run Locally

Serve the repository root with any static file server, for example:

```bash
npx serve .
# or
python3 -m http.server
```

Then open `http://localhost:<port>/` in a browser. The `?q=<path>` URL parameter selects which Markdown file to render (defaults to `README.md`).

## Adding Content

1. Create a new `.md` file (anywhere in the repository, conventionally under `pages/`).
2. Link to it using the relative path as the `?q=` value, e.g. `?q=pages/my-new-page.md`.
3. Optionally add it to the navigation menu in `config.json`.
