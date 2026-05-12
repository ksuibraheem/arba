/**
 * ARBA V8.2 — Audit Report Panel
 * لوحة تقرير المراجعة اليومية
 */

import React, { useState, useEffect } from 'react';
import { dailyAuditService, AuditReport, AuditItem } from '../../src/services/dailyAuditService';

const AuditReportPanel: React.FC = () => {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const all = dailyAuditService.getAllReports();
    setReports(all);
    if (all.length > 0) setSelectedReport(all[0]);
  }, []);

  const filteredItems = selectedReport?.items.filter(
    i => filterPriority === 'all' || i.priority === filterPriority
  ) || [];

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">عاجل</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">متوسط</span>;
      case 'low': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">جيد</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">🔍</div>
          <div>
            <h2 className="text-xl font-bold text-white">تقارير المراجعة اليومية</h2>
            <p className="text-slate-400 text-sm">عينة عشوائية 20% من البنود مقارنة بأسعار السوق</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-5xl">📋</span>
            <p className="text-slate-400 mt-3">لا توجد تقارير مراجعة بعد</p>
            <p className="text-slate-500 text-sm mt-1">سيتم إنشاء تقرير تلقائياً عند تسعير مشروع من محرك BOQ</p>
          </div>
        ) : (
          <>
            {/* Report Selector */}
            <select
              value={selectedReport?.id || ''}
              onChange={e => setSelectedReport(reports.find(r => r.id === e.target.value) || null)}
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500/50 focus:outline-none transition-colors mb-4"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.projectName} — {new Date(r.auditDate).toLocaleDateString('ar-SA')}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Report Details */}
      {selectedReport && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-white">{selectedReport.totalItems}</span>
              <p className="text-slate-400 text-xs mt-1">إجمالي البنود</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-blue-400">{selectedReport.sampledItems}</span>
              <p className="text-slate-400 text-xs mt-1">عينة ({selectedReport.sampleRate}%)</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <span className={`text-2xl font-bold ${selectedReport.summary.avgDeviation > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                {selectedReport.summary.avgDeviation}%
              </span>
              <p className="text-slate-400 text-xs mt-1">متوسط الانحراف</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-emerald-400">{selectedReport.summary.accurate}</span>
              <p className="text-slate-400 text-xs mt-1">أسعار دقيقة</p>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map(p => {
              const labels = { all: 'الكل', high: '🔴 عاجل', medium: '🟡 متوسط', low: '✅ جيد' };
              const counts = {
                all: selectedReport.items.length,
                high: selectedReport.summary.highPriority,
                medium: selectedReport.summary.mediumPriority,
                low: selectedReport.summary.lowPriority,
              };
              return (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filterPriority === p
                    ? 'bg-slate-700 text-white border border-slate-500/50'
                    : 'bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  {labels[p]} ({counts[p]})
                </button>
              );
            })}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {filteredItems.map((item, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityBadge(item.priority)}
                      <span className="text-white text-sm font-medium truncate">{item.description}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{item.recommendation}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">السعر الحالي</p>
                        <p className="text-white font-bold">{item.currentRate.toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-slate-500">المرجعي</p>
                        <p className="text-emerald-400 font-bold">{item.benchmarkRate.toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-slate-500">الانحراف</p>
                        <p className={`font-bold ${Math.abs(item.deviation) > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.deviation > 0 ? '+' : ''}{item.deviation.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AuditReportPanel;
