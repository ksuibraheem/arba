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
let deferred = 0;
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

// SKIPPED: BLOCKED — payments rule reverted to isAuth(); Payment has no userId field
console.log("  ⊘ SKIP: non-stakeholder CANNOT create payment with another userId (BLOCKED)");
deferred++;
// await assert(
//   assertFails(
//     setDoc(doc(outsider.firestore(), "payments", "pay1"), {
//       userId: "engineer1",
//       amount: 999,
//     })
//   ),
//   "non-stakeholder CANNOT create payment with another userId"
// );

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
// P1.1 — Ownership / Anti-Forgery Tests (realistic payloads from service code)
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n── P1.1: Ownership & Anti-Forgery ──");

const owner1 = testEnv.authenticatedContext("owner1");
const attacker = testEnv.authenticatedContext("attacker1");
const adminP1 = testEnv.authenticatedContext("admin1");

// Seed roles for P1.1
const p1Seed = testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "userRoles", "owner1"), { role: "qs_engineer" });
  await setDoc(doc(db, "userRoles", "attacker1"), { role: "qs_engineer" });
  // Seed existing docs with REALISTIC fields matching TS interfaces
  await setDoc(doc(db, "invoices", "inv1"), { createdBy: "admin1", customerId: "client1", total: 100 });
  await setDoc(doc(db, "connect_messages", "msg1"), { senderId: "owner1", receiverId: "other", projectOwnerId: "owner1" });
  await setDoc(doc(db, "attendance", "att1"), { employeeId: "owner1", date: "2025-01-01" });
  await setDoc(doc(db, "suppliers", "sup1"), { ownerId: "owner1", name: "Test Supplier" });
  await setDoc(doc(db, "external_suppliers", "es1"), { createdBy: "owner1", companyName: "Ext Sup" });
  await setDoc(doc(db, "external_prices", "ep1"), { createdBy: "owner1", price: 100, externalSupplierId: "es1" });
  await setDoc(doc(db, "discount_requests", "dr1"), { requestedBy: "owner1", discountValue: 50 });
  await setDoc(doc(db, "support_tickets", "st1"), { userId: "owner1", assignedTo: "admin1", subject: "Test" });
});
await p1Seed;

// ── Projects: ownerId pinned (projectService.ts) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "projects", "p1-own"), { ownerId: "owner1", assignedTo: ["owner1"], name: "My Project" })),
  "P1.1: owner CAN create project with own ownerId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "projects", "p1-forge"), { ownerId: "owner1", assignedTo: ["attacker1"], name: "Forged" })),
  "P1.1: attacker DENIED create project with someone else's ownerId"
);

// ── Clients: ownerId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "clients", "c1-own"), { ownerId: "owner1", name: "My Client" })),
  "P1.1: owner CAN create client with own ownerId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "clients", "c1-forge"), { ownerId: "owner1", name: "Forged Client" })),
  "P1.1: attacker DENIED create client with forged ownerId"
);

// ── Invoices: admin-only create (accountingService.ts: createdBy=accountant, customerId=client) ──
await assert(
  assertSucceeds(setDoc(doc(adminP1.firestore(), "invoices", "inv-admin"), { createdBy: "admin1", customerId: "client1", total: 200 })),
  "P1.1: admin CAN create invoice"
);
await assert(
  assertFails(setDoc(doc(owner1.firestore(), "invoices", "inv-nonadmin"), { createdBy: "owner1", customerId: "client1", total: 200 })),
  "P1.1: non-admin DENIED create invoice (admin-only interim)"
);

// ── Ledger entries: admin-only create (accountingService.ts: createdBy=accountant) ──
await assert(
  assertSucceeds(setDoc(doc(adminP1.firestore(), "ledger_entries", "le-admin"), { createdBy: "admin1", amount: 100, type: "credit" })),
  "P1.1: admin CAN create ledger entry"
);
await assert(
  assertFails(setDoc(doc(owner1.firestore(), "ledger_entries", "le-nonadmin"), { createdBy: "owner1", amount: 100, type: "debit" })),
  "P1.1: non-admin DENIED create ledger entry"
);

