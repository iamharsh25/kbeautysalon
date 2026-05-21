import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import ws from 'ws';

if (existsSync('.env')) {
  const envFile = readFileSync('.env', 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
    }
  }
}

const required = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  },
);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME ?? 'K Beauty Admin';
const phone = process.env.ADMIN_PHONE ?? null;

const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
  },
});

let userId = createdUser.user?.id;

if (createError) {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  const existingUser = users.users.find((user) => user.email === email);
  if (!existingUser) {
    throw createError;
  }

  userId = existingUser.id;
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (updateError) {
    throw updateError;
  }
}

const { error: profileError } = await supabase.from('profiles').upsert({
  id: userId,
  full_name: fullName,
  email,
  phone,
  role: 'admin',
  updated_at: new Date().toISOString(),
});

if (profileError) {
  throw profileError;
}

console.log(`Admin account ready: ${email}`);
