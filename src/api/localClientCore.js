/**
 * Purpose: Provides the local data client facade for the BALIORA app.
 * Used by: public pages, admin pages, and compatibility imports during migration.
 * Main dependencies: localAuth, sessionStorage helpers, local villa seed storage keys, and optional Supabase REST sync helpers.
 * Public functions: localClient.auth.logout, localClient.entities.<Entity>.list/filter/create/update/delete, localClient.integrations.Core.UploadFile.
 * Side effects: Reads and writes browser sessionStorage, generates activity logs, and converts uploaded images to data URLs.
 */
import { localAuth } from '../lib/localAuth.js';
import { getStorage, readJson, writeJson } from '../lib/localStorage.js';
import { LOCAL_VILLAS } from '../data/localVillas.js';
import {
  deleteSupabaseRows,
  insertSupabaseRow,
  isSupabaseConfigured,
  listSupabaseRows,
  updateSupabaseRows,
  upsertSupabaseRow,
} from '../lib/supabaseRest.js';

const STORAGE_KEYS = {
  VillaListing: 'baliora_villa_listings',
  BookingInquiry: 'baliora_booking_inquiries',
  Inquiry: 'baliora_owner_inquiries',
  VillaAssessment: 'baliora_villa_assessments',
  VillaOwner: 'baliora_admin_villa_owners',
  BlogPost: 'baliora_admin_blog_posts',
  FAQ: 'baliora_admin_faqs',
  Testimonial: 'baliora_admin_testimonials',
  WebsiteSetting: 'baliora_admin_website_settings',
  ActivityLog: 'baliora_admin_activity_logs',
  User: 'baliora_auth_users',
  Session: 'baliora_auth_session',
};

const ENTITY_DEFAULTS = {
  VillaListing: () => LOCAL_VILLAS,
  BookingInquiry: () => [],
  Inquiry: () => [],
  VillaAssessment: () => [],
  VillaOwner: () => [],
  BlogPost: () => [],
  FAQ: () => [],
  Testimonial: () => [],
  WebsiteSetting: () => [],
  ActivityLog: () => [],
  User: () => [],
};

const REMOTE_TABLES = {
  VillaListing: 'ba_villa_listings',
  BookingInquiry: 'ba_booking_inquiries',
  Inquiry: 'ba_owner_inquiries',
  VillaOwner: 'ba_villa_owners',
  BlogPost: 'ba_blog_posts',
  FAQ: 'ba_faqs',
  Testimonial: 'ba_testimonials',
  WebsiteSetting: 'ba_website_settings',
  ActivityLog: 'ba_activity_logs',
  User: 'ba_app_users',
};

const remoteFieldMap = (record) => {
  const mapped = {
    ...record,
    created_at: record.created_date,
    updated_at: record.updated_date,
  };
  delete mapped.created_date;
  delete mapped.updated_date;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (mapped.id && !uuidRegex.test(mapped.id)) {
    delete mapped.id;
  }
  return mapped;
};

const localFieldMap = (record) => ({
  ...record,
  created_date: record.created_date || record.created_at,
  updated_date: record.updated_date || record.updated_at,
});

const toComparableNumber = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const ensureCollection = (entityName) => {
  const key = STORAGE_KEYS[entityName];
  const existingValue = readJson(key, null);
  if (existingValue) {
    return existingValue;
  }

  const seedValue = ENTITY_DEFAULTS[entityName]?.() ?? [];
  writeJson(key, seedValue);
  return seedValue;
};

const sortRecords = (records, sortBy = '-created_date') => {
  if (!sortBy) {
    return [...records];
  }

  const descending = sortBy.startsWith('-');
  const fieldName = descending ? sortBy.slice(1) : sortBy;

  return [...records].sort((left, right) => {
    const leftValue = left?.[fieldName];
    const rightValue = right?.[fieldName];

    if (leftValue === rightValue) {
      return 0;
    }

    const leftNumber = toComparableNumber(leftValue);
    const rightNumber = toComparableNumber(rightValue);
    const comparableLeft = leftNumber !== null ? leftNumber : String(leftValue ?? '').toLowerCase();
    const comparableRight = rightNumber !== null ? rightNumber : String(rightValue ?? '').toLowerCase();

    if (descending) {
      return comparableLeft < comparableRight ? 1 : -1;
    }

    return comparableLeft > comparableRight ? 1 : -1;
  });
};

const filterRecords = (records, filters = {}) =>
  records.filter((record) =>
    Object.entries(filters).every(([fieldName, expectedValue]) => {
      if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
        return true;
      }

      return record?.[fieldName] === expectedValue;
    }),
  );

const saveCollection = (entityName, records) => {
  writeJson(STORAGE_KEYS[entityName], records);
  return records;
};

