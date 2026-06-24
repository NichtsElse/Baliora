/**
 * Purpose: Provides local-only authentication flows for login, signup, OTP, password reset, and seeded demo accounts.
 * Used by: AuthContext and all auth-related pages.
 * Main dependencies: browser sessionStorage for active-session gating.
 * Public functions: localAuth auth methods that mirror the old client usage.
 * Side effects: Persists users, pending OTP/reset records, and the active session in browser session storage.
 */
import { supabase } from './supabaseClient.js';

const createMemoryStorage = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

const memoryStorage = createMemoryStorage();

const getStorage = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }

  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
    return globalThis.sessionStorage;
  }

  return memoryStorage;
};

const readJson = (key, fallbackValue) => {
  const rawValue = getStorage().getItem(key);
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
};

const writeJson = (key, value) => {
  getStorage().setItem(key, JSON.stringify(value));
};

const STORAGE_KEYS = {
  users: 'baliora_auth_users',
  session: 'baliora_auth_session',
  sessionGate: 'baliora_auth_session_gate',
  pendingRegistrations: 'baliora_auth_pending_registrations',
  passwordResets: 'baliora_auth_password_resets',
};

const DEMO_USERS = [
  { id: 'demo-admin', email: 'admin@baliora.local', password: 'Admin@2026', role: 'admin', full_name: 'BALIORA Admin' },
  { id: 'demo-villa-manager', email: 'villa.manager@baliora.local', password: 'Villa@2026', role: 'villa_manager', full_name: 'Villa Manager', contact_number: '+62 812-3456-7890' },
  { id: 'demo-reservation-staff', email: 'reservation.staff@baliora.local', password: 'Booking@2026', role: 'reservation_staff', full_name: 'Reservation Staff', contact_number: '+62 812-5555-1234' },
  { id: 'demo-content-manager', email: 'content.manager@baliora.local', password: 'Content@2026', role: 'content_manager', full_name: 'Content Manager', contact_number: '+62 813-2222-3344' },
  { id: 'demo-user', email: 'user@baliora.local', password: 'User@2026', role: 'user', full_name: 'Read Only User', contact_number: '+62 811-0000-0000' },
];

const normalizeEmail = (email) => email.trim().toLowerCase();

const createLocalError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));
const generateToken = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const getUsers = () => readJson(STORAGE_KEYS.users, []);
const saveUsers = (users) => writeJson(STORAGE_KEYS.users, users);

const seedDemoUsersIfNeeded = () => {
  const users = getUsers();
  const demoUsers = DEMO_USERS.map((user) => ({
    ...user,
    provider: 'local',
    created_date: new Date().toISOString(),
    is_seeded_demo: true,
  }));

  const mergedUsers = [
    ...users.filter((user) => !DEMO_USERS.some((demoUser) => demoUser.email === user.email)),
    ...demoUsers,
  ];

  if (mergedUsers.length !== users.length) {
    saveUsers(mergedUsers);
  }

  return mergedUsers;
};

const getPendingRegistrations = () => readJson(STORAGE_KEYS.pendingRegistrations, []);
const savePendingRegistrations = (records) => writeJson(STORAGE_KEYS.pendingRegistrations, records);

const getPasswordResets = () => readJson(STORAGE_KEYS.passwordResets, []);
const savePasswordResets = (records) => writeJson(STORAGE_KEYS.passwordResets, records);

const getSession = () => readJson(STORAGE_KEYS.session, null);
const saveSession = (session) => writeJson(STORAGE_KEYS.session, session);
const getSessionGateStorage = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }

  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
    return globalThis.sessionStorage;
  }

  return null;
};

const saveSessionGate = (sessionId) => {
  const sessionStorage = getSessionGateStorage();
  if (!sessionStorage) {
    return;
  }

  sessionStorage.setItem(STORAGE_KEYS.sessionGate, JSON.stringify({ sessionId }));
};

