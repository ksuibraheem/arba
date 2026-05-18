/**
 * ARBA V10.0 — Brain Training Dashboard Component
 * لوحة مراقبة تدريب الدماغ — للمطور فقط
 *
 * تعرض:
 * 1. نسبة نضج الدماغ (maturity %)
 * 2. حالة الصحة (healthy/needs_attention/critical)
 * 3. نسبة الامتثال SBC
 * 4. عدد البنود الناقصة
 * 5. تنبيهات التلاعب
 * 6. اقتراحات التطوير
 * 7. إصدار الدماغ + patches
 */

import React, { useState, useEffect } from 'react';
import { brainSelfDiagnostic, type DiagnosticReport } from '../../services/brainSelfDiagnostic';
import { brainVersionControl, type BrainVersion } from '../../services/brainVersionControl';
import { brainFirestoreSync, type BrainHealthStatus } from '../../services/brainFirestoreSync';
import { brainTrainingPipeline } from '../../services/brainTrainingPipeline';

// =================== Component ===================

const BrainDashboard: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null);
  const [version, setVersion] = useState<BrainVersion | null>(null);
  const [health, setHealth] = useState<BrainHealthStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [trainingResult, setTrainingResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setDiagnostic(brainSelfDiagnostic.runFullDiagnostic());
      setVersion(brainVersionControl.getVersion());
      setHealth(brainFirestoreSync.getHealthStatus());
    } catch (e) {
      console.error('Brain Dashboard load error:', e);
    }
  };

  const runTraining = async () => {
    setIsRunning(true);
    setTrainingResult(null);
    try {
      const result = brainTrainingPipeline.runTrainingCycle();
      setTrainingResult(
        `✅ تدريب مكتمل: ${result.autoCorrections} تصحيح تلقائي + ${result.patternCorrections} بنمط + ${result.patchesCreated} patches (${result.duration}ms)`
      );
      loadData(); // Refresh
    } catch (e) {
      setTrainingResult(`❌ خطأ: ${e}`);
    }
    setIsRunning(false);
  };

  if (!diagnostic || !version || !health) {
    return <div style={styles.loading}>🧠 جاري تحميل بيانات الدماغ...</div>;
  }

  const healthColor = diagnostic.overallHealth === 'healthy' ? '#22c55e'
    : diagnostic.overallHealth === 'needs_attention' ? '#f59e0b' : '#ef4444';

  const syncColor = health.syncStatus === 'healthy' ? '#22c55e'
    : health.syncStatus === 'stale' ? '#f59e0b' : '#ef4444';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🧠 لوحة مراقبة الدماغ — V{version.version}</h2>
        <div style={styles.headerBadge}>
          <span style={{ ...styles.badge, background: healthColor }}>
            {diagnostic.overallHealth === 'healthy' ? '✅ سليم' : diagnostic.overallHealth === 'needs_attention' ? '⚡ يحتاج انتباه' : '🔴 حرج'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.grid}>
        {/* Maturity */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>📊</div>
          <div style={styles.cardValue}>{diagnostic.maturityScore}%</div>
          <div style={styles.cardLabel}>نضج الدماغ</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${diagnostic.maturityScore}%`, background: diagnostic.maturityScore > 70 ? '#22c55e' : '#f59e0b' }} />
          </div>
        </div>

        {/* Sync Status */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>☁️</div>
          <div style={{ ...styles.cardValue, color: syncColor }}>{health.syncStatus === 'healthy' ? 'متصل' : health.syncStatus === 'stale' ? 'متأخر' : 'منقطع'}</div>
          <div style={styles.cardLabel}>حالة المزامنة</div>
          <div style={styles.cardSub}>{health.pendingWrites} كتابات معلقة</div>
        </div>

        {/* Version */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>🔖</div>
          <div style={styles.cardValue}>v{version.version}</div>
          <div style={styles.cardLabel}>إصدار الدماغ</div>
          <div style={styles.cardSub}>{version.appliedPatches} تصحيح مطبّق | {version.pendingPatches} معلّق</div>
        </div>

        {/* Data Health */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>📦</div>
          <div style={styles.cardValue}>{diagnostic.dataHealth.totalBenchmarkItems}</div>
          <div style={styles.cardLabel}>بنود مرجعية</div>
          <div style={styles.cardSub}>{diagnostic.dataHealth.outlierPricesCount} متطرف | {diagnostic.dataHealth.stalePricesCount} قديم</div>
        </div>

        {/* Learning */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>🎓</div>
          <div style={styles.cardValue}>{diagnostic.learning.totalLearningPoints}</div>
          <div style={styles.cardLabel}>نقاط تعلم</div>
          <div style={styles.cardSub}>الاتجاه: {diagnostic.learning.trend === 'improving' ? '📈 تحسن' : diagnostic.learning.trend === 'stagnant' ? '📊 ركود' : '📉 تراجع'}</div>
        </div>

        {/* Performance */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>⚡</div>
          <div style={styles.cardValue}>{diagnostic.performance.avgCalcTimeMs}ms</div>
          <div style={styles.cardLabel}>سرعة الحساب</div>
          <div style={styles.cardSub}>دقة التصنيف: {diagnostic.performance.classificationAccuracy}%</div>
        </div>
      </div>

      {/* Training Button */}
      <div style={styles.section}>
        <button 
          onClick={runTraining} 
          disabled={isRunning}
          style={{ ...styles.trainButton, opacity: isRunning ? 0.6 : 1 }}
        >
          {isRunning ? '🔄 جاري التدريب...' : '🧠 تشغيل دورة تدريب'}
        </button>
        {trainingResult && <div style={styles.trainingResult}>{trainingResult}</div>}
      </div>

      {/* Suggestions */}
      {diagnostic.suggestions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💡 اقتراحات التطوير ({diagnostic.suggestions.length})</h3>
          {diagnostic.suggestions.map((s, i) => (
            <div key={i} style={{ ...styles.suggestion, borderRight: `4px solid ${s.priority === 'critical' ? '#ef4444' : s.priority === 'high' ? '#f59e0b' : '#3b82f6'}` }}>
              <div style={styles.suggTitle}>{s.titleAr}</div>
              <div style={styles.suggDesc}>{s.descriptionAr}</div>
              <div style={styles.suggMeta}>
                <span style={styles.suggBadge}>{s.area}</span>
                <span style={styles.suggBadge}>{s.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Region Coverage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🗺️ تغطية المناطق</h3>
        <div style={styles.regionGrid}>
          {Object.entries(diagnostic.dataHealth.regionCoverage).map(([region, pct]) => {
            const p = pct as number;
            return (
            <div key={region} style={styles.regionItem}>
              <div style={styles.regionName}>{region}</div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${p}%`, background: p > 70 ? '#22c55e' : p > 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <div style={styles.regionPct}>{p}%</div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Issues */}
      {(diagnostic.dataHealth.issues.length > 0 || diagnostic.performance.issues.length > 0 || diagnostic.learning.issues.length > 0) && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>⚠️ المشاكل المكتشفة</h3>
          {[...diagnostic.dataHealth.issues, ...diagnostic.performance.issues, ...diagnostic.learning.issues].map((issue, i) => (
            <div key={i} style={styles.issue}>⚠️ {issue}</div>
          ))}
        </div>
      )}

      {/* Most Overridden Items */}
      {diagnostic.performance.mostOverriddenItems.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔄 البنود الأكثر تعديلاً يدوياً</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>البند</th>
                <th style={styles.th}>عدد التعديلات</th>
              </tr>
            </thead>
            <tbody>
              {diagnostic.performance.mostOverriddenItems.slice(0, 5).map((item, i) => (
                <tr key={i}>
                  <td style={styles.td}>{item.itemName}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: item.overrideCount > 5 ? '#ef4444' : '#f59e0b' }}>{item.overrideCount}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        آخر فحص: {diagnostic.timestamp.toLocaleString('ar-SA')} | {diagnostic.summaryAr}
      </div>
    </div>
  );
};

