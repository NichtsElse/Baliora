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

test('localClient supports Reservation CRUD', async () => {
  const res = await localClient.entities.Reservation.create({
    villa_id: 'villa-tirta-canggu',
    villa_name: 'Villa Tirta Canggu',
    guest_name: 'Test Guest',
    email: 'test@example.com',
    whatsapp: '+628123456789',
    check_in: '2026-07-10',
    check_out: '2026-07-17',
    guests: 4,
    total_price: 3000,
    status: 'confirmed',
    payment_status: 'unpaid',
  });

  assert.equal(res.guest_name, 'Test Guest');
  assert.equal(res.status, 'confirmed');

  // Verify list & filter
  const list = await localClient.entities.Reservation.list();
  assert.equal(list.length >= 1, true);

  const filtered = await localClient.entities.Reservation.filter({ email: 'test@example.com' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, res.id);

  // Update
  const updated = await localClient.entities.Reservation.update(res.id, { status: 'checked_in' });
  assert.equal(updated.status, 'checked_in');

  // Delete
  await localClient.entities.Reservation.delete(res.id);
  const afterDelete = await localClient.entities.Reservation.filter({ id: res.id });
  assert.equal(afterDelete.length, 0);
});

test('localClient supports Guest profile CRUD', async () => {
  const guest = await localClient.entities.Guest.create({
    name: 'Unique Guest',
    email: 'unique@example.com',
    whatsapp: '+123456789',
    nationality: 'American',
    notes: 'Likes wine.',
    status: 'active',
  });

  assert.equal(guest.name, 'Unique Guest');
  assert.equal(guest.status, 'active');

  const filtered = await localClient.entities.Guest.filter({ email: 'unique@example.com' });
  assert.equal(filtered.length, 1);

  const updated = await localClient.entities.Guest.update(guest.id, { status: 'inactive' });
  assert.equal(updated.status, 'inactive');

  await localClient.entities.Guest.delete(guest.id);
  const afterDelete = await localClient.entities.Guest.filter({ id: guest.id });
  assert.equal(afterDelete.length, 0);
});

test('localClient supports CommunicationLog CRUD', async () => {
  const comm = await localClient.entities.CommunicationLog.create({
    recipient_name: 'Recipient Name',
    recipient_email: 'recipient@example.com',
    channel: 'Email',
    subject: 'Welcome',
    message: 'Hello!',
  });

  assert.equal(comm.recipient_name, 'Recipient Name');
  assert.equal(comm.channel, 'Email');

  const list = await localClient.entities.CommunicationLog.list();
  assert.equal(list.length >= 1, true);
  assert.equal(list[0].subject, 'Welcome');
});

test('localClient supports HousekeepingTask CRUD', async () => {
  const task = await localClient.entities.HousekeepingTask.create({
    villa_id: 'villa-tirta-canggu',
    villa_name: 'Villa Tirta Canggu',
    room_number: 'All Rooms',
    task_type: 'Deep Clean',
    assigned_to: 'Wayan',
    scheduled_date: '2026-07-10',
    remarks: 'Clean well.',
  });

  assert.equal(task.assigned_to, 'Wayan');
  assert.equal(task.status, 'pending');

  const list = await localClient.entities.HousekeepingTask.list();
  assert.equal(list.length >= 1, true);

  const updated = await localClient.entities.HousekeepingTask.update(task.id, { status: 'clean' });
  assert.equal(updated.status, 'clean');

  await localClient.entities.HousekeepingTask.delete(task.id);
  const afterDelete = await localClient.entities.HousekeepingTask.filter({ id: task.id });
  assert.equal(afterDelete.length, 0);
});

test('localClient supports MaintenanceTicket CRUD', async () => {
  const ticket = await localClient.entities.MaintenanceTicket.create({
    villa_id: 'villa-karang-seminyak',
    villa_name: 'Villa Karang Seminyak',
    title: 'AC Leaking',
    description: 'Dripping water.',
    priority: 'high',
    assigned_to: 'Made',
    estimated_cost: 100,
  });

  assert.equal(ticket.title, 'AC Leaking');
  assert.equal(ticket.priority, 'high');

  const list = await localClient.entities.MaintenanceTicket.list();
  assert.equal(list.length >= 1, true);

  const updated = await localClient.entities.MaintenanceTicket.update(ticket.id, { status: 'in_progress' });
  assert.equal(updated.status, 'in_progress');

  await localClient.entities.MaintenanceTicket.delete(ticket.id);
  const afterDelete = await localClient.entities.MaintenanceTicket.filter({ id: ticket.id });
  assert.equal(afterDelete.length, 0);
});

test('localClient supports OpsStaff CRUD', async () => {
  const staff = await localClient.entities.OpsStaff.create({
    name: 'Kadek Test',
    role: 'Housekeeper',
    shift: 'Night',
    assigned_villas: 'Villa Canggu',
  });
  
  assert.equal(staff.name, 'Kadek Test');
  assert.equal(staff.shift, 'Night');

  const list = await localClient.entities.OpsStaff.list();
  assert.equal(list.length >= 1, true);

  const updated = await localClient.entities.OpsStaff.update(staff.id, { shift: 'Morning' });
  assert.equal(updated.shift, 'Morning');

  await localClient.entities.OpsStaff.delete(staff.id);
});

test('localClient supports Vendor CRUD', async () => {
  const vendor = await localClient.entities.Vendor.create({
    company_name: 'Test Services',
    service_type: 'Plumbing',
    contact_person: 'Gede',
    rating: 4,
  });

  assert.equal(vendor.company_name, 'Test Services');
  assert.equal(vendor.rating, 4);

  const list = await localClient.entities.Vendor.list();
  assert.equal(list.length >= 1, true);

  const updated = await localClient.entities.Vendor.update(vendor.id, { rating: 5 });
  assert.equal(updated.rating, 5);

  await localClient.entities.Vendor.delete(vendor.id);
});

test('localClient supports InventoryItem CRUD', async () => {
  const item = await localClient.entities.InventoryItem.create({
    item_name: 'Shampoo Bulks',
    villa_id: 'villa-karang-seminyak',
    villa_name: 'Villa Karang Seminyak',
    category: 'Toiletries',
    stock_level: 20,
    minimum_required: 10,
  });

  assert.equal(item.item_name, 'Shampoo Bulks');
  assert.equal(item.stock_level, 20);

  const list = await localClient.entities.InventoryItem.list();
  assert.equal(list.length >= 1, true);

  const updated = await localClient.entities.InventoryItem.update(item.id, { stock_level: 25 });
  assert.equal(updated.stock_level, 25);

  await localClient.entities.InventoryItem.delete(item.id);
});


