import { expect } from '@playwright/test';
import { expectStatus } from '../../api/assertions';
import { Then, When } from '../../fixtures';

type Transaction = { type: string; amount: number };

When('I credit {int} to the account', async ({ api, apiScenario }, amount: number) => {
  await apiScenario.record(await api.createTransaction(apiScenario.requireAccount().id, { type: 'credit', amount }));
});

When(
  'I credit {int} to the account with reference {string}',
  async ({ api, apiScenario }, amount: number, reference: string) => {
    const accountId = apiScenario.requireAccount().id;
    await apiScenario.record(await api.createTransaction(accountId, { type: 'credit', amount, reference }));
  },
);

When('I debit {int} from the account', async ({ api, apiScenario }, amount: number) => {
  await apiScenario.record(await api.createTransaction(apiScenario.requireAccount().id, { type: 'debit', amount }));
});

When(
  'I debit {int} from the account with reference {string}',
  async ({ api, apiScenario }, amount: number, reference: string) => {
    const accountId = apiScenario.requireAccount().id;
    await apiScenario.record(await api.createTransaction(accountId, { type: 'debit', amount, reference }));
  },
);

When(
  'I transfer {int} from account {string} to account {string}',
  async ({ api, apiScenario }, amount: number, from: string, to: string) => {
    const fromAccountId = apiScenario.requireAccount(from).id;
    const toAccountId = apiScenario.requireAccount(to).id;
    await apiScenario.record(await api.transfer({ fromAccountId, toAccountId, amount }));
  },
);

Then(
  'the transaction history should contain a credit of {int} and a debit of {int}',
  async ({ api, apiScenario }, credit: number, debit: number) => {
    const { data } = await expectStatus<{ data: Transaction[] }>(
      await api.listTransactions(apiScenario.requireAccount().id),
      200,
    );
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'credit', amount: credit }),
        expect.objectContaining({ type: 'debit', amount: debit }),
      ]),
    );
  },
);
