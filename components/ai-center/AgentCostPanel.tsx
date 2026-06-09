import React, { useState, useEffect } from 'react';
const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };

const AgentCostPanel: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try { const { agentCostTracker } = await import('../../services/agentCostTracker'); setSummary(agentCostTracker.getSummary()); } catch {}
    })();
  }, []);

  return (
    <div>
      <div style={{ ...glass, marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 600 }}>⚠️ كل الوكلاء يعملون محلياً حالياً — التكاليف تظهر فقط عند تفعيل Claude/GPT</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>اليوم</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>{summary?.costToday?.toFixed(2) || '0.00'} ر.س</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>هذا الأسبوع</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>{summary?.costThisWeek?.toFixed(2) || '0.00'} ر.س</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>هذا الشهر</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a5b4fc' }}>{summary?.costThisMonth?.toFixed(2) || '0.00'} ر.س</div></div>
      </div>
      <div style={glass}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>📊 الميزانية الشهرية</h3>
        <div style={{ height: '20px', borderRadius: '10px', background: 'rgba(30,41,59,0.8)', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{ height: '100%', borderRadius: '10px', background: (summary?.budgetUtilizationPercent || 0) > 80 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #4f46e5, #818cf8)', width: `${Math.min(summary?.budgetUtilizationPercent || 0, 100)}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
          <span>الاستخدام: {summary?.budgetUtilizationPercent || 0}%</span>
          <span>المتبقي: {summary?.budgetRemaining?.toFixed(2) || '500.00'} ر.س</span>
        </div>
      </div>
    </div>
  );
};
export default AgentCostPanel;
