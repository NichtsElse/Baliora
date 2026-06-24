/**
 * Purpose: Verifies the local client facade used by admin screens.
 * Used by: node --test verification during local development.
 * Main dependencies: node:test, node:assert, and localClient.
 * Public functions: none.
 * Side effects: Writes to a mocked in-memory sessionStorage for each test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { localClient } from '../src/api/localClient.js';

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

test('local client facade supports villa CRUD locally', async () => {
  const created = await localClient.entities.VillaListing.create({
    name: 'Villa Admin Test',
    location: 'Canggu',
    price_per_night: 500,
  });

  assert.equal(created.slug, 'villa-admin-test');

  const filtered = await localClient.entities.VillaListing.filter({ id: created.id });
  assert.equal(filtered.length, 1);

  const updated = await localClient.entities.VillaListing.update(created.id, { status: 'maintenance' });
  assert.equal(updated.status, 'maintenance');

  await localClient.entities.VillaListing.delete(created.id);
  const afterDelete = await localClient.entities.VillaListing.filter({ id: created.id });
  assert.equal(afterDelete.length, 0);
});

test('local client facade writes activity logs for admin mutations', async () => {
  const owner = await localClient.entities.VillaOwner.create({
    name: 'Owner Test',
    email: 'owner@test.com',
  });

  await localClient.entities.VillaOwner.update(owner.id, { status: 'inactive' });
  const logs = await localClient.entities.ActivityLog.list('-created_date', 10);

  assert.equal(logs.length >= 2, true);
  assert.equal(logs[0].entity_type, 'VillaOwner');
});
