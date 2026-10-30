import { expect } from '@playwright/test';
import { env } from '../config/env';
import { Given, Then, When } from '../fixtures';

// Steps translate business language into page-object calls and assertions.
// Locators live in page objects, never here.

Given('the user is on the login page', async ({ loginPage }) => {
  await loginPage.open();
  await expect(loginPage.loginButton).toBeVisible();
});

When('the user logs in with valid credentials', async ({ loginPage }) => {
  await loginPage.login(env.SUITECRM_USERNAME, env.SUITECRM_PASSWORD);
});

When(
  'the user logs in with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

Then('the user should see the home page', async ({ page, homePage }) => {
  await expect(page).toHaveURL(homePage.url);
  await expect(page).toHaveTitle(homePage.title);
  await expect(homePage.salesMenu).toBeVisible();
});

Then('the login error {string} should be shown', async ({ loginPage }, message: string) => {
  await expect(loginPage.message(message)).toBeVisible();
});

Then('the user should remain on the login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(loginPage.url);
  await expect(loginPage.loginButton).toBeVisible();
});
