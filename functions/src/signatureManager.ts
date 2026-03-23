import * as crypto from 'crypto';

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

export interface IntegrityPacket {
    signature: string;
    timestamp: string;
    version: string;
    engineVersion: string;
    precisionLevel: number;
}

/**
 * Generates an HMAC SHA-256 signature for a set of results
 * @param userId The ID of the user performing the calculation
 * @param finalPrice The calculated final price
 * @param itemCount Number of items in the calculation
 * @param precisionLevel The decimal precision used (default: 4)
 */
export function generateSignature(
    userId: string,
    finalPrice: number,
    itemCount: number,
    precisionLevel: number = 4
): IntegrityPacket {
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
export function verifySignature(
    signature: string,
    userId: string,
    finalPrice: number,
    itemCount: number,
    timestamp: string,
    precisionLevel: number = 4
): boolean {
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
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expected, 'hex')
    );
}

/**
 * Generate a lightweight verification hash for QR codes
 * Shorter than full signature, suitable for URL-safe QR data
 */
export function generateQRVerificationHash(
    projectId: string,
    finalPrice: number,
    certifiedAt: string
): string {
    const payload = `${projectId}:${finalPrice.toFixed(4)}:${certifiedAt}`;
    
    return crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16); // Short hash for QR
}
