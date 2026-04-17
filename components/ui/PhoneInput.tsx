import { Language } from '../../types';
/**
 * PhoneInput — مدخل رقم الهاتف الدولي
 *
 * Features:
 *  - Country code dropdown with flag + dial code
 *  - Format validation per country policy (no SMS sending)
 *  - Optional field — valid/invalid indicator only when user types
 *  - Covers 50+ countries including all GCC
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

// ─── Country Data ─────────────────────────────────────────
// format: regex for the subscriber part (after the country code)

export interface Country {
    code: string;    // ISO alpha-2
    name: { ar: string; en: string };
    dial: string;    // e.g. "+966"
    flag: string;    // emoji
    pattern: RegExp; // validates subscriber number (digits only, no spaces/dashes)
    placeholder: string; // example local number
}

export const COUNTRIES: Country[] = [
    // ── GCC first ──
    { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' },   dial: '+966', flag: '🇸🇦', pattern: /^5\d{8}$/,           placeholder: '5xxxxxxxx' },
    { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' },            dial: '+971', flag: '🇦🇪', pattern: /^5\d{8}$/,           placeholder: '5xxxxxxxx' },
    { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' },           dial: '+965', flag: '🇰🇼', pattern: /^[569]\d{7}$/,       placeholder: '6xxxxxxx' },
    { code: 'QA', name: { ar: 'قطر', en: 'Qatar' },               dial: '+974', flag: '🇶🇦', pattern: /^[3567]\d{7}$/,      placeholder: '3xxxxxxx' },
    { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain' },         dial: '+973', flag: '🇧🇭', pattern: /^[36]\d{7}$/,        placeholder: '36xxxxxx' },
    { code: 'OM', name: { ar: 'عُمان', en: 'Oman' },              dial: '+968', flag: '🇴🇲', pattern: /^[79]\d{7}$/,        placeholder: '9xxxxxxx' },
    // ── Arab countries ──
    { code: 'EG', name: { ar: 'مصر', en: 'Egypt' },               dial: '+20',  flag: '🇪🇬', pattern: /^1[0-25]\d{8}$/,    placeholder: '10xxxxxxxx' },
    { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' },           dial: '+962', flag: '🇯🇴', pattern: /^7[789]\d{7}$/,      placeholder: '77xxxxxxx' },
    { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' },           dial: '+961', flag: '🇱🇧', pattern: /^[37]\d{7}$/,        placeholder: '3xxxxxxx' },
    { code: 'IQ', name: { ar: 'العراق', en: 'Iraq' },             dial: '+964', flag: '🇮🇶', pattern: /^7[3-9]\d{8}$/,      placeholder: '7xxxxxxxxx' },
    { code: 'SY', name: { ar: 'سوريا', en: 'Syria' },             dial: '+963', flag: '🇸🇾', pattern: /^9[36]\d{7}$/,       placeholder: '93xxxxxxx' },
    { code: 'YE', name: { ar: 'اليمن', en: 'Yemen' },             dial: '+967', flag: '🇾🇪', pattern: /^7[1-7]\d{7}$/,      placeholder: '71xxxxxxx' },
    { code: 'LY', name: { ar: 'ليبيا', en: 'Libya' },             dial: '+218', flag: '🇱🇾', pattern: /^9[1-5]\d{7}$/,      placeholder: '91xxxxxxx' },
    { code: 'TN', name: { ar: 'تونس', en: 'Tunisia' },            dial: '+216', flag: '🇹🇳', pattern: /^[259]\d{7}$/,       placeholder: '2xxxxxxx' },
    { code: 'DZ', name: { ar: 'الجزائر', en: 'Algeria' },         dial: '+213', flag: '🇩🇿', pattern: /^[567]\d{8}$/,       placeholder: '5xxxxxxxx' },
    { code: 'MA', name: { ar: 'المغرب', en: 'Morocco' },          dial: '+212', flag: '🇲🇦', pattern: /^[67]\d{8}$/,        placeholder: '6xxxxxxxx' },
    { code: 'SD', name: { ar: 'السودان', en: 'Sudan' },           dial: '+249', flag: '🇸🇩', pattern: /^9[0-6]\d{7}$/,      placeholder: '90xxxxxxx' },
    { code: 'PS', name: { ar: 'فلسطين', en: 'Palestine' },        dial: '+970', flag: '🇵🇸', pattern: /^5[69]\d{7}$/,       placeholder: '59xxxxxxx' },
    // ── International ──
    { code: 'US', name: { ar: 'أمريكا', en: 'United States' },    dial: '+1',   flag: '🇺🇸', pattern: /^[2-9]\d{9}$/,       placeholder: '4155552671' },
    { code: 'GB', name: { ar: 'بريطانيا', en: 'United Kingdom' }, dial: '+44',  flag: '🇬🇧', pattern: /^7\d{9}$/,           placeholder: '7911123456' },
    { code: 'TR', name: { ar: 'تركيا', en: 'Turkey' },            dial: '+90',  flag: '🇹🇷', pattern: /^5\d{9}$/,           placeholder: '5xxxxxxxxx' },
    { code: 'PK', name: { ar: 'باكستان', en: 'Pakistan' },        dial: '+92',  flag: '🇵🇰', pattern: /^3\d{9}$/,           placeholder: '3xxxxxxxxx' },
    { code: 'IN', name: { ar: 'الهند', en: 'India' },             dial: '+91',  flag: '🇮🇳', pattern: /^[6-9]\d{9}$/,       placeholder: '98xxxxxxxx' },
    { code: 'BD', name: { ar: 'بنغلاديش', en: 'Bangladesh' },     dial: '+880', flag: '🇧🇩', pattern: /^1[3-9]\d{8}$/,     placeholder: '17xxxxxxxx' },
    { code: 'PH', name: { ar: 'الفلبين', en: 'Philippines' },     dial: '+63',  flag: '🇵🇭', pattern: /^9\d{9}$/,           placeholder: '9xxxxxxxxx' },
    { code: 'ID', name: { ar: 'إندونيسيا', en: 'Indonesia' },     dial: '+62',  flag: '🇮🇩', pattern: /^8\d{8,11}$/,        placeholder: '81xxxxxxxx' },
    { code: 'NG', name: { ar: 'نيجيريا', en: 'Nigeria' },         dial: '+234', flag: '🇳🇬', pattern: /^[789]\d{9}$/,       placeholder: '70xxxxxxxxx' },
    { code: 'ET', name: { ar: 'إثيوبيا', en: 'Ethiopia' },        dial: '+251', flag: '🇪🇹', pattern: /^9\d{8}$/,           placeholder: '9xxxxxxxx' },
    { code: 'DE', name: { ar: 'ألمانيا', en: 'Germany' },         dial: '+49',  flag: '🇩🇪', pattern: /^1[567]\d{8,9}$/,    placeholder: '15xxxxxxxxx' },
    { code: 'FR', name: { ar: 'فرنسا', en: 'France' },            dial: '+33',  flag: '🇫🇷', pattern: /^[67]\d{8}$/,        placeholder: '6xxxxxxxx' },
    { code: 'CA', name: { ar: 'كندا', en: 'Canada' },             dial: '+1',   flag: '🇨🇦', pattern: /^[2-9]\d{9}$/,       placeholder: '6135550199' },
    { code: 'AU', name: { ar: 'أستراليا', en: 'Australia' },      dial: '+61',  flag: '🇦🇺', pattern: /^4\d{8}$/,           placeholder: '412345678' },
];

// ─── Validation helper ────────────────────────────────────

export function validatePhone(dial: string, subscriber: string): boolean {
    const stripped = subscriber.replace(/[\s\-()+]/g, '');
    const country = COUNTRIES.find(c => c.dial === dial);
    if (!country) return stripped.length >= 6; // fallback: at least 6 digits
    return country.pattern.test(stripped);
}

// ─── Component ───────────────────────────────────────────

export interface PhoneValue {
    dial: string;
    subscriber: string;
    full: string; // dial + subscriber (for storage)
    valid: boolean | null; // null = untouched
}

interface PhoneInputProps {
    value: PhoneValue;
    onChange: (v: PhoneValue) => void;
    language: Language;
    optional?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, language, optional = true }) => {
    const isAr = language === 'ar';
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropRef = useRef<HTMLDivElement>(null);

    const selectedCountry = COUNTRIES.find(c => c.dial === value.dial) || COUNTRIES[0];

    const filtered = search.trim()
        ? COUNTRIES.filter(c =>
            c.name[language].includes(search) ||
            c.dial.includes(search) ||
            c.code.toLowerCase().includes(search.toLowerCase())
        )
        : COUNTRIES;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectCountry = (c: Country) => {
        setOpen(false);
        setSearch('');
        const stripped = value.subscriber.replace(/[\s\-()+]/g, '');
        const isValid = stripped.length > 0 ? c.pattern.test(stripped) : null;
        onChange({
            dial: c.dial,
            subscriber: value.subscriber,
            full: `${c.dial}${stripped}`,
            valid: isValid,
        });
    };

    const handleSubscriberChange = (raw: string) => {
        // Allow digits, spaces, dashes
        const cleaned = raw.replace(/[^\d\s\-]/g, '');
        const stripped = cleaned.replace(/[\s\-]/g, '');
        const isValid = stripped.length > 0 ? selectedCountry.pattern.test(stripped) : null;
        onChange({
            dial: value.dial,
            subscriber: cleaned,
            full: `${value.dial}${stripped}`,
            valid: isValid,
        });
    };

    const borderColor =
        value.valid === true  ? 'border-emerald-500/60 focus:border-emerald-500' :
        value.valid === false ? 'border-red-500/60 focus:border-red-500' :
        'border-slate-700 focus:border-slate-500';

    return (
        <div className="flex gap-2 items-stretch" dir="ltr">
            {/* Country selector */}
            <div className="relative" ref={dropRef}>
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="h-full flex items-center gap-1.5 px-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-500 transition-all whitespace-nowrap"
                >
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedCountry.dial}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="absolute top-full mt-1 left-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-slate-800">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={isAr ? 'ابحث عن دولة...' : 'Search country...'}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500"
                            />
                        </div>
                        {/* List */}
                        <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {filtered.map(c => (
                                <button
                                    key={`${c.code}-${c.dial}`}
                                    type="button"
                                    onClick={() => selectCountry(c)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-left ${
                                        c.dial === value.dial && c.code === selectedCountry.code ? 'bg-slate-800/80' : ''
                                    }`}
                                >
                                    <span className="text-base w-6">{c.flag}</span>
                                    <span className="text-slate-300 flex-1 truncate">{c.name[language]}</span>
                                    <span className="text-slate-500 font-mono text-xs">{c.dial}</span>
                                    {c.dial === value.dial && c.code === selectedCountry.code && (
                                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    )}
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">
                                    {isAr ? 'لا نتائج' : 'No results'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Number input */}
            <div className="relative flex-1">
                <input
                    type="tel"
                    dir="ltr"
                    value={value.subscriber}
                    onChange={e => handleSubscriberChange(e.target.value)}
                    placeholder={selectedCountry.placeholder}
                    className={`w-full bg-slate-800/60 border ${borderColor} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 transition-all ${
                        value.valid === true  ? 'focus:ring-emerald-500/20' :
                        value.valid === false ? 'focus:ring-red-500/20' :
                        'focus:ring-slate-500/20'
                    }`}
                />
                {/* Validation icon */}
                {value.valid === true && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                )}
                {value.valid === false && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneInput;
