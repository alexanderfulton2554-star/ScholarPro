import test from 'node:test';
import assert from 'node:assert/strict';

const storage = {};
globalThis.localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
  },
  setItem(key, value) {
    storage[key] = String(value);
  },
  removeItem(key) {
    delete storage[key];
  }
};

const { savePendingZetuPayPayment, getPendingZetuPayPayment, verifyPendingZetuPayPayment, clearPendingZetuPayPayment } = await import('./paymentFlow.js');

import { normalizePhoneNumberForZetuPay } from './paymentFlow.js';

test('saves and clears a pending ZetuPay payment reference', () => {
  savePendingZetuPayPayment({ reference: 'REF-123', amount: 300, writerMode: 'private' });

  const pending = getPendingZetuPayPayment();
  assert.equal(pending.reference, 'REF-123');
  assert.equal(pending.amount, 300);
  assert.equal(pending.writerMode, 'private');
  assert.ok(typeof pending.createdAt === 'number');

  clearPendingZetuPayPayment();
  assert.equal(getPendingZetuPayPayment(), null);
});

test('normalizes a valid M-Pesa phone number for ZetuPay', () => {
  assert.equal(normalizePhoneNumberForZetuPay('0712345678'), '+254712345678');
  assert.equal(normalizePhoneNumberForZetuPay('+254712345678'), '+254712345678');
  assert.equal(normalizePhoneNumberForZetuPay('254712345678'), '+254712345678');
});

test('verifies a pending payment through the API and clears it when successful', async () => {
  savePendingZetuPayPayment({ reference: 'REF-456', amount: 300, writerMode: 'private' });

  const result = await verifyPendingZetuPayPayment(async (path, opts = {}) => {
    assert.equal(path, '/payments/zetupay/verify');
    assert.equal(JSON.parse(opts.body).reference, 'REF-456');
    return { paid: true, reference: 'REF-456' };
  });

  assert.deepEqual(result, { paid: true, reference: 'REF-456' });
  assert.equal(getPendingZetuPayPayment(), null);
});
