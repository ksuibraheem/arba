/**
 * CostBreakdownChart — رسم Donut لتوزيع التكاليف
 * يعرض نسب: المواد / العمالة / المصاريف / الربح
 * مبني بـ SVG خالص بدون مكتبات خارجية
 */
import React, { useState } from 'react';
import { Language } from '../../types';

interface CostBreakdownProps {
  materialCost: number;
  laborCost: number;
  overhead: number;
  profit: number;
  language: Language;
  compact?: boolean;
}

interface Segment {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const CostBreakdownChart: React.FC<CostBreakdownProps> = ({
  materialCost, laborCost, overhead, profit, language, compact = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isAr = language === 'ar';

  const total = materialCost + laborCost + overhead + profit;
  if (total <= 0) return null;

  const segments: Segment[] = [
    {
      label: isAr ? 'المواد الخام' : 'Materials',
      value: materialCost,
      color: '#06b6d4',
      icon: '🧱',
    },
    {
      label: isAr ? 'الأيدي العاملة' : 'Labor',
      value: laborCost,
      color: '#ec4899',
      icon: '👷',
    },
    {
      label: isAr ? 'المصاريف الثابتة' : 'Overhead',
      value: overhead,
      color: '#f59e0b',
      icon: '📋',
    },
    {
      label: isAr ? 'الربح' : 'Profit',
      value: profit,
      color: '#10b981',
      icon: '💰',
    },
  ].filter(s => s.value > 0);

  const size = compact ? 180 : 240;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size / 2) - 8;
  const innerR = outerR * 0.6;
  const strokeWidth = outerR - innerR;
  const midR = (outerR + innerR) / 2;
  const circumference = 2 * Math.PI * midR;

  // Calculate dash arrays
  let cumulative = 0;
  const arcs = segments.map((seg, i) => {
    const fraction = seg.value / total;
    const dashLen = fraction * circumference;
    const gapLen = circumference - dashLen;
    const offset = -cumulative * circumference + circumference * 0.25;
    cumulative += fraction;
    return {
      ...seg,
      fraction,
      percent: Math.round(fraction * 100),
      dashArray: `${dashLen} ${gapLen}`,
      dashOffset: offset,
      index: i,
    };
  });

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toFixed(0);
  };

  const hovered = hoveredIndex !== null ? arcs[hoveredIndex] : null;

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
        {isAr ? '📊 توزيع التكاليف' : '📊 Cost Breakdown'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* SVG Donut */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={cx} cy={cy} r={midR}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={arc.label}
              cx={cx} cy={cy} r={midR}
              fill="none"
              stroke={arc.color}
              strokeWidth={hoveredIndex === i ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              style={{
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* Center text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#64748b" fontSize={compact ? 10 : 11}>
            {hovered ? hovered.label : (isAr ? 'الإجمالي' : 'Total')}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#0f172a" fontSize={compact ? 16 : 20} fontWeight="700">
            {hovered ? `${hovered.percent}%` : formatNum(total)}
          </text>
          {hovered && (
            <text x={cx} y={cy + 26} textAnchor="middle" fill="#64748b" fontSize={10}>
              {formatNum(hovered.value)} {isAr ? 'ر.س' : 'SAR'}
            </text>
          )}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: compact ? '120px' : '160px' }}>
          {arcs.map((arc, i) => (
            <div
              key={arc.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: hoveredIndex === i ? '#f8fafc' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={{
                width: '12px', height: '12px', borderRadius: '3px',
                background: arc.color, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: compact ? '11px' : '12px', color: '#334155', fontWeight: 600 }}>
                  {arc.icon} {arc.label}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {arc.percent}% — {formatNum(arc.value)} {isAr ? 'ر.س' : 'SAR'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownChart;
