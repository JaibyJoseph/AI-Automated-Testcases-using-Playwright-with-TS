# ADR 0003: Run Gherkin on the Playwright runner with playwright-bdd

- Status: Accepted (implementation in Phase 2)
- Date: 2026-10-29

## Context

BDD needs Gherkin feature files mapped to step definitions. The two common options are Cucumber.js driving the Playwright library, or `playwright-bdd`, which generates Playwright test files from features.

## Decision

Use `playwright-bdd` (9.2.1 at the time of writing; peer dependency `@playwright/test >=1.44`).

## Consequences

- Fixtures, parallelism, retries, traces, tags and reporters of Playwright Test all keep working.
- Generated specs live in `.features-gen/` (gitignored) and are rebuilt by `bddgen` before each run.
- No second test runner to configure or maintain.
