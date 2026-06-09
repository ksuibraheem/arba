import React, { useState } from 'react';

const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };

const AGENTS = [
  { id: 'classifier', nameAr: 'المصنف', nameEn: 'Activity Classifier', icon: '🏷️', cat: 'core', status: 'active' },
  { id: 'cognitive', nameAr: 'المحرك المعرفي', nameEn: 'Cognitive Engine', icon: '🧠', cat: 'core', status: 'active' },
  { id: 'boq', nameAr: 'مولد BOQ', nameEn: 'BOQ Generator', icon: '📋', cat: 'core', status: 'active' },
  { id: 'cost_analyzer', nameAr: 'محلل التكاليف', nameEn: 'Cost Analyzer', icon: '💰', cat: 'core', status: 'active' },
  { id: 'anomaly', nameAr: 'كاشف الشذوذ', nameEn: 'Anomaly Detector', icon: '🔍', cat: 'intelligence', status: 'active' },
  { id: 'missing_items', nameAr: 'كاشف النواقص', nameEn: 'Missing Item Detector', icon: '🛡️', cat: 'intelligence', status: 'active' },
  { id: 'commodity', nameAr: 'استخبارات السلع', nameEn: 'Commodity Intelligence', icon: '📊', cat: 'intelligence', status: 'active' },
  { id: 'compliance', nameAr: 'فاحص الامتثال', nameEn: 'Compliance Checker', icon: '✅', cat: 'intelligence', status: 'active' },
  { id: 'labor', nameAr: 'محرك العمالة', nameEn: 'Labor Overhead', icon: '👷', cat: 'intelligence', status: 'active' },
  { id: 'learning', nameAr: 'محرك التعلم', nameEn: 'Learning Feedback', icon: '📚', cat: 'learning', status: 'active' },
  { id: 'brain_sync', nameAr: 'مزامنة الدماغ', nameEn: 'Brain Sync', icon: '🔄', cat: 'monitoring', status: 'active' },
  { id: 'tracker', nameAr: 'المتتبع الصامت', nameEn: 'Silent Tracker', icon: '👁️', cat: 'monitoring', status: 'active' },
  { id: 'diagnostic', nameAr: 'التشخيص الذاتي', nameEn: 'Self Diagnostic', icon: '🩺', cat: 'monitoring', status: 'active' },
  { id: 'supplier', nameAr: 'محرك الموردين', nameEn: 'Supplier Engine', icon: '🏪', cat: 'intelligence', status: 'idle' },
  { id: 'regulatory', nameAr: 'الثوابت التنظيمية', nameEn: 'Regulatory Constants', icon: '📜', cat: 'core', status: 'active' },
  { id: 'file_reader', nameAr: 'قارئ الملفات', nameEn: 'File Reader', icon: '📁', cat: 'core', status: 'active' },
  { id: 'ocr', nameAr: 'محرك OCR', nameEn: 'OCR Engine', icon: '🔤', cat: 'core', status: 'idle' },
  { id: 'offline_buffer', nameAr: 'المخزن المؤقت', nameEn: 'Offline Buffer', icon: '💾', cat: 'monitoring', status: 'active' },
];

const CATS = ['الكل', 'الأساسي', 'الذكاء', 'التعلم', 'المراقبة'];
const CAT_MAP: Record<string, string> = { 'الكل': 'all', 'الأساسي': 'core', 'الذكاء': 'intelligence', 'التعلم': 'learning', 'المراقبة': 'monitoring' };

const AgentsDashboard: React.FC = () => {
  const [filter, setFilter] = useState('الكل');
  const filtered = filter === 'الكل' ? AGENTS : AGENTS.filter(a => a.cat === CAT_MAP[filter]);
  const active = AGENTS.filter(a => a.status === 'active').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إجمالي الوكلاء</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#818cf8' }}>{AGENTS.length}</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>نشط</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>{active}</div></div>
        <div style={{ ...glass, textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>خامل</div><div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>{AGENTS.length - active}</div></div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: filter === cat ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(30,41,59,0.8)', color: filter === cat ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map(agent => (
          <div key={agent.id} style={{ ...glass, transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '3px', background: agent.status === 'active' ? 'linear-gradient(90deg, #4f46e5, #7c3aed)' : 'rgba(100,116,139,0.3)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{agent.icon}</span>
                <div><div style={{ fontWeight: 700, color: '#e2e8f0' }}>{agent.nameAr}</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>{agent.nameEn}</div></div>
              </div>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: agent.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: agent.status === 'active' ? '#34d399' : '#fbbf24' }}>
                {agent.status === 'active' ? '🟢 نشط' : '🟡 خامل'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{agent.cat}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsDashboard;
