import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';

const isCI = !!process.env.CI;

// bddgen turns each .feature file into a Playwright spec in .features-gen/ (gitignored).
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['src/steps/**/*.ts', 'src/fixtures/**/*.ts'],
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  outputDir: './test-results',
  fullyParallel: true,
  // A stray test.only must never silently shrink the CI suite.
  forbidOnly: isCI,
  // Retries hide flakiness locally; in CI they are allowed but reported as "flaky".
  retries: isCI ? 2 : 0,
  // The target is a shared public demo, so keep load low.
  workers: isCI ? 1 : 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: env.BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
