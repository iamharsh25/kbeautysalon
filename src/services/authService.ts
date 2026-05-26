import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AuthProfile = {
  fullName: string;
  role: string;
};

export type MfaFlow = {
  mode: 'setup' | 'verify';
  factorId: string;
  challengeId?: string;
  qrCode?: string;
  secret?: string;
  uri?: string;
};

export type SignInResult = {
  profile: AuthProfile;
  mfa?: MfaFlow;
};

const SESSION_STARTED_AT_KEY = 'kbeauty-session-started-at';
const LOCAL_MFA_ENABLED_KEY = 'kbeauty-local-mfa-enabled';
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function startLocalSessionWindow() {
  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
}

export function clearLocalSessionWindow() {
  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

export function isLocalSessionWindowValid() {
  const startedAt = Number(window.localStorage.getItem(SESSION_STARTED_AT_KEY));
  if (!startedAt) return false;
  return Date.now() - startedAt < SESSION_DURATION_MS;
}

function isPrivilegedRole(role: string) {
  return role === 'admin' || role === 'staff';
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  if (!isSupabaseConfigured || !supabase) {
    const profile = email.toLowerCase() === 'admin@kbeautysalon.com' && password === 'preview123'
      ? { fullName: 'K Beauty Admin', role: 'admin' }
      : { fullName: email || 'K Beauty Client', role: 'client' };

    if (isPrivilegedRole(profile.role)) {
      const hasLocalMfa = window.localStorage.getItem(LOCAL_MFA_ENABLED_KEY) === 'true';
      return {
        profile,
        mfa: hasLocalMfa
          ? { mode: 'verify', factorId: 'local-preview' }
          : { mode: 'setup', factorId: 'local-preview', secret: 'KBEAUTY-DEMO-123456' },
      };
    }

    startLocalSessionWindow();
    return { profile };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    throw new Error('Login failed. Please check your email and password.');
  }

  const profile = await getProfileForUser(data.user.id, data.user.email);

  if (isPrivilegedRole(profile.role)) {
    const mfa = await getMfaFlow();
    if (mfa) return { profile, mfa };
  }

  startLocalSessionWindow();
  return { profile };
}

export async function verifyMfaCode(flow: MfaFlow, code: string) {
  const trimmedCode = code.trim();

  if (!isSupabaseConfigured || !supabase || flow.factorId === 'local-preview') {
    if (trimmedCode !== '123456') {
      throw new Error('Invalid authenticator code. For local preview use 123456.');
    }
    window.localStorage.setItem(LOCAL_MFA_ENABLED_KEY, 'true');
    startLocalSessionWindow();
    return;
  }

  const authMfa = supabase.auth.mfa as unknown as {
    verify: (params: { factorId: string; challengeId: string; code: string }) => Promise<{ error: Error | null }>;
    challenge: (params: { factorId: string }) => Promise<{ data: { id: string } | null; error: Error | null }>;
    challengeAndVerify?: (params: { factorId: string; code: string }) => Promise<{ error: Error | null }>;
  };

  if (flow.challengeId) {
    const { error } = await authMfa.verify({ factorId: flow.factorId, challengeId: flow.challengeId, code: trimmedCode });
    if (error) throw new Error('Invalid authenticator code. Please try again.');
    startLocalSessionWindow();
    return;
  }

  if (authMfa.challengeAndVerify) {
    const { error } = await authMfa.challengeAndVerify({ factorId: flow.factorId, code: trimmedCode });
    if (error) throw new Error('Invalid authenticator code. Please try again.');
    startLocalSessionWindow();
    return;
  }

  const { data, error: challengeError } = await authMfa.challenge({ factorId: flow.factorId });
  if (challengeError || !data?.id) throw new Error('Could not start two-factor verification. Please try again.');

  const { error } = await authMfa.verify({ factorId: flow.factorId, challengeId: data.id, code: trimmedCode });
  if (error) throw new Error('Invalid authenticator code. Please try again.');
  startLocalSessionWindow();
}

export async function getActiveAuthProfile() {
  if (!isSupabaseConfigured || !supabase || !isLocalSessionWindowValid()) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return getProfileForUser(data.user.id, data.user.email);
}

export async function signOut() {
  clearLocalSessionWindow();
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

async function getProfileForUser(userId: string, email?: string | null): Promise<AuthProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role,full_name')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Account found, but no profile role is connected yet.');
  }

  return {
    fullName: profile.full_name || email || 'K Beauty User',
    role: profile.role,
  };
}

async function getMfaFlow(): Promise<MfaFlow | undefined> {
  if (!supabase) return undefined;

  const authMfa = supabase.auth.mfa as unknown as {
    listFactors: () => Promise<{
      data: { totp?: Array<{ id: string; status: string }> } | null;
      error: Error | null;
    }>;
    enroll: (params: { factorType: 'totp' }) => Promise<{
      data: { id: string; totp?: { qr_code?: string; secret?: string; uri?: string } } | null;
      error: Error | null;
    }>;
    challenge: (params: { factorId: string }) => Promise<{ data: { id: string } | null; error: Error | null }>;
  };

  const factorsResult = await authMfa.listFactors();
  if (factorsResult.error) throw new Error('Could not check two-factor settings.');

  const verifiedTotp = factorsResult.data?.totp?.find((factor) => factor.status === 'verified');
  if (verifiedTotp) {
    const challengeResult = await authMfa.challenge({ factorId: verifiedTotp.id });
    if (challengeResult.error || !challengeResult.data?.id) throw new Error('Could not start two-factor verification.');
    return {
      mode: 'verify',
      factorId: verifiedTotp.id,
      challengeId: challengeResult.data.id,
    };
  }

  const enrollResult = await authMfa.enroll({ factorType: 'totp' });
  if (enrollResult.error || !enrollResult.data?.id) throw new Error('Could not start two-factor setup.');

  return {
    mode: 'setup',
    factorId: enrollResult.data.id,
    qrCode: enrollResult.data.totp?.qr_code,
    secret: enrollResult.data.totp?.secret,
    uri: enrollResult.data.totp?.uri,
  };
}
