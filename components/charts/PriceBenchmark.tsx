/**
 * PriceBenchmark — مؤشر مقارنة سعر م² مع متوسطات السوق
 * يقارن السعر المحسوب مع EST_COST_PER_SQM من constants.ts
 * يعرض مؤشر gauge: أقل من السوق ← تنافسي ← مرتفع
 */
import React from 'react';
import { Language, ProjectType } from '../../types';
import { EST_COST_PER_SQM } from '../../constants';

interface PriceBenchmarkProps {
  pricePerSqm: number;
  projectType: ProjectType;
  language: Language;
  compact?: boolean;
}

const PriceBenchmark: React.FC<PriceBenchmarkProps> = ({
  pricePerSqm, projectType, language, compact = false,
}) => {
  const isAr = language === 'ar';
  const benchmark = EST_COST_PER_SQM[projectType] || 2000;

  // Calculate deviation percentage
  const deviation = ((pricePerSqm - benchmark) / benchmark) * 100;

  // Determine status
  let status: 'low' | 'competitive' | 'fair' | 'high' | 'very_high';
  let statusColor: string;
  let statusLabel: string;
  let statusIcon: string;

  if (deviation < -15) {
    status = 'low';
    statusColor = '#3b82f6';
    statusLabel = isAr ? 'أقل من السوق' : 'Below Market';
    statusIcon = '📉';
  } else if (deviation < 5) {
    status = 'competitive';
    statusColor = '#10b981';
    statusLabel = isAr ? 'سعر تنافسي' : 'Competitive';
    statusIcon = '✅';
  } else if (deviation < 15) {
    status = 'fair';
    statusColor = '#f59e0b';
    statusLabel = isAr ? 'سعر معقول' : 'Fair Price';
    statusIcon = '⚖️';
  } else if (deviation < 30) {
    status = 'high';
    statusColor = '#f97316';
    statusLabel = isAr ? 'أعلى من السوق' : 'Above Market';
    statusIcon = '📈';
  } else {
    status = 'very_high';
    statusColor = '#ef4444';
    statusLabel = isAr ? 'مرتفع جداً' : 'Very High';
    statusIcon = '⚠️';
  }

  // Gauge calculations
  const gaugeWidth = compact ? 200 : 280;
  const gaugeHeight = compact ? 80 : 100;

  // Map deviation to position on gauge (-30% to +50% range)
  const minDev = -30;
  const maxDev = 50;
  const clampedDev = Math.max(minDev, Math.min(maxDev, deviation));
  const needlePosition = ((clampedDev - minDev) / (maxDev - minDev)) * 100;

  // Gauge arc parameters
  const cx = gaugeWidth / 2;
  const cy = gaugeHeight - 5;
  const radius = gaugeHeight - 15;
  const startAngle = Math.PI;
  const endAngle = 0;

  const angleRange = startAngle - endAngle;
  const needleAngle = startAngle - (needlePosition / 100) * angleRange;

  // Points for gauge arc (semi-circle)
  const createArcPath = (startPct: number, endPct: number) => {
    const sAngle = startAngle - (startPct / 100) * angleRange;
    const eAngle = startAngle - (endPct / 100) * angleRange;

    const x1 = cx + radius * Math.cos(sAngle);
    const y1 = cy + radius * Math.sin(sAngle);
    const x2 = cx + radius * Math.cos(eAngle);
    const y2 = cy + radius * Math.sin(eAngle);

    const largeArc = (endPct - startPct) > 50 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Needle endpoint
  const needleX = cx + (radius - 8) * Math.cos(needleAngle);
  const needleY = cy + (radius - 8) * Math.sin(needleAngle);

  const formatNum = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: compact ? '12px' : '20px',
      direction: isAr ? 'rtl' : 'ltr',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    }}>
      {/* Title */}
      <div style={{
        fontSize: compact ? '13px' : '15px',
        fontWeight: 700,
        color: '#334155',
        marginBottom: compact ? '8px' : '16px',
        textAlign: isAr ? 'right' : 'left',
      }}>
        {isAr ? '📐 مقارنة سعر المتر المربع' : '📐 Price per m² Benchmark'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {/* Gauge SVG */}
        <svg width={gaugeWidth} height={gaugeHeight + 10} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight + 10}`}>
          {/* Background arc */}
          <path
            d={createArcPath(0, 100)}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={compact ? 12 : 16}
            strokeLinecap="round"
          />

          {/* Color zones */}
          {/* Blue (below market) 0-18% */}
          <path d={createArcPath(0, 18)} fill="none" stroke="#3b82f6" strokeWidth={compact ? 12 : 16} strokeLinecap="butt" opacity={0.7} />
          {/* Green (competitive) 18-44% */}
          <path d={createArcPath(18, 44)} fill="none" stroke="#10b981" strokeWidth={compact ? 12 : 16} strokeLinecap="butt" opacity={0.7} />
          {/* Yellow (fair) 44-56% */}
          <path d={createArcPath(44, 56)} fill="none" stroke="#f59e0b" strokeWidth={compact ? 12 : 16} strokeLinecap="butt" opacity={0.7} />
          {/* Orange (high) 56-75% */}
          <path d={createArcPath(56, 75)} fill="none" stroke="#f97316" strokeWidth={compact ? 12 : 16} strokeLinecap="butt" opacity={0.7} />
          {/* Red (very high) 75-100% */}
          <path d={createArcPath(75, 100)} fill="none" stroke="#ef4444" strokeWidth={compact ? 12 : 16} strokeLinecap="round" opacity={0.7} />

          {/* Needle */}
          <line
            x1={cx} y1={cy}
            x2={needleX} y2={needleY}
            stroke={statusColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Needle center dot */}
          <circle cx={cx} cy={cy} r={5} fill={statusColor} />
          <circle cx={cx} cy={cy} r={2} fill="#ffffff" />

          {/* Labels */}
          <text x={10} y={gaugeHeight + 8} fontSize="9" fill="#64748b" textAnchor="start">
            {isAr ? 'منخفض' : 'Low'}
          </text>
          <text x={gaugeWidth - 10} y={gaugeHeight + 8} fontSize="9" fill="#64748b" textAnchor="end">
            {isAr ? 'مرتفع' : 'High'}
          </text>
        </svg>

        {/* Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{
            fontSize: compact ? '20px' : '26px',
            fontWeight: 800,
            color: statusColor,
          }}>
            {formatNum(pricePerSqm)} {isAr ? 'ر.س/م²' : 'SAR/m²'}
          </div>
          <div style={{
            fontSize: compact ? '11px' : '13px',
            color: statusColor,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {statusIcon} {statusLabel}
            <span style={{ color: '#64748b', fontWeight: 400, fontSize: '11px' }}>
              ({deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Benchmark comparison */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          padding: '10px 16px',
          background: '#f8fafc',
          borderRadius: '10px',
          width: '100%',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {isAr ? 'سعرك' : 'Your Price'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
              {formatNum(pricePerSqm)}
            </div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {isAr ? 'متوسط السوق' : 'Market Avg'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
              {formatNum(benchmark)}
            </div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {isAr ? 'الفرق' : 'Difference'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: statusColor }}>
              {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceBenchmark;
