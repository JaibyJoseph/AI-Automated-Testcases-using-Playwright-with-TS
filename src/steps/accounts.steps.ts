import { expect, type Page } from '@playwright/test';
import { uniqueName } from '../data/testData';
import { Given, Then, When, type ScenarioContext } from '../fixtures';
import type { AccountDetailPage } from '../pages/AccountDetailPage';
import type { AccountEditPage, AccountFormData } from '../pages/AccountEditPage';

type CreateAccountDeps = {
  page: Page;
  accountEditPage: AccountEditPage;
  accountDetailPage: AccountDetailPage;
  scenario: ScenarioContext;
  createdAccounts: Set<string>;
};

// The feature file uses readable labels; the stored name gets a unique, traceable prefix.
async function createAccount(deps: CreateAccountDeps, label: string, data: Omit<AccountFormData, 'name'> = {}) {
  const name = uniqueName(label);
  await deps.accountEditPage.openNew();
  await deps.accountEditPage.fill({ name, ...data });
  await deps.accountEditPage.save();
  await expect(deps.page).toHaveURL(deps.accountDetailPage.url);

  const id = deps.accountDetailPage.recordId();
  deps.createdAccounts.add(id);
  deps.scenario.account = { id, name };
}

// Playwright resolves fixtures from the destructured parameter names, so steps must destructure them.

Given('the user is on the new account form', async ({ accountEditPage }) => {
  await accountEditPage.openNew();
  await expect(accountEditPage.createHeading).toBeVisible();
});

Given(
  'an account named {string} exists',
  async ({ page, accountEditPage, accountDetailPage, scenario, createdAccounts }, label: string) => {
    await createAccount({ page, accountEditPage, accountDetailPage, scenario, createdAccounts }, label);
  },
);

When(
  'the user creates an account named {string}',
  async ({ page, accountEditPage, accountDetailPage, scenario, createdAccounts }, label: string) => {
    await createAccount({ page, accountEditPage, accountDetailPage, scenario, createdAccounts }, label);
  },
);

When(
  'the user creates an account named {string} with type {string} and industry {string}',
  async (
    { page, accountEditPage, accountDetailPage, scenario, createdAccounts },
    label: string,
    type: string,
    industry: string,
  ) => {
    await createAccount({ page, accountEditPage, accountDetailPage, scenario, createdAccounts }, label, {
      type,
      industry,
    });
  },
);

When('the user saves the account form without a name', async ({ accountEditPage }) => {
  await accountEditPage.save();
});

When('the user deletes the account', async ({ accountDetailPage, scenario, createdAccounts }) => {
  const { id } = scenario.requireAccount();
  await accountDetailPage.open(id);
  await accountDetailPage.delete();
  createdAccounts.delete(id);
});

Then('the account detail page should show the account name', async ({ accountDetailPage, scenario }) => {
  const { name } = scenario.requireAccount();
  await expect(accountDetailPage.heading(name)).toBeVisible();
  await expect(accountDetailPage.field('name')).toHaveText(name);
});

Then(
  'the account should have type {string} and industry {string}',
  async ({ accountDetailPage }, type: string, industry: string) => {
    await expect(accountDetailPage.field('account_type')).toHaveText(type);
    await expect(accountDetailPage.field('industry')).toHaveText(industry);
  },
);

Then('the validation message {string} should be shown', async ({ accountEditPage }, message: string) => {
  await expect(accountEditPage.message(message)).toBeVisible();
});

Then('the account should not be saved', async ({ page, accountEditPage }) => {
  await expect(page).toHaveURL(accountEditPage.url);
  await expect(accountEditPage.createHeading).toBeVisible();
});

Then('the account should no longer be available', async ({ accountDetailPage, scenario }) => {
  const { id } = scenario.requireAccount();
  await accountDetailPage.open(id);
  await expect(accountDetailPage.recordNotFound).toBeVisible();
});
