"use strict";
/**
 * P4 — Firestore Security Rules Unit Tests
 * Standalone test (no @firebase/rules-unit-testing dependency required).
 *
 * Tests the 5 P0 security fixes by parsing firestore.rules and asserting
 * the rule text contains the expected constraints. This is a static analysis
 * approach that validates the rules file without needing the Firebase emulator.
 *
 * Run: npx tsc --module commonjs --target es2022 --moduleResolution node --outDir tests/_run tests/firestore-rules.test.ts && node tests/_run/tests/firestore-rules.test.js
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let passed = 0;
const failures = [];
function assert(condition, name) {
    if (condition) {
        passed++;
        console.log(`  PASS  ${name}`);
    }
    else {
        failures.push(name);
        console.log(`  FAIL  ${name}`);
    }
}
// Read the firestore.rules file
const rulesPath = path.resolve(__dirname, '../../firestore.rules');
const rules = fs.readFileSync(rulesPath, 'utf-8');
// =================== P0-1: userRoles — no self-assign admin/superadmin ===================
console.log('\n[P0-1] userRoles: block self-assign admin/superadmin');
// Find the userRoles match block
const userRolesBlock = rules.substring(rules.indexOf("match /userRoles/{uid}"), rules.indexOf("// =================== PROJECTS"));
assert(userRolesBlock.includes("request.resource.data.role != 'admin'"), "userRoles create blocks role='admin'");
assert(userRolesBlock.includes("request.resource.data.role != 'superadmin'"), "userRoles create blocks role='superadmin'");
assert(userRolesBlock.includes("request.auth.uid == uid"), "userRoles create requires uid match");
// =================== P0-2: calculations — no open engineer write ===================
console.log('\n[P0-2] calculations: restrict write to owner/assigned/admin');
const calcsBlock = rules.substring(rules.indexOf("match /calculations/{calcId}"), rules.indexOf("// 🔒 ZERO-KNOWLEDGE: Price history"));
assert(!calcsBlock.includes("isEngineer()"), "calculations write does NOT use isEngineer() (was the hole)");
assert(calcsBlock.includes("isAssigned("), "calculations write checks isAssigned");
assert(calcsBlock.includes("isOwner("), "calculations write checks isOwner");
// =================== P0-3: priceHistory — restricted create ===================
console.log('\n[P0-3] priceHistory: create restricted to stakeholders');
const priceHistoryBlock = rules.substring(rules.indexOf("match /priceHistory/{historyId}"), rules.indexOf("// Quotes sub-collection"));
// Must NOT have a bare "allow create: if isAuth();" — needs project ownership check
// The create rule spans multiple lines, so check the block between "allow create" and the next "allow" or "}"
const createIdx = priceHistoryBlock.indexOf('allow create');
const createEnd = priceHistoryBlock.indexOf(');', createIdx);
const createChunk = createIdx >= 0 && createEnd >= 0 ? priceHistoryBlock.substring(createIdx, createEnd + 2) : '';
assert(createChunk.includes("isOwner("), "priceHistory create requires ownership check");
assert(!createChunk.match(/allow create:\s*if\s+isAuth\(\)\s*;/), "priceHistory create is NOT bare isAuth()");
// =================== P0-4: payments — owner-only create ===================
console.log('\n[P0-4] payments: create restricted to owner');
const paymentsBlock = rules.substring(rules.indexOf("match /payments/{paymentId}"), rules.indexOf("// =================== SECURITY ALERTS"));
const paymentsCreateLine = paymentsBlock.split('\n').find(l => l.includes('allow create'));
assert(!!paymentsCreateLine && paymentsCreateLine.includes("request.auth.uid == request.resource.data.userId"), "payments create requires userId match");
assert(!!paymentsCreateLine && !paymentsCreateLine.match(/allow create:\s*if\s+isAuth\(\)\s*;/), "payments create is NOT bare isAuth()");
// =================== P0-5: usageTracking — admin-only update ===================
console.log('\n[P0-5] usageTracking: update restricted to admin');
const usageBlock = rules.substring(rules.indexOf("match /usageTracking/{userId}"), rules.indexOf("// RFQ Orders"));
const usageUpdateLine = usageBlock.split('\n').find(l => l.includes('allow update'));
assert(!!usageUpdateLine && usageUpdateLine.includes("isAdmin()"), "usageTracking update requires isAdmin()");
assert(!!usageUpdateLine && !usageUpdateLine.includes("request.auth.uid == userId"), "usageTracking update does NOT allow self-update");
// =================== SUMMARY ===================
console.log(`\n-------- RESULT: ${passed} passed, ${failures.length} failed --------`);
if (failures.length > 0) {
    console.log('Failures:', failures.join(', '));
    process.exit(1);
}
else {
    console.log('All Firestore rules tests passed.');
}
