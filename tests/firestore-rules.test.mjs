/**
 * P4 — Behavioral Firestore Security Rules Tests
 * Uses @firebase/rules-unit-testing against the Firestore emulator.
 *
 * Run:
 *   npx firebase emulators:exec --only firestore "node tests/firestore-rules.test.mjs"
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { setDoc, doc, getDoc, updateDoc, setLogLevel } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Suppress Firestore SDK warnings in test output
setLogLevel("error");

let testEnv;
let passed = 0;
let failed = 0;
const failures = [];

async function assert(asyncFn, name) {
  try {
    await asyncFn;
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    failures.push(name);
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
const rules = readFileSync(resolve(__dirname, "../firestore.rules"), "utf-8");

testEnv = await initializeTestEnvironment({
  projectId: "arba-rules-test",
  firestore: { rules, host: "127.0.0.1", port: 8080 },
});

// ── Seed data via admin context (bypasses rules) ────────────────────────────
const admin = testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();

  // Admin role for user "admin1"
  await setDoc(doc(db, "userRoles", "admin1"), { role: "admin" });

  // Engineer role for user "engineer1" 
  await setDoc(doc(db, "userRoles", "engineer1"), { role: "qs_engineer" });

  // Regular user role for "user1"
  await setDoc(doc(db, "userRoles", "user1"), { role: "client" });

  // A project owned by engineer1, with user1 NOT assigned
  await setDoc(doc(db, "projects", "proj1"), {
    ownerId: "engineer1",
    assignedTo: ["engineer1"],
    name: "Test Project",
  });

  // usageTracking doc for user1
  await setDoc(doc(db, "usageTracking", "user1"), {
    projectsUsed: 2,
    projectsQuota: 5,
    aiQueriesUsed: 10,
    aiQueriesQuota: 50,
  });
});
await admin;

// ══════════════════════════════════════════════════════════════════════════════
// TEST GROUP 1: userRoles — privilege escalation blocked
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n[1] userRoles: block self-assign admin/superadmin");

// 1a) Non-admin user CANNOT create their own role as 'admin'
const user2ForAdmin = testEnv.authenticatedContext("user2");
await assert(
  assertFails(
    setDoc(doc(user2ForAdmin.firestore(), "userRoles", "user2"), {
      role: "admin",
    })
  ),
  "user CANNOT self-assign role='admin'"
);

// 1b) Non-admin user CANNOT create their own role as 'superadmin'
const user3ForSuperAdmin = testEnv.authenticatedContext("user3");
await assert(
  assertFails(
    setDoc(doc(user3ForSuperAdmin.firestore(), "userRoles", "user3"), {
      role: "superadmin",
    })
  ),
  "user CANNOT self-assign role='superadmin'"
);

// 1c) User CAN create their own role as a non-privileged role (positive control)
const user4ForClient = testEnv.authenticatedContext("user4");
await assert(
  assertSucceeds(
    setDoc(doc(user4ForClient.firestore(), "userRoles", "user4"), {
      role: "client",
    })
  ),
  "user CAN self-assign role='client'"
);

// 1d) User CANNOT create a role doc for another user
const user5Impersonator = testEnv.authenticatedContext("user5");
await assert(
  assertFails(
    setDoc(doc(user5Impersonator.firestore(), "userRoles", "user999"), {
      role: "client",
    })
  ),
  "user CANNOT create role doc for another user"
);

// ══════════════════════════════════════════════════════════════════════════════
// TEST GROUP 2: project sub-collections — non-stakeholder blocked
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n[2] project sub-collections: non-stakeholder CANNOT write");

// user1 is NOT owner and NOT in assignedTo for proj1
const outsider = testEnv.authenticatedContext("user1");

// 2a) Non-stakeholder CANNOT write to calculations
await assert(
  assertFails(
    setDoc(doc(outsider.firestore(), "projects", "proj1", "calculations", "c1"), {
      total: 1000,
      items: [],
    })
  ),
  "non-stakeholder CANNOT write projects/proj1/calculations"
);

// 2b) Non-stakeholder CANNOT write to priceHistory
await assert(
  assertFails(
    setDoc(doc(outsider.firestore(), "projects", "proj1", "priceHistory", "ph1"), {
      price: 500,
      timestamp: Date.now(),
    })
  ),
  "non-stakeholder CANNOT write projects/proj1/priceHistory"
);

// 2c) Non-stakeholder CANNOT create a payment for someone else
await assert(
  assertFails(
    setDoc(doc(outsider.firestore(), "payments", "pay1"), {
      userId: "engineer1",
      amount: 999,
    })
  ),
  "non-stakeholder CANNOT create payment with another userId"
);

// 2d) Owner CAN write to calculations (positive control)
const owner = testEnv.authenticatedContext("engineer1");
await assert(
  assertSucceeds(
    setDoc(doc(owner.firestore(), "projects", "proj1", "calculations", "c2"), {
      total: 2000,
      items: ["item1"],
    })
  ),
  "project owner CAN write projects/proj1/calculations"
);

// 2e) Owner CAN write to priceHistory (positive control)
await assert(
  assertSucceeds(
    setDoc(doc(owner.firestore(), "projects", "proj1", "priceHistory", "ph2"), {
      price: 750,
      timestamp: Date.now(),
    })
  ),
  "project owner CAN write projects/proj1/priceHistory"
);

// 2f) User CAN create their own payment (positive control)
await assert(
  assertSucceeds(
    setDoc(doc(outsider.firestore(), "payments", "pay2"), {
      userId: "user1",
      amount: 100,
    })
  ),
  "user CAN create payment with own userId"
);

// ══════════════════════════════════════════════════════════════════════════════
// TEST GROUP 3: usageTracking — user CANNOT update own quota
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n[3] usageTracking: user CANNOT update own quota");

const quotaUser = testEnv.authenticatedContext("user1");

// 3a) User CANNOT update their own usageTracking
await assert(
  assertFails(
    updateDoc(doc(quotaUser.firestore(), "usageTracking", "user1"), {
      projectsQuota: 9999,
    })
  ),
  "user CANNOT update own usageTracking quota"
);

// 3b) User CANNOT update even usage counters (all updates admin-only)
await assert(
  assertFails(
    updateDoc(doc(quotaUser.firestore(), "usageTracking", "user1"), {
      projectsUsed: 100,
    })
  ),
  "user CANNOT update own usageTracking counters"
);

// 3c) Admin CAN update usageTracking (positive control)
const adminUser = testEnv.authenticatedContext("admin1");
await assert(
  assertSucceeds(
    updateDoc(doc(adminUser.firestore(), "usageTracking", "user1"), {
      projectsQuota: 20,
    })
  ),
  "admin CAN update usageTracking quota"
);

// 3d) User CAN read their own usageTracking (positive control)
await assert(
  assertSucceeds(
    getDoc(doc(quotaUser.firestore(), "usageTracking", "user1"))
  ),
  "user CAN read own usageTracking"
);

// 3e) User CAN create their own usageTracking doc (positive control)
const newUser = testEnv.authenticatedContext("newuser1");
await assert(
  assertSucceeds(
    setDoc(doc(newUser.firestore(), "usageTracking", "newuser1"), {
      projectsUsed: 0,
      projectsQuota: 3,
    })
  ),
  "user CAN create own usageTracking doc"
);
// ══════════════════════════════════════════════════════════════════════════════
// P0 — arba_config + financial collections: auth-gated reads
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n── P0: arba_config + financial collections ──");

// Seed financial data via admin context
const adminSeed2 = testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "arba_config", "app_settings"), { version: "1.0" });
  await setDoc(doc(db, "arba_config", "employees_data"), { secret: true });
  await setDoc(doc(db, "chart_of_accounts", "1001"), { name: "Cash", type: "asset" });
  await setDoc(doc(db, "journal_entries", "JE-2025-001"), { amount: 5000 });
  await setDoc(doc(db, "invoice_versions", "INV-001"), { total: 12000 });
});
await adminSeed2;

// 4a) Unauth CANNOT read arba_config
const unauth2 = testEnv.unauthenticatedContext();
await assert(
  assertFails(getDoc(doc(unauth2.firestore(), "arba_config", "app_settings"))),
  "P0: unauth DENIED read arba_config/app_settings"
);

// 4b) Unauth CANNOT read chart_of_accounts
await assert(
  assertFails(getDoc(doc(unauth2.firestore(), "chart_of_accounts", "1001"))),
  "P0: unauth DENIED read chart_of_accounts"
);

// 4c) Unauth CANNOT read journal_entries
await assert(
  assertFails(getDoc(doc(unauth2.firestore(), "journal_entries", "JE-2025-001"))),
  "P0: unauth DENIED read journal_entries"
);

// 4d) Unauth CANNOT read invoice_versions
await assert(
  assertFails(getDoc(doc(unauth2.firestore(), "invoice_versions", "INV-001"))),
  "P0: unauth DENIED read invoice_versions"
);

// 4e) Authenticated non-admin CAN read arba_config (non-sensitive doc)
const authUser2 = testEnv.authenticatedContext("user1");
await assert(
  assertSucceeds(getDoc(doc(authUser2.firestore(), "arba_config", "app_settings"))),
  "P0: auth user CAN read arba_config/app_settings"
);

// 4f) Authenticated non-admin CANNOT read employees_data (blocked docId)
await assert(
  assertFails(getDoc(doc(authUser2.firestore(), "arba_config", "employees_data"))),
  "P0: auth user DENIED read arba_config/employees_data"
);

// 4g) Non-admin DENIED read chart_of_accounts
await assert(
  assertFails(getDoc(doc(authUser2.firestore(), "chart_of_accounts", "1001"))),
  "P0: non-admin DENIED read chart_of_accounts"
);

// 4h) Non-admin DENIED read journal_entries
await assert(
  assertFails(getDoc(doc(authUser2.firestore(), "journal_entries", "JE-2025-001"))),
  "P0: non-admin DENIED read journal_entries"
);

// 4i) Non-admin DENIED read invoice_versions
await assert(
  assertFails(getDoc(doc(authUser2.firestore(), "invoice_versions", "INV-001"))),
  "P0: non-admin DENIED read invoice_versions"
);

// 4j) Non-admin DENIED write chart_of_accounts
await assert(
  assertFails(setDoc(doc(authUser2.firestore(), "chart_of_accounts", "2001"), { name: "Bank", type: "asset" })),
  "P0: non-admin DENIED write chart_of_accounts"
);

// 4k) Non-admin DENIED write journal_entries
await assert(
  assertFails(setDoc(doc(authUser2.firestore(), "journal_entries", "JE-2025-002"), { amount: 3000 })),
  "P0: non-admin DENIED write journal_entries"
);

// 4l) Non-admin DENIED write invoice_versions
await assert(
  assertFails(setDoc(doc(authUser2.firestore(), "invoice_versions", "INV-002"), { total: 8000 })),
  "P0: non-admin DENIED write invoice_versions"
);

// 4m) Admin CAN read all financial collections
const adminCtx = testEnv.authenticatedContext("admin1");
await assert(
  assertSucceeds(getDoc(doc(adminCtx.firestore(), "chart_of_accounts", "1001"))),
  "P0: admin CAN read chart_of_accounts"
);
await assert(
  assertSucceeds(getDoc(doc(adminCtx.firestore(), "journal_entries", "JE-2025-001"))),
  "P0: admin CAN read journal_entries"
);
await assert(
  assertSucceeds(getDoc(doc(adminCtx.firestore(), "invoice_versions", "INV-001"))),
  "P0: admin CAN read invoice_versions"
);

// 4n) Admin CAN write all financial collections
await assert(
  assertSucceeds(setDoc(doc(adminCtx.firestore(), "chart_of_accounts", "3001"), { name: "Revenue", type: "revenue" })),
  "P0: admin CAN write chart_of_accounts"
);
await assert(
  assertSucceeds(setDoc(doc(adminCtx.firestore(), "journal_entries", "JE-2025-003"), { amount: 7000 })),
  "P0: admin CAN write journal_entries"
);
await assert(
  assertSucceeds(setDoc(doc(adminCtx.firestore(), "invoice_versions", "INV-003"), { total: 15000 })),
  "P0: admin CAN write invoice_versions"
);

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
console.log(`\n──── RESULT: ${passed}/${passed + failed} ✓ ────`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
}

await testEnv.cleanup();
process.exit(failed > 0 ? 1 : 0);
