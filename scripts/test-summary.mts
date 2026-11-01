// Prints pass/fail counts from Playwright's JSON report (reports/results.json).
// In GitHub Actions it also writes a Markdown table to the job summary page.
// Run with: node scripts/test-summary.mts  (Node 24 runs TypeScript directly)
import fs from 'node:fs';
import { stripVTControlCharacters } from 'node:util';

type TestStatus = 'expected' | 'unexpected' | 'flaky' | 'skipped';
type JsonResult = { status: string; retry: number; errors: { message?: string }[] };
type JsonTest = { projectName: string; status: TestStatus; results: JsonResult[] };
type JsonSpec = { title: string; file: string; tests: JsonTest[] };
type JsonSuite = { title: string; specs?: JsonSpec[]; suites?: JsonSuite[] };
type JsonReport = { suites: JsonSuite[]; errors: { message?: string }[]; stats: { duration: number } };

type Row = { project: string; passed: number; failed: number; flaky: number; skipped: number };
type Failure = { project: string; title: string; error: string };

const reportPath = process.argv[2] ?? 'reports/results.json';
if (!fs.existsSync(reportPath)) {
  console.error(`No report at ${reportPath}. Did the test run start?`);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as JsonReport;

const rows = new Map<string, Row>();
const failures: Failure[] = [];

// Playwright error messages contain terminal colour codes; strip them for readable output.
const firstLine = (text = '') =>
  stripVTControlCharacters(text)
    .split('\n')
    .find((line) => line.trim() !== '')
    ?.trim() ?? '';

function visit(suite: JsonSuite, path: string[]): void {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const row = rows.get(test.projectName) ?? {
        project: test.projectName,
        passed: 0,
        failed: 0,
        flaky: 0,
        skipped: 0,
      };
      if (test.status === 'expected') row.passed++;
      else if (test.status === 'unexpected') row.failed++;
      else if (test.status === 'flaky') row.flaky++;
      else row.skipped++;
      rows.set(test.projectName, row);

      if (test.status === 'unexpected') {
        const last = test.results.at(-1);
        failures.push({
          project: test.projectName,
          title: [...path, spec.title].filter(Boolean).join(' › '),
          error: firstLine(last?.errors[0]?.message),
        });
      }
    }
  }
  // File-level suites are named after the generated spec path; keep only feature/describe titles.
  for (const child of suite.suites ?? []) visit(child, [...path, child.title]);
}
for (const suite of report.suites) visit(suite, []);

const all = [...rows.values()].sort((a, b) => a.project.localeCompare(b.project));
const total = all.reduce(
  (sum, r) => ({
    passed: sum.passed + r.passed,
    failed: sum.failed + r.failed,
    flaky: sum.flaky + r.flaky,
    skipped: sum.skipped + r.skipped,
  }),
  { passed: 0, failed: 0, flaky: 0, skipped: 0 },
);
const count = total.passed + total.failed + total.flaky + total.skipped;
const minutes = (report.stats.duration / 60_000).toFixed(1);
const outcome = total.failed > 0 || report.errors.length > 0 ? 'FAILED' : 'PASSED';

// Plain-text version for the job log.
console.log(`\nUI tests ${outcome}: ${String(count)} tests in ${minutes} min`);
console.log(
  `  passed ${String(total.passed)} | failed ${String(total.failed)} | flaky ${String(total.flaky)} | skipped ${String(total.skipped)}\n`,
);
for (const r of all) {
  console.log(
    `  ${r.project.padEnd(14)} passed ${String(r.passed).padStart(3)}  failed ${String(r.failed).padStart(3)}  flaky ${String(r.flaky).padStart(3)}  skipped ${String(r.skipped).padStart(3)}`,
  );
}
for (const f of failures) console.log(`\n  FAILED [${f.project}] ${f.title}\n    ${f.error}`);
for (const e of report.errors) console.log(`\n  RUN ERROR: ${firstLine(e.message)}`);

// Markdown version for the GitHub Actions job summary.
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  const md = [
    `## UI tests ${outcome === 'PASSED' ? 'passed' : 'failed'}`,
    '',
    `**${String(count)} tests** in ${minutes} min`,
    '',
    '| Project | Passed | Failed | Flaky | Skipped |',
    '|---|---:|---:|---:|---:|',
    ...all.map(
      (r) => `| ${r.project} | ${String(r.passed)} | ${String(r.failed)} | ${String(r.flaky)} | ${String(r.skipped)} |`,
    ),
    `| **Total** | **${String(total.passed)}** | **${String(total.failed)}** | **${String(total.flaky)}** | **${String(total.skipped)}** |`,
    '',
    ...(failures.length > 0
      ? ['### Failed tests', '', ...failures.map((f) => `- \`${f.project}\` ${f.title}: ${f.error}`), '']
      : []),
    ...(report.errors.length > 0
      ? ['### Run errors', '', ...report.errors.map((e) => `- ${firstLine(e.message)}`), '']
      : []),
    'Flaky = failed first, passed on retry. Full details are in the `playwright-report` artifact.',
    '',
  ].join('\n');
  fs.appendFileSync(summaryFile, md);
}
