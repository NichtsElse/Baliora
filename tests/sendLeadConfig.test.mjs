/**
 * Purpose: Verifies email payload generation for owner notifications and auto-replies.
 * Used by: node --test verification during local development.
 * Main dependencies: node:test, node:assert, and sendLeadConfig helpers.
 * Public functions: none.
 * Side effects: none.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAutoReplyTemplateParams,
  buildOwnerTemplateParams,
  getLeadPayload,
} from '../api/utils/sendLeadConfig.js';

test('consultation payload exposes owner and auto-reply metadata', () => {
  const body = {
    type: 'consultation',
    name: 'Rizki',
    email: 'rizki@example.com',
    whatsapp: '+628123',
    villa_location: 'Canggu',
    message: 'Saya ingin diskusi pengelolaan villa.',
  };

  const payload = getLeadPayload(body);
  const ownerParams = buildOwnerTemplateParams(payload, body, 'uwildan544@gmail.com');
  const autoReplyParams = buildAutoReplyTemplateParams(payload, body);

  assert.equal(payload.subject, 'Permintaan Konsultasi Baru - Rizki');
  assert.equal(ownerParams.to_email, 'uwildan544@gmail.com');
  assert.equal(ownerParams.reply_to, 'rizki@example.com');
  assert.match(ownerParams.html_content, /Permintaan Konsultasi Baru/);
  assert.equal(autoReplyParams.to_email, 'rizki@example.com');
  assert.match(autoReplyParams.html_content, /Terima kasih sudah menghubungi BALIORA/);
});

test('booking payload keeps the guest email as the auto-reply target', () => {
  const body = {
    type: 'booking',
    villa_name: 'Villa Mentari',
    guest_name: 'Ayu',
    email: 'ayu@example.com',
    check_in: '2026-07-01',
    check_out: '2026-07-03',
    guests: '4',
    special_requests: 'Airport pickup',
  };

  const payload = getLeadPayload(body);
  const ownerParams = buildOwnerTemplateParams(payload, body, 'uwildan544@gmail.com');
  const autoReplyParams = buildAutoReplyTemplateParams(payload, body);

  assert.equal(payload.subject, 'Booking Inquiry Baru - Villa Mentari');
  assert.equal(ownerParams.reply_to, 'ayu@example.com');
  assert.match(ownerParams.html_content, /Villa Mentari/);
  assert.equal(autoReplyParams.to_email, 'ayu@example.com');
  assert.match(autoReplyParams.html_content, /Terima kasih atas inquiry Anda/);
});
