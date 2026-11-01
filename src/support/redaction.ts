import fs from 'node:fs';
import path from 'node:path';

// Environment variables whose values must never appear in artifacts, logs or (later) AI prompts.
export const SECRET_ENV_VARS = ['SUITECRM_PASSWORD'] as const;

export const REDACTED = '[REDACTED]';

const TEXT_FILE_EXTENSIONS = new Set(['.md', '.txt', '.json', '.log', '.xml', '.html']);

export function secretValues(env: NodeJS.ProcessEnv = process.env): string[] {
  return SECRET_ENV_VARS.map((name) => env[name]).filter((value): value is string => !!value);
}

export function redactText(text: string, secrets: readonly string[]): { text: string; count: number } {
  let count = 0;
  let result = text;
  for (const secret of secrets) {
    const parts = result.split(secret);
    count += parts.length - 1;
    result = parts.join(REDACTED);
  }
  return { text: result, count };
}

/** Redacts secrets in a text file in place. Binary files (screenshots, videos, traces) are skipped. */
export function redactFile(filePath: string, secrets: readonly string[]): number {
  if (!TEXT_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase()) || !fs.existsSync(filePath)) return 0;
  const { text, count } = redactText(fs.readFileSync(filePath, 'utf8'), secrets);
  if (count > 0) fs.writeFileSync(filePath, text, 'utf8');
  return count;
}

export function redactDirectory(dir: string, secrets: readonly string[]): number {
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .reduce((total, entry) => total + redactFile(path.join(entry.parentPath, entry.name), secrets), 0);
}
