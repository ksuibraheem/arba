/**
 * ARBA Social Card Generator v8.0 — محرك الجماليات الاجتماعية
 * 
 * SOVEREIGN v8.0 — Phase 3.1: Visual Identity & Social Presence
 * 
 * Converts pricing data into beautiful, Instagram-ready infographics.
 * Uses Canvas API to generate branded social cards.
 */

export type CardType = 'price_comparison' | 'cost_heatmap' | 'achievement' | 'market_insight';

export interface SocialCardData {
  type: CardType;
  title: string;
  subtitle?: string;
  stats: { label: string; value: string; highlight?: boolean }[];
  branding?: {
    companyName?: string;
    tagline?: string;
  };
  language: 'ar' | 'en';
}

// ====================== BRAND COLORS ======================

const BRAND = {
  primary: '#0D9488',      // Teal-600
  primaryDark: '#0F766E',  // Teal-700
  accent: '#F59E0B',       // Amber-500
  gold: '#D4A030',
  dark: '#0F172A',         // Slate-900
  darker: '#020617',       // Slate-950
  text: '#F8FAFC',         // Slate-50
  textMuted: '#94A3B8',    // Slate-400
  danger: '#EF4444',
  success: '#10B981',
  gradientStart: '#0F172A',
  gradientEnd: '#1E293B',
};

// ====================== CANVAS HELPERS ======================

function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, BRAND.darker);
  gradient.addColorStop(0.5, BRAND.dark);
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawGeometricPattern(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.strokeStyle = BRAND.primary;
  ctx.lineWidth = 1;

  // Geometric grid pattern (Arba brand identity)
  for (let x = 0; x < w; x += 60) {
    for (let y = 0; y < h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30, y + 30);
      ctx.lineTo(x + 60, y);
      ctx.stroke();
    }
  }

  // Accent diagonal lines
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = BRAND.accent;
  ctx.lineWidth = 0.5;
  for (let i = -h; i < w + h; i += 120) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBrandBadge(ctx: CanvasRenderingContext2D, x: number, y: number, isAr: boolean): void {
  // Arba logo area — geometric badge
  ctx.save();

  // Outer ring
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.strokeStyle = BRAND.primary;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner fill
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  const badgeGrad = ctx.createRadialGradient(x, y, 0, x, y, 24);
  badgeGrad.addColorStop(0, BRAND.primary);
  badgeGrad.addColorStop(1, BRAND.primaryDark);
  ctx.fillStyle = badgeGrad;
  ctx.fill();

  // "أ" or "A" letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isAr ? 'أ' : 'A', x, y + 1);

  ctx.restore();
}

function drawGlowLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number): void {
  ctx.save();
  const gradient = ctx.createLinearGradient(x1, y, x2, y);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.2, BRAND.primary + '80');
  gradient.addColorStop(0.5, BRAND.primary);
  gradient.addColorStop(0.8, BRAND.primary + '80');
  gradient.addColorStop(1, 'transparent');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  // Glow effect
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 6;
  ctx.filter = 'blur(4px)';
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  ctx.restore();
}

// ====================== CARD GENERATORS ======================

/**
 * Generate a social media card as a data URL
 */
