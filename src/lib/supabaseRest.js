/**
 * Purpose: Provides lightweight Supabase REST helpers for public forms and local-first admin sync.
 * Used by: localEntities persistence methods, local compatibility layer, and future content sync flows.
 * Main dependencies: browser fetch and Vite environment variables.
 * Public functions: isSupabaseConfigured, insertSupabaseRow, listSupabaseRows, upsertSupabaseRow, updateSupabaseRows, deleteSupabaseRows.
 * Side effects: Performs HTTP requests to Supabase tables when environment variables are configured.
 */
import { supabase } from './supabaseClient.js';

const viteEnv = import.meta.env ?? {};
const SUPABASE_URL = viteEnv.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const SUPABASE_ANON_KEY = viteEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const buildHeaders = async (prefer = 'return=representation') => {
  let token = SUPABASE_ANON_KEY;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (err) {
    console.warn('Failed to get session token:', err);
  }

  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    Prefer: prefer,
  };
};

const encodeValue = (value) => {
  if (typeof value === 'number') {
    return `eq.${value}`;
  }

  if (typeof value === 'boolean') {
    return `eq.${value}`;
  }

  return `eq.${encodeURIComponent(String(value))}`;
};

const buildQueryString = (filters = {}, options = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([fieldName, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    let dbFieldName = fieldName;
    if (fieldName === 'created_date') dbFieldName = 'created_at';
    if (fieldName === 'updated_date') dbFieldName = 'updated_at';

    params.set(dbFieldName, encodeValue(value));
  });

  if (options.orderBy) {
    const descending = options.orderBy.startsWith('-');
    const fieldName = descending ? options.orderBy.slice(1) : options.orderBy;

    let dbFieldName = fieldName;
    if (fieldName === 'created_date') dbFieldName = 'created_at';
    if (fieldName === 'updated_date') dbFieldName = 'updated_at';

    params.set('order', `${dbFieldName}.${descending ? 'desc' : 'asc'}`);
  }

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const insertSupabaseRow = async (tableName, payload) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const publicTables = ['booking_inquiries', 'owner_inquiries', 'villa_assessments'];
  const preferHeader = publicTables.includes(tableName) ? 'return=minimal' : 'return=representation';

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: await buildHeaders(preferHeader),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase insert failed for ${tableName}: ${response.status} ${errorBody}`);
  }

  if (preferHeader === 'return=minimal') {
    return payload; // Return the payload so the local entity sync logic doesn't crash
  }

  const rows = await response.json();
  return rows[0] || null;
};

export const listSupabaseRows = async (tableName, filters = {}, options = {}) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}${buildQueryString(filters, options)}`,
    {
      method: 'GET',
      headers: await buildHeaders(),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase list failed for ${tableName}: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const upsertSupabaseRow = async (tableName, payload) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      ...(await buildHeaders('resolution=merge-duplicates,return=representation')),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase upsert failed for ${tableName}: ${response.status} ${errorBody}`);
  }

  const rows = await response.json();
  return rows[0] || null;
};

export const updateSupabaseRows = async (tableName, filters, payload) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}${buildQueryString(filters)}`,
    {
      method: 'PATCH',
      headers: await buildHeaders('return=representation'),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase update failed for ${tableName}: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const deleteSupabaseRows = async (tableName, filters) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}${buildQueryString(filters)}`,
    {
      method: 'DELETE',
      headers: await buildHeaders('return=representation'),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase delete failed for ${tableName}: ${response.status} ${errorBody}`);
  }

  return response.json();
};
