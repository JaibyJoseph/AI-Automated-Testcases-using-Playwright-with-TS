import { newAccount, newCustomer } from '../data/apiTestData';
import { DEFAULT_ACCOUNT, type ApiAccount, type ApiCustomer, type ApiScenarioContext } from './ApiScenarioContext';
import { expectStatus } from './assertions';
import type { BankingApiClient } from './BankingApiClient';

// Preconditions used by "Given" steps. Unlike "When" steps, these must succeed, so they assert.

type Deps = { api: BankingApiClient; apiScenario: ApiScenarioContext; createdApiCustomers: Set<string> };

export async function ensureCustomer({ api, apiScenario, createdApiCustomers }: Deps): Promise<ApiCustomer> {
  if (apiScenario.customer) return apiScenario.customer;
  const input = newCustomer();
  const { data } = await expectStatus<{ data: ApiCustomer }>(await api.createCustomer(input), 201);
  createdApiCustomers.add(data.id);
  apiScenario.sentCustomer = input;
  apiScenario.customer = data;
  return data;
}

export async function ensureAccount(deps: Deps, alias: string, openingBalance: number): Promise<ApiAccount> {
  const customer = await ensureCustomer(deps);
  const { data } = await expectStatus<{ data: ApiAccount }>(
    await deps.api.createAccount(customer.id, newAccount({ openingBalance })),
    201,
  );
  deps.apiScenario.accounts.set(alias, data);
  return data;
}

export async function currentBalance(api: BankingApiClient, accountId: string): Promise<number> {
  const { data } = await expectStatus<{ data: ApiAccount }>(await api.getAccount(accountId), 200);
  return data.balance;
}

export { DEFAULT_ACCOUNT };
