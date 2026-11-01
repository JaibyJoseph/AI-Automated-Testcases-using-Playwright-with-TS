# ADR 0005: Shared login session, isolated test data and secret hygiene

- Status: Accepted
- Date: 2026-10-31

## Context

The demo is shared, scenarios run in parallel across three browsers, and Phase 2 showed that Playwright artifacts capture typed credentials.

## Decisions

### Session reuse

- A `setup` project logs in once per run (Chromium, tracing/video/screenshots off) and saves cookies to `.auth/user.json` (gitignored).
- Per browser there are two projects: `<browser>` reuses the session and excludes `@auth`; `<browser>-auth` runs only `@auth` scenarios, starts logged out and has tracing off.
- The Chromium session is reused by Firefox and WebKit; verified working on 2026-10-31.
- Any future logout scenario must be tagged `@auth`, otherwise it would end the shared session.

### Test data

- Names are `PWAUTO-<RUN_ID>-<8 random hex> <label>`. `RUN_ID` is set once in `playwright.config.ts` and inherited by workers; it can be set explicitly (e.g. CI run number).
- Every created record id is registered in the `createdAccounts` fixture and deleted in teardown, also when the scenario fails. Only registered ids are ever deleted.
- Cleanup failures do not change the test result but add a `cleanup-failed` annotation to the report.
- Deletion is verified by reopening the record (side-effect free) rather than list search, because list searches are saved as preferences of the shared demo user.

### Secret hygiene

Verified leaks and their controls:

| Artifact                         | Leak observed                                         | Control                                                                                           |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Trace (`trace.zip`)              | Typed password, POST body, DOM snapshots              | Tracing off for `setup` and `*-auth` projects                                                     |
| HTML report step titles          | `Fill "<value>"`                                      | Password entered with `fillSecret()` (shows as `Evaluate`)                                        |
| `error-context.md` page snapshot | Password re-rendered by SuiteCRM after a failed login | `RedactionReporter` scrubs secret values from text artifacts before the HTML reporter copies them |

Secret variables are listed in `src/support/redaction.ts` (`SECRET_ENV_VARS`).

## Consequences

- The password field receives its value via script, not key events. Acceptable for a plain form field.
- The demo account's username equals its password, so the username's normal `Fill` step contains the same string. With a real account this does not apply.
- Binary artifacts (screenshots, videos) are not scrubbed; the password field renders masked, so they do not contain it in readable form.
- Retries remain off locally so instability is visible; CI uses 2 retries and reports flaky tests (Phase 8).
