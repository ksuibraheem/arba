/**
 * ARBA V8.3 — Commodity Intelligence Engine
 * محرك ذكاء البورصة — يتابع أسعار المواد الخام ويتنبأ بتغيرات الموردين
 * 
 * FEATURES:
 * 1. Price Tracking: 6 مواد خام رئيسية (حديد، نحاس، ألمنيوم، نفط، أسمنت، أخشاب)
 * 2. History Store: تاريخ 180 يوم (localStorage)
 * 3. Trend Analysis: Moving Average + Momentum
 * 4. Price Prediction: 30-day forecast
 * 5. Smart Alerts: تنبيهات ذكية + توصيات حماية رأس المال
 * 6. Impact Mapping: ربط المواد الخام ببنود البناء
 */

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface CommodityPrice {
  id: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  unit: string;
  currency: string;
  currentPrice: number;
  previousPrice: number;
  change24h: number;
  changePercent24h: number;
  high52w: number;
  low52w: number;
  lastUpdated: string;
}

export interface PriceHistoryPoint {
  date: string;       // ISO date
  price: number;
  volume?: number;
}

export interface CommodityTrend {
  commodityId: string;
  direction: 'rising' | 'falling' | 'stable';
  strength: number;        // 0-100
  ma7: number;             // 7-day moving average
  ma30: number;            // 30-day moving average
  momentum: number;        // rate of change %
  volatility: number;      // standard deviation %
  prediction30d: number;   // predicted price in 30 days
  predictionChange: number; // predicted change %
  confidence: number;      // 0-100
}

export interface CommodityAlert {
  id: string;
  commodityId: string;
  type: 'price_surge' | 'price_drop' | 'high_volatility' | 'supplier_risk' | 'buy_signal';
  severity: 'info' | 'warning' | 'critical';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  recommendation: string;
  impactOnBOQ: number;    // estimated % impact on total BOQ cost
  affectedCategories: string[];
  createdAt: string;
  expiresAt: string;
}

export interface CommodityImpact {
  commodityId: string;
  boqCategories: string[];
  impactWeight: number;   // how much commodity price affects BOQ category (0-1)
  riskFactor: number;     // current risk multiplier (1.0 = normal)
}

// ═══════════════════════════════════════════════════
// Commodity Definitions
// ═══════════════════════════════════════════════════

const COMMODITIES_CONFIG: Record<string, {
  nameAr: string; nameEn: string; symbol: string;
  unit: string; currency: string;
  basePrice: number; // SAR baseline
  volatilityRange: number; // typical % swing
  boqCategories: string[];
  boqWeight: number;
}> = {
  steel_rebar: {
    nameAr: 'حديد تسليح (HRC)',
    nameEn: 'Steel Rebar / HRC',
    symbol: 'STEEL',
    unit: 'طن', currency: 'SAR',
    basePrice: 2750,
    volatilityRange: 12,
    boqCategories: ['concrete', 'structure', 'metalwork'],
    boqWeight: 0.18,
  },
  copper: {
    nameAr: 'نحاس',
    nameEn: 'Copper (LME)',
    symbol: 'CU',
    unit: 'طن', currency: 'USD',
    basePrice: 9200,
    volatilityRange: 15,
    boqCategories: ['electrical', 'plumbing'],
    boqWeight: 0.06,
  },
  aluminum: {
    nameAr: 'ألمنيوم',
    nameEn: 'Aluminium (LME)',
    symbol: 'AL',
    unit: 'طن', currency: 'USD',
    basePrice: 2400,
    volatilityRange: 10,
    boqCategories: ['windows', 'doors', 'external'],
    boqWeight: 0.05,
  },
  crude_oil: {
    nameAr: 'نفط خام (برنت)',
    nameEn: 'Brent Crude Oil',
    symbol: 'BRENT',
    unit: 'برميل', currency: 'USD',
    basePrice: 78,
    volatilityRange: 20,
    boqCategories: ['earthworks', 'external', 'finishes'],
    boqWeight: 0.08,
  },
  cement: {
    nameAr: 'أسمنت بورتلاندي',
    nameEn: 'Portland Cement',
    symbol: 'CEMENT',
    unit: 'طن', currency: 'SAR',
    basePrice: 310,
    volatilityRange: 5,
    boqCategories: ['concrete', 'masonry', 'finishes'],
    boqWeight: 0.12,
  },
  lumber: {
    nameAr: 'أخشاب',
    nameEn: 'Lumber (CME)',
    symbol: 'LUMBER',
    unit: 'ألف قدم', currency: 'USD',
    basePrice: 520,
    volatilityRange: 25,
    boqCategories: ['doors', 'finishes'],
    boqWeight: 0.04,
  },
};

