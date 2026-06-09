import React, { useState } from 'react';
const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };

const SETTINGS_KEY = 'arba_ai_settings';
const getSettings = () => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; } };
const saveSettings = (s: any) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

const AISettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState(getSettings);
  const update = (key: string, val: any) => { const next = { ...settings, [key]: val }; setSettings(next); saveSettings(next); };

  const localStorageUsage = () => { let total = 0; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key) total += (localStorage.getItem(key) || '').length; } return (total / 1024).toFixed(1); };

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key?.startsWith('arba_')) data[key] = localStorage.getItem(key) || ''; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `arba-brain-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  return (
    <div>
      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>🎛️ إعدادات التعلم</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <span style={{ color: '#e2e8f0' }}>التعلم التلقائي</span>
          <button onClick={() => update('autoLearning', !settings.autoLearning)} style={{ padding: '0.3rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', background: settings.autoLearning !== false ? '#4f46e5' : '#374151', color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>{settings.autoLearning !== false ? 'مفعّل ✅' : 'معطّل ❌'}</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <span style={{ color: '#e2e8f0' }}>أقصى انحراف للتعلم</span>
          <span style={{ color: '#818cf8', fontWeight: 600 }}>{settings.maxDeviation || 25}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
          <span style={{ color: '#e2e8f0' }}>أقل عينات للتحديث</span>
          <span style={{ color: '#818cf8', fontWeight: 600 }}>{settings.minSamples || 3}</span>
        </div>
      </div>

      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>📦 إدارة البيانات</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleExport} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>📤 تصدير بيانات الدماغ</button>
          <button onClick={() => { if (confirm('⚠️ هل أنت متأكد من حذف بيانات التعلم؟')) { localStorage.removeItem('arba_learning_data'); localStorage.removeItem('arba_learning_weights'); alert('✅ تم حذف بيانات التعلم'); }}} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>🗑️ إعادة تعيين التعلم</button>
        </div>
      </div>

      <div style={glass}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc' }}>ℹ️ معلومات النظام</h3>
        {[{ label: 'الإصدار', value: 'V11.3' }, { label: 'الخدمات', value: '25 خدمة' }, { label: 'الوكلاء', value: '18 وكيل' }, { label: 'استخدام التخزين', value: `${localStorageUsage()} KB` }].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
            <span style={{ color: '#94a3b8' }}>{item.label}</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AISettingsPanel;
