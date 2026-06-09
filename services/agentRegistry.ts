/**
 * ARBA V11.3 — Agent Registry (سجل الوكلاء المركزي)
 * Central registry of all AI agents in the platform
 * 
 * يوفر واجهة موحدة لعرض وتتبع وتشغيل جميع وكلاء الذكاء الاصطناعي
 */

export type AgentStatus = 'active' | 'idle' | 'error' | 'disabled';
export type AgentCategory = 'core' | 'learning' | 'intelligence' | 'monitoring' | 'file';

export interface AgentInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  category: AgentCategory;
  sourceFile: string;
  status: AgentStatus;
  capabilities: string[];
  stats: {
    totalRuns: number;
    runsToday: number;
    avgExecutionMs: number;
    lastRunAt: Date | null;
    successRate: number;
    errors: number;
  };
}

export interface AgentRunLog {
  agentId: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  input?: string;
  output?: string;
  error?: string;
}

const REGISTRY_KEY = 'arba_agent_registry';
const LOGS_KEY = 'arba_agent_logs';

class AgentRegistry {
  private agents: Map<string, AgentInfo> = new Map();

  constructor() {
    this.registerAllAgents();
    this.loadStats();
  }

  private registerAllAgents(): void {
    const agentDefs: Omit<AgentInfo, 'stats'>[] = [
      {
        id: 'item_cost_analyzer',
        nameAr: 'محلل التكلفة',
        nameEn: 'Item Cost Analyzer',
        descriptionAr: 'تحليل تكلفة كل بند من الصفر: مواد + عمالة + معدات + هدر + نفقات عامة + ربح',
        descriptionEn: 'Analyzes item costs from scratch: materials + labor + equipment + waste + overhead + profit',
        icon: '🧮',
        category: 'core',
        sourceFile: 'services/itemCostAnalyzer.ts',
        status: 'active',
        capabilities: ['80+ وصفة تكلفة', '13,005 عنصر', 'تحقق متعدد المصادر', 'Smart Profit Capping'],
      },
      {
        id: 'cognitive_engine',
        nameAr: 'المحرك المعرفي',
        nameEn: 'Cognitive Engine',
        descriptionAr: 'حساب الكميات من المساحات والأبعاد طبقاً لكود البناء السعودي SBC 301/304',
        descriptionEn: 'Calculates quantities from areas/dimensions per Saudi Building Code SBC 301/304',
        icon: '🧠',
        category: 'core',
        sourceFile: 'services/cognitiveCalculations.ts',
        status: 'active',
        capabilities: ['SBC 301/304', '18 قسم حسابي', 'معامل هدر ديناميكي', '2,604 سطر'],
      },
      {
        id: 'boq_engine',
        nameAr: 'محرك BOQ',
        nameEn: 'BOQ Engine',
        descriptionAr: 'الجسر المركزي — يربط المحرك المعرفي بأسعار السوق وينتج جداول الكميات',
        descriptionEn: 'Central bridge connecting cognitive engine to market prices for BOQ generation',
        icon: '📋',
        category: 'core',
        sourceFile: 'services/boqEngine.ts',
        status: 'active',
        capabilities: ['~80 mapping', 'أسعار ديناميكية', 'معامل إقليمي', 'كشف ربح/خسارة'],
      },
      {
        id: 'engineering_ghost',
        nameAr: 'المهندس المناوب',
        nameEn: 'Engineering Ghost Agent',
        descriptionAr: 'وكيل هندسي ذكي — تبرير الأسعار بنظام 3 مستويات مع مطابقة SBC',
        descriptionEn: '3-tier price justification with SBC compliance and pattern detection',
        icon: '👻',
        category: 'intelligence',
        sourceFile: 'services/engineeringGhostAgent.ts',
        status: 'active',
        capabilities: ['Tier 1: Benchmark', 'Tier 2: أنماط', 'Tier 3: Claude (مستقبلي)', 'مطابقة SBC'],
      },
      {
        id: 'missing_item_detector',
        nameAr: 'كاشف البنود المفقودة',
        nameEn: 'Missing Item Detector',
        descriptionAr: 'يكشف البنود الناقصة في جداول الكميات ويملأها تلقائياً — 17 قاعدة فيزيائية',
        descriptionEn: 'Detects and auto-fills missing BOQ items using 17 physical dependency rules',
        icon: '🔍',
        category: 'intelligence',
        sourceFile: 'services/missingItemDetector.ts',
        status: 'active',
        capabilities: ['17 قاعدة فيزيائية', 'تعبئة تلقائية', '3 مستويات خطورة', 'تقدير كميات'],
      },
      {
        id: 'commodity_intelligence',
        nameAr: 'ذكاء السوق',
        nameEn: 'Commodity Intelligence',
        descriptionAr: 'تتبع أسعار 6 مواد خام مع تحليل اتجاهات وتنبؤ 30 يوم',
        descriptionEn: 'Tracks 6 raw materials with trend analysis and 30-day price prediction',
        icon: '📈',
        category: 'intelligence',
        sourceFile: 'services/commodityIntelligenceEngine.ts',
        status: 'active',
        capabilities: ['6 مواد خام', 'تاريخ 180 يوم', 'تنبؤ 30 يوم', 'تنبيهات ذكية'],
      },
      {
        id: 'anomaly_detector',
        nameAr: 'محلل الشذوذ',
        nameEn: 'Anomaly Detector',
        descriptionAr: 'كشف الأسعار والكميات الشاذة باستخدام التحليل الإحصائي',
        descriptionEn: 'Detects anomalous prices and quantities using statistical analysis',
        icon: '📊',
        category: 'intelligence',
        sourceFile: 'services/anomalyDetector.ts',
        status: 'active',
        capabilities: ['تحليل 3σ', 'كشف outliers', 'تصنيف الشذوذ', 'توصيات'],
      },
      {
        id: 'compliance_checker',
        nameAr: 'مدقق التوافق',
        nameEn: 'Compliance Checker',
        descriptionAr: 'التحقق من مطابقة التسعير لكود البناء السعودي والأنظمة',
        descriptionEn: 'Validates pricing compliance with Saudi Building Code and regulations',
        icon: '✅',
        category: 'intelligence',
        sourceFile: 'services/brainComplianceChecker.ts',
        status: 'active',
        capabilities: ['SBC compliance', 'فحص الأسعار', 'تقرير المطابقة', 'توصيات'],
      },
      {
        id: 'blueprint_intelligence',
        nameAr: 'ذكاء المخططات',
        nameEn: 'Blueprint Intelligence',
        descriptionAr: 'تحليل المخططات واستخراج الأنماط — تنبؤ بالأعمدة والأساسات والحفر',
        descriptionEn: 'Blueprint analysis and pattern extraction — predicts columns, foundations, excavation',
        icon: '📐',
        category: 'intelligence',
        sourceFile: 'services/blueprintIntelligence.ts',
        status: 'idle',
        capabilities: ['تعلم أنماط', 'تنبؤ أعمدة', 'تنبؤ أساسات', 'تنبؤ حفر'],
      },
      {
        id: 'intuition_bridge',
        nameAr: 'جسر الحدس الهندسي',
        nameEn: 'Intuition Bridge',
        descriptionAr: 'ربط الحدس الهندسي بالحسابات — تعديل معاملات الهدر من أداء المقاولين',
        descriptionEn: 'Links engineering intuition to calculations — adjusts waste from contractor performance',
        icon: '🎯',
        category: 'intelligence',
        sourceFile: 'services/arbaIntuitionBridge.ts',
        status: 'active',
        capabilities: ['Field Feedback Loop', 'كشف ندرة', 'تعديل هدر', 'أداء مقاولين'],
      },
      {
        id: 'deviation_engine',
        nameAr: 'محلل الانحرافات',
        nameEn: 'Deviation Engine',
        descriptionAr: 'كشف الانحرافات بين المتوقع والفعلي في الأسعار والكميات',
        descriptionEn: 'Detects deviations between predicted and actual prices/quantities',
        icon: '📊',
        category: 'intelligence',
        sourceFile: 'services/deviationEngine.ts',
        status: 'active',
        capabilities: ['مقارنة predicted vs actual', 'تصنيف انحراف', 'تقرير', 'threshold alerts'],
      },
      {
        id: 'proactive_sweep',
        nameAr: 'المسح الاستباقي',
        nameEn: 'Proactive Sweep Engine',
        descriptionAr: 'مسح استباقي للبيانات — يكشف المشاكل قبل حدوثها',
        descriptionEn: 'Proactive data sweep — detects issues before they occur',
        icon: '🔄',
        category: 'monitoring',
        sourceFile: 'services/proactiveSweepEngine.ts',
        status: 'active',
        capabilities: ['مسح دوري', 'كشف مبكر', 'تنبيهات استباقية', 'تصحيح تلقائي'],
      },
      {
        id: 'regulatory_intelligence',
        nameAr: 'الذكاء التنظيمي',
        nameEn: 'Regulatory Intelligence',
        descriptionAr: 'متابعة الأنظمة واللوائح السعودية وتأثيرها على التسعير',
        descriptionEn: 'Tracks Saudi regulations and their impact on pricing',
        icon: '⚖️',
        category: 'intelligence',
        sourceFile: 'services/regulatoryIntelligenceEngine.ts',
        status: 'active',
        capabilities: ['أنظمة سعودية', 'تحديثات لوائح', 'تأثير على الأسعار', 'تنبيهات'],
      },
      {
        id: 'budget_guardian',
        nameAr: 'حارس الميزانية',
        nameEn: 'Budget Guardian',
        descriptionAr: 'مراقبة تجاوز الميزانية وتنبيه عند اقتراب الحدود',
        descriptionEn: 'Monitors budget overruns and alerts when approaching limits',
        icon: '🛡️',
        category: 'monitoring',
        sourceFile: 'services/budgetGuardian.ts',
        status: 'active',
        capabilities: ['مراقبة مستمرة', 'تنبيه مبكر', 'تقرير تجاوز', 'توصيات خفض'],
      },
      {
        id: 'schedule_estimator',
        nameAr: 'مقدّر الجدول الزمني',
        nameEn: 'Schedule Estimator',
        descriptionAr: 'تقدير مدة تنفيذ المشروع بناءً على البنود والكميات',
        descriptionEn: 'Estimates project execution duration based on items and quantities',
        icon: '⏱️',
        category: 'intelligence',
        sourceFile: 'services/scheduleEstimator.ts',
        status: 'active',
        capabilities: ['تقدير المدة', 'تسلسل أعمال', 'مسار حرج', 'تقرير جدول'],
      },
      {
        id: 'semantic_normalizer',
        nameAr: 'التطبيع الدلالي',
        nameEn: 'Semantic Normalizer',
        descriptionAr: 'تحويل النصوص العربية/الإنجليزية لمعرفات موحدة + تصحيح إملائي',
        descriptionEn: 'Normalizes Arabic/English text to unified IDs with spell correction',
        icon: '🔤',
        category: 'core',
        sourceFile: 'services/semanticNormalizer.ts',
        status: 'active',
        capabilities: ['تطبيع نصوص', 'تصحيح إملائي', '80+ keyword', 'مطابقة ذكية'],
      },
      {
        id: 'contextual_memory',
        nameAr: 'الذاكرة السياقية',
        nameEn: 'Contextual Memory',
        descriptionAr: 'حفظ السياق والأنماط من المشاريع السابقة لتحسين التنبؤ',
        descriptionEn: 'Stores context and patterns from past projects to improve predictions',
        icon: '💾',
        category: 'learning',
        sourceFile: 'services/contextualMemoryService.ts',
        status: 'active',
        capabilities: ['حفظ سياق', 'أنماط مشاريع', 'baselines', 'تحسين تنبؤ'],
      },
      {
        id: 'brain_self_diagnostic',
        nameAr: 'التشخيص الذاتي',
        nameEn: 'Brain Self Diagnostic',
        descriptionAr: 'فحص شامل لصحة الدماغ: بيانات + أداء + تعلم + بنية تحتية',
        descriptionEn: 'Full brain health check: data + performance + learning + infrastructure',
        icon: '🩺',
        category: 'monitoring',
        sourceFile: 'services/brainSelfDiagnostic.ts',
        status: 'active',
        capabilities: ['4 محاور فحص', 'نقاط نضج', 'اقتراحات تطوير', 'تقرير صحة'],
      },
    ];

    for (const def of agentDefs) {
      this.agents.set(def.id, {
        ...def,
        stats: { totalRuns: 0, runsToday: 0, avgExecutionMs: 0, lastRunAt: null, successRate: 100, errors: 0 },
      });
    }
  }