const getSessionGate = () => {
  const rawValue = getStorage().getItem(STORAGE_KEYS.sessionGate);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const clearSessionGate = () => {
  getStorage().removeItem(STORAGE_KEYS.sessionGate);
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const setActiveSessionForUser = (user) => {
  const accessToken = generateToken('session');
  saveSession({
    accessToken,
    userId: user.id,
  });
  saveSessionGate(accessToken);
  return accessToken;
};

const getUserBySession = () => {
  const session = getSession();
  if (!session?.userId) {
    return null;
  }

  const sessionGate = getSessionGate();
  if (sessionGate?.sessionId !== session.accessToken) {
    return null;
  }

  return seedDemoUsersIfNeeded().find((user) => user.id === session.userId) ?? null;
};

const resolveRedirectPath = (fallbackPath = '/') => {
  if (typeof window === 'undefined') {
    return fallbackPath;
  }

  const fromUrl = new URLSearchParams(window.location.search).get('from_url');
  return fromUrl || fallbackPath;
};

export const localAuth = {
  async me() {
    // 1. Try to get Supabase session first
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const sbUser = session.user;
        let role = 'user';
        let fullName = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Google User';
        let contactNumber = sbUser.user_metadata?.phone || '';

        try {
          const { data: profile } = await supabase
            .from('ba_app_users')
            .select('*')
            .eq('email', sbUser.email)
            .maybeSingle();

          if (profile) {
            role = profile.role;
            fullName = profile.full_name || fullName;
            contactNumber = profile.contact_number || contactNumber;
          } else {
            // Try to auto-create profile if database policies allow
            const { data: newProfile } = await supabase
              .from('ba_app_users')
              .insert({
                email: sbUser.email,
                full_name: fullName,
                role: 'user',
                status: 'active'
              })
              .select()
              .maybeSingle();
            if (newProfile) {
              role = newProfile.role;
            }
          }
        } catch (dbErr) {
          console.warn('Could not read or write ba_app_users profile table:', dbErr);
        }

        return {
          id: sbUser.id,
          email: sbUser.email,
          role,
          full_name: fullName,
          contact_number: contactNumber,
          provider: 'google',
          created_date: sbUser.created_at
        };
      }
    } catch (sbErr) {
      console.warn('Failed to retrieve Supabase session:', sbErr);
    }

    // 2. Fallback to local session
    const user = getUserBySession();
    if (!user) {
      throw createLocalError('Authentication required', 401);
    }

    return sanitizeUser(user);
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error) {
      throw error;
    }

    const sbUser = data.user;
    let role = 'user';
    let fullName = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    let contactNumber = sbUser.user_metadata?.phone || '';

    try {
      const { data: profile } = await supabase
        .from('ba_app_users')
        .select('*')
        .eq('email', sbUser.email)
        .maybeSingle();

      if (profile) {
        role = profile.role;
        fullName = profile.full_name || fullName;
        contactNumber = profile.contact_number || contactNumber;
      }
    } catch (dbErr) {
      console.warn('Could not retrieve user profile role from database:', dbErr);
    }

    return {
      id: sbUser.id,
      email: sbUser.email,
      role,
      full_name: fullName,
      contact_number: contactNumber,
      provider: 'email',
      created_date: sbUser.created_at
    };
  },

  async loginWithProvider(provider, redirectPath = '/') {
    const normalizedProvider = provider.toLowerCase();
    
    if (normalizedProvider === 'google') {
      const fromUrl = new URLSearchParams(window.location.search).get('from_url');
      const targetRedirect = fromUrl || redirectPath || '/home';
      const redirectToUrl = `${window.location.origin}${targetRedirect.startsWith('/') ? targetRedirect : '/' + targetRedirect}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl,
        },
      });
      if (error) {
        throw error;
      }
      return data;
    }

    const demoEmail = `${normalizedProvider}@baliora.local`;
    const users = seedDemoUsersIfNeeded();
    let user = users.find((candidate) => candidate.email === demoEmail);

    if (!user) {
      user = {
        id: generateToken('user'),
        email: demoEmail,
        password: null,
        role: 'user',
        full_name: `${provider} Demo User`,
        provider: normalizedProvider,
        created_date: new Date().toISOString(),
      };
      saveUsers([user, ...users]);
    }

    setActiveSessionForUser(user);

    if (typeof window !== 'undefined') {
      window.location.href = resolveRedirectPath(redirectPath);
    }
  },

  async register({ email, password }) {
    const normalizedEmail = normalizeEmail(email);

    // Call Supabase signUp
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    // Try to pre-insert app_user if session is returned (auto-confirmed)
    if (data.session?.user) {
      try {
        await supabase.from('ba_app_users').insert({
          email: normalizedEmail,
          full_name: normalizedEmail.split('@')[0],
          role: 'user',
          status: 'active',
        });
      } catch (dbErr) {
        console.warn('Failed to insert ba_app_user during auto-confirmed signup:', dbErr);
      }
      return { session: data.session, autoConfirmed: true };
    }

    return { otpRequired: true };
  },

  async verifyOtp({ email, otpCode }) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otpCode,
      type: 'signup',
    });

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      try {
        await supabase.from('ba_app_users').insert({
          email: normalizedEmail,
          full_name: normalizedEmail.split('@')[0],
          role: 'user',
          status: 'active',
        });
      } catch (dbErr) {
        console.warn('Failed to insert ba_app_user during OTP verification:', dbErr);
      }
    }

    return { access_token: data.session?.access_token };
  },

  async resendOtp(email) {
    const normalizedEmail = normalizeEmail(email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    if (error) {
      throw error;
    }

    return { sent: true };
  },

  setToken(accessToken) {
    const users = seedDemoUsersIfNeeded();
    const session = getSession();
    const user = users.find((candidate) => candidate.id === session?.userId);

    if (user) {
      saveSession({ accessToken, userId: user.id });
    }
  },

  async logout(redirectUrl) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    }

    getStorage().removeItem(STORAGE_KEYS.session);
    clearSessionGate();

    if (redirectUrl && typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(fromUrl) {
    if (typeof window === 'undefined') {
      return;
    }

    const nextLocation = fromUrl ? `/login?from_url=${encodeURIComponent(fromUrl)}` : '/login';
    window.location.href = nextLocation;
  },

  async resetPasswordRequest(email) {
    const normalizedEmail = normalizeEmail(email);
    const user = seedDemoUsersIfNeeded().find((candidate) => candidate.email === normalizedEmail);

    if (!user) {
      return { resetToken: null, resetUrl: null };
    }

    const resetToken = generateToken('reset');
    const passwordResets = getPasswordResets().filter(
      (candidate) => candidate.email !== normalizedEmail,
    );

    passwordResets.unshift({
      email: normalizedEmail,
      resetToken,
      created_date: new Date().toISOString(),
    });

    savePasswordResets(passwordResets);

    return {
      resetToken,
      resetUrl: `/reset-password?token=${encodeURIComponent(resetToken)}`,
    };
  },

  async resetPassword({ resetToken, newPassword }) {
    const passwordResets = getPasswordResets();
    const resetRecord = passwordResets.find((candidate) => candidate.resetToken === resetToken);

    if (!resetRecord) {
      throw createLocalError('This reset link is invalid or expired', 400);
    }

    const users = seedDemoUsersIfNeeded();
    const updatedUsers = users.map((user) =>
      user.email === resetRecord.email ? { ...user, password: newPassword } : user,
    );
    saveUsers(updatedUsers);
    savePasswordResets(
      passwordResets.filter((candidate) => candidate.resetToken !== resetToken),
    );
  },

  async updateProfile({ full_name, email, contact_number }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const sbUser = session.user;
        const updates = {};
        
        if (typeof full_name === 'string') updates.full_name = full_name.trim();
        if (typeof contact_number === 'string') updates.contact_number = contact_number.trim();
        if (typeof email === 'string' && normalizeEmail(email) !== sbUser.email) {
            updates.email = normalizeEmail(email);
            const { error: emailError } = await supabase.auth.updateUser({ email: updates.email });
            if (emailError) throw emailError;
        }

        if (Object.keys(updates).length > 0) {
            const upsertData = {
              email: sbUser.email,
              full_name: updates.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
              contact_number: updates.contact_number || sbUser.user_metadata?.phone || '',
              role: 'user',
              status: 'active',
              ...updates
            };
            const { error: dbError } = await supabase
              .from('ba_app_users')
              .upsert(upsertData, { onConflict: 'email' });
            if (dbError) throw dbError;
        }

        return {
           id: sbUser.id,
           email: updates.email || sbUser.email,
           full_name: updates.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
           contact_number: updates.contact_number || sbUser.user_metadata?.phone || '',
        };
      }
    } catch (e) {
      console.warn('Supabase profile update failed:', e);
      throw createLocalError(e.message || 'Failed to update profile', 400);
    }

    const localSession = getSession();
    if (!localSession?.userId) {
      throw createLocalError('Authentication required', 401);
    }

    const users = seedDemoUsersIfNeeded();
    const currentUser = users.find((candidate) => candidate.id === localSession.userId);
    if (!currentUser) {
      throw createLocalError('User not found', 404);
    }

    const nextEmail = typeof email === 'string' ? normalizeEmail(email) : currentUser.email;
    if (nextEmail !== currentUser.email) {
      const emailTaken = users.some((candidate) => candidate.email === nextEmail && candidate.id !== currentUser.id);
      if (emailTaken) {
        throw createLocalError('Email is already in use', 409);
      }
    }

    const updatedUser = {
      ...currentUser,
      full_name: typeof full_name === 'string' ? full_name.trim() : currentUser.full_name,
      email: nextEmail,
      contact_number:
        typeof contact_number === 'string' ? contact_number.trim() : currentUser.contact_number,
    };

    saveUsers(users.map((candidate) => (candidate.id === currentUser.id ? updatedUser : candidate)));
    return sanitizeUser(updatedUser);
  },
};