// ── Accounting clients: admin-only create ──
await assert(
  assertSucceeds(setDoc(doc(adminP1.firestore(), "accounting_clients", "ac-admin"), { createdBy: "admin1", name: "Client Co" })),
  "P1.1: admin CAN create accounting client"
);
await assert(
  assertFails(setDoc(doc(owner1.firestore(), "accounting_clients", "ac-nonadmin"), { createdBy: "owner1", name: "Client Co" })),
  "P1.1: non-admin DENIED create accounting client"
);

// ── Purchase invoices: createdBy pinned (supplierService.ts L403) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "purchase_invoices", "pi-own"), { createdBy: "owner1", supplierId: "sup1", total: 500 })),
  "P1.1: creator CAN create purchase invoice with own createdBy"
);
// SKIPPED: BLOCKED — firestoreInitializer downloads ALL; sync replays others' records
console.log("  ⊘ SKIP: attacker DENIED create purchase invoice with forged createdBy (BLOCKED)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "purchase_invoices", "pi-forge"), { createdBy: "owner1", supplierId: "sup1", total: 500 })),
//   "P1.1: attacker DENIED create purchase invoice with forged createdBy"
// );

// ── Supplier payments: createdBy pinned (supplierService.ts L546) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "supplier_payments", "spay-own"), { createdBy: "owner1", supplierId: "sup1", amount: 300 })),
  "P1.1: creator CAN create supplier payment with own createdBy"
);
// SKIPPED: BLOCKED — firestoreInitializer downloads ALL; sync replays others' records
console.log("  ⊘ SKIP: attacker DENIED create supplier payment with forged createdBy (BLOCKED)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "supplier_payments", "spay-forge"), { createdBy: "owner1", supplierId: "sup1", amount: 300 })),
//   "P1.1: attacker DENIED create supplier payment with forged createdBy"
// );

// ── Connect messages: senderId pinned (connectService.ts L43) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "connect_messages", "cm-own"), { senderId: "owner1", receiverId: "other", projectOwnerId: "p1" })),
  "P1.1: owner CAN create message with own senderId"
);
// SKIPPED: BLOCKED — sync replays RECEIVED messages whose senderId belongs to someone else
console.log("  ⊘ SKIP: attacker DENIED create message with forged senderId (BLOCKED)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "connect_messages", "cm-forge"), { senderId: "owner1", receiverId: "other", projectOwnerId: "p1" })),
//   "P1.1: attacker DENIED create message with forged senderId"
// );

// ── Connect mail: senderId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "connect_mail", "ml-own"), { senderId: "owner1", receiverId: "other" })),
  "P1.1: owner CAN create mail with own senderId"
);
// SKIPPED: BLOCKED — sync replays received mail; field is from.id not senderId
console.log("  ⊘ SKIP: attacker DENIED create mail with forged senderId (BLOCKED)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "connect_mail", "ml-forge"), { senderId: "owner1", receiverId: "other" })),
//   "P1.1: attacker DENIED create mail with forged senderId"
// );

// ── Attendance: employeeId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "attendance", "att-own"), { employeeId: "owner1", date: "2025-06-01" })),
  "P1.1: employee CAN create attendance with own employeeId"
);
// SKIPPED: BLOCKED-BY-P1.2 — rule reverted to isAuth() because employeeId != auth.uid
// The ownership pin will be re-enabled after identity model is fixed.
console.log("  ⊘ SKIP: attacker DENIED create attendance with forged employeeId (BLOCKED-BY-P1.2)");
deferred++; // count as acknowledged-skip
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "attendance", "att-forge"), { employeeId: "owner1", date: "2025-06-01" })),
//   "P1.1: attacker DENIED create attendance with forged employeeId"
// );

