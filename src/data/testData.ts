import { randomUUID } from 'node:crypto';

// Every record created by this framework starts with this prefix, so it can be
// recognised (and cleaned up) on the shared demo without touching anyone else's data.
export const TEST_DATA_PREFIX = 'PWAUTO';

// Set once in playwright.config.ts and inherited by all workers, so one run shares one ID.
export function runId(): string {
  return process.env.RUN_ID ?? 'local';
}

/** Unique, traceable record name, e.g. "PWAUTO-20261030T1012-3f9a1c2b Acme Logistics". */
export function uniqueName(label: string): string {
  return `${TEST_DATA_PREFIX}-${runId()}-${randomUUID().slice(0, 8)} ${label}`;
}
