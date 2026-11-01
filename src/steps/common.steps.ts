import { expect } from '@playwright/test';
import { Given } from '../fixtures';

// The session comes from the setup project (storageState); this step only confirms it is still valid.
Given('the user is signed in', async ({ page, homePage }) => {
  await page.goto('/index.php?module=Home&action=index');
  await expect(homePage.salesMenu).toBeVisible();
});
