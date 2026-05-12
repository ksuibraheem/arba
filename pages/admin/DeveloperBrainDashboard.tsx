import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Activity, Users, FileText, Settings, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Language } from '../../types';
import { silentBrainTracker, BrainAnalytics } from '../../services/silentBrainTracker';

interface DeveloperBrainDashboardProps {
  language: Language;
  onNavigate: (page: string) => void;
}

const DeveloperBrainDashboard: React.FC<DeveloperBrainDashboardProps> = ({ language, onNavigate }) => {
  const [analytics, setAnalytics] = useState<BrainAnalytics | null>(null);
  const isRTL = language === 'ar';

  const refreshData = () => {
    setAnalytics(silentBrainTracker.getAnalytics());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (!analytics) return <div className="p-8 text-center text-white">Loading Brain Data...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="text-emerald-400" />
                {isRTL ? 'دماغ أربا (لوحة المطور)' : 'Arba Brain (Developer Dashboard)'}
              </h1>
              <p className="text-sm text-slate-400">
                {isRTL ? 'مراقبة صامتة لسلوك المستخدمين والنظام' : 'Silent monitoring of user & system behavior'}
              </p>
            </div>
          </div>
          <button 
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title={isRTL ? 'إجمالي الجلسات' : 'Total Sessions'} 
            value={analytics.totalSessions.toString()} 
            icon={<Users className="text-blue-400" />} 
          />
          <StatCard 
            title={isRTL ? 'جلسات اليوم' : 'Sessions Today'} 
            value={analytics.sessionsToday.toString()} 
            icon={<Activity className="text-emerald-400" />} 
          />
          <StatCard 
            title={isRTL ? 'متوسط مدة الجلسة' : 'Avg Session Time'} 
            value={`${analytics.averageSessionMinutes} min`} 
            icon={<Clock className="text-amber-400" />} 
          />
          <StatCard 
            title={isRTL ? 'عروض الأسعار المطبوعة' : 'Quotes Printed'} 
            value={analytics.totalQuotesPrinted.toString()} 
            icon={<FileText className="text-purple-400" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Behavior Analysis */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              {isRTL ? 'سلوك التسعير (أكثر بنود تعديلاً)' : 'Pricing Behavior (Most Overridden)'}
            </h2>
            <div className="space-y-3">
              {analytics.mostOverriddenItems.length > 0 ? (
                analytics.mostOverriddenItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-sm">{item.itemName}</span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-emerald-400">
                      {item.count} {isRTL ? 'مرات' : 'times'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-sm text-center py-4">
                  {isRTL ? 'لا توجد بيانات تعديل' : 'No override data yet'}
                </div>
              )}
            </div>
          </div>

          {/* System Health & Errors */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              {isRTL ? 'صحة النظام والأخطاء' : 'System Health & Errors'}
            </h2>
            <div className="mb-4 flex gap-4">
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-1 text-center">
                 <div className="text-xs text-slate-400 mb-1">{isRTL ? 'إجمالي الأخطاء' : 'Total Errors'}</div>
                 <div className="text-xl font-bold text-red-400">{analytics.errorCount}</div>
               </div>
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-1 text-center">
                 <div className="text-xs text-slate-400 mb-1">{isRTL ? 'متوسط وقت الحساب' : 'Avg Calc Time'}</div>
                 <div className="text-xl font-bold text-emerald-400">{analytics.averageCalcTimeMs}ms</div>
               </div>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {analytics.recentErrors.length > 0 ? (
                analytics.recentErrors.map((err, i) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-200">
                    <div className="font-bold mb-1 text-red-300 text-xs">
                      {new Date(err.timestamp).toLocaleTimeString()} - {err.page}
                    </div>
                    {err.message}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-sm text-center py-4">
                  {isRTL ? 'النظام سليم - لا أخطاء' : 'System Healthy - No Errors'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Usage Patterns */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            {isRTL ? 'أنماط الاستخدام' : 'Usage Patterns'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Top Pages */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3">{isRTL ? 'الصفحات الأكثر زيارة' : 'Top Pages'}</h3>
              <div className="space-y-2">
                {analytics.topPages.map((page, i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-900 p-2 rounded">
                    <span>{page.page}</span>
                    <span className="text-emerald-400">{page.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Projects */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3">{isRTL ? 'أنواع المشاريع' : 'Project Types'}</h3>
              <div className="space-y-2">
                {Object.entries(analytics.projectTypeCounts).map(([type, count], i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-900 p-2 rounded">
                    <span>{type}</span>
                    <span className="text-blue-400">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Locations */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3">{isRTL ? 'المناطق' : 'Locations'}</h3>
              <div className="space-y-2">
                {Object.entries(analytics.locationCounts).map(([loc, count], i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-900 p-2 rounded">
                    <span>{loc}</span>
                    <span className="text-purple-400">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
      {icon}
    </div>
    <div>
      <div className="text-slate-400 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  </div>
);

export default DeveloperBrainDashboard;