// ── Discount requests: requestedBy pinned (discountRequestService.ts L31) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "discount_requests", "dr-own"), { requestedBy: "owner1", discountValue: 10, targetId: "t1" })),
  "P1.1: engineer CAN create discount request with own requestedBy"
);
// SKIPPED: BLOCKED-BY-P1.2 — rule reverted to isAuth() because requestedBy == employee.id (internal)
// The ownership pin will be re-enabled after identity model is fixed.
console.log("  ⊘ SKIP: attacker DENIED create discount request with forged requestedBy (BLOCKED-BY-P1.2)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "discount_requests", "dr-forge"), { requestedBy: "owner1", discountValue: 10, targetId: "t1" })),
//   "P1.1: attacker DENIED create discount request with forged requestedBy"
// );

// ── Support tickets: userId pinned (supportTicketService.ts L52) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "support_tickets", "st-own"), { userId: "owner1", assignedTo: "admin1", subject: "Help" })),
  "P1.1: owner CAN create support ticket with own userId"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth() because userId defaults to 'guest' in some flows
console.log("  ⊘ SKIP: attacker DENIED create support ticket with forged userId (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "support_tickets", "st-forge"), { userId: "owner1", assignedTo: "admin1", subject: "Help" })),
//   "P1.1: attacker DENIED create support ticket with forged userId"
// );

// ── Suppliers: ownerId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "suppliers", "sup-own"), { ownerId: "owner1", name: "My Supplier" })),
  "P1.1: owner CAN create supplier with own ownerId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "suppliers", "sup-forge"), { ownerId: "owner1", name: "Forged Supplier" })),
  "P1.1: attacker DENIED create supplier with forged ownerId"
);

// ── External suppliers: createdBy pinned (externalSupplierService.ts L46) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "external_suppliers", "es-own"), { createdBy: "owner1", companyName: "My Ext" })),
  "P1.1: creator CAN create external supplier with own createdBy"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth() because createdBy: 'system' in sample/API flows
console.log("  ⊘ SKIP: attacker DENIED create external supplier with forged createdBy (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "external_suppliers", "es-forge"), { createdBy: "owner1", companyName: "Forged Ext" })),
//   "P1.1: attacker DENIED create external supplier with forged createdBy"
// );

// ── External prices: createdBy pinned (externalSupplierService.ts L84) ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "external_prices", "ep-own"), { createdBy: "owner1", price: 200, externalSupplierId: "es1" })),
  "P1.1: creator CAN create external price with own createdBy"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth() because createdBy: 'system' in sample/API flows
console.log("  ⊘ SKIP: attacker DENIED create external price with forged createdBy (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "external_prices", "ep-forge"), { createdBy: "owner1", price: 200, externalSupplierId: "es1" })),
//   "P1.1: attacker DENIED create external price with forged createdBy"
// );

// ── Supplier products: supplierId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "supplier_products", "sp-own"), { supplierId: "owner1", name: "My Product" })),
  "P1.1: supplier CAN create product with own supplierId"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth() because sample data uses internal IDs
console.log("  ⊘ SKIP: attacker DENIED create product with forged supplierId (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "supplier_products", "sp-forge"), { supplierId: "owner1", name: "Forged Product" })),
//   "P1.1: attacker DENIED create product with forged supplierId"
// );

// ── SupplierRFQs: clientId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "supplierRFQs", "rfq-own"), { clientId: "owner1", supplierId: "sup1", items: [] })),
  "P1.1: client CAN create RFQ with own clientId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "supplierRFQs", "rfq-forge"), { clientId: "owner1", supplierId: "sup1", items: [] })),
  "P1.1: attacker DENIED create RFQ with forged clientId"
);

// ── SupplierStoragePurchases: supplierId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "supplierStoragePurchases", "ssp-own"), { supplierId: "owner1", amount: 1000 })),
  "P1.1: supplier CAN create storage purchase with own supplierId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "supplierStoragePurchases", "ssp-forge"), { supplierId: "owner1", amount: 1000 })),
  "P1.1: attacker DENIED create storage purchase with forged supplierId"
);

// ── Security alerts: reporterId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "security_alerts", "sa-own"), { reporterId: "owner1", type: "suspicious" })),
  "P1.1: user CAN create security alert with own reporterId"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "security_alerts", "sa-forge"), { reporterId: "owner1", type: "suspicious" })),
  "P1.1: attacker DENIED create security alert with forged reporterId"
);