const syncRemoteList = async (entityName, filters = {}, options = {}) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const tableName = REMOTE_TABLES[entityName];
  if (!tableName) {
    return null;
  }

  try {
    const rows = await listSupabaseRows(tableName, filters, options);
    const mappedRows = rows.map(localFieldMap);
    saveCollection(entityName, mappedRows);
    return mappedRows;
  } catch (error) {
    console.warn(error);
    return null;
  }
};

const syncRemoteInsert = async (entityName, payload) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const tableName = REMOTE_TABLES[entityName];
  if (!tableName) {
    return null;
  }

  try {
    const row = await insertSupabaseRow(tableName, remoteFieldMap(payload));
    return row ? localFieldMap(row) : null;
  } catch (error) {
    console.error('Supabase sync insert failed:', error);
    throw error;
  }
};

const syncRemoteUpsert = async (entityName, payload) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const tableName = REMOTE_TABLES[entityName];
  if (!tableName) {
    return null;
  }

  try {
    const row = await upsertSupabaseRow(tableName, remoteFieldMap(payload));
    return row ? localFieldMap(row) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
};

const syncRemoteUpdate = async (entityName, id, payload) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const tableName = REMOTE_TABLES[entityName];
  if (!tableName) {
    return null;
  }

  try {
    const rows = await updateSupabaseRows(tableName, { id }, remoteFieldMap(payload));
    return rows[0] ? localFieldMap(rows[0]) : null;
  } catch (error) {
    console.error('Supabase sync update failed:', error);
    throw error;
  }
};

const syncRemoteDelete = async (entityName, id) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const tableName = REMOTE_TABLES[entityName];
  if (!tableName) {
    return null;
  }

  try {
    await deleteSupabaseRows(tableName, { id });
    return true;
  } catch (error) {
    console.warn(error);
    return null;
  }
};

const getCurrentUserName = () => {
  const session = readJson(STORAGE_KEYS.Session, null);
  const users = ensureCollection('User');
  const currentUser = users.find((user) => user.id === session?.userId);
  return currentUser?.full_name || currentUser?.email || 'Local Admin';
};

const logActivity = ({ entityType, action, details }) => {
  const logs = ensureCollection('ActivityLog');
  const nextLog = {
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entity_type: entityType,
    action,
    details,
    user_name: getCurrentUserName(),
    created_date: new Date().toISOString(),
  };

  saveCollection('ActivityLog', [nextLog, ...logs].slice(0, 200));
  return nextLog;
};