  /** Log an agent run and update stats */
  logRun(agentId: string, duration: number, success: boolean, input?: string, output?: string, error?: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.stats.totalRuns++;
    agent.stats.runsToday++;
    agent.stats.avgExecutionMs = Math.round(
      (agent.stats.avgExecutionMs * (agent.stats.totalRuns - 1) + duration) / agent.stats.totalRuns
    );
    agent.stats.lastRunAt = new Date();
    if (!success) {
      agent.stats.errors++;
      agent.status = 'error';
    } else {
      agent.status = 'active';
    }
    agent.stats.successRate = Math.round(
      ((agent.stats.totalRuns - agent.stats.errors) / agent.stats.totalRuns) * 100
    );

    // Save log entry
    const logs = this.getLogs();
    logs.unshift({ agentId, timestamp: new Date(), duration, success, input, output, error });
    if (logs.length > 500) logs.length = 500; // keep last 500
    this.saveLogs(logs);
    this.saveStats();
  }

  /** Get all registered agents */
  getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /** Get agents by category */
  getByCategory(category: AgentCategory): AgentInfo[] {
    return this.getAllAgents().filter(a => a.category === category);
  }

  /** Get a specific agent */
  getAgent(id: string): AgentInfo | undefined {
    return this.agents.get(id);
  }

