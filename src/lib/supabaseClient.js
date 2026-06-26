import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || '';

// DEBUG TEMP — hapus setelah fix ditemukan
console.log('[Supabase Debug] URL set:', !!supabaseUrl, '| KEY set:', !!supabaseAnonKey);
console.log('[Supabase Debug] URL value:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'EMPTY');

// Create a safe dummy proxy if Supabase is not configured to prevent startup crashes
const createDummyProxy = () => {
  const dummy = () => {};
  return new Proxy(dummy, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'auth') {
        return {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithOAuth: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          signInWithPassword: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          signUp: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          signOut: () => Promise.resolve({ error: null }),
          resetPasswordForEmail: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          updateUser: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          verifyOtp: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
          resend: () => Promise.resolve({ data: {}, error: new Error('Supabase is not configured') }),
        };
      }
      return createDummyProxy();
    },
    apply() {
      return Promise.resolve({ data: [], error: null, count: 0 });
    }
  });
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyProxy();
