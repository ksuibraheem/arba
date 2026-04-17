import { Language } from '../types';
import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
    language: Language;
}

/**
 * شاشة سبلاش متحركة - تظهر عند أول تسجيل دخول
 * المراحل:
 * 1. صفحة فارغة كحلية داكنة
 * 2. يظهر شعار A الأخضر في المنتصف
 * 3. تظهر الحروف البيضاء R  B  A واحد تلو الآخر من اليسار لليمين
 * 4. اختفاء تدريجي
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'blank' | 'logo' | 'letters' | 'done'>('blank');
    const [visibleLetters, setVisibleLetters] = useState(0); // 0, 1 (R), 2 (B), 3 (A)
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Phase 1: blank screen (600ms)
        const t1 = setTimeout(() => setPhase('logo'), 600);

        // Phase 2: logo appears, then after 800ms start letters
        const t2 = setTimeout(() => setPhase('letters'), 1400);

        // Phase 3: letters appear one by one — R then B then A
        const t3 = setTimeout(() => setVisibleLetters(1), 1700); // R
        const t4 = setTimeout(() => setVisibleLetters(2), 2100); // B
        const t5 = setTimeout(() => setVisibleLetters(3), 2500); // A

        // Phase 4: hold for a moment, then fade out
        const t6 = setTimeout(() => {
            setPhase('done');
            setFadeOut(true);
        }, 3400);

        const t7 = setTimeout(() => onComplete(), 4000);

        return () => {
            [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-600 ${
                fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            style={{
                background: '#1A1A4E',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
        >
            {/* المحتوى الرئيسي */}
            <div className="relative flex flex-col items-center">
                {/* ═══ الشعار — حرف A الأخضر ═══ */}
                <div
                    style={{
                        opacity: phase === 'blank' ? 0 : 1,
                        transform: phase === 'blank' ? 'scale(0.5)' : 'scale(1)',
                        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    <svg
                        width="200"
                        height="220"
                        viewBox="0 0 200 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* حرف A الأخضر — مطابق تماماً للشعار الأصلي */}
                        {/* الساق اليسرى */}
                        <path
                            d="M20,195 C20,195 20,190 22,185 L25,178 C25,178 28,172 30,170 L35,165 C35,165 40,155 45,145 L55,125 C55,125 65,105 70,95 L80,75 C80,75 85,65 90,55 L95,45 C95,45 98,38 100,35 C102,38 105,45 105,45 L110,55 C110,55 115,65 120,75 L130,95 C130,95 140,115 150,135 L160,155 C160,155 168,170 172,178 L175,185 C177,190 178,195 178,195"
                            stroke="#4ADE4A"
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                                strokeDasharray: 600,
                                strokeDashoffset: phase === 'blank' ? 600 : 0,
                                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        />
                        {/* القاعدة السفلية */}
                        <path
                            d="M10,198 L55,198 C55,198 60,198 60,193 C60,188 55,188 55,188 L40,188 C40,188 30,185 28,178 L25,170"
                            stroke="#4ADE4A"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                                strokeDasharray: 200,
                                strokeDashoffset: phase === 'blank' ? 200 : 0,
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
                            }}
                        />
                        <path
                            d="M190,198 L145,198 C145,198 140,198 140,193 C140,188 145,188 145,188 L160,188 C160,188 170,185 172,178 L175,170"
                            stroke="#4ADE4A"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                                strokeDasharray: 200,
                                strokeDashoffset: phase === 'blank' ? 200 : 0,
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s',
                            }}
                        />
                        {/* الفتحة المثلثية الداخلية (الدايموند) */}
                        <path
                            d="M85,140 L100,90 L115,140 Z"
                            fill="#4ADE4A"
                            style={{
                                opacity: phase === 'blank' ? 0 : 1,
                                transform: phase === 'blank' ? 'scale(0)' : 'scale(1)',
                                transformOrigin: '100px 115px',
                                transition: 'opacity 0.5s ease 0.6s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s',
                            }}
                        />
                    </svg>
                </div>

                {/* ═══ الحروف البيضاء R  B  A — تظهر من اليسار لليمين ═══ */}
                <div
                    className="flex items-center justify-center mt-2"
                    style={{ gap: '24px' }}
                >
                    {['R', 'B', 'A'].map((letter, index) => (
                        <span
                            key={letter}
                            style={{
                                fontSize: '3rem',
                                fontWeight: 900,
                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                color: '#FFFFFF',
                                letterSpacing: '0.08em',
                                opacity: visibleLetters > index ? 1 : 0,
                                transform: visibleLetters > index
                                    ? 'translateY(0) scale(1)'
                                    : 'translateY(15px) scale(0.7)',
                                transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
                            }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>

                {/* ═══ وصف تحت الحروف ═══ */}
                <p
                    style={{
                        opacity: visibleLetters >= 3 ? 1 : 0,
                        transform: visibleLetters >= 3 ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
                        color: 'rgba(255,255,255,0.35)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginTop: '8px',
                    }}
                >
                    SMART PRICING PLATFORM
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