// ── Action logs: userId pinned ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "action_logs", "al-own"), { userId: "owner1", action: "login" })),
  "P1.1: user CAN create action log with own userId"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth() because system-generated logs may not have userId
console.log("  ⊘ SKIP: attacker DENIED create action log with forged userId (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(attacker.firestore(), "action_logs", "al-forge"), { userId: "owner1", action: "login" })),
//   "P1.1: attacker DENIED create action log with forged userId"
// );

// ── Registration requests: valid email+name (no auth needed) ──
const unauthReg = testEnv.unauthenticatedContext();
await assert(
  assertSucceeds(setDoc(doc(unauthReg.firestore(), "registration_requests", "rr-valid"), { email: "test@example.com", name: "Test User" })),
  "P1.1: unauth CAN create registration with valid email+name"
);
await assert(
  assertFails(setDoc(doc(unauthReg.firestore(), "registration_requests", "rr-empty"), { email: "", name: "" })),
  "P1.1: unauth DENIED create registration with empty fields"
);
await assert(
  assertFails(setDoc(doc(unauthReg.firestore(), "registration_requests", "rr-nofields"), { phone: "123" })),
  "P1.1: unauth DENIED create registration without email+name"
);

// ── Notifications: requires userId string field ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "notifications", "notif-own"), { userId: "owner1", message: "Hello" })),
  "P1.1: user CAN create notification with userId"
);
// SKIPPED: TODO-P1.6 — rule reverted to isAuth(), notification payload has no top-level userId
console.log("  ⊘ SKIP: DENIED create notification without userId field (TODO-P1.6)");
deferred++;
// await assert(
//   assertFails(setDoc(doc(owner1.firestore(), "notifications", "notif-noid"), { message: "No userId" })),
//   "P1.1: DENIED create notification without userId field"
// );

// ── Quotes sub-collection: restricted to project stakeholders ──
await assert(
  assertSucceeds(setDoc(doc(owner1.firestore(), "projects", "p1-own", "quotes", "q1"), { total: 5000, items: [] })),
  "P1.1: project owner CAN write quote"
);
await assert(
  assertFails(setDoc(doc(attacker.firestore(), "projects", "p1-own", "quotes", "q2"), { total: 9999, items: [] })),
  "P1.1: non-stakeholder DENIED write quote on project they don't own"
);
// ══════════════════════════════════════════════════════════════════════════════
// TEST GROUP 5: FIXTURE TEST — real app-shaped records through the emulator
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n── Fixture: app-shaped records ──");

const fixtureUser = testEnv.authenticatedContext("fixture-user-1");
const fixtureAdmin = testEnv.authenticatedContext("admin1");

// Seed fixture user role
const fixSeed = testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "userRoles", "fixture-user-1"), { role: "qs_engineer" });
});
await fixSeed;

// Payment (app shape: createdBy, NO userId)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "payments", "fix-pay-1"), {
    amount: 5000, method: "bank_transfer", status: "completed",
    date: "2025-07-01", customerName: "Test Client",
    createdBy: "fixture-user-1", createdAt: new Date().toISOString()
  })),
  "FIXTURE: Payment (createdBy, no userId) accepted"
);

