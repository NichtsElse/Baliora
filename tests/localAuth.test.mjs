/**
 * Purpose: Covers the local auth flow that replaces the previous hosted auth dependency.
 * Used by: node --test verification during local development.
 * Main dependencies: node:test, node:assert, and localAuth.
 * Public functions: none.
 * Side effects: Writes to a mocked in-memory sessionStorage for each test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { localAuth } from '../src/lib/localAuth.js';

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

test('register, verify, and login keep auth fully local', async () => {
  const registerResult = await localAuth.register({
    email: 'owner@example.com',
    password: 'secret-123',
  });

  assert.match(registerResult.otpCode, /^\d{6}$/);

  const verifyResult = await localAuth.verifyOtp({
    email: 'owner@example.com',
    otpCode: registerResult.otpCode,
  });

  assert.match(verifyResult.access_token, /^session_/);

  const user = await localAuth.me();
  assert.equal(user.email, 'owner@example.com');

  localAuth.logout();
  await assert.rejects(() => localAuth.me(), /Authentication required/);

  await localAuth.loginViaEmailPassword('owner@example.com', 'secret-123');
  const reloggedUser = await localAuth.me();
  assert.equal(reloggedUser.email, 'owner@example.com');
});

test('resetPasswordRequest returns a local reset link and updates the password', async () => {
  const registerResult = await localAuth.register({
    email: 'reset@example.com',
    password: 'before-reset',
  });

  await localAuth.verifyOtp({
    email: 'reset@example.com',
    otpCode: registerResult.otpCode,
  });

  localAuth.logout();

  const resetRequest = await localAuth.resetPasswordRequest('reset@example.com');
  assert.match(resetRequest.resetUrl, /\/reset-password\?token=/);

  await localAuth.resetPassword({
    resetToken: resetRequest.resetToken,
    newPassword: 'after-reset',
  });

  await localAuth.loginViaEmailPassword('reset@example.com', 'after-reset');
  const user = await localAuth.me();
  assert.equal(user.email, 'reset@example.com');
});
