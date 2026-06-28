/**
 * Atomic gapless counter for invoice/journal/purchase numbering.
 * Uses Firestore transaction to guarantee uniqueness.
 *
 * Counter document: counters/{counterType}
 * Fields: { currentYear: number, currentCount: number }
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getNextNumber = onCall(async (request) => {
  const { type } = request.data as { type: string };

  const prefixes: Record<string, string> = {
    invoice: 'INV',
    purchase_invoice: 'PI',
    journal_entry: 'JE'
  };

  const prefix = prefixes[type];
  if (!prefix) throw new HttpsError('invalid-argument', `Invalid counter type: ${type}`);

  const year = new Date().getFullYear();
  const counterRef = db.collection('counters').doc(type);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    let count = 1;

    if (snap.exists) {
      const data = snap.data()!;
      if (data.currentYear === year) {
        count = data.currentCount + 1;
      }
      // else: new year, reset to 1
    }

    tx.set(counterRef, { currentYear: year, currentCount: count });
    return `${prefix}-${year}-${count.toString().padStart(5, '0')}`;
  });

  return { number: result };
});
