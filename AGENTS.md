# Agent Instructions

## Project

This repository is a Next.js app for the Rogers Cafe Qatar guest site and staff console. `components/restaurant-app.tsx` is the guest app; `lib/menu.ts` supplies menu data, `lib/utils.ts` provides the `cn` helper, and `app/globals.css` is the active Tailwind stylesheet and theme source.

## Conventions

- Keep changes focused on the component package and preserve its existing React, TypeScript, Tailwind, and import conventions.
- The component and demo are client components; `app/page.tsx` renders the demo through the configured `@/` alias.
- Keep the README's component handoff guidance accurate when changing public component requirements.

## Validation

- `package.json` provides a `typecheck` script; run it after TypeScript changes.
- Use `npm run typecheck` for TypeScript checks and `npm run build` for the production app build.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