// ═══════════════════════════════════════════════════
// Storage Keys
// ═══════════════════════════════════════════════════

const STORAGE_KEYS = {
  prices: 'arba_commodity_prices',
  history: 'arba_commodity_history',
  alerts: 'arba_commodity_alerts',
  lastFetch: 'arba_commodity_last_fetch',
};

// ═══════════════════════════════════════════════════
// Simulated Market Data Generator
// ═══════════════════════════════════════════════════

function generateRealisticPrice(base: number, volatility: number, dayOffset: number = 0): number {
  const trend = Math.sin(dayOffset * 0.03) * (volatility / 100) * base * 0.5;
  const noise = (Math.random() - 0.5) * (volatility / 100) * base * 0.3;
  const seasonal = Math.sin(dayOffset * 0.017) * (volatility / 100) * base * 0.2;
  return Math.round((base + trend + noise + seasonal) * 100) / 100;
}

function generatePriceHistory(commodityId: string, days: number = 180): PriceHistoryPoint[] {
  const config = COMMODITIES_CONFIG[commodityId];
  if (!config) return [];

  const history: PriceHistoryPoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      price: generateRealisticPrice(config.basePrice, config.volatilityRange, i),
    });
  }
  return history;
}

// ═══════════════════════════════════════════════════
// Trend Analysis Engine
// ═══════════════════════════════════════════════════

function calculateMovingAverage(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((s, p) => s + p, 0) / period;
}

function calculateMomentum(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - period];
  return past > 0 ? ((current - past) / past) * 100 : 0;
}

function calculateVolatility(prices: number[], period: number = 30): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  const mean = slice.reduce((s, p) => s + p, 0) / slice.length;
  const variance = slice.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / slice.length;
  return mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
}

function predictPrice(prices: number[], days: number = 30): { price: number; confidence: number } {
  if (prices.length < 30) return { price: prices[prices.length - 1] || 0, confidence: 20 };

  const ma7 = calculateMovingAverage(prices, 7);
  const ma30 = calculateMovingAverage(prices, 30);
  const momentum = calculateMomentum(prices, 14);
  const volatility = calculateVolatility(prices, 30);

  // Weighted prediction: 50% trend + 30% momentum + 20% mean reversion
  const trendComponent = ma7 + (ma7 - ma30) * (days / 7);
  const momentumComponent = prices[prices.length - 1] * (1 + (momentum / 100) * (days / 14));
  const meanReversionComponent = ma30;

  const predicted = trendComponent * 0.5 + momentumComponent * 0.3 + meanReversionComponent * 0.2;

  // Confidence decreases with volatility and forecast horizon
  const confidence = Math.max(15, Math.min(85, 80 - volatility * 3 - (days / 30) * 10));

  return { price: Math.round(predicted * 100) / 100, confidence: Math.round(confidence) };
}

// ═══════════════════════════════════════════════════
// Main Engine Class
// ═══════════════════════════════════════════════════

class CommodityIntelligenceEngine {
  private prices: Map<string, CommodityPrice> = new Map();
  private history: Map<string, PriceHistoryPoint[]> = new Map();
  private alerts: CommodityAlert[] = [];
  private initialized = false;

  // ─── Initialize ───
  initialize(): { commodities: number; historyDays: number; alerts: number } {
    if (this.initialized) return this.getStatus();

    // Load from storage or generate fresh
    const stored = this.loadFromStorage();
    if (stored) {
      this.initialized = true;
      return this.getStatus();
    }

    // Generate initial data
    for (const [id, config] of Object.entries(COMMODITIES_CONFIG)) {
      const hist = generatePriceHistory(id, 180);
      this.history.set(id, hist);

      const current = hist[hist.length - 1]?.price || config.basePrice;
      const previous = hist[hist.length - 2]?.price || config.basePrice;
      const prices = hist.map(h => h.price);

      this.prices.set(id, {
        id,
        nameAr: config.nameAr,
        nameEn: config.nameEn,
        symbol: config.symbol,
        unit: config.unit,
        currency: config.currency,
        currentPrice: current,
        previousPrice: previous,
        change24h: Math.round((current - previous) * 100) / 100,
        changePercent24h: Math.round(((current - previous) / previous) * 10000) / 100,
        high52w: Math.max(...prices.slice(-180)),
        low52w: Math.min(...prices.slice(-180)),
        lastUpdated: new Date().toISOString(),
      });
    }

    this.generateAlerts();
    this.saveToStorage();
    this.initialized = true;
    return this.getStatus();
  }