// PurchaseInvoice (app shape: createdBy = someone else, from sync)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "purchase_invoices", "fix-pi-1"), {
    invoiceNumber: "PI-0001", supplierId: "sup-1", supplierName: "Steel Co",
    items: [], subtotal: 1000, taxAmount: 150, total: 1150,
    status: "pending", dueDate: "2025-08-01",
    paidAmount: 0, remainingAmount: 1150,
    createdBy: "other-accountant", createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })),
  "FIXTURE: PurchaseInvoice (createdBy=other-accountant, from sync) accepted"
);

// SupplierPayment (app shape: createdBy = someone else, from sync)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "supplier_payments", "fix-sp-1"), {
    supplierId: "sup-1", supplierName: "Steel Co",
    amount: 500, paymentMethod: "bank_transfer",
    createdBy: "other-accountant", createdAt: new Date().toISOString()
  })),
  "FIXTURE: SupplierPayment (createdBy=other, from sync) accepted"
);

// ConnectMessage (received: senderId != auth.uid)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "connect_messages", "fix-cm-1"), {
    senderId: "someone-else", senderName: "Other User",
    senderRole: "client", content: "Hello",
    type: "text", category: "project",
    readBy: ["someone-else"], emailSent: false,
    createdAt: new Date().toISOString()
  })),
  "FIXTURE: ConnectMessage (received, senderId!=auth.uid) accepted"
);

// ConnectMail (received: from.id != auth.uid, no senderId field)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "connect_mail", "fix-ml-1"), {
    from: { id: "someone-else", name: "Other User", role: "client" },
    to: [{ id: "fixture-user-1", name: "Me", role: "qs_engineer" }],
    subject: "Test", body: "Hello",
    attachments: [], status: "sent",
    externalEmailSent: false, replies: [], starred: false,
    createdAt: new Date().toISOString()
  })),
  "FIXTURE: ConnectMail (received, from.id!=auth.uid, no senderId) accepted"
);

// auth_users (doc ID = generated string, not auth.uid)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "auth_users", "user_1722601234567_a1b2c3"), {
    userType: "individual", name: "Test User", email: "test@test.com",
    password: "hashed", plan: "basic",
    usedProjects: 0, usedStorageMB: 0,
    createdAt: new Date().toISOString()
  })),
  "FIXTURE: auth_users (doc ID != auth.uid) accepted"
);

// supplier_storage (was null-on-create bug)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "supplier_storage", "fix-ss-1"), {
    supplierId: "fixture-user-1", storageMB: 100
  })),
  "FIXTURE: supplier_storage create (was null-on-create) accepted"
);

// company_settings (was null-on-create bug)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "company_settings", "fix-cs-1"), {
    userId: "fixture-user-1", companyName: "Test Co"
  })),
  "FIXTURE: company_settings create (was null-on-create) accepted"
);

// company_employees (was null-on-create bug)
await assert(
  assertSucceeds(setDoc(doc(fixtureUser.firestore(), "company_employees", "fix-ce-1"), {
    companyId: "comp-1", name: "Employee 1"
  })),
  "FIXTURE: company_employees create (was null-on-create) accepted"
);

// subscriptions (admin-only create — non-admin MUST fail)
await assert(
  assertFails(setDoc(doc(fixtureUser.firestore(), "subscriptions", "fix-sub-1"), {
    userId: "fixture-user-1", plan: "pro", status: "active"
  })),
  "FIXTURE: subscriptions create by non-admin DENIED (admin-only)"
);

// subscriptions (admin CAN create)
await assert(
  assertSucceeds(setDoc(doc(fixtureAdmin.firestore(), "subscriptions", "fix-sub-2"), {
    userId: "fixture-user-1", plan: "pro", status: "active"
  })),
  "FIXTURE: subscriptions create by admin accepted"
);

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const realPassed = passed - deferred;
console.log(`\n──── RESULT: ${realPassed} passed, ${deferred} deferred, ${failed} failed (${passed + failed} total) ────`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
}

await testEnv.cleanup();
process.exit(failed > 0 ? 1 : 0);
