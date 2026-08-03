/**
 * Counter Client — Frontend wrapper for the atomic Cloud Function counter.
 *
 * ONLINE:  Calls Cloud Function → gapless, transactional number.
 * OFFLINE: Uses a deterministic localStorage counter → provisional number
 *          prefixed "PROV-". These are safe to use locally and will be
 *          reconciled when the document syncs (M2 linking will handle
 *          number re-assignment on reconnect if needed).
 *
 * The offline counter is monotonically increasing per device, so:
 *  - No duplicates within the same device session.
 *  - Cross-device uniqueness is NOT guaranteed (but offline is single-device).
 *  - offlineBufferService will sync the document; reconciliation can reassign
 *    the number via Cloud Function on next successful write if desired.
 */

import app from '../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';

type CounterType = 'invoice' | 'purchase_invoice' | 'journal_entry';

const OFFLINE_COUNTER_KEY = 'arba_offline_counters';

/**
 * Get the next sequential number.
 * Online → Cloud Function (gapless, atomic).
 * Offline → local provisional counter.
 */
export async function getNextNumber(type: CounterType): Promise<string> {
  // Try Cloud Function first
  try {
    const functions = getFunctions(app, 'us-central1');
    const fn = httpsCallable(functions, 'getNextNumber');
    const result = await fn({ type });
    return (result.data as { number: string }).number;
  } catch (err) {
    // LOUD FALLBACK: log the real reason so region mismatches / auth errors
    // are visible in production, not silently swallowed.
    console.error('❌ Cloud counter failed — falling back to PROV-', err);
    return getProvisionalNumber(type);
  }
}

/**
 * Deterministic local counter for offline use.
 * Returns "PROV-{PREFIX}-{YEAR}-{SEQ}" format.
 * Monotonically increasing per type per device.
 */
function getProvisionalNumber(type: CounterType): string {
  const prefix = { invoice: 'INV', purchase_invoice: 'PI', journal_entry: 'JE' }[type];
  const year = new Date().getFullYear();

  // Read current counters from localStorage
  let counters: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(OFFLINE_COUNTER_KEY);
    if (raw) counters = JSON.parse(raw);
  } catch { /* empty */ }

  const key = `${type}_${year}`;
  const seq = (counters[key] || 0) + 1;
  counters[key] = seq;

  localStorage.setItem(OFFLINE_COUNTER_KEY, JSON.stringify(counters));

  console.warn(`⚠️ Cloud counter offline — provisional: PROV-${prefix}-${year}-${seq.toString().padStart(5, '0')}`);
  return `PROV-${prefix}-${year}-${seq.toString().padStart(5, '0')}`;
}

/**
 * Check if a number is provisional (created offline).
 */
export function isProvisionalNumber(number: string): boolean {
  return number.startsWith('PROV-');
}
