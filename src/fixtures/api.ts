import { expect, type APIRequestContext, type PlaywrightWorkerArgs, type TestInfo } from '@playwright/test';
import { BankingApiClient } from '../api/BankingApiClient';
import { env } from '../config/env';

// Fixture functions for the API features. They are registered in ./index.ts so that UI and API
// steps share one test object, as playwright-bdd requires.

// All endpoints live under /api/v1/. The trailing slash lets clients use relative paths.
export const API_V1 = new URL('/api/v1/', env.API_BASE_URL).toString();

export const PRACTICE_USER = { email: env.API_USER_EMAIL, password: env.API_USER_PASSWORD };

type Use<T> = (value: T) => Promise<void>;

function openContext(playwright: PlaywrightWorkerArgs['playwright'], token?: string): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: API_V1,
    extraHTTPHeaders: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

/** Factory for extra clients, each with its own fresh token (e.g. a second, independent user). */
export async function newAuthenticatedApiFixture(
  { playwright }: { playwright: PlaywrightWorkerArgs['playwright'] },
  use: Use<() => Promise<BankingApiClient>>,
): Promise<void> {
  const contexts: APIRequestContext[] = [];
  await use(async () => {
    const anonymous = await openContext(playwright);
    contexts.push(anonymous);
    const response = await new BankingApiClient(anonymous).createToken({ ...PRACTICE_USER, expires_in: 900 });
    // Status only: the body contains the token and must not end up in failure messages.
    expect(response.status(), 'Could not obtain an access token for the practice user').toBe(201);
    const { access_token } = (await response.json()) as { access_token: string };
    const authenticated = await openContext(playwright, access_token);
    contexts.push(authenticated);
    return new BankingApiClient(authenticated);
  });
  for (const context of contexts) await context.dispose();
}

/** Client without an Authorization header, for token and 401 scenarios. */
export async function anonymousApiFixture(
  { playwright }: { playwright: PlaywrightWorkerArgs['playwright'] },
  use: Use<BankingApiClient>,
): Promise<void> {
  const context = await openContext(playwright);
  await use(new BankingApiClient(context));
  await context.dispose();
}

/** Client with a fresh token. Created only when a step asks for it; one token per scenario. */
export async function apiFixture(
  { newAuthenticatedApi }: { newAuthenticatedApi: () => Promise<BankingApiClient> },
  use: Use<BankingApiClient>,
): Promise<void> {
  await use(await newAuthenticatedApi());
}

/**
 * Customer ids created through `api`, removed after the scenario (also on failure).
 * API rules: an account with a balance cannot be deleted, and a customer with accounts cannot be
 * deleted (both 409). So: withdraw the balance, delete the accounts, then delete the customer.
 */
export async function createdApiCustomersFixture(
  { api }: { api: BankingApiClient },
  use: Use<Set<string>>,
  testInfo: TestInfo,
): Promise<void> {
  const ids = new Set<string>();
  await use(ids);
  for (const id of ids) {
    try {
      const accounts = await api.listAccounts(id);
      if (accounts.ok()) {
        const { data } = (await accounts.json()) as { data: { id: string; balance: number }[] };
        for (const account of data) {
          if (account.balance > 0) {
            await api.createTransaction(account.id, { type: 'debit', amount: account.balance, reference: 'Cleanup' });
          }
          const deletedAccount = await api.deleteAccount(account.id);
          if (![204, 404].includes(deletedAccount.status())) {
            throw new Error(`DELETE account ${account.id} returned ${String(deletedAccount.status())}`);
          }
        }
      }
      const deleted = await api.deleteCustomer(id);
      if (![204, 404].includes(deleted.status())) throw new Error(`DELETE returned ${String(deleted.status())}`);
    } catch (error) {
      testInfo.annotations.push({ type: 'cleanup-failed', description: `API customer ${id}: ${String(error)}` });
    }
  }
}
