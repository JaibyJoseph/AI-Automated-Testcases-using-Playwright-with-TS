import type { APIRequestContext, APIResponse } from '@playwright/test';

// Request bodies as documented in the API's Swagger UI (<API_BASE_URL>/swagger).
export type TokenRequest = { email: string; password: string; expires_in: number };

export type CustomerInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  isMinorCustomer?: boolean;
  gender: string;
  birthCountry?: string;
  nationality?: string;
};

export type AccountInput = { accountType: 'savings' | 'current'; nickname?: string; openingBalance?: number };
export type TransactionInput = { type: 'credit' | 'debit'; amount: number; reference?: string };
export type TransferInput = { fromAccountId: string; toAccountId: string; amount: number };

/**
 * Thin wrapper around Playwright's APIRequestContext: one method per endpoint, no assertions.
 * Tests decide what a response should look like; the client only knows how to call the API.
 * Paths are relative so they resolve against the context's baseURL (<API_BASE_URL>/api/v1/).
 */
export class BankingApiClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(body: TokenRequest): Promise<APIResponse> {
    return this.request.post('auth/token', { data: body });
  }

  listCustomers(): Promise<APIResponse> {
    return this.request.get('customers');
  }

  createCustomer(body: CustomerInput | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('customers', { data: body });
  }

  getCustomer(customerId: string): Promise<APIResponse> {
    return this.request.get(`customers/${encodeURIComponent(customerId)}`);
  }

  replaceCustomer(customerId: string, body: CustomerInput): Promise<APIResponse> {
    return this.request.put(`customers/${encodeURIComponent(customerId)}`, { data: body });
  }

  deleteCustomer(customerId: string): Promise<APIResponse> {
    return this.request.delete(`customers/${encodeURIComponent(customerId)}`);
  }

  createAccount(customerId: string, body: AccountInput | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post(`customers/${encodeURIComponent(customerId)}/accounts`, { data: body });
  }

  listAccounts(customerId: string): Promise<APIResponse> {
    return this.request.get(`customers/${encodeURIComponent(customerId)}/accounts`);
  }

  getAccount(accountId: string): Promise<APIResponse> {
    return this.request.get(`accounts/${encodeURIComponent(accountId)}`);
  }

  updateAccountNickname(accountId: string, nickname: string): Promise<APIResponse> {
    return this.request.patch(`accounts/${encodeURIComponent(accountId)}`, { data: { nickname } });
  }

  deleteAccount(accountId: string): Promise<APIResponse> {
    return this.request.delete(`accounts/${encodeURIComponent(accountId)}`);
  }

  createTransaction(accountId: string, body: TransactionInput): Promise<APIResponse> {
    return this.request.post(`accounts/${encodeURIComponent(accountId)}/transactions`, { data: body });
  }

  listTransactions(accountId: string): Promise<APIResponse> {
    return this.request.get(`accounts/${encodeURIComponent(accountId)}/transactions`);
  }

  transfer(body: TransferInput): Promise<APIResponse> {
    return this.request.post('transfers', { data: body });
  }
}
