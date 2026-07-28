import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error(
    'Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL. Pull the Vercel Supabase environment variables first.',
  );
  process.exit(1);
}

const migrationPath = fileURLToPath(
  new URL(
    '../supabase/migrations/202607280001_auth_and_user_data.sql',
    import.meta.url,
  ),
);
const migration = await readFile(migrationPath, 'utf8');
const sql = postgres(databaseUrl, {
  idle_timeout: 5,
  max: 1,
  ssl: 'require',
});

try {
  await sql.begin(async (transaction) => {
    await transaction.unsafe(migration);
  });
  console.log('Supabase schema and RLS migration completed.');
} finally {
  await sql.end();
}
