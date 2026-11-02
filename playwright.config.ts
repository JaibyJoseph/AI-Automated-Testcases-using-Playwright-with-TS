import { defineConfig, devices, type Project } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';
import { AUTH_STATE_FILE } from './src/config/paths';

const isCI = !!process.env.CI;

// One ID per run, used in test-data names. Workers inherit it because the config sets it
// in the main process before workers start; later re-evaluations in workers keep the value.
process.env.RUN_ID ??= new Date().toISOString().replace(/[-:]/g, '').slice(0, 13);

// bddgen turns each .feature file into a Playwright spec in .features-gen/ (gitignored).
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['src/steps/**/*.ts', 'src/fixtures/**/*.ts'],
  missingSteps: 'fail-on-gen',
  // Example titles are set per Examples table with a "# title-format:" comment in the feature file.
});

const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

// Per browser, two projects:
// - "<browser>": reuses the saved session; everything except @auth and @api.
// - "<browser>-auth": @auth scenarios that type credentials themselves. They start logged out
//   and run with tracing off so the password never lands in a trace file.
// @api scenarios run once, in the browserless "api" project below.
const browserProjects: Project[] = browsers.flatMap(({ name, device }) => [
  {
    name,
    grepInvert: [/@auth/, /@api/],
    dependencies: ['setup'],
    use: { ...device, storageState: AUTH_STATE_FILE },
  },
  {
    name: `${name}-auth`,
    grep: /@auth/,
    grepInvert: /@api/,
    use: { ...device, trace: 'off' },
  },
]);

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
  // Includes fixture teardown, i.e. deleting the records a scenario created.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    // First, so artifacts are scrubbed before other reporters copy them.
    ['./src/support/redactionReporter.ts'],
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
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], trace: 'off', video: 'off', screenshot: 'off' },
    },
    ...browserProjects,
    {
      // @api features (features/api). API steps never request `page`, so no browser starts.
      // Tracing off because traces record the token request body (password) and Authorization
      // headers; failures carry the response body in the assertion message instead.
      name: 'api',
      grep: /@api/,
      use: { trace: 'off', video: 'off', screenshot: 'off' },
    },
  ],
});
