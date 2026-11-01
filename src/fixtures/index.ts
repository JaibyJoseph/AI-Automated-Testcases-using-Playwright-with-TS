import { createBdd, test as base } from 'playwright-bdd';
import { AccountDetailPage } from '../pages/AccountDetailPage';
import { AccountEditPage } from '../pages/AccountEditPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

export type CreatedAccount = { id: string; name: string };

/** State shared between the steps of one scenario. A new instance is created for every scenario. */
export class ScenarioContext {
  account: CreatedAccount | undefined;

  requireAccount(): CreatedAccount {
    if (!this.account) throw new Error('No account in this scenario. A previous step must create one first.');
    return this.account;
  }
}

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  accountEditPage: AccountEditPage;
  accountDetailPage: AccountDetailPage;
  scenario: ScenarioContext;
  /** Record ids of accounts created by this scenario. Deleted automatically after the scenario. */
  createdAccounts: Set<string>;
};

// Each scenario gets its own browser context and fresh fixtures, so scenarios never share state.
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  accountEditPage: async ({ page }, use) => {
    await use(new AccountEditPage(page));
  },
  accountDetailPage: async ({ page }, use) => {
    await use(new AccountDetailPage(page));
  },
  scenario: async ({}, use) => {
    await use(new ScenarioContext());
  },
  createdAccounts: async ({ page }, use, testInfo) => {
    const ids = new Set<string>();
    await use(ids);
    // Teardown runs even when the scenario failed. Only ids this scenario created are touched.
    const detailPage = new AccountDetailPage(page);
    for (const id of ids) {
      try {
        await detailPage.deleteIfPresent(id);
      } catch (error) {
        // A cleanup problem must not hide the real test result, but it must be visible in the report.
        testInfo.annotations.push({
          type: 'cleanup-failed',
          description: `Account ${id} may remain on the demo: ${String(error)}`,
        });
      }
    }
  },
});

export const { Given, When, Then } = createBdd(test);
