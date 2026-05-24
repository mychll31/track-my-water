# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 app (App Router) with TypeScript, Tailwind CSS v4, and React 19.

### Standard commands

See `README.md` and `package.json` scripts for the full list. Key commands:

| Action | Command |
|--------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (port 3000) |
| Lint | `pnpm lint` |
| Build | `pnpm build` |

### Notes

- Data is stored in browser `localStorage` — no database or backend services required.
- The ESLint config (`eslint-config-next`) enforces the `react-hooks/set-state-in-effect` rule. Avoid calling `setState` directly inside `useEffect` bodies; use `useSyncExternalStore` or lazy state initialization patterns instead.
- Tailwind CSS v4 uses `@import "tailwindcss"` and `@theme inline` blocks in `globals.css` — there is no `tailwind.config.js`.
- Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`).