export function generateSocialCard(data: SocialCardData): string {
  const W = 1080; // Instagram square
  const H = 1080;
  const { canvas, ctx } = createCanvas(W, H);
  const isAr = data.language === 'ar';

  // Background
  drawGradientBackground(ctx, W, H);
  drawGeometricPattern(ctx, W, H);

  // Top brand badge
  drawBrandBadge(ctx, isAr ? W - 60 : 60, 60, isAr);

  // Brand name
  ctx.fillStyle = BRAND.textMuted;
  ctx.font = '16px Arial';
  ctx.textAlign = isAr ? 'right' : 'left';
  ctx.fillText(
    data.branding?.companyName || (isAr ? 'أربا للتسعير الذكي' : 'ARBA Smart Pricing'),
    isAr ? W - 100 : 100,
    66
  );

  // Divider glow line
  drawGlowLine(ctx, 40, 120, W - 40);

  // Card type indicator
  const typeLabels: Record<CardType, { ar: string; en: string; color: string }> = {
    price_comparison: { ar: '📊 مقارنة الأسعار', en: '📊 Price Comparison', color: BRAND.primary },
    cost_heatmap: { ar: '🔥 خريطة التكلفة', en: '🔥 Cost Heatmap', color: BRAND.accent },
    achievement: { ar: '🏆 إنجاز', en: '🏆 Achievement', color: BRAND.gold },
    market_insight: { ar: '📈 رؤية سوقية', en: '📈 Market Insight', color: BRAND.success },
  };

  const typeInfo = typeLabels[data.type];
  ctx.fillStyle = typeInfo.color;
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(isAr ? typeInfo.ar : typeInfo.en, W / 2, 160);

  // Title
  ctx.fillStyle = BRAND.text;
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';

  // Word wrap title
  const titleWords = data.title.split(' ');
  let titleLine = '';
  let titleY = 240;
  for (const word of titleWords) {
    const testLine = titleLine + word + ' ';
    if (ctx.measureText(testLine).width > W - 120) {
      ctx.fillText(titleLine.trim(), W / 2, titleY);
      titleLine = word + ' ';
      titleY += 52;
    } else {
      titleLine = testLine;
    }
  }
  ctx.fillText(titleLine.trim(), W / 2, titleY);

  // Subtitle
  if (data.subtitle) {
    ctx.fillStyle = BRAND.textMuted;
    ctx.font = '22px Arial';
    ctx.fillText(data.subtitle, W / 2, titleY + 50);
  }

  // Stats cards
  const statsY = titleY + 120;
  const cardW = (W - 120) / Math.min(data.stats.length, 2);
  const cardH = 160;

  data.stats.forEach((stat, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const cx = 60 + col * (cardW + 10);
    const cy = statsY + row * (cardH + 20);

    // Card background
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = stat.highlight ? BRAND.accent : BRAND.primary;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW - 10, cardH, 16);
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.strokeStyle = stat.highlight ? BRAND.accent + '40' : BRAND.primary + '30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW - 10, cardH, 16);
    ctx.stroke();

    // Stat value
    ctx.fillStyle = stat.highlight ? BRAND.accent : BRAND.text;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stat.value, cx + (cardW - 10) / 2, cy + 70);

    // Stat label
    ctx.fillStyle = BRAND.textMuted;
    ctx.font = '16px Arial';
    ctx.fillText(stat.label, cx + (cardW - 10) / 2, cy + 110);
  });

  // Bottom section
  drawGlowLine(ctx, 40, H - 120, W - 40);

  // Tagline
  ctx.fillStyle = BRAND.textMuted;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    data.branding?.tagline || (isAr ? 'تسعير ذكي • دقة هندسية • رؤية مستقبلية' : 'Smart Pricing • Engineering Precision • Future Vision'),
    W / 2,
    H - 70
  );

  // Hashtags
  ctx.fillStyle = BRAND.primary;
  ctx.font = '14px Arial';
  ctx.fillText(
    isAr ? '#آربا_للتسعير  #arba_pricing  #تسعير_ذكي  #مقاولات' : '#arba_pricing  #smart_pricing  #construction',
    W / 2,
    H - 40
  );

  return canvas.toDataURL('image/png');
}

/**
 * Generate a price comparison card
 */
export function generatePriceComparisonCard(params: {
  ourPrice: number;
  marketAvg: number;
  projectType: string;
  buildArea: number;
  language: 'ar' | 'en';
}): string {
  const isAr = params.language === 'ar';
  const pricePerSqm = params.buildArea > 0 ? params.ourPrice / params.buildArea : 0;
  const marketPerSqm = params.marketAvg;
  const diff = ((pricePerSqm - marketPerSqm) / marketPerSqm * 100);

  return generateSocialCard({
    type: 'price_comparison',
    title: isAr ? 'تسعيرك مقارنة بالسوق' : 'Your Price vs Market',
    subtitle: isAr
      ? `مشروع ${params.projectType} • ${params.buildArea.toLocaleString()} م²`
      : `${params.projectType} • ${params.buildArea.toLocaleString()} m²`,
    stats: [
      { label: isAr ? 'سعرك / م²' : 'Your Price/m²', value: `${Math.round(pricePerSqm).toLocaleString()} SAR` },
      { label: isAr ? 'متوسط السوق' : 'Market Avg', value: `${Math.round(marketPerSqm).toLocaleString()} SAR` },
      { label: isAr ? 'الفرق' : 'Difference', value: `${diff > 0 ? '+' : ''}${Math.round(diff)}%`, highlight: Math.abs(diff) > 10 },
      { label: isAr ? 'الإجمالي' : 'Total', value: `${Math.round(params.ourPrice).toLocaleString()} SAR` },
    ],
    language: params.language,
  });
}

/**
 * Generate a project achievement card
 */
export function generateAchievementCard(params: {
  projectNumber: number;
  totalValue: number;
  language: 'ar' | 'en';
}): string {
  const isAr = params.language === 'ar';
  return generateSocialCard({
    type: 'achievement',
    title: isAr ? `المشروع رقم ${params.projectNumber} على أربا!` : `Project #${params.projectNumber} on Arba!`,
    subtitle: isAr ? 'دقة في التسعير.. ثقة في التنفيذ' : 'Precision in pricing.. Confidence in execution',
    stats: [
      { label: isAr ? 'رقم المشروع' : 'Project #', value: `#${params.projectNumber}`, highlight: true },
      { label: isAr ? 'القيمة الإجمالية' : 'Total Value', value: `${Math.round(params.totalValue).toLocaleString()} SAR` },
    ],
    language: params.language,
  });
}

/**
 * Download the generated card as an image
 */
export function downloadSocialCard(dataUrl: string, filename = 'arba_social_card'): void {
  const link = document.createElement('a');
  link.download = `${filename}_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export default {
  generateSocialCard,
  generatePriceComparisonCard,
  generateAchievementCard,
  downloadSocialCard,
};
