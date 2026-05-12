/**
 * CategoryBarChart — رسم أعمدة أفقية لتكلفة كل قسم هندسي
 * يعرض الأقسام مرتبة من الأعلى للأقل تكلفة
 * الألوان مأخوذة من SECTION_DEFINITIONS
 */
import React, { useState } from 'react';
import { Language } from '../../types';
import { SECTION_DEFINITIONS } from '../../constants';

interface CategoryBarChartProps {
  /** Map of section code → total cost */
  sectionCosts: Record<string, number>;
  language: Language;
  compact?: boolean;
}

interface BarData {
  code: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  cost: number;
  percent: number;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  sectionCosts, language, compact = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isAr = language === 'ar';

  const totalCost = (Object.values(sectionCosts) as number[]).reduce((sum, v) => sum + v, 0);
  if (totalCost <= 0) return null;

  // Build sorted bar data
  const bars: BarData[] = SECTION_DEFINITIONS
    .filter(sec => (sectionCosts[sec.code] || 0) > 0)
    .map(sec => ({
      code: sec.code,
      nameAr: sec.nameAr,
      nameEn: sec.nameEn,
      icon: sec.icon,
      color: sec.color,
      cost: sectionCosts[sec.code] || 0,
      percent: Math.round(((sectionCosts[sec.code] || 0) / totalCost) * 100),
    }))
    .sort((a, b) => b.cost - a.cost);

  const maxCost = bars[0]?.cost || 1;

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toFixed(0);
  };

  const barHeight = compact ? 24 : 32;
  const gap = compact ? 4 : 6;

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
        {isAr ? '📊 تكلفة الأقسام الهندسية' : '📊 Section Cost Breakdown'}
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
        {bars.slice(0, compact ? 8 : 15).map((bar, i) => {
          const widthPct = (bar.cost / maxCost) * 100;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={bar.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '2px 0',
                cursor: 'pointer',
                opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Label */}
              <div style={{
                minWidth: compact ? '100px' : '140px',
                fontSize: compact ? '10px' : '12px',
                color: '#475569',
                fontWeight: 600,
                textAlign: isAr ? 'right' : 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                <span style={{ marginLeft: isAr ? '4px' : '0', marginRight: isAr ? '0' : '4px' }}>{bar.icon}</span>
                {isAr ? bar.nameAr : bar.nameEn}
              </div>

              {/* Bar */}
              <div style={{ flex: 1, height: `${barHeight}px`, position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  [isAr ? 'right' : 'left']: 0,
                  width: '100%',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '2px', bottom: '2px',
                  [isAr ? 'right' : 'left']: 0,
                  width: `${widthPct}%`,
                  background: `linear-gradient(${isAr ? '270deg' : '90deg'}, ${bar.color}dd, ${bar.color}88)`,
                  borderRadius: '5px',
                  transition: 'width 0.5s ease, box-shadow 0.2s',
                  boxShadow: isHovered ? `0 0 12px ${bar.color}66` : 'none',
                  minWidth: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isAr ? 'flex-start' : 'flex-end',
                  paddingLeft: isAr ? '0' : '8px',
                  paddingRight: isAr ? '8px' : '0',
                }}>
                  {widthPct > 25 && (
                    <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>
                      {formatNum(bar.cost)}
                    </span>
                  )}
                </div>
              </div>

              {/* Value */}
              <div style={{
                minWidth: compact ? '50px' : '65px',
                fontSize: compact ? '10px' : '11px',
                color: '#64748b',
                fontWeight: 600,
                textAlign: isAr ? 'left' : 'right',
              }}>
                {bar.percent}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {isAr ? 'الإجمالي' : 'Total'}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
          {formatNum(totalCost)} {isAr ? 'ر.س' : 'SAR'}
        </span>
      </div>
    </div>
  );
};

export default CategoryBarChart;
