/**
 * BOQUploader — واجهة رفع ومعالجة جدول الكميات
 * Drag & Drop + Region Select + Processing Pipeline + Results Dashboard
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, MapPin, Zap, Download, AlertTriangle, CheckCircle, XCircle, BarChart3, TrendingUp, Package, DollarSign, ChevronDown, Search, Filter } from 'lucide-react';
import { readExcelFile, processItems, exportToExcel, type ProcessingResult, type ProcessedItem } from '../src/engines/arbaProcessor';
import { LOCATION_MULTIPLIERS, CATEGORY_LABELS, getAutoUpdateCount } from '../src/engines/benchmarkData';
import { getRuleCount } from '../src/engines/classificationEngine';
import { brainLearningService } from '../src/services/brainLearningService';
import { projectHistoryService } from '../src/services/projectHistoryService';
import { dailyAuditService } from '../src/services/dailyAuditService';
import { contextualMemoryService } from '../services/contextualMemoryService';
import { collectiveBrainService } from '../services/collectiveBrainService';
import { reasoningPortalService, requiresJustification } from '../services/reasoningPortalService';
import { commodityEngine } from '../services/commodityIntelligenceEngine';
import { getBrainAccessLevel, filterBrainDataForUser } from '../services/brainFeatureGate';
import { learningFeedbackService } from '../services/learningFeedbackService';

interface BOQUploaderProps {
  language?: string;
}

type ViewMode = 'upload' | 'processing' | 'results';

const BOQUploader: React.FC<BOQUploaderProps> = ({ language = 'ar' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [region, setRegion] = useState('riyadh');
  const [profitMargin, setProfitMargin] = useState(15);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  // ═══ FILE HANDLING ═══
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert(t('يرجى رفع ملف Excel (.xlsx, .xls)', 'Please upload an Excel file (.xlsx, .xls)'));
      return;
    }
    setFileName(file.name);
    setViewMode('processing');
    setProcessingStep(1);

    try {
      const buffer = await file.arrayBuffer();
      setProcessingStep(2);
      await new Promise(r => setTimeout(r, 400));

      const rawItems = readExcelFile(buffer);
      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 400));

      const processed = processItems(rawItems, region, profitMargin / 100);
      setProcessingStep(4);
      await new Promise(r => setTimeout(r, 300));

      setResult(processed);
      setViewMode('results');

      // ═══ AUTO-SAVE: Project History (M4) + Audit (M6) + Learning (M5) ═══
      try {
        const projectId = Date.now().toString(36);
        const itemPrices: Record<string, { description: string; rate: number; total: number }> = {};
        processed.items.forEach((item: ProcessedItem) => {
          if (item.classification.ruleId) {
            itemPrices[item.classification.ruleId] = {
              description: item.description,
              rate: item.costRate,
              total: item.costTotal,
            };
          }
        });

        // Save project snapshot
        projectHistoryService.saveProject({
          id: projectId,
          name: file.name.replace(/\.[^.]+$/, ''),
          fileName: file.name,
          region,
          processedAt: new Date().toISOString(),
          itemCount: processed.stats.total,
          classificationRate: processed.stats.classificationRate,
          totalCost: processed.stats.totalCost,
          totalSell: processed.stats.totalSell,
          totalProfit: processed.stats.totalProfit,
          profitMargin: processed.stats.profitMargin,
          categoryBreakdown: processed.stats.categoryBreakdown as Record<string, { count: number; total: number }>,
          itemPrices,
        });

        // Run daily audit
        dailyAuditService.runAudit(
          file.name.replace(/\.[^.]+$/, ''),
          processed.items.map((item: ProcessedItem) => ({
            seq: Number(item.seq),
            description: item.description,
            ruleId: item.classification.ruleId,
            costRate: item.costRate,
          }))
        );

        // Record learnings from classified items
        processed.items.forEach((item: ProcessedItem) => {
          if (item.classification.ruleId && item.costRate > 0) {
            brainLearningService.learn({
              ruleId: item.classification.ruleId,
              description: item.description,
              originalRate: item.costRate,
              correctedRate: item.sellRate,
              source: 'comparison',
              projectName: file.name,
            });
          }
        });

        console.log('\u2705 Project saved, audit run, learnings recorded');

        // ═══ Contextual Memory: Save performance record for baselines ═══
        try {
          const buildArea = processed.stats.total * 15; // rough estimate: 15m² per item
          contextualMemoryService.addPerformanceRecord({
            projectId,
            projectType: 'villa' as any,
            location: (region || 'riyadh') as any,
            buildArea,
            floorsCount: 2,
            actualCostPerSqm: buildArea > 0 ? Math.round(processed.stats.totalCost / buildArea) : 0,
            actualWasteFactors: {},
            actualLaborRates: {},
            quotedPrice: processed.stats.totalSell,
            actualPrice: processed.stats.totalCost,
            deviationPercent: processed.stats.totalSell > 0
              ? Math.round(((processed.stats.totalCost - processed.stats.totalSell) / processed.stats.totalSell) * 100)
              : 0,
            completedAt: new Date(),
            recordedBy: 'BOQUploader',
          });
        } catch { /* non-blocking */ }

        // ═══ Collective Brain: Push anonymized insight ═══
        try {
          collectiveBrainService.pushAnonymizedInsight(
            'villa' as any, (region || 'riyadh') as any,
            processed.stats.total * 15, 2,
            processed.stats.totalCost / Math.max(1, processed.stats.total * 15),
            0, 0, 0,
            { concrete: 5, steel: 5, blocks: 7, tiles: 10, paint: 5 },
            { substructurePercent: 15, superstructurePercent: 30, masonryPercent: 12, finishesPercent: 25, mepPercent: 13, otherPercent: 5 }
          );
        } catch { /* non-blocking */ }

        // ═══ V8.3: Commodity Alerts — log to console if critical ═══
        try {
          commodityEngine.initialize();
          const alerts = commodityEngine.getAlerts();
          const critical = alerts.filter((a: any) => a.severity === 'critical');
          if (critical.length > 0) {
            console.warn(`📈 COMMODITY ALERT: ${critical.length} critical alerts — check Commodity Dashboard`);
          }
        } catch { /* non-blocking */ }

        // ═══ V8.3: Reasoning Portal — flag items with large deviations ═══
        try {
          processed.items.forEach((item: ProcessedItem) => {
            if (item.classification.baseRate > 0 && item.costRate > 0) {
              if (requiresJustification(item.classification.baseRate, item.costRate)) {
                reasoningPortalService.addJustification({
                  itemId: String(item.seq),
                  itemName: item.description.substring(0, 60),
                  field: 'price',
                  originalValue: item.classification.baseRate,
                  overriddenValue: item.costRate,
                  deviationPercent: Math.round(((item.costRate - item.classification.baseRate) / item.classification.baseRate) * 100),
                  justification: 'Auto-detected deviation via BOQ processing',
                  category: 'market_fluctuation',
                  projectId,
                  engineerId: 'system',
                  engineerName: 'ARBA Engine',
                });
              }
            }
          });
        } catch { /* non-blocking */ }

        // ═══ V8.3: Learning Feedback — record predicted quantities ═══
        try {
          const predictedQty: Record<string, number> = {};
          processed.items.forEach((item: ProcessedItem) => {
            if (item.classification.ruleId) {
              predictedQty[item.classification.ruleId] = (predictedQty[item.classification.ruleId] || 0) + item.qty;
            }
          });
          if (Object.keys(predictedQty).length > 0) {
            learningFeedbackService.addDataPoint(
              projectId,
              'villa' as any,
              (region || 'riyadh') as any,
              predictedQty,
              predictedQty // actual = predicted at upload time; corrected on project close
            );
          }
        } catch { /* non-blocking */ }

      } catch (e) {
        console.warn('\u26a0\ufe0f Auto-save services error:', e);
      }
    } catch (err) {
      console.error('Processing error:', err);
      alert(t('خطأ في معالجة الملف', 'Error processing file'));
      setViewMode('upload');
    }
  }, [region, profitMargin, t]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleExport = () => {
    if (!result) return;
    const blob = exportToExcel(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, '')}_ARBA_PRICED.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ═══ UPLOAD VIEW ═══
  if (viewMode === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-4">
              <Zap className="w-3.5 h-3.5" />
              ARBA V8.2 — {getRuleCount()}+ {t('قاعدة تصنيف', 'classification rules')}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {t('محرك التسعير الذكي', 'Smart Pricing Engine')}
            </h1>
            <p className="text-slate-400 text-sm">
              {t('ارفع جدول الكميات واحصل على تسعير احترافي خلال ثوانٍ', 'Upload your BOQ and get professional pricing in seconds')}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {t('المنطقة', 'Region')}
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                {Object.entries(LOCATION_MULTIPLIERS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.nameAr} ({(info.factor * 100 - 100).toFixed(0)}%+)
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                {t('هامش الربح', 'Profit Margin')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="5" max="30" value={profitMargin}
                  onChange={e => setProfitMargin(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-white font-bold text-sm w-10 text-center">{profitMargin}%</span>
              </div>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]'
                : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef} type="file"
              accept=".xlsx,.xls,.csv" onChange={onFileInput}
              className="hidden"
            />
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
              isDragging ? 'bg-emerald-500/20 scale-110' : 'bg-slate-800 group-hover:bg-emerald-500/10'
            }`}>
              <FileSpreadsheet className={`w-10 h-10 transition-colors ${isDragging ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
            </div>
            <p className="text-lg font-bold text-white mb-1">
              {isDragging ? t('أفلت الملف هنا', 'Drop file here') : t('اسحب ملف Excel هنا', 'Drag Excel file here')}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              {t('أو اضغط لاختيار الملف', 'or click to browse')}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>.xlsx</span>
              <span>•</span>
              <span>.xls</span>
              <span>•</span>
              <span>.csv</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: '🧠', title: t('تصنيف ذكي', 'Smart Classification'), desc: t('345+ قاعدة عربي/إنجليزي', '345+ AR/EN rules') },
              { icon: '💰', title: t('تسعير 3 مستويات', '3-Tier Pricing'), desc: t('ملف → مرجعي → يدوي', 'File → Benchmark → Manual') },
              { icon: '🔍', title: t('فحص الأسعار', 'Sanity Check'), desc: t('كشف القيم المستحيلة', 'Outlier detection') },
            ].map((f, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
                <span className="text-2xl block mb-1">{f.icon}</span>
                <p className="text-xs font-bold text-white">{f.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ PROCESSING VIEW ═══
  if (viewMode === 'processing') {
    const steps = [
      { label: t('قراءة الملف', 'Reading file'), icon: '📂' },
      { label: t('استخراج البنود', 'Extracting items'), icon: '📋' },
      { label: t('تصنيف وتسعير', 'Classifying & pricing'), icon: '🧠' },
      { label: t('فحص الأسعار', 'Sanity check'), icon: '🔍' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse">
            <Zap className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{t('جاري المعالجة...', 'Processing...')}</h2>
          <p className="text-sm text-slate-400 mb-8">{fileName}</p>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                i + 1 < processingStep ? 'bg-emerald-500/10 border border-emerald-500/20' :
                i + 1 === processingStep ? 'bg-slate-800 border border-emerald-500/30 animate-pulse' :
                'bg-slate-800/40 border border-slate-700/30 opacity-50'
              }`}>
                <span className="text-xl">{i + 1 < processingStep ? '✅' : step.icon}</span>
                <span className={`text-sm font-medium ${i + 1 <= processingStep ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ RESULTS VIEW ═══
  if (!result) return null;
  const { stats } = result;

  const filteredItems = result.items.filter(item => {
    const matchSearch = !searchTerm || item.description.includes(searchTerm) || item.sanitizedDesc.includes(searchTerm);
    const matchCat = filterCategory === 'all' || item.classification.category === filterCategory;
    return matchSearch && matchCat;
  });

  const categories = Object.entries(stats.categoryBreakdown)
    .sort(([,a], [,b]) => (b as { count: number; total: number }).total - (a as { count: number; total: number }).total) as [string, { count: number; total: number }][];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{fileName}</h1>
              <p className="text-[10px] text-slate-400">{stats.total} {t('بند', 'items')} • {result.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setViewMode('upload'); setResult(null); }}
              className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl text-xs font-medium transition-colors">
              <Upload className="w-3.5 h-3.5 inline ml-1" />
              {t('ملف جديد', 'New File')}
            </button>
            <button onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95">
              <Download className="w-3.5 h-3.5 inline ml-1" />
              {t('تحميل Excel', 'Export Excel')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ═══ STAT CARDS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Package className="w-5 h-5" />, label: t('البنود', 'Items'), value: stats.total, sub: `${stats.classificationRate}% ${t('مصنف', 'classified')}`, color: 'from-blue-500 to-indigo-600' },
            { icon: <DollarSign className="w-5 h-5" />, label: t('إجمالي البيع', 'Total Sell'), value: stats.totalSell.toLocaleString(), sub: `+${stats.profitMargin}%`, color: 'from-emerald-500 to-teal-600' },
            { icon: <TrendingUp className="w-5 h-5" />, label: t('الربح', 'Profit'), value: stats.totalProfit.toLocaleString(), sub: `${t('ريال', 'SAR')}`, color: 'from-amber-500 to-orange-600' },
            { icon: <AlertTriangle className="w-5 h-5" />, label: t('تحذيرات', 'Warnings'), value: stats.warningCount + stats.criticalCount, sub: `${stats.criticalCount} ${t('حرج', 'critical')}`, color: stats.criticalCount > 0 ? 'from-red-500 to-pink-600' : 'from-slate-500 to-slate-600' },
          ].map((card, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}>
                {card.icon}
              </div>
              <p className="text-xs text-slate-400">{card.label}</p>
              <p className="text-xl font-bold text-white">{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ═══ SCOPE AUDIT ALERTS ═══ */}
        {(() => {
          const scopeItems = result.items.filter(i => i.scopeAudit);
          const rejectedCount = scopeItems.filter(i => i.scopeAudit?.status === 'REJECTED').length;
          const warningCount = scopeItems.filter(i => i.scopeAudit?.status === 'WARNING').length;
          const brainUpdates = getAutoUpdateCount();
          if (scopeItems.length === 0 && brainUpdates === 0) return null;
          return (
            <div className="space-y-2">
              {rejectedCount > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">🚨</span>
                  <div>
                    <p className="text-xs font-bold text-red-300">
                      {t(`${rejectedCount} بند يحتوي استثناءات — يحتاج مراجعة بشرية`, `${rejectedCount} items with exclusions — needs human review`)}
                    </p>
                    <p className="text-[10px] text-red-400/60 mt-0.5">
                      {t('بنود تحتوي على "لا يشمل" أو "باستثناء" — قد تؤثر على السعر', 'Items with "excludes" or "except" clauses may affect pricing')}
                    </p>
                  </div>
                </div>
              )}
              {warningCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-amber-300">
                      {t(`${warningCount} بند "شامل" — تأكد من التغطية الكاملة`, `${warningCount} items marked "inclusive" — verify full coverage`)}
                    </p>
                  </div>
                </div>
              )}
              {brainUpdates > 0 && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">🧠</span>
                  <div>
                    <p className="text-xs font-bold text-violet-300">
                      {t(`${brainUpdates} سعر مرجعي محدّث من التعلّم الذاتي`, `${brainUpdates} benchmark rates auto-updated from learning`)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══ CATEGORY BREAKDOWN ═══ */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            {t('توزيع الفئات', 'Category Breakdown')}
          </h3>
          <div className="space-y-2">
            {categories.map(([cat, data]) => {
              const info = CATEGORY_LABELS[cat] || CATEGORY_LABELS.unclassified;
              const pct = stats.totalSell > 0 ? (data.total / stats.totalSell * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm w-6">{info.icon}</span>
                  <span className="text-xs text-white w-24 truncate">{info.ar}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-10 text-left">{pct.toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-500 w-8 text-left">{data.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ ITEMS TABLE ═══ */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-2 p-3 border-b border-slate-700/50">
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('بحث في البنود...', 'Search items...')}
                className="w-full bg-slate-700/50 border border-slate-600/30 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="bg-slate-700/50 border border-slate-600/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer">
              <option value="all">{t('كل الفئات', 'All categories')}</option>
              {categories.map(([cat]) => {
                const info = CATEGORY_LABELS[cat] || CATEGORY_LABELS.unclassified;
                return <option key={cat} value={cat}>{info.icon} {info.ar}</option>;
              })}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr className="text-slate-400 border-b border-slate-700/50">
                  <th className="py-2.5 px-3 text-right font-medium">#</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t('الفئة', 'Category')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t('وصف البند', 'Description')}</th>
                  <th className="py-2.5 px-3 text-center font-medium">{t('الوحدة', 'Unit')}</th>
                  <th className="py-2.5 px-3 text-center font-medium">{t('الكمية', 'Qty')}</th>
                  <th className="py-2.5 px-3 text-left font-medium">{t('سعر البيع', 'Sell Rate')}</th>
                  <th className="py-2.5 px-3 text-left font-medium">{t('الإجمالي', 'Total')}</th>
                  <th className="py-2.5 px-3 text-center font-medium">{t('المصدر', 'Source')}</th>
                  <th className="py-2.5 px-3 text-center font-medium">{t('حالة', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => (
                  <tr key={i} className={`border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors ${
                    item.sanityFlag === 'critical' ? 'bg-red-500/5' :
                    item.sanityFlag === 'warning' ? 'bg-amber-500/5' :
                    item.pricingTier === 'unpriced' ? 'bg-slate-700/10' : ''
                  }`}>
                    <td className="py-2 px-3 text-slate-500">{item.seq}</td>
                    <td className="py-2 px-3">
                      <span className="text-sm" title={item.categoryLabel}>{item.categoryIcon}</span>
                    </td>
                    <td className="py-2 px-3 text-white max-w-xs truncate" title={item.description}>
                      {item.description.substring(0, 60)}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-400">{item.unit}</td>
                    <td className="py-2 px-3 text-center text-white">{item.qty.toLocaleString()}</td>
                    <td className="py-2 px-3 text-left text-white font-medium">{item.sellRate.toLocaleString()}</td>
                    <td className="py-2 px-3 text-left text-emerald-400 font-medium">{item.sellTotal.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      {item.pricingTier === 'original' ? <span className="text-blue-400" title="سعر الملف">📁</span> :
                       item.pricingTier === 'benchmark' ? <span className="text-emerald-400" title="سعر مرجعي">📊</span> :
                       <span className="text-red-400" title="بدون سعر">❌</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.scopeAudit?.status === 'REJECTED'
                        ? <span title={item.scopeAudit.details?.join('\n') || ''} className="cursor-help">🚨</span>
                        : item.scopeAudit?.status === 'WARNING'
                        ? <span title={item.scopeAudit.details?.join('\n') || ''} className="cursor-help">⚠️</span>
                        : item.sanityFlag === 'critical' ? <span title={item.sanityNote}>🔴</span> :
                         item.sanityFlag === 'warning' ? <span title={item.sanityNote}>🟠</span> :
                         <span>✅</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-slate-700/50 bg-slate-800/80">
            <span className="text-[10px] text-slate-500">
              {filteredItems.length} / {stats.total} {t('بند', 'items')}
            </span>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span>📁 {t('ملف', 'File')}: {stats.tier1Count}</span>
              <span>📊 {t('مرجعي', 'Benchmark')}: {stats.tier2Count}</span>
              <span>❌ {t('بدون', 'None')}: {stats.tier3Count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQUploader;
