/**
 * Arba Session Manager — Firestore-Backed Stateless Sessions
 * مدير الجلسات — تخزين Firestore للتوسع
 * 
 * Part of Arba API Gateway 🏗️
 * 
 * Replaces the in-memory Map with Firestore documents.
 * Each Cloud Function instance can read/write sessions independently.
 * Sessions auto-expire after 1 hour.
 */

import * as admin from 'firebase-admin';

const db = admin.firestore();
const SESSIONS_COLLECTION = 'gateway_sessions';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

// =================== Types ===================

export interface SessionData {
    userId: string;
    fileName: string;
    fileType: string;
    sheets: any[];
    metadata: any;
    columnTypes: any;
    headers: string[];
    autoMappings: Record<string, string>;
    scanReport: any;
    ocrReport: any;
    pipelineStage: 'scanned' | 'purged' | 'mapped' | 'calculated' | 'saved';
    securityAlertLevel: 'BLOCKED' | 'WARNING' | 'CLEAN';
    createdAt: number;
    expiresAt: number;
}

// =================== Session CRUD ===================

/**
 * Create a new scan session in Firestore
 * Returns the session ID
 */
export async function createSession(
    userId: string,
    data: Omit<SessionData, 'userId' | 'createdAt' | 'expiresAt'>
): Promise<string> {
    const sessionId = `session_${userId}_${Date.now()}`;
    const now = Date.now();

    const sessionDoc: SessionData = {
        ...data,
        userId,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
    };

    await db.collection(SESSIONS_COLLECTION).doc(sessionId).set(sessionDoc);

    return sessionId;
}

/**
 * Retrieve a session by ID
 * Returns null if session doesn't exist or is expired
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
    const doc = await db.collection(SESSIONS_COLLECTION).doc(sessionId).get();

    if (!doc.exists) {
        return null;
    }

    const session = doc.data() as SessionData;

    // Check expiry
    if (Date.now() > session.expiresAt) {
        // Auto-cleanup expired session
        await db.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
        return null;
    }

    return session;
}

/**
 * Update a session's pipeline stage and/or data
 */
export async function updateSession(
    sessionId: string,
    updates: Partial<SessionData>
): Promise<void> {
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update(updates);
}

/**
 * Delete a session after successful processing
 */
export async function deleteSession(sessionId: string): Promise<void> {
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
}

/**
 * Cleanup all expired sessions
 * Called by a scheduled Firebase function every 30 minutes
 */
export async function cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    const expiredQuery = await db.collection(SESSIONS_COLLECTION)
        .where('expiresAt', '<', now)
        .limit(100) // Batch limit
        .get();

    if (expiredQuery.empty) return 0;

    const batch = db.batch();
    expiredQuery.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return expiredQuery.size;
}
