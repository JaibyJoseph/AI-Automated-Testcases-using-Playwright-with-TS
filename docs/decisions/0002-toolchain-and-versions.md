# ADR 0002: Toolchain and version pinning

- Status: Accepted
- Date: 2026-10-29

## Decision

| Tool                     | Version                          | Note                                                                     |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------ |
| Node.js                  | 24.x (`.nvmrc`, `engines`)       | LTS line installed locally                                               |
| @playwright/test         | 1.64.1                           |                                                                          |
| TypeScript               | 6.0.3                            | Not 7.x: `typescript-eslint` 8.72.1 declares `typescript >=4.8.4 <6.1.0` |
| @types/node              | 24.19.2                          | Matches the Node major version                                           |
| ESLint                   | 10.13.0 with `@eslint/js` 10.0.1 | `typescript-eslint` supports ESLint 10                                   |
| typescript-eslint        | 8.72.1                           | `strictTypeChecked` preset                                               |
| eslint-plugin-playwright | 2.12.1                           | Catches fixed sleeps, forced clicks, missing assertions                  |
| Prettier                 | 3.9.10                           |                                                                          |
| zod                      | 4.6.7                            | Environment validation now; agent schemas later                          |
| dotenv                   | 18.0.9                           | Local `.env` loading with `quiet: true`                                  |

All versions are pinned exactly (`--save-exact`) and locked in `package-lock.json`. Upgrades go through Dependabot PRs (Phase 8) and must pass `npm run validate` and the smoke suite.

## Consequences

- TypeScript 7 adoption waits for `typescript-eslint` support.
- Reproducible installs via `npm ci`.
