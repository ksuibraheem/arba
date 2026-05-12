/**
 * ARBA V8.2 — Price Comparison Panel
 * لوحة مقارنة الأسعار بين المشاريع
 */

import React, { useState, useEffect, useMemo } from 'react';
import { projectHistoryService, ProjectSnapshot, PriceComparison } from '../../src/services/projectHistoryService';

const PriceComparisonPanel: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSnapshot[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [filterDir, setFilterDir] = useState<'all' | 'up' | 'down'>('all');

  useEffect(() => {
    setProjects(projectHistoryService.getAll());
  }, []);

  const handleCompare = () => {
    if (!selectedA || !selectedB) return;
    const result = projectHistoryService.compare(selectedA, selectedB);
    setComparisons(result);
  };

  const filtered = useMemo(() => {
    if (filterDir === 'all') return comparisons;
    return comparisons.filter(c => c.direction === filterDir);
  }, [comparisons, filterDir]);

  const projectA = projects.find(p => p.id === selectedA);
  const projectB = projects.find(p => p.id === selectedB);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-2xl">📊</div>
          <div>
            <h2 className="text-xl font-bold text-white">مقارنة العروض</h2>
            <p className="text-slate-400 text-sm">قارن أسعار بنود بين مشروعين مختلفين</p>
          </div>
        </div>

        {projects.length < 2 ? (
          <div className="text-center py-10">
            <span className="text-5xl">📭</span>
            <p className="text-slate-400 mt-3">يحتاج على الأقل مشروعين محفوظين للمقارنة</p>
            <p className="text-slate-500 text-sm mt-1">سعّر مشاريع من محرك BOQ وسيتم حفظها تلقائياً</p>
          </div>
        ) : (
          <>
            {/* Project Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1 block">المشروع الأول (المرجع)</label>
                <select
                  value={selectedA}
                  onChange={e => setSelectedA(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 focus:outline-none transition-colors"
                >
                  <option value="">— اختر مشروع —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({new Date(p.processedAt).toLocaleDateString('ar-SA')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1 block">المشروع الثاني (للمقارنة)</label>
                <select
                  value={selectedB}
                  onChange={e => setSelectedB(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500/50 focus:outline-none transition-colors"
                >
                  <option value="">— اختر مشروع —</option>
                  {projects.filter(p => p.id !== selectedA).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({new Date(p.processedAt).toLocaleDateString('ar-SA')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={!selectedA || !selectedB}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:from-blue-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              🔍 مقارنة الأسعار
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {comparisons.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-emerald-500/20 transition-colors"
              onClick={() => setFilterDir('all')}>
              <span className="text-2xl font-bold text-emerald-400">{comparisons.length}</span>
              <p className="text-emerald-300/60 text-xs mt-1">إجمالي البنود</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-red-500/20 transition-colors"
              onClick={() => setFilterDir('up')}>
              <span className="text-2xl font-bold text-red-400">{comparisons.filter(c => c.direction === 'up').length}</span>
              <p className="text-red-300/60 text-xs mt-1">ارتفاع ↑</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-500/20 transition-colors"
              onClick={() => setFilterDir('down')}>
              <span className="text-2xl font-bold text-blue-400">{comparisons.filter(c => c.direction === 'down').length}</span>
              <p className="text-blue-300/60 text-xs mt-1">انخفاض ↓</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700/50">
                  <th className="py-3 text-right font-medium">البند</th>
                  <th className="py-3 text-center font-medium">{projectA?.name || 'المرجع'}</th>
                  <th className="py-3 text-center font-medium">{projectB?.name || 'المقارنة'}</th>
                  <th className="py-3 text-center font-medium">الفرق</th>
                  <th className="py-3 text-center font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 text-slate-300 text-xs max-w-[200px] truncate">{c.description}</td>
                    <td className="py-3 text-center text-slate-300">{c.previousRate.toLocaleString()}</td>
                    <td className="py-3 text-center text-white font-medium">{c.currentRate.toLocaleString()}</td>
                    <td className={`py-3 text-center font-medium ${c.direction === 'up' ? 'text-red-400' : c.direction === 'down' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {c.direction === 'up' ? '↑' : c.direction === 'down' ? '↓' : '='} {Math.abs(c.difference).toLocaleString()}
                    </td>
                    <td className={`py-3 text-center text-xs font-bold ${Math.abs(c.differencePercent) > 20 ? 'text-red-400' : 'text-slate-400'}`}>
                      {c.differencePercent > 0 ? '+' : ''}{c.differencePercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonPanel;
