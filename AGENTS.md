# AGENTS.md

This document provides guidance for AI coding agents operating in this repository.

## Project Overview

This is a **Hugo static site** (personal blog at davegallant.ca) using a vendored/customized
version of the hugo-theme-gruvbox theme located in `themes/custom-theme/`. The site requires
**Hugo Extended** edition for PostCSS processing. The dev environment is managed via
**Nix flakes** (hugo, just, nodejs).

## Project Structure

```
config.yaml                  # Main Hugo config (YAML)
content/blog/                # Blog posts as page bundles (dir with index.md + images)
layouts/partials/            # Site-level template overrides
themes/custom-theme/         # Vendored theme (templates, CSS, JS, configs)
  assets/css/critical/       # CSS inlined in <head>, numbered prefixes (00-, 15-, 20-, etc.)
  assets/css/non-critical/   # CSS loaded async
  assets/js/                 # JS files (some are Hugo templates using {{ }})
  layouts/                   # Theme templates
  postcss.config.js          # PostCSS pipeline
static/                      # Static assets (favicons, CNAME)
justfile                     # Task runner
flake.nix                    # Nix dev environment
package.json                 # Root npm dependencies
```

## Build / Dev / Deploy Commands

The task runner is **just** (justfile):

```sh
# Build the site (production)
just build          # runs: npm ci && hugo --minify

# Start dev server with drafts
just server         # runs: npm ci && hugo server --buildDrafts

# Clean build output
just clean          # runs: rm -rf public/
```

Alternatively, run Hugo directly:

```sh
npm ci
hugo --minify              # production build
hugo server --buildDrafts  # dev server
```

## Linting

Linting tools are configured in the theme directory but dependencies are in the root
`package.json`. Run from the **theme directory** (`themes/custom-theme/`):

```sh
# All linters
npm run lint

# Individual linters
npm run lint:css    # stylelint --fix **/*.css
npm run lint:js     # eslint --fix --ext js .
npm run lint:md     # markdownlint --fix **/*.md
```

## Tests

There are no tests in this project. Validation is done via linting and successful Hugo builds.

## CI Pipeline

GitHub Actions (`.github/workflows/publish.yml`) runs on push to `main`:

- Node 18, Hugo Extended
- `npm ci` then `hugo --minify`
- Deploys to `generated` branch via GitHub Pages

## Code Style Guidelines

### General Formatting

- **Indentation**: 2 spaces (no tabs)
- **Line endings**: LF (Unix-style)
- **Charset**: UTF-8
- **Prettier** handles formatting with `proseWrap: "always"`
- HTML template files use the `go-template` Prettier parser (`prettier-plugin-go-template`)

### Hugo Templates (HTML)

- Use 2-space indentation
- Use whitespace-trimming delimiters `{{- -}}` where appropriate for compact output
- Place Hugo template actions on their own lines when they contain blocks
- External links must include `target="_blank" rel="noreferrer"` and class `link--external`
- Use ISO 8601 date format: `2006-01-02`
- Prefer partials for reusable components; organize in subdirectories (`head/`, `comments/`, etc.)
- Use `css.PostCSS` (not the deprecated `resources.PostCSS`) for PostCSS pipe operations
- Use `resources.Concat`, `resources.ExecuteAsTemplate`, `resources.PostProcess` for asset pipeline
- Hugo config is YAML (`config.yaml`); theme config is TOML (`themes/custom-theme/config/`)

### CSS

- **PostCSS** pipeline: `postcss-import`, `postcss-url`, `postcss-nesting`, `postcss-custom-media`
- Production adds: `postcss-preset-env`, `cssnano`, `@fullhuman/postcss-purgecss`
- Use **CSS custom properties** (variables) for theming: `--bg`, `--fg`, `--primary`, etc.
- Use **CSS nesting** (via postcss-nesting), not Sass
- Files are numbered with prefix for ordering: `00-vendor.css`, `15-colors.css`, `20-base.css`, etc.
- Split CSS into `critical/` (inlined in `<head>`) and `non-critical/` (loaded async)
- Use Bootstrap 5 breakpoints as custom media: `--sm`, `--md`, `--lg`, `--xl`, `--xxl`
- Mark sections for PurgeCSS with `/*! purgecss start ignore */` / `/*! purgecss end ignore */`
- Stylelint extends `stylelint-prettier/recommended`

### JavaScript

- ES6 modules with `import`/`export` syntax; target is `es6` via Hugo's `js.Build`
- Use `const` and `let` (never `var`)
- ESLint extends `eslint:recommended` + `plugin:prettier/recommended`
- Environment: `browser`, `es6`, `node`
- Some JS files contain Hugo template expressions (`{{ }}`); these are processed by Hugo first
- DOM manipulation uses standard APIs: `document.createElement`, `classList`, `addEventListener`

### Markdown / Content

- Blog posts use **page bundles**: each post is a directory under `content/blog/` with `index.md`
- Front matter (YAML) must include: `title`, `date`, `draft`, `comments`, `toc`, `author`
- Author is always: `"Dave Gallant"`
- Use `<!--more-->` separator for summaries
- Tags are YAML arrays in front matter
- New posts are created with: `hugo new blog/<slug>/index.md` (uses `archetypes/default.md`)
- Goldmark is configured with `unsafe: true` (raw HTML allowed in Markdown)

### Archetype Template (for new posts)

```yaml
---
title: "{{ humanize .Name | title }}"
date: "{{ .Date }}"
draft: true
comments: true
toc: false
author: "Dave Gallant"
---
<!--more-->
```

## Key Technical Details

- **Theme**: Vendored in `themes/custom-theme/`, not fetched as a Hugo module from remote
- **Syntax highlighting**: Prism.js (not Hugo's built-in Chroma)
- **Search**: FlexSearch for client-side full-text search
- **Comments**: Utterances (GitHub-based)
- **Analytics**: Umami, Cloudflare Analytics, Google Analytics
- **Fonts**: Fira Code (monospace), Roboto Slab (serif), Verdana (sans-serif)
- **Default theme**: Dark mode
- **Node modules** are mounted into Hugo's asset pipeline via `config.yaml` module mounts

## Pre-commit Hooks

Husky runs `lint-staged` on commit (configured in theme's `package.json`):

```json
{
  "*.css": "stylelint --fix --allow-empty-input",
  "*.js": "eslint --cache --fix",
  "*.md": "markdownlint --fix"
}
```

## Dependency Management

- **Renovate** is configured (`renovate.json`) to run on weekends
- Root `package.json` has runtime + dev dependencies
- Theme `package.json` has its own copy (kept in sync)
- Nix flake provides: `hugo`, `just`, `nodejs_25`
- Activate dev environment with `direnv allow` (`.envrc` runs `use flake`)
