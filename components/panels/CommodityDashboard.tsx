/**
 * ARBA V8.3 — Commodity Dashboard
 * لوحة بورصة المواد الخام — تتبع الأسعار والتنبؤات والتنبيهات
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, BarChart3, Shield, Zap, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Clock, Target, Bell } from 'lucide-react';
import { commodityEngine, type CommodityPrice, type CommodityTrend, type CommodityAlert } from '../../services/commodityIntelligenceEngine';

interface CommodityDashboardProps {
  language?: string;
}

const CommodityDashboard: React.FC<CommodityDashboardProps> = ({ language = 'ar' }) => {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [trends, setTrends] = useState<CommodityTrend[]>([]);
  const [alerts, setAlerts] = useState<CommodityAlert[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;
  const isRTL = language === 'ar';

  useEffect(() => {
    commodityEngine.initialize();
    loadData();
  }, []);

  const loadData = () => {
    setPrices(commodityEngine.getAllPrices());
    setTrends(commodityEngine.getAllTrends());
    setAlerts(commodityEngine.getAlerts());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    commodityEngine.refreshPrices();
    loadData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getTrendForCommodity = (id: string) => trends.find(t => t.commodityId === id);

  const selectedTrend = selectedCommodity ? getTrendForCommodity(selectedCommodity) : null;
  const selectedPrice = selectedCommodity ? prices.find(p => p.id === selectedCommodity) : null;
  const selectedHistory = selectedCommodity ? commodityEngine.getHistory(selectedCommodity) : [];

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                {t('📈 بورصة مواد البناء', '📈 Construction Materials Exchange')}
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">LIVE</span>
              </h1>
              <p className="text-[10px] text-slate-400">
                {t('تتبع ذكي — تنبؤات — حماية رأس المال', 'Smart tracking — Predictions — Capital protection')}
              </p>
            </div>
          </div>
          <button onClick={handleRefresh} className={`flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl text-xs font-medium transition-all ${isRefreshing ? 'animate-pulse' : ''}`}>
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('تحديث', 'Refresh')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Alert Banner */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-300">{isRTL ? criticalAlerts[0].titleAr : criticalAlerts[0].titleEn}</p>
              <p className="text-xs text-red-400/70 mt-1">{isRTL ? criticalAlerts[0].messageAr : criticalAlerts[0].messageEn}</p>
              <p className="text-xs text-amber-300 mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {criticalAlerts[0].recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Price Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {prices.map(price => {
            const trend = getTrendForCommodity(price.id);
            const isUp = price.changePercent24h > 0;
            const isSelected = selectedCommodity === price.id;

            return (
              <div key={price.id} onClick={() => setSelectedCommodity(isSelected ? null : price.id)}
                className={`relative bg-slate-800/60 border rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] ${
                  isSelected ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20' : 'border-slate-700/50 hover:border-slate-600'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">{price.symbol}</span>
                  {trend && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      trend.direction === 'rising' ? 'bg-red-500/20 text-red-300' :
                      trend.direction === 'falling' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-600/50 text-slate-400'
                    }`}>
                      {trend.direction === 'rising' ? t('صاعد', '↑') : trend.direction === 'falling' ? t('هابط', '↓') : t('مستقر', '→')}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate mb-1">{isRTL ? price.nameAr : price.nameEn}</p>
                <p className="text-lg font-bold text-white">{price.currentPrice.toLocaleString()}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(price.changePercent24h).toFixed(2)}%
                </div>
                {/* Mini sparkline bar */}
                <div className="mt-2 h-1 rounded-full bg-slate-700/50 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isUp ? 'bg-red-500/60' : 'bg-emerald-500/60'}`}
                    style={{ width: `${Math.min(100, Math.abs(price.changePercent24h) * 15 + 20)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedCommodity && selectedPrice && selectedTrend && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                {isRTL ? selectedPrice.nameAr : selectedPrice.nameEn} — {t('تحليل تفصيلي', 'Detailed Analysis')}
              </h3>
              <span className="text-xs text-slate-500">{t('آخر تحديث:', 'Updated:')} {new Date(selectedPrice.lastUpdated).toLocaleTimeString()}</span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: t('السعر الحالي', 'Current'), value: selectedPrice.currentPrice.toLocaleString(), icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-white' },
                { label: t('متوسط 7 أيام', 'MA7'), value: selectedTrend.ma7.toLocaleString(), icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-blue-400' },
                { label: t('متوسط 30 يوم', 'MA30'), value: selectedTrend.ma30.toLocaleString(), icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-purple-400' },
                { label: t('الزخم', 'Momentum'), value: `${selectedTrend.momentum > 0 ? '+' : ''}${selectedTrend.momentum}%`, icon: <Zap className="w-3.5 h-3.5" />, color: selectedTrend.momentum > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: t('التذبذب', 'Volatility'), value: `${selectedTrend.volatility}%`, icon: <Activity className="w-3.5 h-3.5" />, color: selectedTrend.volatility > 8 ? 'text-amber-400' : 'text-slate-400' },
                { label: t('توقع 30 يوم', 'Forecast 30d'), value: selectedTrend.prediction30d.toLocaleString(), icon: <Target className="w-3.5 h-3.5" />, color: selectedTrend.predictionChange > 0 ? 'text-red-400' : 'text-emerald-400' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-700/30 border border-slate-600/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={m.color}>{m.icon}</span>
                    <span className="text-[10px] text-slate-500">{m.label}</span>
                  </div>
                  <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Prediction Bar */}
            <div className="bg-slate-700/30 border border-slate-600/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  {t('التنبؤ — 30 يوم', 'Prediction — 30 Days')}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedTrend.confidence >= 60 ? 'bg-emerald-500/20 text-emerald-300' :
                  selectedTrend.confidence >= 40 ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {t('ثقة:', 'Conf:')} {selectedTrend.confidence}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{t('الحالي', 'Now')}: {selectedPrice.currentPrice.toLocaleString()}</span>
                    <span>{t('المتوقع', 'Expected')}: {selectedTrend.prediction30d.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-600/30 overflow-hidden relative">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      selectedTrend.predictionChange > 5 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                      selectedTrend.predictionChange > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                      'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`} style={{ width: `${Math.min(100, Math.max(10, 50 + selectedTrend.predictionChange * 3))}%` }} />
                  </div>
                </div>
                <div className={`text-xl font-bold ${selectedTrend.predictionChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedTrend.predictionChange > 0 ? '+' : ''}{selectedTrend.predictionChange}%
                </div>
              </div>
            </div>

            {/* Price History Chart (Text-based) */}
            <div className="bg-slate-700/30 border border-slate-600/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t('آخر 30 يوم', 'Last 30 Days')}
              </h4>
              <div className="flex items-end gap-0.5 h-16">
                {selectedHistory.slice(-30).map((point, i) => {
                  const allPrices = selectedHistory.slice(-30).map(p => p.price);
                  const min = Math.min(...allPrices);
                  const max = Math.max(...allPrices);
                  const range = max - min || 1;
                  const height = ((point.price - min) / range) * 100;
                  const isLast = i === selectedHistory.slice(-30).length - 1;

                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end" title={`${point.date}: ${point.price}`}>
                      <div className={`rounded-t-sm transition-all ${
                        isLast ? 'bg-amber-400' :
                        point.price > selectedHistory.slice(-30)[Math.max(0, i - 1)]?.price
                          ? 'bg-red-500/40' : 'bg-emerald-500/40'
                      }`} style={{ height: `${Math.max(4, height)}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>{selectedHistory.slice(-30)[0]?.date}</span>
                <span>{t('اليوم', 'Today')}</span>
              </div>
            </div>
          </div>
        )}

        {/* All Alerts */}
        {alerts.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              {t(`التنبيهات النشطة (${alerts.length})`, `Active Alerts (${alerts.length})`)}
            </h3>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border flex items-start gap-3 ${
                  alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <span className="text-sm mt-0.5">
                    {alert.type === 'price_surge' ? '📈' : alert.type === 'buy_signal' ? '💰' : '⚡'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{isRTL ? alert.titleAr : alert.titleEn}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{isRTL ? alert.messageAr : alert.messageEn}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-amber-300 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {alert.recommendation}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {t('تأثير على BOQ:', 'BOQ Impact:')} {alert.impactOnBOQ}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOQ Risk Summary */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t('معامل مخاطرة التسعير حسب الفئة', 'Pricing Risk Factors by Category')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['concrete', 'structure', 'electrical', 'plumbing', 'windows', 'finishes', 'earthworks', 'metalwork'].map(cat => {
              const risk = commodityEngine.getCategoryRiskFactor(cat);
              const riskPct = Math.round((risk - 1) * 100);
              const labels: Record<string, string> = {
                concrete: t('خرسانة', 'Concrete'), structure: t('هياكل', 'Structure'),
                electrical: t('كهرباء', 'Electrical'), plumbing: t('سباكة', 'Plumbing'),
                windows: t('نوافذ', 'Windows'), finishes: t('تشطيبات', 'Finishes'),
                earthworks: t('ترابية', 'Earthworks'), metalwork: t('معادن', 'Metalwork'),
              };

              return (
                <div key={cat} className="bg-slate-700/30 border border-slate-600/20 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{labels[cat]}</span>
                  <span className={`text-xs font-bold ${
                    riskPct > 5 ? 'text-red-400' : riskPct > 2 ? 'text-amber-400' : riskPct < -2 ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {riskPct > 0 ? '+' : ''}{riskPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommodityDashboard;
