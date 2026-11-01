# AI-assisted Playwright BDD framework

Test automation for the [SuiteCRM demo](https://demo.suiteondemand.com/) using Playwright, TypeScript and Gherkin via `playwright-bdd`. AI agents for test generation and failure analysis are added in later phases.

See [docs/architecture.md](docs/architecture.md) for the design and [docs/decisions/](docs/decisions/) for the reasoning behind key choices.

## Setup

Requires Node.js 24 (see `.nvmrc`).

```sh
npm ci                                          # install exact locked dependencies
npx playwright install chromium firefox webkit  # download the browsers
cp .env.example .env                            # Windows PowerShell: Copy-Item .env.example .env
```

Then fill in `SUITECRM_USERNAME` and `SUITECRM_PASSWORD` in `.env` with the credentials SuiteCRM publishes for its public demo. Tests refuse to start if a value is missing.

## How a scenario runs

1. `features/**/*.feature` describe behaviour in Gherkin.
2. `bddgen` generates Playwright specs into `.features-gen/` (gitignored, rebuilt on every run). It fails if any step has no definition.
3. The `setup` project logs in once and saves the session to `.auth/user.json` (gitignored).
4. `src/steps/` match each Gherkin line and call page objects; assertions live here.
5. `src/pages/` hold locators and UI actions; `src/fixtures/` create fresh page objects, scenario state and a cleanup registry for every scenario.

## Projects and tags

| Project                                        | Runs                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `setup`                                        | One login per run, no trace/video/screenshot                       |
| `chromium`, `firefox`, `webkit`                | All scenarios except `@auth`, using the saved session              |
| `chromium-auth`, `firefox-auth`, `webkit-auth` | `@auth` scenarios (they type credentials), logged out, tracing off |

Tags: `@smoke` (fast critical path), `@regression`, `@critical`, `@negative`, plus area tags `@auth` and `@accounts`. Run one browser with e.g. `npm test -- --project=setup --project=chromium --project=chromium-auth`.

## Commands

| Command                               | What it does                                                    |
| ------------------------------------- | --------------------------------------------------------------- |
| `npm test`                            | Generate specs and run all scenarios in all browsers            |
| `npm run test:smoke`                  | Run scenarios tagged `@smoke`                                   |
| `npm run test:regression`             | Run scenarios tagged `@regression`                              |
| `npm run test:headed`                 | Run with a visible browser                                      |
| `npm run test:debug`                  | Step through in the Playwright Inspector                        |
| `npm run report`                      | Open the last HTML report                                       |
| `npm run validate`                    | Format check, lint and type check (must pass before committing) |
| `npm run format` / `npm run lint:fix` | Auto-fix formatting and fixable lint issues                     |

Output: `reports/html` (HTML report), `reports/results.json`, `reports/junit.xml`, and `test-results/` (screenshot, video, trace and error context for failed tests).

## Test data on the shared demo

Every record a scenario creates is named `PWAUTO-<RUN_ID>-<random> <label>` and deleted after the scenario, also when it fails. If cleanup itself fails, the report shows a `cleanup-failed` annotation with the record id.

## Exploring the app with Playwright MCP

Claude Code can drive a browser through the project's Playwright MCP server to explore screens and find locators. Run `npm run session:refresh` first, then restart Claude Code and approve the `playwright` server. Setup, safety flags and rules: [docs/exploration.md](docs/exploration.md).

## Known limitations

- The demo is shared and resets periodically; other users can change data at any time.
- `.auth/user.json` holds a live session cookie. It is gitignored; do not share it.
- Secrets are scrubbed from text artifacts and never typed in traced projects (see [ADR 0005](docs/decisions/0005-sessions-test-data-and-secret-hygiene.md)). The demo account's username equals its password, so that string still appears in the username `Fill` step.
- `npm audit` reports 12 moderate findings, all from one advisory ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), `minimatch` < 11.0.1, published 2026-10-30) in the ESLint toolchain. ESLint 10 and typescript-eslint still require `minimatch` 10, so no compatible fix exists yet. Dev-time only; exploitable only with attacker-controlled glob patterns. Revisit when ESLint updates.
