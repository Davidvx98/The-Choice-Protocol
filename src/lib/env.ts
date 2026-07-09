import { env as cloudflareEnv } from 'cloudflare:workers';

type EnvValue = string | undefined;

export function getEnv(name: string): string {
  const runtimeEnv = cloudflareEnv as unknown as Record<string, EnvValue>;
  const nodeEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, EnvValue> };
  }).process?.env;

  return (runtimeEnv[name] ?? nodeEnv?.[name] ?? '').trim();
}
