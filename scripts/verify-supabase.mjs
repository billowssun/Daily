import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !publishableKey || !secretKey) {
  throw new Error('Supabase verification credentials are incomplete.');
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};
const system = createClient(url, secretKey, clientOptions);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const password = `Rixu-${crypto.randomUUID()}-9a!`;
const emails = [
  `rixu-rls-a-${suffix}@example.invalid`,
  `rixu-rls-b-${suffix}@example.invalid`,
];
const userIds = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(`Supabase verification failed: ${message}`);
};

const createTestUser = async (email, displayName) => {
  const { data, error } = await system.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error || !data.user) throw error ?? new Error(`Unable to create ${displayName}`);
  userIds.push(data.user.id);
  return data.user.id;
};

const signIn = async (email) => {
  const client = createClient(url, publishableKey, clientOptions);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
};

const { data: userAudit, error: userAuditError } = await system.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (userAuditError) throw userAuditError;
const productionUsers = userAudit.users.filter((user) => !user.email?.startsWith('rixu-rls-'));
const confirmedUsers = productionUsers.filter((user) => Boolean(user.email_confirmed_at));
console.log(
  `Supabase user audit: ${productionUsers.length} registered, ${confirmedUsers.length} confirmed, ${productionUsers.length - confirmedUsers.length} awaiting email confirmation.`,
);

try {
  const userA = await createTestUser(emails[0], '权限测试 A');
  const userB = await createTestUser(emails[1], '权限测试 B');

  const { error: promoteError } = await system
    .from('profiles')
    .update({ role: 'admin', updated_at: new Date().toISOString() })
    .eq('id', userA);
  if (promoteError) throw promoteError;

  const clientA = await signIn(emails[0]);
  const clientB = await signIn(emails[1]);

  const { error: insertAError } = await clientA.from('user_states').upsert({
    user_id: userA,
    kind: 'planner',
    payload: { owner: 'A', verified: true },
  });
  if (insertAError) throw insertAError;

  const { error: insertBError } = await clientB.from('user_states').upsert({
    user_id: userB,
    kind: 'finance',
    payload: { owner: 'B', verified: true },
  });
  if (insertBError) throw insertBError;

  const { data: bReadsA, error: bReadsAError } = await clientB
    .from('user_states')
    .select('user_id')
    .eq('user_id', userA);
  if (bReadsAError) throw bReadsAError;
  assert(bReadsA.length === 0, 'a normal user could read another user’s state');

  const { error: bWritesAError } = await clientB.from('user_states').insert({
    user_id: userA,
    kind: 'finance',
    payload: { intrusion: true },
  });
  assert(Boolean(bWritesAError), 'a normal user could write another user’s state');

  const { data: adminReadsB, error: adminReadsBError } = await clientA
    .from('user_states')
    .select('user_id')
    .eq('user_id', userB);
  if (adminReadsBError) throw adminReadsBError;
  assert(adminReadsB.length === 0, 'an administrator could read private user state');

  const { data: userProfiles, error: userProfilesError } = await clientB
    .from('profiles')
    .select('id');
  if (userProfilesError) throw userProfilesError;
  assert(
    userProfiles.length === 1 && userProfiles[0].id === userB,
    'a normal user could enumerate other profiles',
  );

  const { data: adminProfiles, error: adminProfilesError } = await clientA
    .from('profiles')
    .select('id')
    .in('id', [userA, userB]);
  if (adminProfilesError) throw adminProfilesError;
  assert(adminProfiles.length === 2, 'administrator profile listing is unavailable');

  const { error: disableError } = await clientA
    .from('profiles')
    .update({ disabled: true, updated_at: new Date().toISOString() })
    .eq('id', userB);
  if (disableError) throw disableError;

  const { data: disabledRows, error: disabledRowsError } = await clientB
    .from('user_states')
    .select('user_id')
    .eq('user_id', userB);
  if (disabledRowsError) throw disabledRowsError;
  assert(disabledRows.length === 0, 'a disabled user retained data access');

  const { error: restoreError } = await clientA
    .from('profiles')
    .update({ disabled: false, updated_at: new Date().toISOString() })
    .eq('id', userB);
  if (restoreError) throw restoreError;

  const { data: restoredRows, error: restoredRowsError } = await clientB
    .from('user_states')
    .select('user_id')
    .eq('user_id', userB);
  if (restoredRowsError) throw restoredRowsError;
  assert(restoredRows.length === 1, 'restored user access did not recover');

  console.log('Supabase RLS and administrator permission verification completed.');
} finally {
  for (const userId of userIds.reverse()) {
    const { error } = await system.auth.admin.deleteUser(userId);
    if (error) console.error(`Temporary Supabase user cleanup failed: ${error.message}`);
  }
}

