import { expect, type APIResponse } from '@playwright/test';

/**
 * Asserts the HTTP status and returns the parsed JSON body (or null for empty responses).
 * On a mismatch the failure message includes the URL and response body, which is the
 * evidence needed to tell a test defect from an API defect.
 */
export async function expectStatus<T = unknown>(response: APIResponse, status: number): Promise<T> {
  const text = await response.text();
  expect(response.status(), `Unexpected status from ${response.url()}\nResponse body: ${text}`).toBe(status);
  return (text ? JSON.parse(text) : null) as T;
}
