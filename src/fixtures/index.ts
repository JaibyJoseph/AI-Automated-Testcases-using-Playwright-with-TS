import { createBdd, test as base } from 'playwright-bdd';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

type PageFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
};

// Each scenario gets its own browser context and fresh page objects, so scenarios never share state.
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
