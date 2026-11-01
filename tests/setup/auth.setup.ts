import { expect, test as setup } from '@playwright/test';
import { env } from '../../src/config/env';
import { AUTH_STATE_FILE } from '../../src/config/paths';
import { HomePage } from '../../src/pages/HomePage';
import { LoginPage } from '../../src/pages/LoginPage';

// Logs in once per run and saves the session cookies. Scenarios reuse it instead of typing
// credentials again. This project runs with tracing off so the password is never recorded.
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);

  await loginPage.open();
  await loginPage.login(env.SUITECRM_USERNAME, env.SUITECRM_PASSWORD);
  await expect(page).toHaveURL(homePage.url);
  await expect(homePage.salesMenu).toBeVisible();

  await page.context().storageState({ path: AUTH_STATE_FILE });
});
