import type { APIResponse } from '@playwright/test';
import type { CustomerInput } from './BankingApiClient';

export type ApiCustomer = CustomerInput & { id: string; status: string };
export type ApiAccount = { id: string; customerId: string; accountType: string; nickname: string; balance: number };

export type RecordedResponse = { status: number; url: string; text: string; body: unknown };

/** Default alias for steps that talk about "the account". */
export const DEFAULT_ACCOUNT = 'default';

/**
 * State shared between the steps of one API scenario. A new instance is created for every scenario.
 * "When" steps record the response; "Then" steps assert on it.
 */
export class ApiScenarioContext {
  private response: RecordedResponse | undefined;
  /** The payload most recently sent to create or replace the customer. */
  sentCustomer: CustomerInput | undefined;
  customer: ApiCustomer | undefined;
  readonly accounts = new Map<string, ApiAccount>();

  async record(response: APIResponse): Promise<RecordedResponse> {
    const text = await response.text();
    this.response = { status: response.status(), url: response.url(), text, body: text ? JSON.parse(text) : null };
    return this.response;
  }

  get lastResponse(): RecordedResponse {
    if (!this.response) throw new Error('No API response recorded. A "When" step must call the API first.');
    return this.response;
  }

  /** The response body's `data` property, typed by the caller (the API is untyped JSON). */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- caller-declared response shape
  lastData<T>(): T {
    return (this.lastResponse.body as { data: T }).data;
  }

  requireCustomer(): ApiCustomer {
    if (!this.customer) throw new Error('No customer in this scenario. A previous step must create one.');
    return this.customer;
  }

  requireAccount(alias = DEFAULT_ACCOUNT): ApiAccount {
    const account = this.accounts.get(alias);
    if (!account) throw new Error(`No account "${alias}" in this scenario. A previous step must create it.`);
    return account;
  }
}
