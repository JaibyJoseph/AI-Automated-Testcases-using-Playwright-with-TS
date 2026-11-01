import type { Locator } from '@playwright/test';

/**
 * Enters a secret without exposing it in reports. `locator.fill(value)` records the value in the
 * step title ("Fill "<value>" ..."), which the HTML report stores even when tracing is off.
 * Setting the value via `evaluate` shows up only as "Evaluate".
 * Trade-off: no per-key typing events, which is acceptable for a plain password field.
 */
export async function fillSecret(locator: Locator, value: string): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.evaluate((element, secret) => {
    const input = element as HTMLInputElement;
    input.value = secret;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
