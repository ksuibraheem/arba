"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
exports.deleteSession = deleteSession;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const SESSIONS_COLLECTION = 'gateway_sessions';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
// =================== Session CRUD ===================
/**
 * Create a new scan session in Firestore
 * Returns the session ID
 */
async function createSession(userId, data) {
    const sessionId = `session_${userId}_${Date.now()}`;
    const now = Date.now();
    const sessionDoc = {
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
async function getSession(sessionId) {
    const doc = await db.collection(SESSIONS_COLLECTION).doc(sessionId).get();
    if (!doc.exists) {
        return null;
    }
    const session = doc.data();
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
async function updateSession(sessionId, updates) {
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update(updates);
}
/**
 * Delete a session after successful processing
 */
async function deleteSession(sessionId) {
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
}
/**
 * Cleanup all expired sessions
 * Called by a scheduled Firebase function every 30 minutes
 */
async function cleanupExpiredSessions() {
    const now = Date.now();
    const expiredQuery = await db.collection(SESSIONS_COLLECTION)
        .where('expiresAt', '<', now)
        .limit(100) // Batch limit
        .get();
    if (expiredQuery.empty)
        return 0;
    const batch = db.batch();
    expiredQuery.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return expiredQuery.size;
}
//# sourceMappingURL=sessionManager.js.map