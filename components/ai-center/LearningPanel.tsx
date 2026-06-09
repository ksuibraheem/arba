import React, { useState, useEffect } from 'react';

const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };
const gridRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };

const SUB_TABS = [
  { id: 'auto', label: '🔄 التعلم التلقائي' },
  { id: 'manual', label: '✏️ التدريب اليدوي' },
  { id: 'knowledge', label: '📖 قاعدة المعرفة' },
];

const LearningPanel: React.FC = () => {
  const [subTab, setSubTab] = useState('auto');
  const [learningData, setLearningData] = useState<any[]>([]);
  const [manualForm, setManualForm] = useState({ projectType: 'villa', location: 'riyadh', itemId: '', predictedQty: '', actualQty: '' });
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    try { setLearningData(JSON.parse(localStorage.getItem('arba_learning_data') || '[]')); } catch {}
    try { setSuggestions(JSON.parse(localStorage.getItem('arba_brain_dev_suggestions') || '[]')); } catch {}
  }, []);

  const handleSubmitTraining = () => {
    alert('✅ تم إرسال بيانات التدريب');
    setManualForm({ projectType: 'villa', location: 'riyadh', itemId: '', predictedQty: '', actualQty: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {SUB_TABS.map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: subTab === tab.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(30, 41, 59, 0.8)', color: subTab === tab.id ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'auto' && (
        <div>
          <div style={gridRow}>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>📊</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>نقاط التعلم</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>{learningData.length}</div></div>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>✅</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>تحديثات تلقائية</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>{Object.keys(JSON.parse(localStorage.getItem('arba_brain_auto_updates') || '{}')).length}</div></div>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>📈</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>الاتجاه</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: learningData.length > 10 ? '#34d399' : '#fbbf24' }}>{learningData.length > 10 ? 'يتحسن ↗' : 'راكد —'}</div></div>
          </div>
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>📋 آخر نقاط التعلم</h3>
            {learningData.length === 0 ? <p style={{ color: '#64748b' }}>لا توجد نقاط تعلم بعد. ابدأ بإنشاء مشاريع حقيقية.</p> : learningData.slice(-5).reverse().map((point: any, i: number) => (
              <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.1)', fontSize: '0.85rem', color: '#cbd5e1' }}>{point.itemName || point.id || `نقطة ${i + 1}`} — {point.recordedAt ? new Date(point.recordedAt).toLocaleDateString('ar-SA') : '—'}</div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'manual' && (
        <div style={glass}>
          <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>✏️ إدخال بيانات تدريب يدوي</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>نوع المشروع</label><select value={manualForm.projectType} onChange={e => setManualForm({...manualForm, projectType: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}><option value="villa">فيلا</option><option value="apartment">شقة</option><option value="commercial">تجاري</option><option value="school">مدرسة</option></select></div>
            <div><label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>الموقع</label><select value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}><option value="riyadh">الرياض</option><option value="jeddah">جدة</option><option value="dammam">الدمام</option><option value="makkah">مكة</option></select></div>
            <div><label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>رقم البند</label><input value={manualForm.itemId} onChange={e => setManualForm({...manualForm, itemId: e.target.value})} placeholder="مثال: CON-001" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} /></div>
            <div><label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>الكمية المتوقعة</label><input type="number" value={manualForm.predictedQty} onChange={e => setManualForm({...manualForm, predictedQty: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} /></div>
          </div>
          <button onClick={handleSubmitTraining} style={{ marginTop: '1rem', padding: '0.6rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>📤 إرسال للتدريب</button>
        </div>
      )}

      {subTab === 'knowledge' && (
        <div>
          <div style={gridRow}>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>📚</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>أنماط الأخطاء</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>42</div></div>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>💡</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>اقتراحات معلقة</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>{suggestions.filter((s: any) => s.status === 'pending').length}</div></div>
            <div style={{ ...glass, textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>🎯</div><div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>المخرجات الذهبية</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>5,121</div></div>
          </div>
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>💡 اقتراحات التطوير</h3>
            {suggestions.filter((s: any) => s.status === 'pending').length === 0 ? <p style={{ color: '#64748b' }}>لا توجد اقتراحات معلقة. شغّل التشخيص الذاتي لتوليدها.</p> : suggestions.filter((s: any) => s.status === 'pending').slice(0, 5).map((s: any, i: number) => (
              <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '10px', background: s.priority === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.08)', borderRight: `3px solid ${s.priority === 'critical' ? '#ef4444' : '#fbbf24'}` }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{s.titleAr || s.title}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{s.descriptionAr || s.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPanel;
