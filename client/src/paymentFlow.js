const STORE_KEY = 'scholarpro_pending_payment';

export function savePendingZetuPayPayment({ reference, amount, writerMode }) {
  if (!reference) return null;
  const record = { reference, amount, writerMode, createdAt: Date.now() };
  localStorage.setItem(STORE_KEY, JSON.stringify(record));
  return record;
}

export function getPendingZetuPayPayment() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingZetuPayPayment() {
  localStorage.removeItem(STORE_KEY);
}

export function normalizePhoneNumberForZetuPay(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  const cleaned = text.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!cleaned) return '';

  if (/^254\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0\d{9}$/.test(cleaned)) return `+254${cleaned.slice(1)}`;
  if (/^\d{9}$/.test(cleaned)) return `+254${cleaned}`;
  if (/^254\d{10}$/.test(cleaned)) return `+${cleaned}`;
  return `+${cleaned}`.replace(/\+\+/, '+');
}

export async function verifyPendingZetuPayPayment(apiFn) {
  const pending = getPendingZetuPayPayment();
  if (!pending?.reference) {
    return { paid: false, reference: null };
  }

  const result = await apiFn('/payments/zetupay/verify', {
    method: 'POST',
    body: JSON.stringify({ reference: pending.reference, amount: pending.amount || 300 })
  });

  if (result?.paid) {
    clearPendingZetuPayPayment();
  }

  return result;
}
