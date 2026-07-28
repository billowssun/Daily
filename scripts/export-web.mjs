import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const env = { ...process.env };
const cliArgs = process.argv.slice(2);

env.EXPO_PUBLIC_SUPABASE_URL ??=
  env.SUPABASE_URL ??
  env.NEXT_PUBLIC_SUPABASE_URL;

env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
  env.SUPABASE_PUBLISHABLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  env.SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/expo/bin/cli', import.meta.url)),
    'export',
    '--platform',
    'web',
    ...(cliArgs.includes('--clear') ? cliArgs : ['--clear', ...cliArgs]),
  ],
  {
    env,
    stdio: 'inherit',
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