// =================== Styles ===================

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderRadius: 16, padding: 24, color: '#e2e8f0',
    fontFamily: 'Inter, Tajawal, sans-serif',
  },
  loading: {
    padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 16,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  title: {
    margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc',
  },
  headerBadge: {},
  badge: {
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: '#fff',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20,
  },
  card: {
    background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  cardIcon: { fontSize: 24, marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4 },
  cardLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#64748b' },
  progressBar: {
    height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 6, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#f8fafc', marginBottom: 12 },
  trainButton: {
    width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  trainingResult: {
    padding: 12, background: 'rgba(34,197,94,0.1)', borderRadius: 8,
    marginTop: 10, fontSize: 13, color: '#86efac', border: '1px solid rgba(34,197,94,0.2)',
  },
  suggestion: {
    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12,
    marginBottom: 8, borderLeft: 'none',
  },
  suggTitle: { fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 4 },
  suggDesc: { fontSize: 12, color: '#94a3b8', marginBottom: 6 },
  suggMeta: { display: 'flex', gap: 8 },
  suggBadge: {
    padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: 4,
    fontSize: 11, color: '#94a3b8',
  },
  regionGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  regionItem: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  regionName: { fontSize: 13, width: 80, color: '#cbd5e1' },
  regionPct: { fontSize: 12, fontWeight: 600, width: 40, textAlign: 'right' as const, color: '#94a3b8' },
  issue: {
    padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 6,
    fontSize: 13, color: '#fca5a5', marginBottom: 6,
    border: '1px solid rgba(239,68,68,0.15)',
  },
  table: {
    width: '100%', borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'right' as const, padding: '8px 12px', fontSize: 12, color: '#94a3b8',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  td: {
    padding: '8px 12px', fontSize: 13, color: '#e2e8f0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  footer: {
    textAlign: 'center' as const, fontSize: 11, color: '#64748b', paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
};

export default BrainDashboard;