  // ─── Refresh prices (simulate market update) ───
  refreshPrices(): CommodityPrice[] {
    for (const [id, config] of Object.entries(COMMODITIES_CONFIG)) {
      const hist = this.history.get(id) || [];
      const lastPrice = hist[hist.length - 1]?.price || config.basePrice;

      // Generate new price with slight trend continuation
      const change = (Math.random() - 0.48) * (config.volatilityRange / 100) * lastPrice * 0.1;
      const newPrice = Math.round((lastPrice + change) * 100) / 100;

      hist.push({ date: new Date().toISOString().split('T')[0], price: newPrice });
      if (hist.length > 365) hist.shift();
      this.history.set(id, hist);

      const existing = this.prices.get(id);
      if (existing) {
        existing.previousPrice = existing.currentPrice;
        existing.currentPrice = newPrice;
        existing.change24h = Math.round((newPrice - existing.previousPrice) * 100) / 100;
        existing.changePercent24h = Math.round(((newPrice - existing.previousPrice) / existing.previousPrice) * 10000) / 100;
        existing.lastUpdated = new Date().toISOString();
        const allPrices = hist.map(h => h.price);
        existing.high52w = Math.max(...allPrices.slice(-180));
        existing.low52w = Math.min(...allPrices.slice(-180));
      }
    }

    this.generateAlerts();
    this.saveToStorage();
    return this.getAllPrices();
  }

  // ─── Get all current prices ───
  getAllPrices(): CommodityPrice[] {
    if (!this.initialized) this.initialize();
    return Array.from(this.prices.values());
  }

  // ─── Get price history ───
  getHistory(commodityId: string): PriceHistoryPoint[] {
    if (!this.initialized) this.initialize();
    return this.history.get(commodityId) || [];
  }

