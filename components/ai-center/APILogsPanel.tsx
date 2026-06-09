import React, { useState, useEffect } from 'react';
const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };

const APILogsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { apiCallLogger } = await import('../../services/apiCallLogger');
        setStats(apiCallLogger.getStats());
        setLogs(apiCallLogger.getLogs({ limit: 50 }));
      } catch {}
    })();
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>استدعاءات اليوم</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#818cf8' }}>{stats?.callsToday || 0}</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>نسبة النجاح</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>{stats?.successRate || 100}%</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>متوسط الاستجابة</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>{stats?.avgDurationMs || 0}ms</div></div>
      </div>
      <div style={glass}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>📋 سجل الاستدعاءات</h3>
        {logs.length === 0 ? <p style={{ color: '#64748b' }}>لا توجد استدعاءات مسجلة بعد.</p> :
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead><tr>{['الوقت', 'الوكيل', 'النقطة', 'الحالة', 'المدة'].map((h, i) => <th key={i} style={{ padding: '0.6rem', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', textAlign: 'right' }}>{h}</th>)}</tr></thead>
              <tbody>{logs.slice(0, 20).map((log: any, i: number) => (
                <tr key={i}><td style={{ padding: '0.5rem', color: '#94a3b8', borderBottom: '1px solid rgba(99,102,241,0.05)' }}>{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</td>
                <td style={{ padding: '0.5rem', color: '#e2e8f0', borderBottom: '1px solid rgba(99,102,241,0.05)' }}>{log.agentNameAr || log.agentId}</td>
                <td style={{ padding: '0.5rem', color: '#94a3b8', borderBottom: '1px solid rgba(99,102,241,0.05)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.endpoint}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(99,102,241,0.05)' }}><span style={{ padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.7rem', background: log.success ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: log.success ? '#34d399' : '#ef4444' }}>{log.statusCode || (log.success ? 200 : 500)}</span></td>
                <td style={{ padding: '0.5rem', color: '#cbd5e1', borderBottom: '1px solid rgba(99,102,241,0.05)' }}>{log.durationMs}ms</td></tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
};
export default APILogsPanel;
