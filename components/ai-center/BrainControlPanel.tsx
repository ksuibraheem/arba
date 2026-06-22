import React, { useState, useEffect } from 'react';
import { brainSelfDiagnostic, DiagnosticReport } from '../../services/brainSelfDiagnostic';
import { brainFirestoreSync } from '../../services/brainFirestoreSync';
import { 
  Settings, 
  Activity, 
  Database, 
  BookOpen, 
  Brain, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Cpu, 
  Save, 
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

const glass: React.CSSProperties = { 
  backdropFilter: 'blur(16px)', 
  background: 'rgba(15, 23, 42, 0.8)', 
  border: '1px solid rgba(99, 102, 241, 0.15)', 
  borderRadius: '16px', 
  padding: '1.5rem',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const gridRow: React.CSSProperties = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
  gap: '1rem', 
  marginBottom: '1.5rem' 
};

const subGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem'
};

const BrainControlPanel: React.FC = () => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'data' | 'perf' | 'learn' | 'errors' | 'suggestions'>('data');

  // Pricing settings state
  const [profitMargin, setProfitMargin] = useState(() => Number(localStorage.getItem('arba_default_profit_margin') || '15'));
  const [maxDeviation, setMaxDeviation] = useState(() => Number(localStorage.getItem('arba_max_allowed_deviation') || '25'));
  const [pricingStrategy, setPricingStrategy] = useState(() => localStorage.getItem('arba_pricing_strategy') || 'arba_standard');
  const [syncInterval, setSyncInterval] = useState(() => Number(localStorage.getItem('arba_sync_interval') || '5'));
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Run diagnostic on mount
  useEffect(() => {
    const runInitialDiagnostic = () => {
      try {
        const initialReport = brainSelfDiagnostic.runFullDiagnostic();
        setReport(initialReport);
      } catch (e) {
        console.error('Failed to run initial diagnostic:', e);
      }
    };
    runInitialDiagnostic();
  }, []);

  // Handle setting updates
  const handleSettingChange = (key: string, value: any) => {
    if (key === 'profitMargin') {
      setProfitMargin(value);
      localStorage.setItem('arba_default_profit_margin', String(value));
    } else if (key === 'maxDeviation') {
      setMaxDeviation(value);
      localStorage.setItem('arba_max_allowed_deviation', String(value));
    } else if (key === 'pricingStrategy') {
      setPricingStrategy(value);
      localStorage.setItem('arba_pricing_strategy', String(value));
    } else if (key === 'syncInterval') {
      setSyncInterval(value);
      localStorage.setItem('arba_sync_interval', String(value));
      // Trigger auto-sync restart with the new interval
      try {
        const cachedUserStr = localStorage.getItem('arba_cached_user');
        const userId = cachedUserStr ? JSON.parse(cachedUserStr).uid : 'local';
        brainFirestoreSync.startAutoSync(userId, value * 60 * 1000);
      } catch (e) {
        console.warn('Failed to restart auto-sync with new interval:', e);
      }
    }

    setSaveStatus('💾 تم حفظ التغييرات وتطبيقها تلقائياً');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      // Small artificial timeout to simulate deep analysis
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newReport = brainSelfDiagnostic.runFullDiagnostic();
      setReport(newReport);
    } catch (e) {
      console.error('Error running self-diagnostic:', e);
    }
    setIsRunning(false);
  };

  const healthColor = report?.overallHealth === 'healthy' 
    ? '#34d399' 
    : report?.overallHealth === 'needs_attention' 
    ? '#fbbf24' 
    : '#f87171';

  return (
    <div>
      {/* 1. Quick Stats Grid */}
      <div style={gridRow}>
        {[
          { label: 'إصدار الدماغ', value: 'V11.3', icon: '🏷️', color: '#818cf8' },
          { label: 'نقاط نضج المعرفة', value: report ? `${report.maturityScore}/100` : '—', icon: '📊', color: '#60a5fa' },
          { label: 'البنود المرجعية الكلية', value: report ? report.dataHealth.totalBenchmarkItems.toLocaleString() : '13,961', icon: '📦', color: '#fb7185' },
          { 
            label: 'الحالة الصحية الحالية', 
            value: report?.overallHealth === 'healthy' 
              ? '✅ سليم ومستقر' 
              : report?.overallHealth === 'needs_attention' 
              ? '⚠️ يحتاج انتباه' 
              : report?.overallHealth === 'critical' 
              ? '🚨 حرج' 
              : '—', 
            icon: '💚', 
            color: healthColor 
          }
        ].map((card, i) => (
          <div key={i} style={{ ...glass, textAlign: 'center', borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: i === 3 && report ? healthColor : '#e2e8f0' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* 2. Main Interface Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* RIGHT COLUMN: Settings Panel (Editable) */}
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: '0.75rem' }}>
            <Settings style={{ color: '#818cf8', width: '20px', height: '20px' }} />
            <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1.1rem' }}>⚙️ إعدادات التسعير للدماغ</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Profit Margin */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>هامش الربح الافتراضي</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>{profitMargin}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={profitMargin}
                onChange={(e) => handleSettingChange('profitMargin', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                <span>5%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Max Allowed Deviation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>أقصى انحراف مسموح للأسعار</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>{maxDeviation}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={maxDeviation}
                onChange={(e) => handleSettingChange('maxDeviation', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Pricing Strategy */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.85rem' }}>استراتيجية التسعير الافتراضية</label>
              <select
                value={pricingStrategy}
                onChange={(e) => handleSettingChange('pricingStrategy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#e2e8f0',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="fixed_margin">📈 هامش ربح ثابت (Fixed Margin)</option>
                <option value="target_roi">🎯 العائد المستهدف على الاستثمار (Target ROI)</option>
                <option value="arba_standard">⚡ قياسي / تنافسي (Competitive Standard)</option>
              </select>
            </div>

            {/* Sync Interval */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.85rem' }}>فترة المزامنة السحابية تلقائياً</label>
              <select
                value={syncInterval}
                onChange={(e) => handleSettingChange('syncInterval', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#e2e8f0',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="1">⏱️ كل دقيقة (سرعة عالية)</option>
                <option value="5">⏱️ كل 5 دقائق (افتراضي)</option>
                <option value="15">⏱️ كل 15 دقيقة</option>
                <option value="30">⏱️ كل 30 دقيقة</option>
                <option value="60">⏱️ كل ساعة</option>
              </select>
            </div>

            {saveStatus && (
              <div style={{ 
                padding: '0.5rem', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(52, 211, 153, 0.1)', 
                color: '#34d399', 
                fontSize: '0.8rem', 
                textAlign: 'center', 
                fontWeight: 600,
                border: '1px solid rgba(52, 211, 153, 0.2)',
                marginTop: '0.5rem'
              }}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>

        {/* LEFT COLUMN: Diagnostic & Suggestions Summary */}
        <div style={glass}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain style={{ color: '#818cf8', width: '20px', height: '20px' }} />
              <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1.1rem' }}>🩺 الفحص الذاتي والتشخيص</h3>
            </div>
            <button 
              onClick={runDiagnostic} 
              disabled={isRunning} 
              style={{ 
                padding: '0.4rem 1.2rem', 
                borderRadius: '8px', 
                background: isRunning ? '#374151' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                color: '#fff', 
                border: 'none', 
                cursor: isRunning ? 'not-allowed' : 'pointer', 
                fontWeight: 600, 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
              {isRunning ? 'جاري الفحص...' : 'تشغيل الآن'}
            </button>
          </div>

          {report ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', textAlign: 'center', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>مؤشر النضج المعرفي</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>{report.maturityScore}%</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: `rgba(${report.overallHealth === 'healthy' ? '52,211,153' : '251,191,36'}, 0.08)`, textAlign: 'center', border: `1px solid rgba(${report.overallHealth === 'healthy' ? '52,211,153' : '251,191,36'}, 0.15)` }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>حالة الدماغ العامة</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: healthColor, marginTop: '0.3rem' }}>
                    {report.overallHealth === 'healthy' ? 'سليم ومستقر' : 'يحتاج انتباه'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ملخص الحالة (عربي):
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  {report.summaryAr}
                </div>
              </div>

              <div>
                <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', justifyItems: 'center', gap: '6px' }}>
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                  <span>أعلى توصيات ومقترحات الدماغ:</span>
                </div>
                {report.suggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {report.suggestions.slice(0, 3).map((suggestion, idx) => {
                      const priorityColor = suggestion.priority === 'critical' 
                        ? '#ef4444' 
                        : suggestion.priority === 'high' 
                        ? '#f97316' 
                        : '#fbbf24';
                      return (
                        <div key={idx} style={{ 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: '8px', 
                          background: 'rgba(30, 41, 59, 0.4)', 
                          borderRight: `3px solid ${priorityColor}`, 
                          fontSize: '0.75rem', 
                          color: '#e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{suggestion.titleAr}</span>
                          <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: `${priorityColor}22`, color: priorityColor, fontWeight: 700 }}>
                            {suggestion.priority === 'critical' ? 'حرج' : suggestion.priority === 'high' ? 'عالي' : 'متوسط'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '0.5rem' }}>
                    ✅ لا توجد مشاكل معلقة حالياً.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              اضغط على تشغيل الآن لبدء فحص الدماغ.
            </div>
          )}
        </div>
      </div>

      {/* 3. Detailed Brain Metrics Hub */}
      {report && (
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: '0.75rem' }}>
            <Activity style={{ color: '#818cf8', width: '20px', height: '20px' }} />
            <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1.1rem' }}>📊 مركز المقاييس التفصيلية والمراقبة الذاتية</h3>
          </div>

          {/* Sub Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
            {[
              { id: 'data', label: '🗃️ صحة قاعدة الأسعار', icon: <Database style={{ width: '14px', height: '14px' }} /> },
              { id: 'perf', label: '⚡ أداء وكفاءة المحرك', icon: <Cpu style={{ width: '14px', height: '14px' }} /> },
              { id: 'learn', label: '📚 التعلم التلقائي والاتجاه', icon: <TrendingUp style={{ width: '14px', height: '14px' }} /> },
              { id: 'errors', label: '🔍 الأخطاء والأنماط الشائعة', icon: <AlertTriangle style={{ width: '14px', height: '14px' }} /> },
              { id: 'suggestions', label: '💡 التوصيات والإجراءات', icon: <Sparkles style={{ width: '14px', height: '14px' }} /> }
            ].map((tab) => {
              const active = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))' : 'transparent',
                    color: active ? '#fff' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap',
                    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Tab Contents */}
          <div style={{ minHeight: '200px' }}>
            
            {/* SUB-TAB 1: Data Health */}
            {activeSubTab === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={subGrid}>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الأسعار الراكدة (أقدم من 6 أشهر)</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: report.dataHealth.stalePricesCount > 10 ? '#fbbf24' : '#e2e8f0' }}>
                      {report.dataHealth.stalePricesCount} سعر
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>أسعار قد تدل على ركود التحديثات التلقائية</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الأسعار المتطرفة (Outliers)</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: report.dataHealth.outlierPricesCount > 5 ? '#f87171' : '#34d399' }}>
                      {report.dataHealth.outlierPricesCount} سعر مرجعي
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>أسعار تنحرف بشكل كبير عن المعدلات الطبيعية</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الفئات المفتقدة للتسعير المرجعي</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: report.dataHealth.missingCategoryCount > 0 ? '#fbbf24' : '#34d399' }}>
                      {report.dataHealth.missingCategoryCount} فئات
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>فئات فنية بجدول الكميات لا تملك بنداً مرجعياً</p>
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#a5b4fc' }}>🗺️ نسبة التغطية الجغرافية للأسعار (المحافظات)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(report.dataHealth.regionCoverage).map(([region, value]) => {
                      const val = Number(value) || 0;
                      return (
                        <div key={region} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>
                              {region === 'riyadh' ? 'الرياض' : region === 'jeddah' ? 'جدة' : region === 'dammam' ? 'الدمام' : region === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'}
                            </span>
                            <span style={{ fontWeight: 'bold', color: val > 50 ? '#34d399' : '#fbbf24' }}>{val}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: val > 50 ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #fbbf24, #f59e0b)', width: `${val}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {report.dataHealth.issues.length > 0 && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#f87171', marginBottom: '0.3rem' }}>⚠️ مشاكل صحة البيانات المكتشفة:</div>
                    {report.dataHealth.issues.map((iss, i) => (
                      <div key={i} style={{ color: '#f87171', display: 'flex', gap: '6px', marginTop: '0.2rem' }}>
                        <span>•</span> <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: Performance */}
            {activeSubTab === 'perf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={subGrid}>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>سرعة المعالجة والحساب</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: report.performance.avgCalcTimeMs > 2000 ? '#f87171' : '#34d399' }}>
                      {report.performance.avgCalcTimeMs}ms
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>المعيار المطلوب: أقل من 2000ms للعمليات</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>معدل أخطاء المعالجة الذكية</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: report.performance.errorRate > 5 ? '#f87171' : '#34d399' }}>
                      {report.performance.errorRate}%
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>إجمالي الفشل البرمجي بالمعالجات</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>دقة تصنيف ومطابقة البنود</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#818cf8' }}>
                      {report.performance.classificationAccuracy}%
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>بناءً على 397 قاعدة تصنيف عربية/إنجليزية</p>
                  </div>
                </div>

                {/* Overridden items */}
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeftRight style={{ width: '16px', height: '16px', color: '#818cf8' }} />
                    <span>البنود الأكثر تعديلاً يدوياً من المستخدمين (انحرافات مرجعية محتملة)</span>
                  </h4>
                  {report.performance.mostOverriddenItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {report.performance.mostOverriddenItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.4)', fontSize: '0.75rem' }}>
                          <span style={{ color: '#e2e8f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>{item.itemName}</span>
                          <span style={{ color: '#fb7185', fontWeight: 'bold' }}>{item.overrideCount} تعديل</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                      لا توجد بيانات تعديل مسجلة.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: Self Learning */}
            {activeSubTab === 'learn' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={subGrid}>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>إجمالي نقاط التعلم المكتسبة</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#34d399' }}>
                      {report.learning.totalLearningPoints} نقطة
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>عدد تعديلات الأسعار الفردية المكتسبة</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>التحديثات التلقائية النشطة للأسعار</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#818cf8' }}>
                      {report.learning.totalAutoUpdates} تحديثات
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>عدد القواعد التي عدّلها الدماغ ذاتياً</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>اتجاه تطور الدماغ</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.4rem', color: report.learning.trend === 'improving' ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {report.learning.trend === 'improving' ? '📈 نمو مستمر' : report.learning.trend === 'stagnant' ? '⏸️ استقرار وركود' : '📉 تراجع'}
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>مؤشر التحديث والتنبؤات للمشاريع</p>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.02)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>تاريخ آخر تعلم ذاتي تلقائي:</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>
                    {report.learning.lastLearningDate ? new Date(report.learning.lastLearningDate).toLocaleString('ar-EG') : 'لا يوجد مشاريع مكتملة للتعلم بعد'}
                  </span>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: Error Patterns */}
            {activeSubTab === 'errors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={subGrid}>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>أنماط الأخطاء في قاعدة المعرفة</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#e2e8f0' }}>
                      {report.knowledgeBase.totalPatterns} أنماط فريدة
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>أنماط معالجة وحماية الأخطاء</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>إجمالي تكرار الأخطاء المعالجة</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#34d399' }}>
                      {report.knowledgeBase.totalOccurrences} مرات كبح
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>حالات حماية ومنع أسعار غير معقولة</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>التغطية الهيكلية للأخطاء</span>
                    <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.2rem', color: '#818cf8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.knowledgeBase.coverage}
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>توزع الأنماط على الفئات الفنية</p>
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#a5b4fc' }}>📝 أنماط الأخطاء الشائعة التي تم كشفها ومعالجتها في المحرك:</h4>
                  {report.knowledgeBase.topRecurringErrors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {report.knowledgeBase.topRecurringErrors.map((err, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.4)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fb7185' }}>🔍</span>
                            <span style={{ color: '#e2e8f0' }}>{err.patternAr || err.id}</span>
                          </div>
                          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{err.count} مرات</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                      لم تُرصد أي أخطاء متكررة بعد.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 5: Suggestions */}
            {activeSubTab === 'suggestions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#a5b4fc' }}>💡 توصيات تحسين الدماغ المقترحة تلقائياً:</h4>
                {report.suggestions.length > 0 ? (
                  report.suggestions.map((suggestion, idx) => {
                    const priorityColor = suggestion.priority === 'critical' 
                      ? '#ef4444' 
                      : suggestion.priority === 'high' 
                      ? '#f97316' 
                      : '#fbbf24';
                    return (
                      <div key={idx} style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        background: 'rgba(30, 41, 59, 0.3)', 
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRight: `4px solid ${priorityColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#e2e8f0' }}>{suggestion.titleAr}</span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '4px', 
                            background: `${priorityColor}15`, 
                            color: priorityColor, 
                            fontWeight: 800,
                            border: `1px solid ${priorityColor}30`
                          }}>
                            {suggestion.priority === 'critical' ? 'خطير جداً' : suggestion.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>{suggestion.descriptionAr}</p>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '0.3rem' }}>
                          <span>الأثر: {suggestion.impact}</span>
                          <span>القسم: {suggestion.area === 'pricing' ? 'التسعير' : suggestion.area === 'coverage' ? 'تغطية البيانات' : 'أداء النظام'}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                    ✅ الدماغ يعمل بكامل كفاءته دون أي توصيات حرجة.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default BrainControlPanel;
