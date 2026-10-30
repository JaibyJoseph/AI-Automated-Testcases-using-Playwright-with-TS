# AI-assisted Playwright BDD framework

Test automation for the [SuiteCRM demo](https://demo.suiteondemand.com/) using Playwright, TypeScript and Gherkin via `playwright-bdd`. AI agents for test generation and failure analysis are added in later phases.

See [docs/architecture.md](docs/architecture.md) for the design and [docs/decisions/](docs/decisions/) for the reasoning behind key choices.

## Setup

Requires Node.js 24 (see `.nvmrc`).

```sh
npm ci                                # install exact locked dependencies
npx playwright install chromium       # download the browser
cp .env.example .env                  # Windows PowerShell: Copy-Item .env.example .env
```

Then fill in `SUITECRM_USERNAME` and `SUITECRM_PASSWORD` in `.env` with the credentials SuiteCRM publishes for its public demo. Tests refuse to start if a value is missing.

## How a scenario runs

1. `features/**/*.feature` describe behaviour in Gherkin.
2. `bddgen` generates Playwright specs into `.features-gen/` (gitignored, rebuilt on every run). It fails if any step has no definition.
3. `src/steps/` match each Gherkin line and call page objects; assertions live here.
4. `src/pages/` hold locators and UI actions; `src/fixtures/` create fresh page objects for every scenario.

## Commands

| Command                               | What it does                                                    |
| ------------------------------------- | --------------------------------------------------------------- |
| `npm test`                            | Generate specs and run all scenarios                            |
| `npm run test:smoke`                  | Run scenarios tagged `@smoke`                                   |
| `npm run test:regression`             | Run scenarios tagged `@regression`                              |
| `npm run test:headed`                 | Run with a visible browser                                      |
| `npm run test:debug`                  | Step through in the Playwright Inspector                        |
| `npm run report`                      | Open the last HTML report                                       |
| `npm run validate`                    | Format check, lint and type check (must pass before committing) |
| `npm run format` / `npm run lint:fix` | Auto-fix formatting and fixable lint issues                     |

Output: `reports/html` (HTML report), `reports/results.json`, `reports/junit.xml`, and `test-results/` (screenshot, video, trace and error context for failed tests).

## Known limitations

- Traces of login scenarios contain the password (form input, network request, page snapshots). Treat `test-results/` and trace files as sensitive and do not share them. Phase 3 disables tracing for credential-entry scenarios.
