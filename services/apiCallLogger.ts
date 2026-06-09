/**
 * ARBA V11.3 — API Call Logger
 * يسجل كل استدعاءات الـ API مع البيانات الوصفية للمراقبة والتحليل
 */

export interface APICallLog {
  id: string;
  timestamp: Date;
  agentId: string;           // which AI agent made the call
  agentNameAr: string;       // Arabic name
  endpoint: string;          // URL or Firestore path
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'BATCH';
  statusCode: number;        // 200, 400, 500, etc.
  durationMs: number;        // response time
  requestSizeBytes: number;
  responseSizeBytes: number;
  success: boolean;
  error?: string;
  costEstimate?: number;     // SAR cost per call
}

export interface APICallStats {
  totalCalls: number;
  callsToday: number;
  successRate: number;
  avgDurationMs: number;
  totalCostSAR: number;
  byAgent: Record<string, { calls: number; avgMs: number; errors: number }>;
  byEndpoint: Record<string, { calls: number; avgMs: number }>;
  byHour: number[];          // 24 slots
  byStatus: Record<number, number>; // status code → count
}

const STORAGE_KEY = 'arba_api_call_logs';
const MAX_LOGS = 1000;

class APICallLogger {
  
  /** Log an API call */
  log(entry: Omit<APICallLog, 'id' | 'timestamp'>): APICallLog {
    const log: APICallLog = {
      ...entry,
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
    };
    
    const logs = this.getLogs();
    logs.unshift(log);
    if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
    this.saveLogs(logs);
    
    return log;
  }
  
  /** Get all logs (optionally filtered) */
  getLogs(filters?: {
    agentId?: string;
    startDate?: Date;
    endDate?: Date;
    statusCode?: number;
    limit?: number;
  }): APICallLog[] {
    try {
      let logs: APICallLog[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      if (filters) {
        if (filters.agentId) logs = logs.filter(l => l.agentId === filters.agentId);
        if (filters.statusCode) logs = logs.filter(l => l.statusCode === filters.statusCode);
        if (filters.startDate) logs = logs.filter(l => new Date(l.timestamp) >= filters.startDate!);
        if (filters.endDate) logs = logs.filter(l => new Date(l.timestamp) <= filters.endDate!);
        if (filters.limit) logs = logs.slice(0, filters.limit);
      }
      
      return logs;
    } catch { return []; }
  }
  
  /** Get aggregated stats */
  getStats(): APICallStats {
    const logs = this.getLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(l => new Date(l.timestamp) >= today);
    const successLogs = logs.filter(l => l.success);
    
    const byAgent: APICallStats['byAgent'] = {};
    const byEndpoint: APICallStats['byEndpoint'] = {};
    const byHour = new Array(24).fill(0);
    const byStatus: Record<number, number> = {};
    let totalCost = 0;
    let totalDuration = 0;
    
    for (const log of logs) {
      // By agent
      if (!byAgent[log.agentId]) byAgent[log.agentId] = { calls: 0, avgMs: 0, errors: 0 };
      byAgent[log.agentId].calls++;
      byAgent[log.agentId].avgMs += log.durationMs;
      if (!log.success) byAgent[log.agentId].errors++;
      
      // By endpoint
      if (!byEndpoint[log.endpoint]) byEndpoint[log.endpoint] = { calls: 0, avgMs: 0 };
      byEndpoint[log.endpoint].calls++;
      byEndpoint[log.endpoint].avgMs += log.durationMs;
      
      // By hour
      const hour = new Date(log.timestamp).getHours();
      byHour[hour]++;
      
      // By status
      byStatus[log.statusCode] = (byStatus[log.statusCode] || 0) + 1;
      
      totalCost += log.costEstimate || 0;
      totalDuration += log.durationMs;
    }
    
    // Calculate averages
    for (const agent of Object.values(byAgent)) {
      agent.avgMs = agent.calls > 0 ? Math.round(agent.avgMs / agent.calls) : 0;
    }
    for (const ep of Object.values(byEndpoint)) {
      ep.avgMs = ep.calls > 0 ? Math.round(ep.avgMs / ep.calls) : 0;
    }
    
    return {
      totalCalls: logs.length,
      callsToday: todayLogs.length,
      successRate: logs.length > 0 ? Math.round((successLogs.length / logs.length) * 100) : 100,
      avgDurationMs: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
      totalCostSAR: Math.round(totalCost * 100) / 100,
      byAgent,
      byEndpoint,
      byHour,
      byStatus,
    };
  }
  
  /** Clear all logs */
  clearLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  private saveLogs(logs: APICallLog[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); } catch { /* storage full */ }
  }
}

export const apiCallLogger = new APICallLogger();