  /** Get summary stats */
  getSummary(): { total: number; active: number; idle: number; error: number; runsToday: number; avgMs: number } {
    const all = this.getAllAgents();
    return {
      total: all.length,
      active: all.filter(a => a.status === 'active').length,
      idle: all.filter(a => a.status === 'idle').length,
      error: all.filter(a => a.status === 'error').length,
      runsToday: all.reduce((sum, a) => sum + a.stats.runsToday, 0),
      avgMs: Math.round(all.reduce((sum, a) => sum + a.stats.avgExecutionMs, 0) / all.length),
    };
  }

  /** Get recent logs */
  getLogs(limit = 50): AgentRunLog[] {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      const logs: AgentRunLog[] = raw ? JSON.parse(raw) : [];
      return logs.slice(0, limit);
    } catch { return []; }
  }

  /** Toggle agent enabled/disabled */
  toggleAgent(id: string): void {
    const agent = this.agents.get(id);
    if (!agent) return;
    agent.status = agent.status === 'disabled' ? 'idle' : 'disabled';
    this.saveStats();
  }

  /** Reset daily stats (call at midnight or app start) */
  resetDailyStats(): void {
    for (const agent of this.agents.values()) {
      agent.stats.runsToday = 0;
    }
    this.saveStats();
  }

  // Persistence
  private loadStats(): void {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (!raw) return;
      const saved: Record<string, AgentInfo['stats']> = JSON.parse(raw);
      for (const [id, stats] of Object.entries(saved)) {
        const agent = this.agents.get(id);
        if (agent) agent.stats = { ...agent.stats, ...stats };
      }
    } catch { /* ignore */ }
  }

  private saveStats(): void {
    const data: Record<string, AgentInfo['stats']> = {};
    for (const [id, agent] of this.agents) {
      data[id] = agent.stats;
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(data));
  }

  private saveLogs(logs: AgentRunLog[]): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
}

export const agentRegistry = new AgentRegistry();
