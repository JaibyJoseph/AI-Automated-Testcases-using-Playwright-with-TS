import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env for local runs. In CI the same variables come from GitHub Secrets/Variables,
// and real environment variables always win over .env values.
dotenv.config({ quiet: true });

const EnvSchema = z.object({
  BASE_URL: z.url({ message: 'BASE_URL must be a full URL, e.g. https://demo.suiteondemand.com' }),
  SUITECRM_USERNAME: z.string({ message: 'SUITECRM_USERNAME is required' }).min(1, 'SUITECRM_USERNAME is required'),
  SUITECRM_PASSWORD: z.string({ message: 'SUITECRM_PASSWORD is required' }).min(1, 'SUITECRM_PASSWORD is required'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Fail fast with a readable message instead of failing later inside a test.
    // zod reports which variable is wrong, never its value.
    throw new Error(
      `Invalid environment configuration. Copy .env.example to .env and fill it in.\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export const env = loadEnv();
