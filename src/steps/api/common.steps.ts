import { expect } from '@playwright/test';
import { BankingApiClient } from '../../api/BankingApiClient';
import { Given, Then } from '../../fixtures';

// Requesting the `api` fixture creates a fresh token for this scenario.
Given('I have a valid access token', ({ api }) => {
  expect(api).toBeInstanceOf(BankingApiClient);
});

Then('the response status should be {int}', ({ apiScenario }, status: number) => {
  const { status: actual, url, text } = apiScenario.lastResponse;
  expect(actual, `Unexpected status from ${url}\nResponse body: ${text}`).toBe(status);
});

Then('the response error should be {string}', ({ apiScenario }, error: string) => {
  expect(apiScenario.lastResponse.body).toMatchObject({ error });
});

Then('the response message should name the fields {string}', ({ apiScenario }, fields: string) => {
  const { message } = apiScenario.lastResponse.body as { message: string };
  for (const field of fields.split(',').map((f) => f.trim())) expect(message).toContain(field);
});