const buildCrudEntity = (entityName, options = {}) => {
  const {
    createDefaults = {},
    onBeforeCreate = (payload) => payload,
    onBeforeUpdate = (payload) => payload,
    activityLabel = entityName,
  } = options;

  return {
    async list(sortBy = '-created_date', limit = 50) {
      const remoteRows = await syncRemoteList(entityName, {}, { orderBy: sortBy, limit });
      const sourceRows = remoteRows ?? ensureCollection(entityName);
      return sortRecords(sourceRows, sortBy).slice(0, limit);
    },

    async filter(filters = {}, sortBy = '-created_date', limit = 50) {
      const remoteRows = await syncRemoteList(entityName, filters, { orderBy: sortBy, limit });
      const sourceRows = remoteRows ?? ensureCollection(entityName);
      return sortRecords(filterRecords(sourceRows, filters), sortBy).slice(0, limit);
    },

    async create(payload = {}) {
      const records = ensureCollection(entityName);
      const nextRecord = {
        id: `${entityName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        created_date: new Date().toISOString(),
        ...createDefaults,
        ...onBeforeCreate(payload),
      };

      saveCollection(entityName, [nextRecord, ...records]);
      const synced = await syncRemoteInsert(entityName, nextRecord);
      if (synced && synced.id) {
        const updatedRecords = [synced, ...records];
        saveCollection(entityName, updatedRecords);
        nextRecord.id = synced.id;
      }
      
      logActivity({
        entityType: entityName,
        action: `${activityLabel} created`,
        details: nextRecord.name || nextRecord.title || nextRecord.key || nextRecord.email || nextRecord.id,
      });
      return nextRecord;
    },

    async update(id, payload = {}) {
      const records = ensureCollection(entityName);
      let updatedRecord = null;

      const updatedRecords = records.map((record) => {
        if (record.id !== id) {
          return record;
        }

        updatedRecord = {
          ...record,
          ...onBeforeUpdate(payload),
          updated_date: new Date().toISOString(),
        };
        return updatedRecord;
      });

      if (!updatedRecord) {
        throw new Error(`${entityName} record not found`);
      }

      saveCollection(entityName, updatedRecords);
      await syncRemoteUpdate(entityName, id, updatedRecord);

      logActivity({
        entityType: entityName,
        action: `${activityLabel} updated`,
        details: updatedRecord.name || updatedRecord.title || updatedRecord.key || updatedRecord.email || updatedRecord.id,
      });
      return updatedRecord;
    },

    async delete(id) {
      const records = ensureCollection(entityName);
      const targetRecord = records.find((record) => record.id === id);
      const nextRecords = records.filter((record) => record.id !== id);
      saveCollection(entityName, nextRecords);
      await syncRemoteDelete(entityName, id);

      if (targetRecord) {
        logActivity({
          entityType: entityName,
          action: `${activityLabel} deleted`,
          details: targetRecord.name || targetRecord.title || targetRecord.key || targetRecord.email || targetRecord.id,
        });
      }

      return { success: true };
    },
  };
};

const normalizeVillaPayload = (payload) => ({
  ...payload,
  slug: payload.slug || String(payload.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
});

const normalizeBlogPayload = (payload) => ({
  ...payload,
  slug: payload.slug || String(payload.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read file locally'));
    reader.readAsDataURL(file);
  });

const buildUserEntity = () => ({
  async list(sortBy = '-created_date', limit = 100) {
    const remoteRows = await syncRemoteList('User', {}, { orderBy: sortBy, limit });
    const sourceRows = remoteRows ?? ensureCollection('User');
    const users = sortRecords(sourceRows, sortBy).slice(0, limit);
    return users.map((user) => ({
      ...user,
      role: user.role || 'user',
      full_name: user.full_name || user.email?.split('@')[0] || 'User',
    }));
  },

  async filter(filters = {}, sortBy = '-created_date', limit = 100) {
    const remoteRows = await syncRemoteList('User', filters, { orderBy: sortBy, limit });
    const sourceRows = remoteRows ?? ensureCollection('User');
    return sortRecords(filterRecords(sourceRows, filters), sortBy).slice(0, limit);
  },
});

export const localClient = {
  auth: {
    ...localAuth,
    logout(redirectUrl) {
      localAuth.logout(redirectUrl);
    },
  },
  entities: {
    VillaListing: buildCrudEntity('VillaListing', {
      activityLabel: 'Villa listing',
      createDefaults: { status: 'available' },
      onBeforeCreate: normalizeVillaPayload,
      onBeforeUpdate: normalizeVillaPayload,
    }),
    BookingInquiry: buildCrudEntity('BookingInquiry', {
      activityLabel: 'Booking inquiry',
      createDefaults: { status: 'new' },
    }),
    Inquiry: buildCrudEntity('Inquiry', {
      activityLabel: 'Owner inquiry',
      createDefaults: { status: 'new' },
    }),
    VillaAssessment: buildCrudEntity('VillaAssessment', {
      activityLabel: 'Villa assessment',
      createDefaults: { status: 'new' },
    }),
    VillaOwner: buildCrudEntity('VillaOwner', {
      activityLabel: 'Villa owner',
      createDefaults: { status: 'active' },
    }),
    BlogPost: buildCrudEntity('BlogPost', {
      activityLabel: 'Blog post',
      createDefaults: { status: 'draft' },
      onBeforeCreate: normalizeBlogPayload,
      onBeforeUpdate: normalizeBlogPayload,
    }),
    FAQ: buildCrudEntity('FAQ', {
      activityLabel: 'FAQ',
      createDefaults: { status: 'active' },
    }),
    Testimonial: buildCrudEntity('Testimonial', {
      activityLabel: 'Testimonial',
      createDefaults: { status: 'active', rating: 5, is_featured: false },
    }),
    WebsiteSetting: buildCrudEntity('WebsiteSetting', {
      activityLabel: 'Website setting',
    }),
    ActivityLog: {
      async list(sortBy = '-created_date', limit = 100) {
        const remoteRows = await syncRemoteList('ActivityLog', {}, { orderBy: sortBy, limit });
        const sourceRows = remoteRows ?? ensureCollection('ActivityLog');
        return sortRecords(sourceRows, sortBy).slice(0, limit);
      },
      async filter(filters = {}, sortBy = '-created_date', limit = 100) {
        const remoteRows = await syncRemoteList('ActivityLog', filters, { orderBy: sortBy, limit });
        const sourceRows = remoteRows ?? ensureCollection('ActivityLog');
        return sortRecords(filterRecords(sourceRows, filters), sortBy).slice(0, limit);
      },
    },
    User: buildUserEntity(),
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const fileUrl = await readFileAsDataUrl(file);
        const fallbackName = file?.name || 'uploaded-file';
        logActivity({
          entityType: 'Asset',
          action: 'Local file uploaded',
          details: fallbackName,
        });
        return { file_url: fileUrl };
      },
    },
  },
};
