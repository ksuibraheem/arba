import React, { useState } from 'react';
import { BENCHMARK_RATES, CATEGORY_LABELS } from '../../src/engines/benchmarkData';
import { 
  Settings, 
  Database, 
  Search, 
  RotateCcw, 
  Save, 
  Sliders, 
  ArrowLeftRight, 
  Trash2, 
  CheckCircle,
  FileSpreadsheet,
  Activity
} from 'lucide-react';

const glass: React.CSSProperties = { 
  backdropFilter: 'blur(16px)', 
  background: 'rgba(15, 23, 42, 0.8)', 
  border: '1px solid rgba(99, 102, 241, 0.15)', 
  borderRadius: '16px', 
  padding: '1.5rem',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const SETTINGS_KEY = 'arba_ai_settings';
const OVERRIDES_KEY = 'arba_manual_benchmark_overrides';

const getSettings = () => { 
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; } 
};
const saveSettings = (s: any) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

const getOverrides = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); } catch { return {}; }
};
const saveOverrides = (o: Record<string, number>) => localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));

const AISettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState(getSettings);
  const [overrides, setOverrides] = useState<Record<string, number>>(getOverrides);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saveStatus, setSaveStatus] = useState<string>('');
  
  // Cache for quick input values to prevent lag while typing
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    Object.entries(getOverrides()).forEach(([k, v]) => {
      vals[k] = String(v);
    });
    return vals;
  });

  const updateSetting = (key: string, val: any) => { 
    const next = { ...settings, [key]: val }; 
    setSettings(next); 
    saveSettings(next); 
    
    // If user edited minSamples, we can sync it with arba_brain_learnings threshold
    if (key === 'minSamples') {
      localStorage.setItem('arba_learning_threshold', String(val));
    }

    triggerSaveStatus('✅ تم تحديث إعدادات محرك التعلم');
  };

  const handleOverrideChange = (ruleId: string, val: string) => {
    setInputValues(prev => ({ ...prev, [ruleId]: val }));
  };

  const handleSaveOverride = (ruleId: string) => {
    const val = inputValues[ruleId];
    const nextOverrides = { ...overrides };
    
    if (val === '' || isNaN(Number(val)) || Number(val) <= 0) {
      delete nextOverrides[ruleId];
      const nextInputs = { ...inputValues };
      delete nextInputs[ruleId];
      setInputValues(nextInputs);
    } else {
      nextOverrides[ruleId] = Math.round(Number(val));
    }
    
    setOverrides(nextOverrides);
    saveOverrides(nextOverrides);
    triggerSaveStatus('✅ تم حفظ تعديل السعر المرجعي بنجاح');
  };

  const handleResetOverride = (ruleId: string) => {
    const nextOverrides = { ...overrides };
    delete nextOverrides[ruleId];
    setOverrides(nextOverrides);
    saveOverrides(nextOverrides);

    const nextInputs = { ...inputValues };
    delete nextInputs[ruleId];
    setInputValues(nextInputs);

    triggerSaveStatus('🔄 تم إعادة تعيين السعر المرجعي للأصل');
  };

  const handleResetAllOverrides = () => {
    if (confirm('⚠️ هل أنت متأكد من رغبتك في حذف جميع التعديلات اليدوية لأسعار البنود؟')) {
      localStorage.removeItem(OVERRIDES_KEY);
      setOverrides({});
      setInputValues({});
      triggerSaveStatus('🗑️ تم إزالة جميع التعديلات اليدوية');
    }
  };

  const triggerSaveStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const localStorageUsage = () => { 
    let total = 0; 
    for (let i = 0; i < localStorage.length; i++) { 
      const key = localStorage.key(i); 
      if (key) total += (localStorage.getItem(key) || '').length; 
    } 
    return (total / 1024).toFixed(1); 
  };

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) { 
      const key = localStorage.key(i); 
      if (key?.startsWith('arba_')) data[key] = localStorage.getItem(key) || ''; 
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `arba-brain-export-${new Date().toISOString().split('T')[0]}.json`; 
    a.click();
  };

  // Filter items based on search term and category
  const filteredRates = Object.entries(BENCHMARK_RATES).filter(([key, data]) => {
    const categoryInfo = CATEGORY_LABELS[data.category] || { ar: '', en: '' };
    const matchSearch = key.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        categoryInfo.ar.includes(searchTerm) || 
                        categoryInfo.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || data.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Save Notification Toast */}
      {saveStatus && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '10px',
          padding: '0.75rem 1.5rem',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {saveStatus}
        </div>
      )}

      {/* 1. Learning Configuration */}
      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <Sliders style={{ width: '18px', height: '18px', color: '#818cf8' }} />
          <span>🎛️ إعدادات ذكاء الدماغ ومعاملات التعلم</span>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>التعلم التلقائي (Auto-Learning)</span>
            <button 
              onClick={() => updateSetting('autoLearning', settings.autoLearning !== false ? false : true)} 
              style={{ 
                padding: '0.35rem 1.2rem', 
                borderRadius: '20px', 
                border: 'none', 
                cursor: 'pointer', 
                background: settings.autoLearning !== false ? 'linear-gradient(135deg, #10b981, #059669)' : '#374151', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: '0.8rem',
                boxShadow: settings.autoLearning !== false ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
              }}
            >
              {settings.autoLearning !== false ? 'مفعّل ✅' : 'معطّل ❌'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>أقل عينات (تكرار تعديلات) للتحديث التلقائي</span>
            <select
              value={settings.minSamples || 3}
              onChange={(e) => updateSetting('minSamples', Number(e.target.value))}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="2">مرتين (سريع جداً)</option>
              <option value="3">3 مرات (افتراضي)</option>
              <option value="5">5 مرات (متحفظ)</option>
              <option value="10">10 مرات (شديد الدقة)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>أقصى انحراف للتعلم التلقائي</span>
            <select
              value={settings.maxDeviation || 25}
              onChange={(e) => updateSetting('maxDeviation', Number(e.target.value))}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="15">15%</option>
              <option value="25">25% (افتراضي)</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Direct Material Rates Manual Overrides UI */}
      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database style={{ width: '18px', height: '18px', color: '#818cf8' }} />
            <span>🏷️ تعديل أسعار البنود المرجعية مباشرة (100+ بند)</span>
          </h3>
          {Object.keys(overrides).length > 0 && (
            <button 
              onClick={handleResetAllOverrides}
              style={{
                padding: '0.35rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 style={{ width: '13px', height: '13px' }} />
              مسح جميع التعديلات ({Object.keys(overrides).length})
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ width: '14px', height: '14px', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="ابحث عن بند أو رمز السعر (مثال: rc_column, خرسانة)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 2.2rem 0.5rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(99,102,241,0.15)',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(99,102,241,0.15)',
              color: '#e2e8f0',
              outline: 'none',
              fontSize: '0.8rem',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="all">كل الفئات</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.ar}</option>
            ))}
          </select>
        </div>

        {/* Override Rates List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          {filteredRates.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              لا توجد بنود تطابق كلمات البحث.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right' }}>
              <thead style={{ background: 'rgba(99, 102, 241, 0.08)', position: 'sticky', top: 0, zIndex: 5 }}>
                <tr>
                  <th style={{ padding: '0.6rem 0.8rem', color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>رمز البند</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>الفئة والنوع</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>الوحدة</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>السعر الأصلي</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: '#a5b4fc', borderBottom: '1px solid rgba(99,102,241,0.15)', textAlign: 'left', paddingLeft: '1.5rem' }}>السعر المعدل (يدوياً)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.slice(0, 50).map(([ruleId, item]) => {
                  const hasVal = overrides[ruleId] !== undefined;
                  const cat = CATEGORY_LABELS[item.category] || { ar: 'غير مصنف', icon: '❓' };
                  const inputVal = inputValues[ruleId] !== undefined ? inputValues[ruleId] : '';

                  return (
                    <tr key={ruleId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', backgroundColor: hasVal ? 'rgba(99, 102, 241, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{ruleId}</td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>
                        <span>{cat.icon} </span>
                        <span>{cat.ar}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>{item.unit}</td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>{item.rate} ر.س</td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'left', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder={String(item.rate)}
                          value={inputVal}
                          onChange={(e) => handleOverrideChange(ruleId, e.target.value)}
                          style={{
                            width: '80px',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: hasVal ? '#34d399' : '#cbd5e1',
                            outline: 'none',
                            fontSize: '0.8rem',
                            textAlign: 'center'
                          }}
                        />
                        <button
                          onClick={() => handleSaveOverride(ruleId)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: '#a5b4fc',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          title="حفظ"
                        >
                          <Save style={{ width: '12px', height: '12px' }} />
                        </button>
                        {hasVal && (
                          <button
                            onClick={() => handleResetOverride(ruleId)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            title="إعادة تعيين للأصل"
                          >
                            <RotateCcw style={{ width: '12px', height: '12px' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {filteredRates.length > 50 && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
            تم عرض أول 50 بنداً فقط. يرجى استخدام شريط البحث أو الفلترة لتحديد بنود أخرى.
          </p>
        )}
      </div>

      {/* 3. Data Management Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={glass}>
          <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ width: '18px', height: '18px', color: '#818cf8' }} />
            <span>📦 إدارة وتصدير البيانات</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1rem', lineHeight: '1.5' }}>
            يمكنك نسخ وتصدير ملف التكوين الكامل للتعلم والأسعار المرجعية المعدلة لاستخدامها كنسخة احتياطية أو استعادتها لاحقاً.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleExport} 
              style={{ 
                padding: '0.5rem 1.25rem', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.8rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
              }}
            >
              📤 تصدير ملف إعدادات الدماغ
            </button>
            <button 
              onClick={() => { 
                if (confirm('⚠️ هل أنت متأكد من حذف بيانات التعلم المتراكمة؟ سيؤدي ذلك لإعادة تعيين الدماغ لحالته الأصلية.')) { 
                  localStorage.removeItem('arba_learning_data'); 
                  localStorage.removeItem('arba_learning_weights'); 
                  localStorage.removeItem('arba_brain_auto_updates');
                  triggerSaveStatus('✅ تم تفريغ وحذف بيانات التعلم التلقائي'); 
                }
              }} 
              style={{ 
                padding: '0.5rem 1.25rem', 
                borderRadius: '8px', 
                background: 'rgba(239,68,68,0.1)', 
                color: '#ef4444', 
                border: '1px solid rgba(239,68,68,0.2)', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.8rem' 
              }}
            >
              🗑️ إعادة تعيين التعلم الذاتي
            </button>
          </div>
        </div>

        <div style={glass}>
          <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '18px', height: '18px', color: '#818cf8' }} />
            <span>ℹ️ معلومات الذاكرة والتخزين</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'إصدار الواجهة والأنظمة', value: 'V11.3' },
              { label: 'الخدمات المفعلة', value: '25 خدمة نشطة' },
              { label: 'الوكلاء المرتبطين بالنظام', value: '18 وكيل ذكي' },
              { label: 'مجموع استخدام ذاكرة المتصفح', value: `${localStorageUsage()} KB` }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid rgba(99,102,241,0.1)' : 'none', fontSize: '0.8rem' }}>
                <span style={{ color: '#94a3b8' }}>{item.label}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPanel;
