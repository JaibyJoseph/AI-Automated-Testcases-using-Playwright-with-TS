# ADR 0001: Use the SuiteCRM demo as the application under test

- Status: Accepted
- Date: 2026-10-29

## Context

The original target was myntra.com, with flipkart.com and the SuiteCRM demo as fallbacks. Checks made on 2026-10-29:

- myntra.com: plain HTTP requests timed out and then had the connection reset, consistent with bot protection. Bypassing bot protection is out of bounds.
- flipkart.com: reachable, but its Terms of Use prohibit any "robot", "spider" or other automatic device used to access the platform.
- demo.suiteondemand.com: reachable; a vendor-hosted demo intended for hands-on trial, with form login and CRUD workflows.

## Decision

Use `https://demo.suiteondemand.com/` as the only target.

## Consequences

- Real login, create/edit/delete, validation and search workflows are available for BDD scenarios.
- The instance is shared and resets periodically. Tests must create uniquely prefixed data (`PWAUTO-<runId>`), clean up only their own records, and never depend on pre-existing data.
- `robots.txt` disallows crawlers. We keep load low (max 2 local workers, 1 in CI) and do not crawl.
- Page content is user-editable by anyone and is treated as untrusted input to AI agents.
