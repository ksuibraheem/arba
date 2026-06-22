/**
 * Standalone sync/offline tests (no test framework needed).
 * Run: node --experimental-strip-types _sync_isolated/tests/sync.test.mts
 *
 * يحاكي قطع الإنترنت، إعادة إرسال الطابور، سلامة التسلسل (serverTimestamp)،
 * وسلوك الحفظ التلقائي للمسودة.
 */

// ---------- minimal browser-ish globals (BEFORE importing the services) ----------
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();
// Start OFFLINE so the singleton constructs in offline mode.
// (navigator is a read-only global in Node 22, so redefine it.)
Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
(globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
(globalThis as any).document = {
  addEventListener() {}, removeEventListener() {}, visibilityState: 'visible',
};

// ---------- tiny assert helpers ----------
let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failures.push(name); console.log(`  ✗ ${name}`); }
}

const { offlineBufferService } = await import('../services/offlineBufferService.ts');
const { draftAutosaveService } = await import('../services/draftAutosaveService.ts');

const BUFFER_KEY = 'arba_offline_buffer';

// ============================================================
console.log('\n[1] Offline write is buffered, never thrown, JSON-clean');
// ============================================================
let writerCalls: Array<{ path: string; id: string; data: any }> = [];
const recordingWriter = async (path: string, id: string, data: any) => {
  writerCalls.push({ path, id, data });
};

const res1 = await offlineBufferService.safeWrite(
  'projects', 'proj_1',
  { name: 'فيلا', estimatedValue: 100 },
  'update', recordingWriter, ['updatedAt']
);

check('offline write returns success+local', res1.success === true && res1.source === 'local');
check('writer NOT called while offline', writerCalls.length === 0);

const rawBuffer = (globalThis as any).localStorage.getItem(BUFFER_KEY);
check('buffer persisted to localStorage', !!rawBuffer);
const parsed = JSON.parse(rawBuffer);
const entry = parsed[0];
check('buffered data is plain (no updatedAt sentinel stored)', entry.data.updatedAt === undefined);
check('serverTimestampFields recorded for replay', JSON.stringify(entry.serverTimestampFields) === JSON.stringify(['updatedAt']));
// The whole buffer must be valid JSON with no function/sentinel leakage:
check('buffer round-trips through JSON cleanly', typeof rawBuffer === 'string' && !rawBuffer.includes('FieldValue') && !rawBuffer.includes('function'));

// ============================================================
console.log('\n[2] Reconnect → replay stamps serverTimestamp & clears buffer');
// ============================================================
writerCalls = [];
const replayResult = await offlineBufferService.syncPendingWrites(recordingWriter);
check('replay synced exactly 1 write', replayResult.synced === 1);
check('writer called once on replay', writerCalls.length === 1);
const replayed = writerCalls[0];
check('replay targeted correct doc', replayed.path === 'projects' && replayed.id === 'proj_1');
check('replay payload HAS updatedAt (re-stamped at write time)', replayed.data.updatedAt !== undefined);
check('re-stamped updatedAt is a Firestore sentinel object (not plain)', typeof replayed.data.updatedAt === 'object');
const bufferAfter = JSON.parse((globalThis as any).localStorage.getItem(BUFFER_KEY) || '[]');
check('buffer emptied after successful replay', bufferAfter.length === 0);

// ============================================================
console.log('\n[3] Replay retries (does not lose data) when writer fails');
// ============================================================
await offlineBufferService.safeWrite('projects', 'proj_2', { name: 'برج' }, 'create', recordingWriter, ['createdAt', 'updatedAt']);
const failingWriter = async () => { throw new Error('network flake'); };
const failRes = await offlineBufferService.syncPendingWrites(failingWriter);
check('failed replay synced 0', failRes.synced === 0);
const stillBuffered = JSON.parse((globalThis as any).localStorage.getItem(BUFFER_KEY) || '[]');
check('data still safe in buffer after failed replay', stillBuffered.length === 1 && stillBuffered[0].docId === 'proj_2');
check('retry count incremented (will retry later)', stillBuffered[0].retryCount === 1);
// cleanup
(globalThis as any).localStorage.removeItem(BUFFER_KEY);

// ============================================================
console.log('\n[4] Draft autosave: dedup, restore, cloudSaved flag');
// ============================================================
let liveState: any = { items: [{ id: 'a', rate: 10 }], total: 10 };
draftAutosaveService.start(() => liveState, { intervalMs: 10_000, draftId: 'proj_1' });

const t1 = draftAutosaveService.tick(false);
check('first tick saves', t1 === true);
const t2 = draftAutosaveService.tick(false);
check('second identical tick is skipped (no redundant write)', t2 === false);

liveState = { items: [{ id: 'a', rate: 12 }], total: 12 };
const t3 = draftAutosaveService.tick(false);
check('tick saves after state changes', t3 === true);

const restored = draftAutosaveService.restore<any>();
check('restore returns latest draft', !!restored && restored.state.total === 12);
check('draft marked NOT cloud-saved', restored!.cloudSaved === false);
check('hasUnsyncedDraft is true', draftAutosaveService.hasUnsyncedDraft() === true);

draftAutosaveService.markCloudSaved();
check('after markCloudSaved, hasUnsyncedDraft is false', draftAutosaveService.hasUnsyncedDraft() === false);

draftAutosaveService.clear();
check('clear removes the draft', draftAutosaveService.restore() === null);
draftAutosaveService.stop();

// ============================================================
console.log(`\n──────── RESULT: ${passed} passed, ${failures.length} failed ────────`);
if (failures.length) {
  console.log('FAILED:', failures.join(' | '));
  process.exit(1);
} else {
  console.log('✅ All sync tests passed.');
}
