# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

Welovefonts is a web app that normalizes/standardizes font metrics across multiple font files. Users drop font files, the app groups them by font-family and weight, processes metrics via fontkit on the server, provides a UI playground for adjustments, and exports a compressed archive of normalized fonts. Sample fonts are in `./fonts_sample/`.

## Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Production build
npm run test       # Run tests (vitest)
npm run lint       # ESLint check
npm run format     # Prettier check
npm run check      # Prettier write + ESLint fix
```

## Architecture

**Framework:** TanStack Start (React 19 + Vite 8 + SSR) with file-based routing and Tailwind CSS v4.

**Path aliases:** `#/*`, `@/*` → `./src/*`, `@server/*` → `./src/server/*` (configured in tsconfig.json and package.json imports).

**Key directories:**
- `src/routes/` — File-based routes. `__root.tsx` is the shell layout (includes theme init script and devtools). Route files export `Route` via `createFileRoute()`.
- `src/server/` — Server functions using `createServerFn` from `@tanstack/react-start`. Font processing lives here (`fonts.ts`).
- `src/components/` — Shared React components (Header, Footer, ThemeToggle).

**Font processing pipeline:** Client reads font files as `Uint8Array`, sends the buffer array to `getFontMetrics` server function (POST), which uses fontkit (loaded via `createRequire` since it's a CJS module) to extract metrics: familyName, unitsPerEm, ascent, descent, capHeight, xHeight, lineGap.

**Route tree:** Auto-generated at `src/routeTree.gen.ts` by the TanStack router plugin — do not edit manually.

### Product Flow (in progress)
1. Drop font files → filter and classify by family/weight
2. Group fonts and send to server functions for fontkit metric extraction
3. Display UI playground for user adjustments
4. Export compressed normalized font files
