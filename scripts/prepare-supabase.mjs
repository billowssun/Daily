const hasDatabase =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (!hasDatabase) {
  console.log('Supabase migration skipped: database variables are not configured.');
} else {
  await import('./migrate-supabase.mjs');
}

const hasVerificationCredentials =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_PUBLISHABLE_KEY &&
  process.env.SUPABASE_SECRET_KEY;

if (!hasVerificationCredentials) {
  console.log('Supabase permission verification skipped: server credentials are not configured.');
} else {
  await import('./verify-supabase.mjs');
}

