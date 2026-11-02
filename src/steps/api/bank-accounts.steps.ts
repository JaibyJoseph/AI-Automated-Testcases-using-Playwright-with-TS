import { expect } from '@playwright/test';
import type { ApiAccount } from '../../api/ApiScenarioContext';
import { expectStatus } from '../../api/assertions';
import { currentBalance, DEFAULT_ACCOUNT, ensureAccount } from '../../api/scenarioActions';
import { newAccount } from '../../data/apiTestData';
import { Given, Then, When } from '../../fixtures';

Given(
  'a customer has an account with a balance of {int}',
  async ({ api, apiScenario, createdApiCustomers }, balance: number) => {
    await ensureAccount({ api, apiScenario, createdApiCustomers }, DEFAULT_ACCOUNT, balance);
  },
);

Given(
  'a customer has an account {string} with a balance of {int}',
  async ({ api, apiScenario, createdApiCustomers }, alias: string, balance: number) => {
    await ensureAccount({ api, apiScenario, createdApiCustomers }, alias, balance);
  },
);

When(
  'I open a {string} account with an opening balance of {int}',
  async ({ api, apiScenario }, accountType: string, openingBalance: number) => {
    const body = newAccount({ accountType: accountType as 'savings' | 'current', openingBalance });
    const { status } = await apiScenario.record(await api.createAccount(apiScenario.requireCustomer().id, body));
    if (status === 201) apiScenario.accounts.set(DEFAULT_ACCOUNT, apiScenario.lastData<ApiAccount>());
  },
);

When(
  'I open a {string} account for customer {string}',
  async ({ api, apiScenario }, accountType: string, customerId: string) => {
    const body = newAccount({ accountType: accountType as 'savings' | 'current' });
    await apiScenario.record(await api.createAccount(customerId, body));
  },
);

When('I rename the account to {string}', async ({ api, apiScenario }, nickname: string) => {
  await apiScenario.record(await api.updateAccountNickname(apiScenario.requireAccount().id, nickname));
});

When('I close the account', async ({ api, apiScenario }) => {
  await apiScenario.record(await api.deleteAccount(apiScenario.requireAccount().id));
});

Then('the account should belong to the customer with a balance of {int}', ({ apiScenario }, balance: number) => {
  const account = apiScenario.lastData<ApiAccount>();
  expect(account.id.startsWith('ACC-'), `id ${account.id} should start with ACC-`).toBe(true);
  expect(account).toMatchObject({ customerId: apiScenario.requireCustomer().id, balance });
});

Then('the customer should have exactly that account', async ({ api, apiScenario }) => {
  const { data } = await expectStatus<{ data: ApiAccount[] }>(
    await api.listAccounts(apiScenario.requireCustomer().id),
    200,
  );
  expect(data.map((a) => a.id)).toEqual([apiScenario.requireAccount().id]);
});

Then('the account nickname should be {string}', ({ apiScenario }, nickname: string) => {
  expect(apiScenario.lastData<ApiAccount>().nickname).toBe(nickname);
});

Then('the account balance should be {int}', async ({ api, apiScenario }, balance: number) => {
  expect(await currentBalance(api, apiScenario.requireAccount().id)).toBe(balance);
});

Then(
  'account {string} should have a balance of {int}',
  async ({ api, apiScenario }, alias: string, balance: number) => {
    expect(await currentBalance(api, apiScenario.requireAccount(alias).id)).toBe(balance);
  },
);

Then('the account should no longer exist', async ({ api, apiScenario }) => {
  await expectStatus(await api.getAccount(apiScenario.requireAccount().id), 404);
});
