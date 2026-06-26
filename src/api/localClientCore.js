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
  Reservation: 'baliora_reservations',
  Guest: 'baliora_guests',
  CommunicationLog: 'baliora_communication_logs',
  HousekeepingTask: 'baliora_housekeeping_tasks',
  MaintenanceTicket: 'baliora_maintenance_tickets',
  OpsStaff: 'baliora_ops_staff',
  Vendor: 'baliora_vendors',
  InventoryItem: 'baliora_inventory_items',
  VillaPricingRule: 'baliora_villa_pricing_rules',
  OwnerContract: 'baliora_owner_contracts',
  OwnerRevenueEntry: 'baliora_owner_revenue_entries',
};

const ENTITY_DEFAULTS = {
  VillaListing: () => LOCAL_VILLAS,
  BookingInquiry: () => [],
  Inquiry: () => [],
  VillaAssessment: () => [],
  VillaOwner: () => [
    {
      id: 'owner_1',
      name: 'James Hartley',
      email: 'james.hartley@example.com',
      whatsapp: '+61 491 570 156',
      nationality: 'Australian',
      status: 'active',
      created_date: '2024-12-15T10:00:00Z',
    },
    {
      id: 'owner_2',
      name: 'Sofia Andersson',
      email: 'sofia.andersson@example.com',
      whatsapp: '+46 8 123 4567',
      nationality: 'Swedish',
      status: 'active',
      created_date: '2024-12-15T10:00:00Z',
    },
    {
      id: 'owner_3',
      name: 'BALIORA Owner',
      email: 'owner@example.com',
      whatsapp: '+62 812 9999 1111',
      nationality: 'Indonesian',
      status: 'active',
      created_date: '2026-01-01T00:00:00Z',
    }
  ],
  BlogPost: () => [],
  FAQ: () => [],
  Testimonial: () => [],
  WebsiteSetting: () => [],
  ActivityLog: () => [],
  User: () => [],
  // Reservations reference villa_id as UUID in Supabase — no slug-based seed
  Reservation: () => [],
  Guest: () => [
    {
      id: 'guest_1',
      name: 'Liam Vance',
      email: 'liam.vance@example.com',
      whatsapp: '+628123456789',
      nationality: 'Australian',
      notes: 'Prefers quiet rooms, gluten-free diet.',
      total_bookings: 1,
      total_spent: 3150,
      status: 'active',
      created_date: '2026-06-15T12:00:00Z',
    },
    {
      id: 'guest_2',
      name: 'Sophia Loren',
      email: 'sophia.l@example.com',
      whatsapp: '+61491570156',
      nationality: 'Italian',
      notes: 'Requested baby cot in past bookings.',
      total_bookings: 1,
      total_spent: 1520,
      status: 'active',
      created_date: '2026-06-20T08:30:00Z',
    },
    {
      id: 'guest_3',
      name: 'David Beck',
      email: 'david@example.com',
      whatsapp: '+447911123456',
      nationality: 'British',
      notes: 'Loyal guest, travels with family.',
      total_bookings: 3,
      total_spent: 6750,
      status: 'active',
      created_date: '2026-05-01T14:22:00Z',
    }
  ],
  CommunicationLog: () => [
    {
      id: 'comm_1',
      recipient_name: 'Liam Vance',
      recipient_email: 'liam.vance@example.com',
      channel: 'Email',
      subject: 'Villa Booking Confirmed - BALIORA',
      message: 'Dear Liam Vance, your booking for Villa Tirta Canggu from 2026-07-10 to 2026-07-17 is confirmed. Thank you!',
      status: 'sent',
      created_date: '2026-06-15T12:05:00Z',
    },
    {
      id: 'comm_2',
      recipient_name: 'Sophia Loren',
      recipient_email: 'sophia.l@example.com',
      channel: 'WhatsApp',
      subject: 'Pre-arrival Information',
      message: 'Hi Sophia, we are preparing Villa Karang Seminyak for your stay starting Aug 1st. Do you need any airport transfer arrangements?',
      status: 'sent',
      created_date: '2026-06-21T09:00:00Z',
    }
  ],
  // HousekeepingTask references villa_id UUID in Supabase — no slug-based seed
  HousekeepingTask: () => [],
  // MaintenanceTicket references villa_id UUID in Supabase — no slug-based seed
  MaintenanceTicket: () => [],
  OpsStaff: () => [
    {
      id: 'staff_1',
      name: 'Wayan Sudiarta',
      role: 'Housekeeper',
      contact_number: '+6281234567890',
      shift: 'Morning',
      assigned_villas: 'Villa Tirta Canggu',
      status: 'active',
      created_date: '2026-01-10T08:00:00Z',
    },
    {
      id: 'staff_2',
      name: 'Kadek Wardana',
      role: 'Housekeeper',
      contact_number: '+6287654321098',
      shift: 'Afternoon',
      assigned_villas: 'Villa Karang Seminyak',
      status: 'active',
      created_date: '2026-02-15T09:00:00Z',
    },
    {
      id: 'staff_3',
      name: 'Made Artawan',
      role: 'Technician',
      contact_number: '+6282227888025',
      shift: 'Morning',
      assigned_villas: 'All Villas',
      status: 'active',
      created_date: '2026-03-01T08:30:00Z',
    }
  ],
  Vendor: () => [
    {
      id: 'vendor_1',
      company_name: 'Bali Cool AC Services',
      service_type: 'AC Maintenance',
      contact_person: 'Ketut',
      phone: '+628111222333',
      email: 'ac.cool@bali.com',
      rating: 5,
      status: 'active',
      created_date: '2026-01-05T10:00:00Z',
    },
    {
      id: 'vendor_2',
      company_name: 'Dewata Pool & Spa Care',
      service_type: 'Pool Maintenance',
      contact_person: 'Gede',
      phone: '+628555666777',
      email: 'dewata.pool@bali.com',
      rating: 4,
      status: 'active',
      created_date: '2026-01-08T11:00:00Z',
    }
  ],
  // InventoryItem references villa_id UUID in Supabase — no slug-based seed
  InventoryItem: () => [],
  // VillaPricingRule references villa_id UUID in Supabase — no slug-based seed
  VillaPricingRule: () => [],
  // OwnerContract references villa_id UUID in Supabase — no slug-based seed
  OwnerContract: () => [],
  // OwnerRevenueEntry references villa_id UUID in Supabase — no slug-based seed
  OwnerRevenueEntry: () => [],
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
  Reservation: 'ba_reservations',
  Guest: 'ba_guests',
  CommunicationLog: 'ba_communication_logs',
  HousekeepingTask: 'ba_housekeeping_tasks',
  MaintenanceTicket: 'ba_maintenance_tickets',
  OpsStaff: 'ba_ops_staff',
  Vendor: 'ba_vendors',
  InventoryItem: 'ba_inventory_items',
  VillaPricingRule: 'ba_villa_pricing_rules',
  OwnerContract: 'ba_owner_contracts',
  OwnerRevenueEntry: 'ba_owner_revenue_entries',
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
    if (entityName === 'VillaListing') {
      let changed = false;
      const repaired = existingValue.map((v) => {
        if (!v.slug || v.slug === 'undefined') {
          v.slug = String(v.name || 'villa')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          changed = true;
        }
        return v;
      });
      if (changed) {
        writeJson(key, repaired);
      }
      return repaired;
    }
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
    let rows = await listSupabaseRows(tableName, filters, options);
    
    // Auto-seed remote Supabase table if it is completely empty and we have local dummy/mock data
    const isFiltered = Object.keys(filters).length > 0;
    if (rows.length === 0 && !isFiltered) {
      const defaultFactory = ENTITY_DEFAULTS[entityName];
      const defaults = defaultFactory ? defaultFactory() : [];
      if (defaults.length > 0) {
        console.log(`[Supabase Auto-Seed] Seeding empty table '${tableName}' with default mock data...`);
        for (const record of defaults) {
          try {
            await insertSupabaseRow(tableName, remoteFieldMap(record));
          } catch (insertErr) {
            console.warn(`[Supabase Auto-Seed] Failed to seed record in '${tableName}':`, insertErr);
          }
        }
        // Refetch after seeding
        rows = await listSupabaseRows(tableName, filters, options);
      }
    }

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
    console.warn('Supabase sync insert failed:', error);
    return null;
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
    console.warn('Supabase sync update failed:', error);
    return null;
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

const normalizeVillaPayload = (payload) => {
  const normalized = { ...payload };
  if (payload.name && !payload.slug) {
    normalized.slug = String(payload.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  return normalized;
};

const normalizeBlogPayload = (payload) => {
  const normalized = { ...payload };
  if (payload.title && !payload.slug) {
    normalized.slug = String(payload.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  return normalized;
};

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

  async update(id, payload) {
    const records = ensureCollection('User');
    const existingIndex = records.findIndex(r => r.id === id);
    if (existingIndex === -1) {
      throw new Error('User not found');
    }
    const updatedRecord = {
      ...records[existingIndex],
      ...payload,
      updated_date: new Date().toISOString(),
    };
    records[existingIndex] = updatedRecord;
    saveCollection('User', records);
    await syncRemoteUpdate('User', id, updatedRecord);
    logActivity({
      entityType: 'User',
      action: 'User updated',
      details: `${updatedRecord.email || id} - role: ${updatedRecord.role}`,
    });
    return updatedRecord;
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
    Reservation: buildCrudEntity('Reservation', {
      activityLabel: 'Reservation',
      createDefaults: { status: 'confirmed', payment_status: 'unpaid' },
    }),
    Guest: buildCrudEntity('Guest', {
      activityLabel: 'Guest profile',
      createDefaults: { status: 'active', total_bookings: 0, total_spent: 0 },
    }),
    CommunicationLog: buildCrudEntity('CommunicationLog', {
      activityLabel: 'Communication log',
      createDefaults: { status: 'sent' },
    }),
    HousekeepingTask: buildCrudEntity('HousekeepingTask', {
      activityLabel: 'Housekeeping task',
      createDefaults: { status: 'pending' },
    }),
    MaintenanceTicket: buildCrudEntity('MaintenanceTicket', {
      activityLabel: 'Maintenance ticket',
      createDefaults: { status: 'pending', priority: 'medium' },
    }),
    OpsStaff: buildCrudEntity('OpsStaff', {
      activityLabel: 'Operations staff',
      createDefaults: { status: 'active', shift: 'Morning' },
    }),
    Vendor: buildCrudEntity('Vendor', {
      activityLabel: 'Vendor profile',
      createDefaults: { status: 'active', rating: 5 },
    }),
    InventoryItem: buildCrudEntity('InventoryItem', {
      activityLabel: 'Inventory item',
      createDefaults: { stock_level: 0, minimum_required: 5 },
    }),
    VillaPricingRule: buildCrudEntity('VillaPricingRule', {
      activityLabel: 'Villa pricing rule',
      createDefaults: { rate_type: 'multiplier', value: 1.0 },
    }),
    OwnerContract: buildCrudEntity('OwnerContract', {
      activityLabel: 'Owner contract',
      createDefaults: { status: 'active', management_fee_type: 'percentage' },
    }),
    OwnerRevenueEntry: buildCrudEntity('OwnerRevenueEntry', {
      activityLabel: 'Owner revenue entry',
      createDefaults: { payment_status: 'pending' },
    }),
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
