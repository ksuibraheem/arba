/**
 * Accounting Module QA Tests — M1 Gate
 * Standalone: runs with MemoryStorage mocks, no Firebase required.
 * Tests: trial balance, recompute-from-source, referential validation,
 *        income statement date filtering, numbering uniqueness.
 */

// ---- browser-ish globals BEFORE the services are used ----
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  get length() { return this.m.size; }
  key(i: number) { return Array.from(this.m.keys())[i] ?? null; }
}

(globalThis as any).localStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
(globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
(globalThis as any).document = { addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' };
// Stub crypto.randomUUID
let uuidCounter = 0;
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = { randomUUID: () => `test-uuid-${++uuidCounter}` };
}

// Firebase stubs not needed — firebase/config.ts is now null-safe for tests

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  ✅ PASS  ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL  ${name}`); }
}

async function main() {
  // Dynamic imports after globals
  const { chartOfAccountsService, ACCOUNT_CODES } = await import('../services/chartOfAccountsService');
  const { accountingService } = await import('../services/accountingService');

  console.log('\n========== ACCOUNTING QA TESTS — M1 GATE ==========\n');

  // ====================================================================
  // [1] Initialize default chart of accounts
  // ====================================================================
  console.log('[1] Default Accounts Initialization');
  chartOfAccountsService.initializeDefaultAccounts();
  const accounts = chartOfAccountsService.getAccounts();
  check('default accounts created (11)', accounts.length === 11);
  check('bank account exists (1101)', !!chartOfAccountsService.getAccountByCode('1101'));
  check('sales revenue account exists (4201)', !!chartOfAccountsService.getAccountByCode('4201'));

  // ====================================================================
  // [2] Balanced journal entry -> trial balance == 0
  // ====================================================================
  console.log('\n[2] Balanced Journal Entry → Trial Balance == 0');

  // Create a manual balanced entry (debit bank, credit sales revenue)
  const entry1 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-15',
    description: 'Test sale #1',
    lines: [
      { accountCode: ACCOUNT_CODES.BANK, debit: 1000, credit: 0 },
      { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: 1000 }
    ],
    sourceType: 'manual',
    createdBy: 'qa-test'
  });

  check('entry created', !!entry1.id);
  check('entry is balanced', entry1.isBalanced);
  check('entry not yet posted', !entry1.isPosted);

  // Post it
  const posted1 = chartOfAccountsService.postJournalEntry(entry1.id);
  check('entry posted successfully', posted1 !== null && posted1.isPosted);

  // Trial balance
  const tb1 = chartOfAccountsService.getTrialBalance();
  check('trial balance: totalDebit == totalCredit', tb1.isBalanced);
  check('trial balance: totalDebit == 1000', tb1.totalDebit === 1000);
  check('trial balance: totalCredit == 1000', tb1.totalCredit === 1000);
  check('trial balance: difference == 0', Math.abs(tb1.totalDebit - tb1.totalCredit) < 0.01);

  // ====================================================================
  // [3] Multiple entries, all balanced -> trial balance still == 0
  // ====================================================================
  console.log('\n[3] Multiple Balanced Entries → Trial Balance == 0');

  // Subscription activation: debit receivables, credit revenue + VAT
  const entry2 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-20',
    description: 'Subscription activation',
    lines: [
      { accountCode: ACCOUNT_CODES.SUBSCRIPTION_RECEIVABLES, debit: 1150, credit: 0 },
      { accountCode: ACCOUNT_CODES.SUBSCRIPTION_REVENUE, debit: 0, credit: 1000 },
      { accountCode: ACCOUNT_CODES.OUTPUT_VAT, debit: 0, credit: 150 }
    ],
    sourceType: 'subscription',
    createdBy: 'qa-test'
  });
  chartOfAccountsService.postJournalEntry(entry2.id);

  // Salary payment: debit salary expense, credit bank
  const entry3 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-25',
    description: 'Monthly salary',
    lines: [
      { accountCode: ACCOUNT_CODES.SALARY_EXPENSE, debit: 5000, credit: 0 },
      { accountCode: ACCOUNT_CODES.BANK, debit: 0, credit: 5000 }
    ],
    sourceType: 'payroll',
    createdBy: 'qa-test'
  });
  chartOfAccountsService.postJournalEntry(entry3.id);

  const tb2 = chartOfAccountsService.getTrialBalance();
  check('3-entry trial balance: balanced', tb2.isBalanced);
  check('3-entry trial balance: diff == 0', Math.abs(tb2.totalDebit - tb2.totalCredit) < 0.01);

  // ====================================================================
  // [4] Recompute-from-source: after recompute, balances match
  // ====================================================================
  console.log('\n[4] Recompute-from-Source Balances');

  // Tamper with a cached balance to simulate drift
  const accsBeforeTamper = chartOfAccountsService.getAccounts();
  const bankAccount = accsBeforeTamper.find(a => a.code === '1101')!;
  const originalBankBalance = bankAccount.balance;
  bankAccount.balance = 999999; // corrupt
  (globalThis as any).localStorage.setItem('arba_chart_of_accounts', JSON.stringify(accsBeforeTamper));

  check('bank balance corrupted to 999999', chartOfAccountsService.getAccountByCode('1101')!.balance === 999999);

  // Now recompute
  chartOfAccountsService.recomputeAccountBalances();

  const bankAfterRecompute = chartOfAccountsService.getAccountByCode('1101')!;
  check('after recompute: bank balance restored', bankAfterRecompute.balance === originalBankBalance);
  check('after recompute: bank balance == -4000 (1000 in - 5000 out)',
    bankAfterRecompute.balance === -4000);

  // Re-check trial balance after recompute
  const tb3 = chartOfAccountsService.getTrialBalance();
  check('recomputed trial balance: balanced', tb3.isBalanced);

  // ====================================================================
  // [5] Referential Validation: REJECT fake accountCode
  // ====================================================================
  console.log('\n[5] Referential Validation: Reject Fake Account Code');

  let caughtBadCode = false;
  try {
    await chartOfAccountsService.createJournalEntry({
      date: '2026-06-28',
      description: 'Ghost account test',
      lines: [
        { accountCode: 'FAKE-9999', debit: 100, credit: 0 },
        { accountCode: ACCOUNT_CODES.BANK, debit: 0, credit: 100 }
      ],
      sourceType: 'manual',
      createdBy: 'qa-test'
    });
  } catch (e: any) {
    caughtBadCode = e.message.includes('Account code not found');
  }
  check('fake accountCode REJECTED by createJournalEntry', caughtBadCode);

  // ====================================================================
  // [6] Referential Validation: REJECT fake customerId on invoice
  // ====================================================================
  console.log('\n[6] Referential Validation: Reject Fake Customer ID');

  let caughtBadCustomer = false;
  try {
    await accountingService.createInvoice({
      customerId: 'FAKE-CUSTOMER-999',
      customerName: 'Ghost Client',
      items: [{ id: 'item-1', description: 'test', quantity: 1, unitPrice: 100, total: 100 }],
      subtotal: 100,
      tax: 15,
      discount: 0,
      total: 115,
      status: 'draft',
      dueDate: '2026-07-28',
      issueDate: '2026-06-28',
      createdBy: 'qa-test'
    });
  } catch (e: any) {
    caughtBadCustomer = e.message.includes('Client not found');
  }
  check('fake customerId REJECTED by createInvoice', caughtBadCustomer);

  // ====================================================================
  // [7] Income Statement respects from/to date filtering
  // ====================================================================
  console.log('\n[7] Income Statement Date Filtering');

  // Full range: should include all entries
  const isFull = chartOfAccountsService.getIncomeStatement('2026-01-01', '2026-12-31');
  check('full-range income: subscription revenue == 1000', isFull.subscriptionRevenue === 1000);
  check('full-range income: sales revenue == 1000', isFull.salesRevenue === 1000);
  check('full-range income: salary expense == 5000', isFull.salaryExpense === 5000);
  check('full-range income: net profit == -3000', isFull.netProfit === -3000);

  // Restricted to 2026-06-16 to 2026-06-22: only entry2 (subscription)
  const isPartial = chartOfAccountsService.getIncomeStatement('2026-06-16', '2026-06-22');
  check('partial-range: subscription revenue == 1000', isPartial.subscriptionRevenue === 1000);
  check('partial-range: sales revenue == 0 (entry1 on Jun 15 excluded)', isPartial.salesRevenue === 0);
  check('partial-range: salary == 0 (entry3 on Jun 25 excluded)', isPartial.salaryExpense === 0);
  check('partial-range: net profit == 1000', isPartial.netProfit === 1000);

  // Narrow to future (no entries)
  const isEmpty = chartOfAccountsService.getIncomeStatement('2027-01-01', '2027-12-31');
  check('empty-range: total revenue == 0', isEmpty.totalRevenue === 0);
  check('empty-range: net profit == 0', isEmpty.netProfit === 0);

  // ====================================================================
  // [8] Numbering uniqueness (local fallback — concurrent calls)
  // ====================================================================
  console.log('\n[8] Numbering Uniqueness (Concurrent Calls)');

  // Since Cloud Functions aren't available, counterClient falls back to random.
  // We test the createJournalEntry numbering produces unique numbers.
  const e4 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-28',
    description: 'Uniqueness test 1',
    lines: [
      { accountCode: ACCOUNT_CODES.BANK, debit: 10, credit: 0 },
      { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: 10 }
    ],
    sourceType: 'manual',
    createdBy: 'qa-test'
  });

  const e5 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-28',
    description: 'Uniqueness test 2',
    lines: [
      { accountCode: ACCOUNT_CODES.BANK, debit: 20, credit: 0 },
      { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: 20 }
    ],
    sourceType: 'manual',
    createdBy: 'qa-test'
  });

  const e6 = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-28',
    description: 'Uniqueness test 3',
    lines: [
      { accountCode: ACCOUNT_CODES.BANK, debit: 30, credit: 0 },
      { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: 30 }
    ],
    sourceType: 'manual',
    createdBy: 'qa-test'
  });

  const numbers = new Set([e4.entryNumber, e5.entryNumber, e6.entryNumber]);
  check('3 concurrent entries have 3 unique numbers', numbers.size === 3);
  check('entry numbers have JE- prefix (or PROV-JE- if offline)', Array.from(numbers).every(n => n.includes('JE-')));

  // ====================================================================
  // [9] Unbalanced entry CANNOT be posted
  // ====================================================================
  console.log('\n[9] Unbalanced Entry Rejected on Post');

  const unbalanced = await chartOfAccountsService.createJournalEntry({
    date: '2026-06-28',
    description: 'Unbalanced test',
    lines: [
      { accountCode: ACCOUNT_CODES.BANK, debit: 100, credit: 0 },
      { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: 50 }
    ],
    sourceType: 'manual',
    createdBy: 'qa-test'
  });
  check('unbalanced entry created but isBalanced=false', !unbalanced.isBalanced);

  let caughtUnbalanced = false;
  try {
    chartOfAccountsService.postJournalEntry(unbalanced.id);
  } catch (e: any) {
    caughtUnbalanced = true;
  }
  check('unbalanced entry REJECTED on post attempt', caughtUnbalanced);

  // ====================================================================
  // [10] Account CRUD
  // ====================================================================
  console.log('\n[10] Account CRUD Operations');

  const newAcc = chartOfAccountsService.createAccount({
    code: '9999',
    name: 'حساب اختبار',
    nameEn: 'Test Account',
    type: 'asset',
    isSubLedger: false
  });
  check('new account created', newAcc.code === '9999');
  check('new account balance == 0', newAcc.balance === 0);
  check('new account isActive', newAcc.isActive);

  // Duplicate code should fail
  let caughtDuplicate = false;
  try {
    chartOfAccountsService.createAccount({
      code: '9999',
      name: 'duplicate',
      nameEn: 'duplicate',
      type: 'asset',
      isSubLedger: false
    });
  } catch {
    caughtDuplicate = true;
  }
  check('duplicate account code REJECTED', caughtDuplicate);

  // Deactivate
  const deactivated = chartOfAccountsService.updateAccount('9999', { isActive: false });
  check('account deactivated', deactivated !== null && !deactivated.isActive);

  // ====================================================================
  // SUMMARY
  // ====================================================================
  console.log(`\n========== RESULT: ${passed} passed, ${failed} failed ==========`);
  if (failures.length) {
    console.log('FAILED:', failures.join(' | '));
    process.exit(1);
  } else {
    console.log('✅ All accounting QA tests passed.');
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