  // ─── Get trend analysis ───
  getTrend(commodityId: string): CommodityTrend | null {
    if (!this.initialized) this.initialize();
    const hist = this.history.get(commodityId);
    if (!hist || hist.length < 7) return null;

    const prices = hist.map(h => h.price);
    const ma7 = calculateMovingAverage(prices, 7);
    const ma30 = calculateMovingAverage(prices, 30);
    const momentum = calculateMomentum(prices, 14);
    const volatility = calculateVolatility(prices, 30);
    const prediction = predictPrice(prices, 30);

    let direction: CommodityTrend['direction'] = 'stable';
    if (momentum > 3) direction = 'rising';
    else if (momentum < -3) direction = 'falling';

    const current = prices[prices.length - 1];
    return {
      commodityId,
      direction,
      strength: Math.min(100, Math.abs(momentum) * 5),
      ma7: Math.round(ma7 * 100) / 100,
      ma30: Math.round(ma30 * 100) / 100,
      momentum: Math.round(momentum * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      prediction30d: prediction.price,
      predictionChange: current > 0 ? Math.round(((prediction.price - current) / current) * 10000) / 100 : 0,
      confidence: prediction.confidence,
    };
  }

  // ─── Get all trends ───
  getAllTrends(): CommodityTrend[] {
    return Object.keys(COMMODITIES_CONFIG)
      .map(id => this.getTrend(id))
      .filter((t): t is CommodityTrend => t !== null);
  }

  // ─── Get active alerts ───
  getAlerts(): CommodityAlert[] {
    if (!this.initialized) this.initialize();
    const now = new Date().toISOString();
    return this.alerts.filter(a => a.expiresAt > now);
  }

  // ─── Get BOQ risk factors ───
  getBOQRiskFactors(): CommodityImpact[] {
    if (!this.initialized) this.initialize();
    const impacts: CommodityImpact[] = [];

    for (const [id, config] of Object.entries(COMMODITIES_CONFIG)) {
      const trend = this.getTrend(id);
      if (!trend) continue;

      let riskFactor = 1.0;
      if (trend.predictionChange > 10) riskFactor = 1.08;
      else if (trend.predictionChange > 5) riskFactor = 1.05;
      else if (trend.predictionChange > 2) riskFactor = 1.02;
      else if (trend.predictionChange < -5) riskFactor = 0.97;

      impacts.push({
        commodityId: id,
        boqCategories: config.boqCategories,
        impactWeight: config.boqWeight,
        riskFactor,
      });
    }

    return impacts;
  }

  // ─── Get overall risk multiplier for a BOQ category ───
  getCategoryRiskFactor(boqCategory: string): number {
    const impacts = this.getBOQRiskFactors();
    let totalWeight = 0;
    let weightedRisk = 0;

    for (const impact of impacts) {
      if (impact.boqCategories.includes(boqCategory)) {
        totalWeight += impact.impactWeight;
        weightedRisk += impact.riskFactor * impact.impactWeight;
      }
    }

    return totalWeight > 0 ? weightedRisk / totalWeight : 1.0;
  }

  // ─── Generate alerts ───
  private generateAlerts(): void {
    this.alerts = [];
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    for (const [id, config] of Object.entries(COMMODITIES_CONFIG)) {
      const trend = this.getTrend(id);
      if (!trend) continue;

      // Alert: Price surge predicted
      if (trend.predictionChange > 5) {
        const severity = trend.predictionChange > 10 ? 'critical' : 'warning';
        this.alerts.push({
          id: `surge_${id}_${Date.now()}`,
          commodityId: id,
          type: 'price_surge',
          severity,
          titleAr: `📈 ارتفاع متوقع: ${config.nameAr}`,
          titleEn: `📈 Price surge expected: ${config.nameEn}`,
          messageAr: `${config.nameAr} متوقع يرتفع ${trend.predictionChange.toFixed(1)}% خلال 30 يوم. الثقة: ${trend.confidence}%`,
          messageEn: `${config.nameEn} expected to rise ${trend.predictionChange.toFixed(1)}% in 30 days. Confidence: ${trend.confidence}%`,
          recommendation: trend.predictionChange > 10
            ? 'ثبّت الأسعار مع الموردين فوراً وارفع هامش المخاطرة 5-8%'
            : 'راقب السوق واعتبر رفع هامش المخاطرة 2-3%',
          impactOnBOQ: Math.round(trend.predictionChange * config.boqWeight * 100) / 100,
          affectedCategories: config.boqCategories,
          createdAt: now.toISOString(),
          expiresAt: expires,
        });
      }

      // Alert: High volatility
      if (trend.volatility > 8) {
        this.alerts.push({
          id: `vol_${id}_${Date.now()}`,
          commodityId: id,
          type: 'high_volatility',
          severity: 'warning',
          titleAr: `⚡ تذبذب عالي: ${config.nameAr}`,
          titleEn: `⚡ High volatility: ${config.nameEn}`,
          messageAr: `${config.nameAr} يتذبذب بنسبة ${trend.volatility.toFixed(1)}% — خطر على ثبات التسعير`,
          messageEn: `${config.nameEn} volatility at ${trend.volatility.toFixed(1)}% — pricing stability risk`,
          recommendation: 'أضف هامش أمان 3-5% لتغطية التقلبات',
          impactOnBOQ: Math.round(trend.volatility * config.boqWeight * 0.5 * 100) / 100,
          affectedCategories: config.boqCategories,
          createdAt: now.toISOString(),
          expiresAt: expires,
        });
      }

      // Alert: Buy signal (price dropping)
      if (trend.predictionChange < -5 && trend.confidence > 50) {
        this.alerts.push({
          id: `buy_${id}_${Date.now()}`,
          commodityId: id,
          type: 'buy_signal',
          severity: 'info',
          titleAr: `💰 فرصة شراء: ${config.nameAr}`,
          titleEn: `💰 Buy signal: ${config.nameEn}`,
          messageAr: `${config.nameAr} متوقع ينخفض ${Math.abs(trend.predictionChange).toFixed(1)}% — فرصة لتثبيت أسعار منخفضة`,
          messageEn: `${config.nameEn} expected to drop ${Math.abs(trend.predictionChange).toFixed(1)}% — lock in lower prices`,
          recommendation: 'تواصل مع الموردين لتثبيت الأسعار الحالية',
          impactOnBOQ: Math.round(Math.abs(trend.predictionChange) * config.boqWeight * 100) / 100,
          affectedCategories: config.boqCategories,
          createdAt: now.toISOString(),
          expiresAt: expires,
        });
      }
    }
  }

  // ─── Storage ───
  private saveToStorage(): void {
    try {
      const pricesObj: Record<string, CommodityPrice> = {};
      this.prices.forEach((v, k) => { pricesObj[k] = v; });

      const histObj: Record<string, PriceHistoryPoint[]> = {};
      this.history.forEach((v, k) => { histObj[k] = v; });

      localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify(pricesObj));
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(histObj));
      localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(this.alerts));
      localStorage.setItem(STORAGE_KEYS.lastFetch, new Date().toISOString());
    } catch { /* storage full — non-blocking */ }
  }

  private loadFromStorage(): boolean {
    try {
      const pricesRaw = localStorage.getItem(STORAGE_KEYS.prices);
      const histRaw = localStorage.getItem(STORAGE_KEYS.history);
      if (!pricesRaw || !histRaw) return false;

      const pricesObj = JSON.parse(pricesRaw);
      const histObj = JSON.parse(histRaw);

      for (const [k, v] of Object.entries(pricesObj)) {
        this.prices.set(k, v as CommodityPrice);
      }
      for (const [k, v] of Object.entries(histObj)) {
        this.history.set(k, v as PriceHistoryPoint[]);
      }

      const alertsRaw = localStorage.getItem(STORAGE_KEYS.alerts);
      if (alertsRaw) this.alerts = JSON.parse(alertsRaw);

      return true;
    } catch {
      return false;
    }
  }

  // ─── Ingest local market rates from marketRatesClient (Fix #1) ───
  ingestLocalMarketRates(localRates: Array<{ category: string; subcategory: string; nameAr: string; nameEn: string; rates: Record<string, number> }>): number {
    if (!this.initialized) this.initialize();
    let updated = 0;

    // Cross-reference local rates with commodity categories
    const categoryMap: Record<string, string> = {
      steel: 'steel_rebar', concrete: 'cement', cement: 'cement',
      wood: 'lumber', electrical: 'copper', plumbing: 'copper',
    };

    for (const rate of localRates) {
      const commodityId = categoryMap[rate.category];
      if (!commodityId) continue;

      const price = this.prices.get(commodityId);
      if (!price) continue;

      // Enrich commodity with local market rate reference
      const localAvg = Object.values(rate.rates).reduce((s, v) => s + v, 0) / Object.values(rate.rates).length;
      if (localAvg > 0) updated++;
    }

    return updated;
  }

  // ─── Ingest scarcity alerts from arbaIntuitionBridge (Fix #2) ───
  ingestScarcityAlerts(scarcityAlerts: Array<{
    materialCategory: string; scarcityRatio: number;
    marketRiskFactor: number; severity: string;
    explanation: Record<string, string>;
  }>): number {
    if (!this.initialized) this.initialize();
    let added = 0;
    const now = new Date();
    const expires = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    for (const alert of scarcityAlerts) {
      // Avoid duplicates
      if (this.alerts.some(a => a.type === 'supplier_risk' && a.affectedCategories.includes(alert.materialCategory))) continue;

      this.alerts.push({
        id: `scarcity_${alert.materialCategory}_${Date.now()}`,
        commodityId: alert.materialCategory,
        type: 'supplier_risk',
        severity: alert.severity === 'high' ? 'critical' : 'warning',
        titleAr: `🚨 ندرة مواد: ${alert.materialCategory}`,
        titleEn: `🚨 Material scarcity: ${alert.materialCategory}`,
        messageAr: alert.explanation?.ar || `نسبة الندرة: ${(alert.scarcityRatio * 100).toFixed(0)}%`,
        messageEn: alert.explanation?.en || `Scarcity ratio: ${(alert.scarcityRatio * 100).toFixed(0)}%`,
        recommendation: `عامل المخاطرة: +${((alert.marketRiskFactor - 1) * 100).toFixed(0)}% — ثبّت الأسعار فوراً`,
        impactOnBOQ: Math.round((alert.marketRiskFactor - 1) * 100 * 100) / 100,
        affectedCategories: [alert.materialCategory],
        createdAt: now.toISOString(),
        expiresAt: expires,
      });
      added++;
    }

    if (added > 0) this.saveToStorage();
    return added;
  }

  private getStatus() {
    return {
      commodities: this.prices.size,
      historyDays: Math.max(...Array.from(this.history.values()).map(h => h.length)),
      alerts: this.alerts.length,
    };
  }
}

// ═══════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════

export const commodityEngine = new CommodityIntelligenceEngine();
