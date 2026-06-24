/**
 * Purpose: Verifies local entity queries and writes that replace the former hosted collections.
 * Used by: node --test verification during local development.
 * Main dependencies: node:test, node:assert, and localEntities.
 * Public functions: none.
 * Side effects: Writes to a mocked in-memory sessionStorage for each test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { localEntities } from '../src/lib/localEntities.js';

const createStorageMock = () => {
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

test.beforeEach(() => {
  globalThis.sessionStorage = createStorageMock();
});

test('villa listing queries are served from local seeded data', async () => {
  const villas = await localEntities.VillaListing.filter({ status: 'available' }, '-created_date', 3);

  assert.equal(villas.length, 3);
  assert.equal(villas[0].slug, 'villa-tirta-canggu');
  assert.equal(villas[1].created_date > villas[2].created_date, true);
});

test('booking, owner inquiries, and villa assessments are persisted locally', async () => {
  const bookingInquiry = await localEntities.BookingInquiry.create({
    villa_name: 'Villa Tirta Canggu',
    guest_name: 'Rizki',
    email: 'guest@example.com',
  });
  const ownerInquiry = await localEntities.Inquiry.create({
    name: 'Owner',
    email: 'owner@example.com',
  });
  const villaAssessment = await localEntities.VillaAssessment.create({
    owner_name: 'Owner',
    contact: 'owner@example.com',
    location: 'Canggu',
  });

  assert.equal(bookingInquiry.status, 'new');
  assert.equal(ownerInquiry.status, 'new');
  assert.equal(villaAssessment.status, 'new');
  assert.match(bookingInquiry.id, /^baliora_booking_inquiries_/);
  assert.match(ownerInquiry.id, /^baliora_owner_inquiries_/);
  assert.match(villaAssessment.id, /^baliora_villa_assessments_/);
});
