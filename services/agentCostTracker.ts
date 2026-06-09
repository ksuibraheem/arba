/**
 * ARBA V11.3 — Agent Cost Tracker
 * تتبع تكاليف عمليات الوكلاء — حالياً صفر (محلي) مع جاهزية لـ Claude/GPT
 */

export interface AgentCostEntry {
  id: string;
  agentId: string;
  agentNameAr: string;
  operation: string;
  provider: 'local' | 'claude' | 'openai' | 'google' | 'firebase';
  tokensInput?: number;
  tokensOutput?: number;
  costSAR: number;
  timestamp: Date;
}

export interface CostSummary {
  totalCostSAR: number;
  costToday: number;
  costThisWeek: number;
  costThisMonth: number;
  byAgent: Record<string, { cost: number; operations: number }>;
  byProvider: Record<string, { cost: number; calls: number }>;
  dailyHistory: { date: string; cost: number }[];
  budgetLimit: number;
  budgetRemaining: number;
  budgetUtilizationPercent: number;
}

const STORAGE_KEY = 'arba_agent_costs';
const BUDGET_KEY = 'arba_agent_budget';
const MAX_ENTRIES = 5000;

/** Pricing per 1M tokens (SAR) — 2026 rates */
const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  claude: { input: 0.011, output: 0.056 },     // Claude 3.5 Sonnet
  openai: { input: 0.019, output: 0.056 },      // GPT-4o
  google: { input: 0.0, output: 0.0 },          // Gemini free tier
  local: { input: 0.0, output: 0.0 },           // Local = free
  firebase: { input: 0.0, output: 0.0 },        // Firestore reads/writes (negligible)
};

class AgentCostTracker {
  
  /** Log a cost entry */
  track(entry: Omit<AgentCostEntry, 'id' | 'timestamp' | 'costSAR'>): AgentCostEntry {
    const pricing = TOKEN_PRICING[entry.provider] || TOKEN_PRICING.local;
    const costSAR = (
      ((entry.tokensInput || 0) / 1_000_000) * pricing.input +
      ((entry.tokensOutput || 0) / 1_000_000) * pricing.output
    );
    
    const log: AgentCostEntry = {
      ...entry,
      id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      costSAR: Math.round(costSAR * 10000) / 10000,
    };
    
    const entries = this.getEntries();
    entries.unshift(log);
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    this.saveEntries(entries);
    
    return log;
  }
  
  /** Get cost summary */
  getSummary(): CostSummary {
    const entries = this.getEntries();
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now); monthStart.setDate(1);
    
    let totalCost = 0, costToday = 0, costWeek = 0, costMonth = 0;
    const byAgent: CostSummary['byAgent'] = {};
    const byProvider: CostSummary['byProvider'] = {};
    const dailyMap: Record<string, number> = {};
    
    for (const e of entries) {
      const ts = new Date(e.timestamp);
      totalCost += e.costSAR;
      if (ts >= todayStart) costToday += e.costSAR;
      if (ts >= weekStart) costWeek += e.costSAR;
      if (ts >= monthStart) costMonth += e.costSAR;
      
      if (!byAgent[e.agentId]) byAgent[e.agentId] = { cost: 0, operations: 0 };
      byAgent[e.agentId].cost += e.costSAR;
      byAgent[e.agentId].operations++;
      
      if (!byProvider[e.provider]) byProvider[e.provider] = { cost: 0, calls: 0 };
      byProvider[e.provider].cost += e.costSAR;
      byProvider[e.provider].calls++;
      
      const dateKey = ts.toISOString().split('T')[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + e.costSAR;
    }
    
    const budgetLimit = this.getBudgetLimit();
    
    return {
      totalCostSAR: Math.round(totalCost * 100) / 100,
      costToday: Math.round(costToday * 100) / 100,
      costThisWeek: Math.round(costWeek * 100) / 100,
      costThisMonth: Math.round(costMonth * 100) / 100,
      byAgent,
      byProvider,
      dailyHistory: Object.entries(dailyMap).map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date)),
      budgetLimit,
      budgetRemaining: budgetLimit - Math.round(costMonth * 100) / 100,
      budgetUtilizationPercent: budgetLimit > 0 ? Math.round((costMonth / budgetLimit) * 100) : 0,
    };
  }
  
  /** Set monthly budget limit (SAR) */
  setBudgetLimit(limitSAR: number): void {
    localStorage.setItem(BUDGET_KEY, String(limitSAR));
  }
  
  getBudgetLimit(): number {
    return Number(localStorage.getItem(BUDGET_KEY) || '500');
  }
  
  /** Check if budget exceeded */
  isBudgetExceeded(): boolean {
    const summary = this.getSummary();
    return summary.budgetRemaining <= 0;
  }
  
  private getEntries(): AgentCostEntry[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  
  private saveEntries(entries: AgentCostEntry[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
  }
}

export const agentCostTracker = new AgentCostTracker();
