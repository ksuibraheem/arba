import React, { useState, useEffect } from 'react';
const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };

const MonitoringPanel: React.FC = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    try { setErrors(JSON.parse(localStorage.getItem('arba_brain_errors') || '[]')); } catch {}
    try { setSessions(JSON.parse(localStorage.getItem('arba_brain_sessions') || '[]')); } catch {}
  }, []);
  const quotes = (() => { try { return JSON.parse(localStorage.getItem('arba_brain_quotes') || '[]').length; } catch { return 0; } })();

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...glass, textAlign: 'center', borderRight: '3px solid #ef4444' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>🔴 أخطاء حرجة</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>{errors.filter((e: any) => e.severity === 'critical').length}</div></div>
        <div style={{ ...glass, textAlign: 'center', borderRight: '3px solid #fbbf24' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>🟡 تحذيرات</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>{errors.length}</div></div>
        <div style={{ ...glass, textAlign: 'center', borderRight: '3px solid #818cf8' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>📋 عروض أسعار</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#818cf8' }}>{quotes}</div></div>
        <div style={{ ...glass, textAlign: 'center', borderRight: '3px solid #34d399' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>🔑 جلسات</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>{sessions.length}</div></div>
      </div>
      <div style={glass}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>📋 سجل الأخطاء</h3>
        {errors.length === 0 ? <p style={{ color: '#64748b' }}>لا توجد أخطاء مسجلة ✅</p> : errors.slice(0, 15).map((err: any, i: number) => (
          <div key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', borderRight: '3px solid #ef4444', fontSize: '0.8rem' }}>
            <span style={{ color: '#94a3b8' }}>{err.timestamp ? new Date(err.timestamp).toLocaleString('ar-SA') : '—'}</span>
            <span style={{ color: '#f87171', marginRight: '0.75rem' }}>{err.message || err.error || JSON.stringify(err).substring(0, 80)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MonitoringPanel;
