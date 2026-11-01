import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { redactDirectory, redactFile, secretValues } from './redaction';

/**
 * Removes secret values from text artifacts (e.g. error-context.md page snapshots).
 * Must be listed before the HTML reporter so files are clean before they are copied into the report.
 */
export default class RedactionReporter implements Reporter {
  private readonly secrets = secretValues();
  private readonly outputDirs = new Set<string>();
  private redactedCount = 0;

  onBegin(config: FullConfig): void {
    for (const project of config.projects) this.outputDirs.add(project.outputDir);
  }

  onTestEnd(_test: TestCase, result: TestResult): void {
    for (const attachment of result.attachments) {
      if (attachment.path) this.redactedCount += redactFile(attachment.path, this.secrets);
    }
  }

  onEnd(): void {
    // Sweep for anything not registered as an attachment.
    for (const dir of this.outputDirs) this.redactedCount += redactDirectory(dir, this.secrets);
    if (this.redactedCount > 0) {
      console.log(`[redaction] Removed ${String(this.redactedCount)} secret occurrence(s) from test artifacts.`);
    }
  }

  printsToStdio(): boolean {
    return false;
  }
}
