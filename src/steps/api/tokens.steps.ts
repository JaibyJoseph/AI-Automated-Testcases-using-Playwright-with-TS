import { expect } from '@playwright/test';
import { PRACTICE_USER } from '../../fixtures/api';
import { Then, When } from '../../fixtures';

type TokenBody = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_in_minutes: number;
  expires_at: string;
};

When('I request an access token valid for {int} seconds', async ({ anonymousApi, apiScenario }, seconds: number) => {
  await apiScenario.record(await anonymousApi.createToken({ ...PRACTICE_USER, expires_in: seconds }));
});

When('I request an access token with a wrong password', async ({ anonymousApi, apiScenario }) => {
  await apiScenario.record(
    await anonymousApi.createToken({ email: PRACTICE_USER.email, password: 'wrong-password', expires_in: 900 }),
  );
});

When('I list customers without an access token', async ({ anonymousApi, apiScenario }) => {
  await apiScenario.record(await anonymousApi.listCustomers());
});

Then('the response should contain a Bearer token valid for {int} minutes', ({ apiScenario }, minutes: number) => {
  const body = apiScenario.lastResponse.body as TokenBody;

  expect(body.access_token.length).toBeGreaterThan(10);
  expect(body.token_type).toBe('Bearer');
  expect(body.expires_in).toBe(minutes * 60);
  expect(body.expires_in_minutes).toBe(minutes);
  // expires_at must be about `minutes` from now (one minute of tolerance for clock skew and latency).
  const remaining = Date.parse(body.expires_at) - Date.now();
  expect(remaining).toBeGreaterThan((minutes - 1) * 60_000);
  expect(remaining).toBeLessThan((minutes + 1) * 60_000);
});

Then('the allowed token lifetimes should be 900, 1800, 2700 and 3600 seconds', ({ apiScenario }) => {
  expect(apiScenario.lastResponse.body).toMatchObject({ allowed_values: [900, 1800, 2700, 3600] });
});
