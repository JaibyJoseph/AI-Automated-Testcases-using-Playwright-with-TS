# AI-assisted Playwright BDD framework

Test automation for the [SuiteCRM demo](https://demo.suiteondemand.com/) using Playwright, TypeScript and (from Phase 2) Gherkin via `playwright-bdd`. AI agents for test generation and failure analysis are added in later phases.

See [docs/architecture.md](docs/architecture.md) for the design and [docs/decisions/](docs/decisions/) for the reasoning behind key choices.

## Setup

Requires Node.js 24 (see `.nvmrc`).

```sh
npm ci                                # install exact locked dependencies
npx playwright install chromium       # download the browser
cp .env.example .env                  # Windows PowerShell: Copy-Item .env.example .env
```

## Commands

| Command                               | What it does                                                    |
| ------------------------------------- | --------------------------------------------------------------- |
| `npm test`                            | Run all tests                                                   |
| `npm run test:smoke`                  | Run tests tagged `@smoke`                                       |
| `npm run test:headed`                 | Run with a visible browser                                      |
| `npm run test:debug`                  | Step through a test in the Playwright Inspector                 |
| `npm run report`                      | Open the last HTML report                                       |
| `npm run validate`                    | Format check, lint and type check (must pass before committing) |
| `npm run format` / `npm run lint:fix` | Auto-fix formatting and fixable lint issues                     |

Output: `reports/html` (HTML report), `reports/results.json`, `reports/junit.xml`, and `test-results/` (traces, screenshots, videos for failed tests).
