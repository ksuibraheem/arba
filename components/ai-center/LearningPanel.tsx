import React, { useState, useEffect } from 'react';
import { brainLearningService, PriceLearning } from '../../src/services/brainLearningService';
import { BENCHMARK_RATES } from '../../src/engines/benchmarkData';
import { 
  Check, 
  X, 
  ShieldAlert, 
  Award, 
  FileText, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Play, 
  PlusCircle, 
  HelpCircle,
  AlertCircle
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
  gap: '1rem', 
  marginBottom: '1.5rem' 
};

const SUB_TABS = [
  { id: 'auto', label: '🔄 التعلم التلقائي والدروس' },
  { id: 'approval', label: '🛡️ طابور الاعتماد البشري' },
  { id: 'manual', label: '✏️ التدريب اليدوي' },
  { id: 'knowledge', label: '📖 قاعدة المعرفة والأخطاء' },
];

const LearningPanel: React.FC = () => {
  const [subTab, setSubTab] = useState('auto');
  const [learningData, setLearningData] = useState<PriceLearning[]>([]);
  const [manualForm, setManualForm] = useState({ 
    ruleId: 'rc_column', 
    description: '', 
    originalRate: '', 
    correctedRate: '', 
    source: 'manual' as const 
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState('');

  // Load learnings on mount and on tab changes
  const reloadData = () => {
    try { 
      setLearningData(brainLearningService.getAll()); 
    } catch (e) {
      console.error('Failed to load learnings:', e);
    }
    try { 
      const rawSuggestions = localStorage.getItem('arba_brain_dev_suggestions') || '[]';
      setSuggestions(JSON.parse(rawSuggestions)); 
    } catch {}
  };

  useEffect(() => {
    reloadData();
  }, [subTab]);

  const handleSubmitTraining = () => {
    if (!manualForm.description || !manualForm.originalRate || !manualForm.correctedRate) {
      alert('⚠️ يرجى ملء كافة الحقول لإرسال درس التدريب');
      return;
    }

    try {
      brainLearningService.learn({
        ruleId: manualForm.ruleId,
        description: manualForm.description,
        originalRate: Number(manualForm.originalRate),
        correctedRate: Number(manualForm.correctedRate),
        source: 'manual',
      });
      
      setSaveStatus('✅ تم تسجيل درس التعلم اليدوي بنجاح');
      setTimeout(() => setSaveStatus(''), 2500);

      // Reset form
      setManualForm({ 
        ruleId: 'rc_column', 
        description: '', 
        originalRate: '', 
        correctedRate: '', 
        source: 'manual' 
      });
      reloadData();
    } catch (e) {
      alert('❌ فشل تسجيل التعلم');
    }
  };

  // Group learnings by ruleId to show in the approval queue
  const getPendingApprovals = () => {
    const grouped: Record<string, PriceLearning[]> = {};
    learningData.forEach((item) => {
      if (!grouped[item.ruleId]) {
        grouped[item.ruleId] = [];
      }
      grouped[item.ruleId].push(item);
    });
    return grouped;
  };

  const handleApproveLearning = (ruleId: string, suggestedRate: number) => {
    try {
      // Save directly to manual overrides database
      const overridesRaw = localStorage.getItem('arba_manual_benchmark_overrides') || '{}';
      const overrides = JSON.parse(overridesRaw);
      overrides[ruleId] = Math.round(suggestedRate);
      localStorage.setItem('arba_manual_benchmark_overrides', JSON.stringify(overrides));

      // Remove learnings for this rule to clear it from queue
      const nextLearnings = learningData.filter(l => l.ruleId !== ruleId);
      localStorage.setItem('arba_brain_learnings', JSON.stringify(nextLearnings));
      
      // Update auto updates status count
      const autoUpdatesRaw = localStorage.getItem('arba_brain_auto_updates') || '{}';
      const autoUpdates = JSON.parse(autoUpdatesRaw);
      autoUpdates[ruleId] = {
        suggestedRate: Math.round(suggestedRate),
        learningCount: (autoUpdates[ruleId]?.learningCount || 0) + 1,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('arba_brain_auto_updates', JSON.stringify(autoUpdates));

      setSaveStatus(`✅ تم اعتماد السعر المرجعي الجديد لـ ${ruleId} بقيمة ${suggestedRate} ريال`);
      setTimeout(() => setSaveStatus(''), 3000);
      reloadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectLearning = (ruleId: string) => {
    try {
      // Remove all learnings for this ruleId
      const nextLearnings = learningData.filter(l => l.ruleId !== ruleId);
      localStorage.setItem('arba_brain_learnings', JSON.stringify(nextLearnings));
      
      setSaveStatus(`❌ تم رفض وحذف دروس التعلم الخاصة بـ ${ruleId}`);
      setTimeout(() => setSaveStatus(''), 2500);
      reloadData();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingGrouped = getPendingApprovals();
  const autoUpdatesCount = Object.keys(JSON.parse(localStorage.getItem('arba_brain_auto_updates') || '{}')).length;

  return (
    <div>
      {/* Toast Save Status */}
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

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {SUB_TABS.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setSubTab(tab.id)} 
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '10px', 
              border: 'none', 
              cursor: 'pointer', 
              background: subTab === tab.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(30, 41, 59, 0.8)', 
              color: subTab === tab.id ? '#fff' : '#94a3b8', 
              fontWeight: 600, 
              fontSize: '0.85rem', 
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Auto Learning & Last Insights */}
      {subTab === 'auto' && (
        <div>
          <div style={gridRow}>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #818cf8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📊</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إجمالي دروس التعلم المكتشفة</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8', marginTop: '0.25rem' }}>{learningData.length} درس</div>
            </div>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #34d399' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✅</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>قواعد تم تحديثها تلقائياً</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>{autoUpdatesCount} قاعدة</div>
            </div>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📈</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>اتجاه تطور دقة التسعير</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: learningData.length > 5 ? '#34d399' : '#fbbf24', marginTop: '0.4rem' }}>
                {learningData.length > 5 ? 'نمو وتطور مستمر' : 'مستقر وراكد'}
              </div>
            </div>
          </div>
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>📋 سجل آخر نقاط التعلم المستكشفة من المشاريع</h3>
            {learningData.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>
                لا توجد نقاط تعلم مسجلة حالياً. ابدأ برفع وتسعير مشاريع حقيقية ليتعلم الدماغ تلقائياً من تعديلاتك.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {learningData.slice(-10).reverse().map((point, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '0.6rem 0.8rem', 
                      borderRadius: '8px', 
                      background: 'rgba(30, 41, 59, 0.4)', 
                      border: '1px solid rgba(255,255,255,0.02)', 
                      fontSize: '0.8rem', 
                      color: '#cbd5e1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#818cf8' }}>[{point.ruleId}]</span>
                      <span style={{ marginRight: '0.5rem' }}>{point.description}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>السعر الأصلي: {point.originalRate} ر.س</span>
                      <span>⬅️</span>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>المعدل: {point.correctedRate} ر.س</span>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                        {point.projectName?.substring(0, 20) || 'تعديل مباشر'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QS Approval Queue (🛡️ طابور الاعتماد البشري) */}
      {subTab === 'approval' && (
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            <ShieldAlert style={{ color: '#fbbf24', width: '18px', height: '18px' }} />
            <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1.05rem' }}>🛡️ طابور الاعتماد ومراجعة قرارات التعلم للدماغ</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            يقوم الدماغ بتجميع تعديلات المهندسين يدوياً في المشاريع المختلفة. هنا يمكنك مراجعة متوسط التعديلات واعتماد السعر المقترح لتحديث قاعدة الأسعار المرجعية للمنصة فوراً، أو رفضه.
          </p>

          {Object.keys(pendingGrouped).length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              🎉 طابور المراجعة فارغ! لا توجد تعديلات أسعار معلقة بحاجة لاعتمادك حالياً.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(pendingGrouped).map(([ruleId, items]) => {
                // Calculate average suggested rate
                const rates = items.map(l => l.correctedRate);
                const avgRate = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
                const baseRate = BENCHMARK_RATES[ruleId]?.rate || items[0].originalRate;
                const pctChange = Math.round(((avgRate - baseRate) / baseRate) * 100);

                return (
                  <div 
                    key={ruleId} 
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '10px', 
                      background: 'rgba(30, 41, 59, 0.5)', 
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {ruleId}
                        </span>
                        <span style={{ marginRight: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>
                          {items[0].description}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        مبني على عدد {items.length} تعديل/مشروع
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>السعر المرجعي الحالي</div>
                          <div style={{ color: '#cbd5e1', fontWeight: 'bold', marginTop: '0.15rem' }}>{baseRate} ر.س</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>⬅️</div>
                        <div>
                          <div style={{ color: '#fbbf24', fontSize: '0.7rem' }}>السعر المقترح واعتماده</div>
                          <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '0.15rem' }}>{avgRate} ر.س</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>نسبة التغير</div>
                          <div style={{ color: pctChange > 0 ? '#fb7185' : '#34d399', fontWeight: 'bold', marginTop: '0.15rem' }}>
                            {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleApproveLearning(ruleId, avgRate)}
                          style={{
                            padding: '0.35rem 0.8rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check style={{ width: '12px', height: '12px' }} />
                          اعتماد السعر
                        </button>
                        <button 
                          onClick={() => handleRejectLearning(ruleId)}
                          style={{
                            padding: '0.35rem 0.8rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                          تجاهل
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Manual Training Input */}
      {subTab === 'manual' && (
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            <PlusCircle style={{ color: '#818cf8', width: '18px', height: '18px' }} />
            <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1.05rem' }}>✏️ إدخال عينة تدريب يدوي لمحرك الذكاء الاصطناعي</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            تتيح هذه الواجهة محاكاة وتدريب الدماغ يدوياً على بند تسعيري مخصص. عند إرسال البند، سيقوم الدماغ بتسجيل التعديل كـ "درس تعلم" لتعديل وزنه المرجعي.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>تحديد البند المرجعي</label>
              <select 
                value={manualForm.ruleId} 
                onChange={e => setManualForm({...manualForm, ruleId: e.target.value})} 
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }}
              >
                {Object.entries(BENCHMARK_RATES).map(([key, item]) => (
                  <option key={key} value={key}>{key} ({item.unit})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>وصف البند التوضيحي</label>
              <input 
                value={manualForm.description} 
                onChange={e => setManualForm({...manualForm, description: e.target.value})} 
                placeholder="مثال: توريد وتركيب خرسانة القواعد..." 
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }} 
              />
            </div>
            
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>السعر المرجعي الأصلي (ر.س)</label>
              <input 
                type="number" 
                value={manualForm.originalRate} 
                onChange={e => setManualForm({...manualForm, originalRate: e.target.value})} 
                placeholder="مثال: 765"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }} 
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>السعر الجديد المراد تدريبه (ر.س)</label>
              <input 
                type="number" 
                value={manualForm.correctedRate} 
                onChange={e => setManualForm({...manualForm, correctedRate: e.target.value})} 
                placeholder="مثال: 820"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }} 
              />
            </div>
          </div>
          <button 
            onClick={handleSubmitTraining} 
            style={{ 
              marginTop: '1.25rem', 
              padding: '0.55rem 2rem', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: '0.85rem' 
            }}
          >
            📤 تسجيل درس التدريب وإرساله للدماغ
          </button>
        </div>
      )}

      {/* TAB 4: Knowledge Base (📖 قاعدة المعرفة واقتراحات الدماغ) */}
      {subTab === 'knowledge' && (
        <div>
          <div style={gridRow}>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #818cf8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📚</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إجمالي أنماط الأخطاء المكتشفة</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8', marginTop: '0.25rem' }}>42 نمط</div>
            </div>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>💡</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>اقتراحات تطوير معلقة</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>
                {suggestions.filter((s: any) => s.status === 'pending').length} توصيات
              </div>
            </div>
            <div style={{ ...glass, textAlign: 'center', borderBottom: '3px solid #34d399' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎯</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>البنود المصنفة "ذهبية"</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>5,121 بند</div>
            </div>
          </div>
          
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle style={{ color: '#fbbf24', width: '18px', height: '18px' }} />
              <span>اقتراحات وتوصيات تطوير الدماغ (المستمدة من التشخيص الذاتي)</span>
            </h3>
            {suggestions.filter((s: any) => s.status === 'pending').length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>
                لا توجد اقتراحات أو توصيات معلقة حالياً. شغل الفحص الشامل في تبويب تحكم الدماغ لتحديث هذه التوصيات.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {suggestions.filter((s: any) => s.status === 'pending').slice(0, 10).map((s: any, i: number) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '0.85rem 1rem', 
                      borderRadius: '10px', 
                      background: s.priority === 'critical' ? 'rgba(239,68,68,0.06)' : 'rgba(251,191,36,0.05)', 
                      borderRight: `4px solid ${s.priority === 'critical' ? '#ef4444' : '#fbbf24'}`,
                      borderLeft: '1px solid rgba(255,255,255,0.02)',
                      borderTop: '1px solid rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{s.titleAr || s.title}</span>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '4px', 
                        background: s.priority === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', 
                        color: s.priority === 'critical' ? '#ef4444' : '#fbbf24', 
                        fontWeight: 'bold' 
                      }}>
                        {s.priority === 'critical' ? 'خطير جداً' : s.priority === 'high' ? 'عالي الأهمية' : 'متوسط'}
                      </span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: '1.4' }}>
                      {s.descriptionAr || s.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>الأثر: {s.impact}</span>
                      <span>القسم: {s.area}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPanel;
