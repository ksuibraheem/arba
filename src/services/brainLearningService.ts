/**
 * ARBA V8.2 — Brain Learning Service (M5)
 * خدمة التعلّم الذاتي — يتعلم من تعديلات المستخدم
 * 
 * عند تعديل سعر يدوياً → يُحفظ كـ "درس"
 * عند تكرار نفس التعديل 3+ مرات → يُحدّث الـ benchmark تلقائياً
 */

export interface PriceLearning {
  id: string;
  ruleId: string;          // e.g., 'plaster_int'
  description: string;     // وصف البند
  originalRate: number;    // السعر الأصلي
  correctedRate: number;   // السعر المعدّل
  reason?: string;         // سبب التعديل
  source: 'manual' | 'comparison' | 'audit';
  timestamp: string;
  projectName?: string;
}

export interface LearningStats {
  totalLearnings: number;
  autoUpdatedRules: string[];
  pendingLearnings: Record<string, PriceLearning[]>; // grouped by ruleId
}

const STORAGE_KEY = 'arba_brain_learnings';
const AUTO_UPDATE_THRESHOLD = 3; // بعد 3 تعديلات متشابهة → تحديث تلقائي

class BrainLearningService {
  /**
   * Record a price correction
   */
  learn(learning: Omit<PriceLearning, 'id' | 'timestamp'>): PriceLearning {
    const entry: PriceLearning = {
      ...learning,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };

    const learnings = this.getAll();
    learnings.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learnings));

    // Check if auto-update threshold reached
    this.checkAutoUpdate(entry.ruleId);

    return entry;
  }

  /**
   * Get all learnings
   */
  getAll(): PriceLearning[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get learnings for a specific rule
   */
  getByRule(ruleId: string): PriceLearning[] {
    return this.getAll().filter(l => l.ruleId === ruleId);
  }

  /**
   * Check if a rule should be auto-updated based on consistent corrections
   */
  private checkAutoUpdate(ruleId: string): { shouldUpdate: boolean; suggestedRate: number } {
    const ruleLearnings = this.getByRule(ruleId);
    
    if (ruleLearnings.length < AUTO_UPDATE_THRESHOLD) {
      return { shouldUpdate: false, suggestedRate: 0 };
    }

    // Get the last N corrections
    const recent = ruleLearnings.slice(-AUTO_UPDATE_THRESHOLD);
    
    // Check if corrections are consistent (within 20% of each other)
    const rates = recent.map(l => l.correctedRate);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const allConsistent = rates.every(r => Math.abs(r - avg) / avg < 0.2);

    if (allConsistent) {
      // Store auto-update suggestion
      const updates = this.getAutoUpdates();
      updates[ruleId] = {
        suggestedRate: Math.round(avg),
        learningCount: ruleLearnings.length,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('arba_brain_auto_updates', JSON.stringify(updates));
      return { shouldUpdate: true, suggestedRate: Math.round(avg) };
    }

    return { shouldUpdate: false, suggestedRate: 0 };
  }

  /**
   * Get auto-update suggestions
   */
  getAutoUpdates(): Record<string, { suggestedRate: number; learningCount: number; lastUpdated: string }> {
    try {
      const raw = localStorage.getItem('arba_brain_auto_updates');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get learning statistics
   */
  getStats(): LearningStats {
    const all = this.getAll();
    const grouped: Record<string, PriceLearning[]> = {};

    for (const l of all) {
      if (!grouped[l.ruleId]) grouped[l.ruleId] = [];
      grouped[l.ruleId].push(l);
    }

    const autoUpdates = this.getAutoUpdates();

    return {
      totalLearnings: all.length,
      autoUpdatedRules: Object.keys(autoUpdates),
      pendingLearnings: grouped,
    };
  }

  /**
   * Clear all learnings
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('arba_brain_auto_updates');
  }
}

export const brainLearningService = new BrainLearningService();
