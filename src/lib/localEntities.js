/**
 * Purpose: Replaces the former hosted entity access with local session-backed collections.
 * Used by: villa queries plus booking and owner inquiry forms.
 * Main dependencies: sessionStorage helpers and local villa seed data.
 * Public functions: localEntities.VillaListing.list/filter, BookingInquiry.create, Inquiry.create, VillaAssessment.create.
 * Side effects: Seeds and updates browser sessionStorage collections and optionally posts records to Supabase.
 */
import { LOCAL_VILLAS } from '../data/localVillas.js';
import { readJson, writeJson } from './localStorage.js';
import { insertSupabaseRow, isSupabaseConfigured } from './supabaseRest.js';

const STORAGE_KEYS = {
  villaListings: 'baliora_villa_listings',
  bookingInquiries: 'baliora_booking_inquiries',
  ownerInquiries: 'baliora_owner_inquiries',
  villaAssessments: 'baliora_villa_assessments',
};

const ensureCollection = (key, seedValue) => {
  const existingValue = readJson(key, null);
  if (existingValue) {
    return existingValue;
  }

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
    const leftValue = left[fieldName];
    const rightValue = right[fieldName];

    if (leftValue === rightValue) {
      return 0;
    }

    if (descending) {
      return leftValue < rightValue ? 1 : -1;
    }

    return leftValue > rightValue ? 1 : -1;
  });
};

const applyFilters = (records, filters = {}) =>
  records.filter((record) =>
    Object.entries(filters).every(([fieldName, expectedValue]) => {
      if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
        return true;
      }

      return record[fieldName] === expectedValue;
    }),
  );

const getVillaListings = () => ensureCollection(STORAGE_KEYS.villaListings, LOCAL_VILLAS);

const normalizeRemotePayload = (record) => {
  const mapped = {
    ...record,
    created_at: record.created_date,
  };
  delete mapped.created_date;
  delete mapped.updated_date;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (mapped.id && !uuidRegex.test(mapped.id)) {
    delete mapped.id;
  }
  return mapped;
};

const appendRecord = async (key, payload, defaults = {}, remoteTableName) => {
  const records = ensureCollection(key, []);
  const nextRecord = {
    id: `${key}_${Date.now()}`,
    created_date: new Date().toISOString(),
    ...defaults,
    ...payload,
  };

  writeJson(key, [nextRecord, ...records]);

  if (remoteTableName && isSupabaseConfigured()) {
    try {
      const synced = await insertSupabaseRow(remoteTableName, normalizeRemotePayload(nextRecord));
      if (synced && synced.id) {
        const mappedSynced = {
          ...synced,
          created_date: synced.created_date || synced.created_at,
        };
        const updatedRecords = [mappedSynced, ...records];
        writeJson(key, updatedRecords);
        nextRecord.id = synced.id;
      }
    } catch (error) {
      console.warn(error);
    }
  }

  return nextRecord;
};

export const localEntities = {
  VillaListing: {
    async list(sortBy = '-created_date', limit = 50) {
      return sortRecords(getVillaListings(), sortBy).slice(0, limit);
    },
    async filter(filters = {}, sortBy = '-created_date', limit = 50) {
      return sortRecords(applyFilters(getVillaListings(), filters), sortBy).slice(0, limit);
    },
  },
  BookingInquiry: {
    async create(payload) {
      return appendRecord(STORAGE_KEYS.bookingInquiries, payload, { status: 'new' }, 'booking_inquiries');
    },
  },
  Inquiry: {
    async create(payload) {
      return appendRecord(STORAGE_KEYS.ownerInquiries, payload, { status: 'new' }, 'owner_inquiries');
    },
  },
  VillaAssessment: {
    async create(payload) {
      return appendRecord(STORAGE_KEYS.villaAssessments, payload, { status: 'new' }, 'villa_assessments');
    },
  },
};
