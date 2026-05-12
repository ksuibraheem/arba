/**
 * ARBA v7.0 — Quote Snapshot Service
 * خدمة تجميد العروض — لقطات غير قابلة للتعديل
 * 
 * PURPOSE:
 * - Freeze a quote at a specific timestamp → immutable snapshot
 * - Compare two snapshots → SyncDiffReport showing item-by-item changes
 * - Store snapshots in localStorage (with optional Firebase sync)
 * 
 * ⚠️ MIDDLEWARE: Does NOT modify calculateProjectCosts().
 */

import { CognitiveEngineOutput, CognitiveOutputItem } from './cognitiveCalculations';

// =================== Types ===================

export interface QuoteSnapshot {
  id: string;
  projectId: string;
  projectName: string;
  
  // Metadata
  createdAt: Date;
  createdBy: string;               // Engineer name
  version: number;                 // Auto-increment per project
  label?: string;                  // "Initial Estimate", "After Client Revision", etc.
  
  // Frozen data
  engineOutput: CognitiveEngineOutput;
  totalCost_SAR: number;
  costPerSqm_SAR: number;
  buildArea_m2: number;
  
  // Flags
  isFrozen: true;                  // Always true — immutable marker
  isBaseline: boolean;             // Is this the baseline for comparison?
}

export interface DiffItem {
  itemId: string;
  itemName: string;
  field: 'qty' | 'unit' | 'waste' | 'removed' | 'added';
  
  oldValue: number | string;
  newValue: number | string;
  changePercent: number;           // % change from old → new
}

export interface SyncDiffReport {
  snapshotA_id: string;
  snapshotB_id: string;
  snapshotA_label: string;
  snapshotB_label: string;
  
  generatedAt: Date;
  
  // Summary
  totalItemsA: number;
  totalItemsB: number;
  addedItems: number;
  removedItems: number;
  changedItems: number;
  unchangedItems: number;
  
  // Cost delta
  costDelta_SAR: number;
  costDeltaPercent: number;
  
  // Details
  diffs: DiffItem[];
}

// =================== Storage Keys ===================

const SNAPSHOTS_KEY = 'arba_quote_snapshots';

// =================== Service ===================

class QuoteSnapshotService {

  /**
   * Freeze the current engine output into an immutable snapshot.
   */
  freezeQuote(
    projectId: string,
    projectName: string,
    engineOutput: CognitiveEngineOutput,
    totalCost: number,
    buildArea: number,
    createdBy: string,
    label?: string,
    isBaseline: boolean = false,
  ): QuoteSnapshot {
    const existing = this.getProjectSnapshots(projectId);
    const version = existing.length + 1;

    const snapshot: QuoteSnapshot = {
      id: `snap_${projectId}_v${version}_${Date.now()}`,
      projectId,
      projectName,
      createdAt: new Date(),
      createdBy,
      version,
      label: label || `v${version}`,
      engineOutput,
      totalCost_SAR: totalCost,
      costPerSqm_SAR: buildArea > 0 ? Math.round(totalCost / buildArea) : 0,
      buildArea_m2: buildArea,
      isFrozen: true,
      isBaseline,
    };

    const all = this.getAllSnapshots();
    all.push(snapshot);
    this.saveSnapshots(all);
    
    return snapshot;
  }

  /**
   * Get all snapshots for a project, sorted by version.
   */
  getProjectSnapshots(projectId: string): QuoteSnapshot[] {
    return this.getAllSnapshots()
      .filter(s => s.projectId === projectId)
      .sort((a, b) => a.version - b.version);
  }

  /**
   * Compare two snapshots → SyncDiffReport with item-by-item comparison.
   */
  compareSnapshots(snapshotA: QuoteSnapshot, snapshotB: QuoteSnapshot): SyncDiffReport {
    const flatA = this.flattenOutput(snapshotA.engineOutput);
    const flatB = this.flattenOutput(snapshotB.engineOutput);

    const diffs: DiffItem[] = [];
    let addedCount = 0;
    let removedCount = 0;
    let changedCount = 0;
    let unchangedCount = 0;

    // Check items in A
    for (const [id, itemA] of flatA.entries()) {
      const itemB = flatB.get(id);
      if (!itemB) {
        // Removed in B
        removedCount++;
        diffs.push({
          itemId: id,
          itemName: itemA.name.ar,
          field: 'removed',
          oldValue: itemA.grossQty,
          newValue: 0,
          changePercent: -100,
        });
      } else if (Math.abs(itemA.grossQty - itemB.grossQty) > 0.01) {
        // Changed qty
        changedCount++;
        const pct = itemA.grossQty > 0
          ? ((itemB.grossQty - itemA.grossQty) / itemA.grossQty) * 100
          : 100;
        diffs.push({
          itemId: id,
          itemName: itemA.name.ar,
          field: 'qty',
          oldValue: itemA.grossQty,
          newValue: itemB.grossQty,
          changePercent: Math.round(pct * 10) / 10,
        });
      } else {
        unchangedCount++;
      }
    }

    // Check items only in B (added)
    for (const [id, itemB] of flatB.entries()) {
      if (!flatA.has(id)) {
        addedCount++;
        diffs.push({
          itemId: id,
          itemName: itemB.name.ar,
          field: 'added',
          oldValue: 0,
          newValue: itemB.grossQty,
          changePercent: 100,
        });
      }
    }

    const costDelta = snapshotB.totalCost_SAR - snapshotA.totalCost_SAR;
    const costDeltaPct = snapshotA.totalCost_SAR > 0
      ? (costDelta / snapshotA.totalCost_SAR) * 100
      : 0;

    return {
      snapshotA_id: snapshotA.id,
      snapshotB_id: snapshotB.id,
      snapshotA_label: snapshotA.label || `v${snapshotA.version}`,
      snapshotB_label: snapshotB.label || `v${snapshotB.version}`,
      generatedAt: new Date(),
      totalItemsA: flatA.size,
      totalItemsB: flatB.size,
      addedItems: addedCount,
      removedItems: removedCount,
      changedItems: changedCount,
      unchangedItems: unchangedCount,
      costDelta_SAR: Math.round(costDelta),
      costDeltaPercent: Math.round(costDeltaPct * 10) / 10,
      diffs: diffs.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)),
    };
  }

  /**
   * Delete a snapshot (admin only).
   */
  deleteSnapshot(snapshotId: string): void {
    const all = this.getAllSnapshots().filter(s => s.id !== snapshotId);
    this.saveSnapshots(all);
  }

  // =================== Internal ===================

  private flattenOutput(output: CognitiveEngineOutput): Map<string, CognitiveOutputItem> {
    const map = new Map<string, CognitiveOutputItem>();
    const categories: (keyof CognitiveEngineOutput)[] = [
      'excavation', 'substructure', 'superstructure', 'masonry',
      'consumables', 'finishes', 'facades',
      'insulation', 'waterproofing', 'fireProtection',
      'testing', 'safety', 'summerAdditives', 'mep',
    ];
    for (const cat of categories) {
      const items = output[cat] as CognitiveOutputItem[] | undefined;
      if (Array.isArray(items)) {
        items.forEach(item => map.set(item.id, item));
      }
    }
    return map;
  }

  private getAllSnapshots(): QuoteSnapshot[] {
    try {
      return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private saveSnapshots(snapshots: QuoteSnapshot[]): void {
    // Keep max 100 snapshots
    if (snapshots.length > 100) snapshots = snapshots.slice(-100);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  }
}

export const quoteSnapshotService = new QuoteSnapshotService();
