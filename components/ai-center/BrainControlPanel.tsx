import React, { useState } from 'react';

const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };
const gridRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };

interface DiagResult {
  overallHealth: string;
  maturityScore: number;
  issues: string[];
}

const BrainControlPanel: React.FC = () => {
  const [diagResult, setDiagResult] = useState<DiagResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const { brainSelfDiagnostic } = await import('../../services/brainSelfDiagnostic');
      const report = brainSelfDiagnostic.runFullDiagnostic();
      setDiagResult({ overallHealth: report.overallHealth, maturityScore: report.maturityScore, issues: report.suggestions?.map((s: any) => s.titleAr || s.title) || [] });
    } catch (e) { console.error(e); }
    setIsRunning(false);
  };

  const healthColor = diagResult?.overallHealth === 'healthy' ? '#34d399' : diagResult?.overallHealth === 'needs_attention' ? '#fbbf24' : '#f87171';

  return (
    <div>
      <div style={gridRow}>
        {[{ label: 'الإصدار', value: 'V11.3', icon: '🏷️' }, { label: 'نقاط النضج', value: diagResult ? `${diagResult.maturityScore}/100` : '—', icon: '📊' }, { label: 'البنود المرجعية', value: '13,005', icon: '📦' }, { label: 'الحالة الصحية', value: diagResult?.overallHealth === 'healthy' ? '✅ سليم' : diagResult?.overallHealth || '—', icon: '💚' }].map((card, i) => (
          <div key={i} style={{ ...glass, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: i === 3 && diagResult ? healthColor : '#e2e8f0' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#a5b4fc' }}>🩺 التشخيص الذاتي</h3>
          <button onClick={runDiagnostic} disabled={isRunning} style={{ padding: '0.5rem 1.5rem', borderRadius: '10px', background: isRunning ? '#374151' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            {isRunning ? '⏳ جاري الفحص...' : '▶ تشغيل الآن'}
          </button>
        </div>
        {diagResult && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>النضج</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#818cf8' }}>{diagResult.maturityScore}%</div>
              </div>
              <div style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: `rgba(${diagResult.overallHealth === 'healthy' ? '52,211,153' : '251,191,36'}, 0.1)`, textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>الحالة</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: healthColor }}>{diagResult.overallHealth === 'healthy' ? '✅ سليم' : '⚠️ يحتاج مراجعة'}</div>
              </div>
            </div>
            {diagResult.issues.length > 0 && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>اقتراحات ({diagResult.issues.length}):</div>
                {diagResult.issues.slice(0, 5).map((issue, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem', borderRadius: '8px', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', fontSize: '0.8rem', borderRight: '3px solid #fbbf24' }}>{issue}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={glass}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>⚙️ إعدادات التسعير</h3>
        {[{ label: 'هامش الربح الافتراضي', value: '15%' }, { label: 'أقصى انحراف مسموح', value: '25%' }, { label: 'استراتيجية التسعير', value: 'تنافسي' }, { label: 'فترة المزامنة', value: 'كل 5 دقائق' }].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 3 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
            <span style={{ color: '#94a3b8' }}>{item.label}</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrainControlPanel;
