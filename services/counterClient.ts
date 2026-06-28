/**
 * Counter Client — Frontend wrapper for the atomic Cloud Function counter.
 * Falls back to local random numbering when Cloud Functions are unavailable.
 */

import app from '../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';

type CounterType = 'invoice' | 'purchase_invoice' | 'journal_entry';

export async function getNextNumber(type: CounterType): Promise<string> {
  try {
    const functions = getFunctions(app, 'us-central1');
    const fn = httpsCallable(functions, 'getNextNumber');
    const result = await fn({ type });
    return (result.data as { number: string }).number;
  } catch (error) {
    // Fallback: generate locally (degraded mode)
    console.warn('⚠️ Cloud counter unavailable, using local fallback');
    const year = new Date().getFullYear();
    const prefix = { invoice: 'INV', purchase_invoice: 'PI', journal_entry: 'JE' }[type];
    const rand = Math.floor(Math.random() * 99999);
    return `${prefix}-${year}-${rand.toString().padStart(5, '0')}`;
  }
}
