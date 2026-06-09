/**
 * ARBA V11.3 — Brain Daily Diagnostic Service
 * يشغّل التشخيص الذاتي مرة يومياً (عند فتح التطبيق) ويحقن الاقتراحات الحرجة
 */

import { brainSelfDiagnostic } from './brainSelfDiagnostic';

const SUGGESTIONS_KEY = 'arba_brain_dev_suggestions';
const LAST_DIAG_KEY = 'arba_brain_last_diagnostic';
const DIAG_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DevSuggestion {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  titleAr: string;
  descriptionAr: string;
  impact: string;
  status: 'pending' | 'dismissed' | 'implemented';
  createdAt: string;
  dismissedAt?: string;
}

class BrainDailyDiagnostic {
  runDiagnosticIfDue(): { ran: boolean; suggestions: DevSuggestion[] } {
    const lastRun = localStorage.getItem(LAST_DIAG_KEY);
    const now = Date.now();

    if (lastRun && (now - new Date(lastRun).getTime()) < DIAG_INTERVAL_MS) {
      return { ran: false, suggestions: this.getPendingSuggestions() };
    }

    // Run diagnostic
    try {
      const report = brainSelfDiagnostic.runFullDiagnostic();
      const existing = this.getAllSuggestions();
      const existingIds = new Set(existing.map(s => s.id));

      // Add new suggestions (only critical and high)
      for (const sugg of report.suggestions) {
        if ((sugg.priority === 'critical' || sugg.priority === 'high') && !existingIds.has(sugg.id)) {
          existing.push({
            id: sugg.id,
            priority: sugg.priority,
            area: sugg.area,
            titleAr: sugg.titleAr || sugg.title,
            descriptionAr: sugg.descriptionAr || sugg.description,
            impact: sugg.impact || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }

      this.saveSuggestions(existing);
      localStorage.setItem(LAST_DIAG_KEY, new Date().toISOString());

      return { ran: true, suggestions: this.getPendingSuggestions() };
    } catch (err) {
      console.warn('[DailyDiagnostic] Failed:', err);
      return { ran: false, suggestions: this.getPendingSuggestions() };
    }
  }

  getPendingSuggestions(): DevSuggestion[] {
    return this.getAllSuggestions().filter(s => s.status === 'pending');
  }

  getCriticalSuggestions(): DevSuggestion[] {
    return this.getPendingSuggestions().filter(s => s.priority === 'critical');
  }

  dismissSuggestion(id: string): void {
    const all = this.getAllSuggestions();
    const item = all.find(s => s.id === id);
    if (item) {
      item.status = 'dismissed';
      item.dismissedAt = new Date().toISOString();
      this.saveSuggestions(all);
    }
  }

  markImplemented(id: string): void {
    const all = this.getAllSuggestions();
    const item = all.find(s => s.id === id);
    if (item) {
      item.status = 'implemented';
      this.saveSuggestions(all);
    }
  }

  private getAllSuggestions(): DevSuggestion[] {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY) || '[]'); } catch { return []; }
  }

  private saveSuggestions(suggs: DevSuggestion[]): void {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggs));
  }
}

export const brainDailyDiagnostic = new BrainDailyDiagnostic();
