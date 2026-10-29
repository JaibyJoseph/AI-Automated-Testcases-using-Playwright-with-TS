import { expect, test } from '@playwright/test';

// Phase 1 foundation check: proves browser, config and network work end to end.
// It only reads the public login page, so it needs no credentials.
// Replaced by a Gherkin scenario in Phase 2.
test.describe('SuiteCRM login page', () => {
  test('displays the login form', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/module=Users/);
    await expect(page).toHaveTitle(/SuiteCRM/);
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByPlaceholder('Password', { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeEnabled();
  });
});
