import { randomUUID } from 'node:crypto';
import type { AccountInput, CustomerInput } from '../api/BankingApiClient';
import { TEST_DATA_PREFIX } from './testData';

/** Valid customer payload; every customer created by tests has firstName PWAUTO and a unique last name. */
export function newCustomer(overrides: Partial<CustomerInput> = {}): CustomerInput {
  return {
    firstName: TEST_DATA_PREFIX,
    middleName: '',
    lastName: `Test${randomUUID().slice(0, 8)}`,
    dateOfBirth: '1990-05-17',
    isMinorCustomer: false,
    gender: 'F',
    birthCountry: 'IN',
    nationality: 'IN',
    ...overrides,
  };
}

export function newAccount(overrides: Partial<AccountInput> = {}): AccountInput {
  return {
    accountType: 'savings',
    nickname: `${TEST_DATA_PREFIX} savings`,
    openingBalance: 10_000,
    ...overrides,
  };
}
