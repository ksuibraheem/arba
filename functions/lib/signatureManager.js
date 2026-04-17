"use strict";
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
exports.generateSignature = generateSignature;
exports.verifySignature = verifySignature;
exports.generateQRVerificationHash = generateQRVerificationHash;
const crypto = __importStar(require("crypto"));
/**
 * Signature Manager v2 — مدير التوقيع الرقمي (HMAC SHA-256)
 *
 * Upgraded from plain SHA-256 to HMAC SHA-256 with server-side secret.
 * Generates tamper-proof signatures for calculation results.
 *
 * Part of Arba Phase 4: Secure Cloud Black Box.
 * 🏰 THE FORTRESS — Digital Integrity
 */
// Server-side HMAC secret — NEVER expose to client
const HMAC_SECRET = process.env.ARBA_HMAC_SECRET || 'arba-hmac-fortress-2026-secure-key';
/**
 * Generates an HMAC SHA-256 signature for a set of results
 * @param userId The ID of the user performing the calculation
 * @param finalPrice The calculated final price
 * @param itemCount Number of items in the calculation
 * @param precisionLevel The decimal precision used (default: 4)
 */
function generateSignature(userId, finalPrice, itemCount, precisionLevel = 4) {
    const timestamp = new Date().toISOString();
    const version = '2.0.0';
    const engineVersion = 'arba-engine-v2';
    // Create the payload to sign with 4-decimal precision
    const payload = [
        userId,
        finalPrice.toFixed(precisionLevel),
        itemCount.toString(),
        timestamp,
        engineVersion,
        precisionLevel.toString()
    ].join(':');
    // Generate HMAC SHA-256 (upgrade from plain SHA-256)
    const signature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex');
    return {
        signature,
        timestamp,
        version,
        engineVersion,
        precisionLevel
    };
}
/**
 * Verifies if a signature is valid (useful for audit logs and QR verification)
 */
function verifySignature(signature, userId, finalPrice, itemCount, timestamp, precisionLevel = 4) {
    const engineVersion = 'arba-engine-v2';
    const payload = [
        userId,
        finalPrice.toFixed(precisionLevel),
        itemCount.toString(),
        timestamp,
        engineVersion,
        precisionLevel.toString()
    ].join(':');
    const expected = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex');
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
/**
 * Generate a lightweight verification hash for QR codes
 * Shorter than full signature, suitable for URL-safe QR data
 */
function generateQRVerificationHash(projectId, finalPrice, certifiedAt) {
    const payload = `${projectId}:${finalPrice.toFixed(4)}:${certifiedAt}`;
    return crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16); // Short hash for QR
}
//# sourceMappingURL=signatureManager.js.map