/**
 * ARBA V10.0 — Brain Version Control
 * نظام إصدارات الدماغ — يتتبع كل تصحيح بالتاريخ والمصدر
 *
 * كل تصحيح = patch — يُسجَّل مع:
 * - المصدر (human / claude / auto_detector / learning)
 * - التاريخ
 * - البيانات القديمة والجديدة
 * - إمكانية الرجوع (undo)
 */

// =================== Types ===================

export interface CorrectionPatch {
  id: string;
  version: string;          // e.g., "10.0.47" = V10 patch #47
  source: 'human' | 'claude' | 'auto_detector' | 'learning' | 'compliance';
  createdAt: Date;
  
  // What changed
  itemId: string;
  field: 'price' | 'qty' | 'category' | 'unit' | 'existence' | 'waste_factor';
  oldValue: unknown;
  newValue: unknown;
  
  // Why
  reason: string;
  reasonAr: string;
  confidence: number;       // 0-1
  
  // Status
  status: 'pending' | 'applied' | 'rejected' | 'reverted';
  appliedAt?: Date;
  appliedBy?: string;
  
  // For undo
  revertible: boolean;
}

export interface BrainVersion {
  version: string;          // "10.0.47"
  major: number;            // 10
  minor: number;            // 0
  patch: number;            // 47
  totalPatches: number;
  appliedPatches: number;
  rejectedPatches: number;
  pendingPatches: number;
  maturityScore: number;
  lastPatchDate: Date | null;
  changelog: string[];
}

// =================== Constants ===================

const PATCHES_STORAGE_KEY = 'arba_brain_patches';
const VERSION_STORAGE_KEY = 'arba_brain_version';
const MAJOR = 10;
const MINOR = 0;

// =================== Service ===================

class BrainVersionControl {

  /**
   * Create a new correction patch
   */
  createPatch(params: {
    source: CorrectionPatch['source'];
    itemId: string;
    field: CorrectionPatch['field'];
    oldValue: unknown;
    newValue: unknown;
    reason: string;
    reasonAr: string;
    confidence: number;
  }): CorrectionPatch {
    const patches = this.getPatches();
    const patchNumber = patches.length + 1;

    const patch: CorrectionPatch = {
      id: `patch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      version: `${MAJOR}.${MINOR}.${patchNumber}`,
      source: params.source,
      createdAt: new Date(),
      itemId: params.itemId,
      field: params.field,
      oldValue: params.oldValue,
      newValue: params.newValue,
      reason: params.reason,
      reasonAr: params.reasonAr,
      confidence: params.confidence,
      status: params.confidence >= 0.8 ? 'applied' : 'pending', // Auto-apply high confidence
      appliedAt: params.confidence >= 0.8 ? new Date() : undefined,
      revertible: true,
    };

    patches.push(patch);
    this.savePatches(patches);

    return patch;
  }

  /**
   * Apply a pending patch
   */
  applyPatch(patchId: string, appliedBy: string = 'system'): boolean {
    const patches = this.getPatches();
    const patch = patches.find(p => p.id === patchId);
    if (!patch || patch.status !== 'pending') return false;

    patch.status = 'applied';
    patch.appliedAt = new Date();
    patch.appliedBy = appliedBy;

    this.savePatches(patches);
    return true;
  }

  /**
   * Reject a pending patch
   */
  rejectPatch(patchId: string): boolean {
    const patches = this.getPatches();
    const patch = patches.find(p => p.id === patchId);
    if (!patch || patch.status !== 'pending') return false;

    patch.status = 'rejected';
    this.savePatches(patches);
    return true;
  }

  /**
   * Revert an applied patch (undo)
   */
  revertPatch(patchId: string): boolean {
    const patches = this.getPatches();
    const patch = patches.find(p => p.id === patchId);
    if (!patch || patch.status !== 'applied' || !patch.revertible) return false;

    patch.status = 'reverted';
    this.savePatches(patches);
    return true;
  }

  /**
   * Get current brain version info
   */
  getVersion(): BrainVersion {
    const patches = this.getPatches();
    const applied = patches.filter(p => p.status === 'applied');
    const rejected = patches.filter(p => p.status === 'rejected');
    const pending = patches.filter(p => p.status === 'pending');

    const patchNumber = applied.length;
    const lastPatch = applied.length > 0 ? applied[applied.length - 1] : null;

    // Generate changelog from last 10 patches
    const changelog = applied.slice(-10).map(p =>
      `v${p.version}: ${p.reasonAr} (${p.source})`
    );

    return {
      version: `${MAJOR}.${MINOR}.${patchNumber}`,
      major: MAJOR,
      minor: MINOR,
      patch: patchNumber,
      totalPatches: patches.length,
      appliedPatches: applied.length,
      rejectedPatches: rejected.length,
      pendingPatches: pending.length,
      maturityScore: this.calculateMaturity(applied.length),
      lastPatchDate: lastPatch ? new Date(lastPatch.appliedAt || lastPatch.createdAt) : null,
      changelog,
    };
  }

  /**
   * Get all patches (optionally filtered)
   */
  getPatches(status?: CorrectionPatch['status']): CorrectionPatch[] {
    try {
      const raw = localStorage.getItem(PATCHES_STORAGE_KEY);
      const all: CorrectionPatch[] = raw ? JSON.parse(raw) : [];
      return status ? all.filter(p => p.status === status) : all;
    } catch {
      return [];
    }
  }

  /**
   * Get pending patches count (for UI badge)
   */
  getPendingCount(): number {
    return this.getPatches('pending').length;
  }

  /**
   * Export patches for Firestore sync
   */
  exportForSync(): { patches: CorrectionPatch[]; version: BrainVersion } {
    return {
      patches: this.getPatches(),
      version: this.getVersion(),
    };
  }

  // ═══════════════════════════════════════════════════
  // Internal
  // ═══════════════════════════════════════════════════

  private savePatches(patches: CorrectionPatch[]): void {
    localStorage.setItem(PATCHES_STORAGE_KEY, JSON.stringify(patches));
  }

  private calculateMaturity(appliedPatches: number): number {
    // Base: 50% (Phase 0 complete)
    // Each patch adds ~0.5% up to 98%
    return Math.min(98, 50 + Math.round(appliedPatches * 0.5));
  }
}

export const brainVersionControl = new BrainVersionControl();
