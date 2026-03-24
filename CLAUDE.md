# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture

This is a Next.js 16 app using the **App Router** (`src/app/`). All routes, layouts, and pages live under `src/app/`. The `@/*` alias maps to `./src/*`.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4.

## Next.js Version Warning

This project uses Next.js 16, which has breaking changes from prior versions. Before writing any Next.js-specific code (routing, data fetching, middleware, etc.), consult the bundled docs:

```
node_modules/next/dist/docs/01-app/   # App Router reference
```

Pay attention to deprecation notices — APIs from Next.js 12–14 may not apply here.
