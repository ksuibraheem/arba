import { Language } from '../types';
/**
 * WatermarkOverlay — علامة مائية ديناميكية شفافة
 * Dynamic Watermark with employee ID — Zero-Leak Security
 */
import React from 'react';

interface WatermarkProps {
    employeeName: string;
    employeeId: string;
    language: Language;
}

const WatermarkOverlay: React.FC<WatermarkProps> = ({ employeeName, employeeId }) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const label = `${employeeName} | ${employeeId} | ${dateStr}`;

    // Build a repeated grid of watermarks
    const cells = Array.from({ length: 20 }, (_, i) => (
        <span
            key={i}
            style={{
                display: 'inline-block',
                padding: '60px 40px',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.04)',
                fontWeight: 700,
                letterSpacing: '1px',
            }}
        >
            {label}
        </span>
    ));

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 30,
                transform: 'rotate(-25deg)',
                transformOrigin: 'center center',
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'center',
                justifyContent: 'center',
                gap: '0',
            }}
            className="watermark-overlay"
            aria-hidden="true"
        >
            {cells}
            {/* Print style: make watermark much more visible */}
            <style>{`
                @media print {
                    .watermark-overlay span {
                        color: rgba(0,0,0,0.15) !important;
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default WatermarkOverlay;
