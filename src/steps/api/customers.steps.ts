import { expect } from '@playwright/test';
import type { ApiCustomer } from '../../api/ApiScenarioContext';
import { expectStatus } from '../../api/assertions';
import { ensureCustomer } from '../../api/scenarioActions';
import { newCustomer } from '../../data/apiTestData';
import { Given, Then, When } from '../../fixtures';

Given('a customer exists', async ({ api, apiScenario, createdApiCustomers }) => {
  await ensureCustomer({ api, apiScenario, createdApiCustomers });
});

When('I create a customer', async ({ api, apiScenario, createdApiCustomers }) => {
  apiScenario.sentCustomer = newCustomer();
  const { status } = await apiScenario.record(await api.createCustomer(apiScenario.sentCustomer));
  if (status === 201) {
    apiScenario.customer = apiScenario.lastData<ApiCustomer>();
    createdApiCustomers.add(apiScenario.customer.id);
  }
});

When('I create a customer with an empty body', async ({ api, apiScenario }) => {
  await apiScenario.record(await api.createCustomer({}));
});

When('I retrieve the customer', async ({ api, apiScenario }) => {
  await apiScenario.record(await api.getCustomer(apiScenario.requireCustomer().id));
});

When('I retrieve the customer with id {string}', async ({ api, apiScenario }, customerId: string) => {
  await apiScenario.record(await api.getCustomer(customerId));
});

When(
  'I replace the customer with last name {string}, gender {string} and date of birth {string}',
  async ({ api, apiScenario }, lastName: string, gender: string, dateOfBirth: string) => {
    apiScenario.sentCustomer = newCustomer({ lastName, gender, dateOfBirth });
    await apiScenario.record(await api.replaceCustomer(apiScenario.requireCustomer().id, apiScenario.sentCustomer));
  },
);

When('I delete the customer', async ({ api, apiScenario }) => {
  await apiScenario.record(await api.deleteCustomer(apiScenario.requireCustomer().id));
});

When('another user lists customers with their own access token', async ({ newAuthenticatedApi, apiScenario }) => {
  const otherUser = await newAuthenticatedApi();
  await apiScenario.record(await otherUser.listCustomers());
});

Then('the customer should be active with an id starting with {string}', ({ apiScenario }, prefix: string) => {
  const customer = apiScenario.lastData<ApiCustomer>();
  expect(customer.id.startsWith(prefix), `id ${customer.id} should start with ${prefix}`).toBe(true);
  expect(customer.status).toBe('active');
});

Then('the customer details should match what was sent', ({ apiScenario }) => {
  expect(apiScenario.lastData<ApiCustomer>()).toMatchObject({ ...apiScenario.sentCustomer });
});

Then('retrieving the customer should return the replaced details', async ({ api, apiScenario }) => {
  const { data } = await expectStatus<{ data: ApiCustomer }>(
    await api.getCustomer(apiScenario.requireCustomer().id),
    200,
  );
  expect(data).toMatchObject({ ...apiScenario.sentCustomer });
});

Then('the customer should no longer exist', async ({ api, apiScenario }) => {
  await expectStatus(await api.getCustomer(apiScenario.requireCustomer().id), 404);
});

Then('the customer should still exist', async ({ api, apiScenario }) => {
  await expectStatus(await api.getCustomer(apiScenario.requireCustomer().id), 200);
});

Then('the customer should not be visible to the other user', ({ apiScenario }) => {
  const visibleIds = apiScenario.lastData<ApiCustomer[]>().map((c) => c.id);
  expect(visibleIds).not.toContain(apiScenario.requireCustomer().id);
});
