import React from 'react';

interface ArbaLogoProps {
    size?: number;
    animated?: boolean;
    className?: string;
}

/**
 * شعار آربا - حرف A بخط Serif مع ظل أخضر
 * مطابق تماماً للوقو الأصلي المعتمد
 */
const ArbaLogo: React.FC<ArbaLogoProps> = ({ size = 40, animated = false, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${animated ? 'arba-logo-anim' : ''} ${className}`}
            style={{ display: 'block' }}
        >
            {/* الظل الأخضر - خلف الحرف، مزاح لليمين والأسفل */}
            <g transform="translate(8, 8)">
                {/* الساق اليسرى */}
                <path d="M30,170 L30,165 Q30,160 33,155 L80,30 Q85,18 95,15 L105,15 Q115,18 120,30 L167,155 Q170,160 170,165 L170,170 L170,175 Q170,180 165,182 L155,182 Q148,182 145,175 L135,148 Q132,140 125,140 L75,140 Q68,140 65,148 L55,175 Q52,182 45,182 L35,182 Q30,180 30,175 Z" fill="#4ADE4A" />
                {/* سيريف يسار */}
                <rect x="18" y="170" width="48" height="14" rx="4" fill="#4ADE4A" />
                {/* سيريف يمين */}
                <rect x="135" y="170" width="48" height="14" rx="4" fill="#4ADE4A" />
                {/* سيريف أعلى */}
                <rect x="78" y="10" width="44" height="10" rx="3" fill="#4ADE4A" />
            </g>

            {/* الحرف A الرئيسي - أزرق داكن */}
            <g>
                {/* جسم الحرف A */}
                <path d="M30,170 L30,165 Q30,160 33,155 L80,30 Q85,18 95,15 L105,15 Q115,18 120,30 L167,155 Q170,160 170,165 L170,170 L170,175 Q170,180 165,182 L155,182 Q148,182 145,175 L135,148 Q132,140 125,140 L75,140 Q68,140 65,148 L55,175 Q52,182 45,182 L35,182 Q30,180 30,175 Z" fill="#2B2D6E" />

                {/* الفتحة المثلثية الداخلية */}
                <path d="M85,120 L100,60 L115,120 Z" fill="#1E1F52" />

                {/* سيريف يسار (القدم اليسرى) */}
                <rect x="18" y="170" width="48" height="14" rx="4" fill="#2B2D6E" />

                {/* سيريف يمين (القدم اليمنى) */}
                <rect x="135" y="170" width="48" height="14" rx="4" fill="#2B2D6E" />

                {/* سيريف أعلى */}
                <rect x="78" y="10" width="44" height="10" rx="3" fill="#2B2D6E" />
            </g>

            {animated && (
                <style>{`
                    .arba-logo-anim {
                        animation: arbaFloat 3s ease-in-out infinite;
                    }
                    @keyframes arbaFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                    }
                `}</style>
            )}
        </svg>
    );
};

export default ArbaLogo;
