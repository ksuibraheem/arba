/**
 * ARBA V8.2 — Project History Service (M4)
 * خدمة سجل المشاريع — حفظ ومقارنة عروض سابقة
 * يحفظ في localStorage لكل مشروع مُسعّر
 */

export interface ProjectSnapshot {
  id: string;
  name: string;
  fileName: string;
  region: string;
  processedAt: string;
  itemCount: number;
  classificationRate: number;
  totalCost: number;
  totalSell: number;
  totalProfit: number;
  profitMargin: number;
  categoryBreakdown: Record<string, { count: number; total: number }>;
  /** Top-level item prices for comparison */
  itemPrices: Record<string, { description: string; rate: number; total: number }>;
}

export interface PriceComparison {
  itemKey: string;
  description: string;
  currentRate: number;
  previousRate: number;
  difference: number;
  differencePercent: number;
  direction: 'up' | 'down' | 'same';
}

const STORAGE_KEY = 'arba_project_history';
const MAX_PROJECTS = 50;

class ProjectHistoryService {
  /**
   * Save a processed project snapshot
   */
  saveProject(snapshot: ProjectSnapshot): void {
    const history = this.getAll();
    
    // Check if already exists (update)
    const existingIdx = history.findIndex(p => p.id === snapshot.id);
    if (existingIdx >= 0) {
      history[existingIdx] = snapshot;
    } else {
      history.unshift(snapshot); // newest first
    }
    
    // Trim to max
    if (history.length > MAX_PROJECTS) {
      history.splice(MAX_PROJECTS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  /**
   * Get all saved projects
   */
  getAll(): ProjectSnapshot[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get a specific project by ID
   */
  getById(id: string): ProjectSnapshot | null {
    return this.getAll().find(p => p.id === id) || null;
  }

  /**
   * Get recent N projects
   */
  getRecent(n: number = 5): ProjectSnapshot[] {
    return this.getAll().slice(0, n);
  }

  /**
   * Compare two projects' item prices
   */
  compare(currentId: string, previousId: string): PriceComparison[] {
    const current = this.getById(currentId);
    const previous = this.getById(previousId);
    if (!current || !previous) return [];

    const comparisons: PriceComparison[] = [];

    for (const [key, currentItem] of Object.entries(current.itemPrices)) {
      const prevItem = previous.itemPrices[key];
      if (prevItem) {
        const diff = currentItem.rate - prevItem.rate;
        const diffPct = prevItem.rate > 0 ? (diff / prevItem.rate) * 100 : 0;
        comparisons.push({
          itemKey: key,
          description: currentItem.description,
          currentRate: currentItem.rate,
          previousRate: prevItem.rate,
          difference: diff,
          differencePercent: diffPct,
          direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
        });
      }
    }

    return comparisons.sort((a, b) => Math.abs(b.differencePercent) - Math.abs(a.differencePercent));
  }

  /**
   * Get price trend for a specific item across projects
   */
  getPriceTrend(itemKey: string): { date: string; rate: number; projectName: string }[] {
    return this.getAll()
      .filter(p => p.itemPrices[itemKey])
      .map(p => ({
        date: p.processedAt,
        rate: p.itemPrices[itemKey].rate,
        projectName: p.name,
      }))
      .reverse(); // oldest first for chart
  }

  /**
   * Delete a project from history
   */
  delete(id: string): void {
    const history = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  /**
   * Clear all history
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const projectHistoryService = new ProjectHistoryService();
