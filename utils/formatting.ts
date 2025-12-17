import { Language } from '../types';

// Number formatting utility for the Arba Pricing Platform
// - Two decimal places with "." separator
// - Space as thousand separator
// - Arabic word representation for amounts

// Arabic number words
const ARABIC_ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const ARABIC_TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const ARABIC_HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
const ARABIC_SCALE = [
    { value: 1000000000, singular: 'مليار', dual: 'ملياران', plural: 'مليارات' },
    { value: 1000000, singular: 'مليون', dual: 'مليونان', plural: 'ملايين' },
    { value: 1000, singular: 'ألف', dual: 'ألفان', plural: 'آلاف' },
];

/**
 * Convert a number (0-999) to Arabic words
 */
function convertHundreds(num: number): string {
    if (num === 0) return '';
    if (num < 20) return ARABIC_ONES[num];
    if (num < 100) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        if (ones === 0) return ARABIC_TENS[tens];
        return `${ARABIC_ONES[ones]} و${ARABIC_TENS[tens]}`;
    }
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    if (remainder === 0) return ARABIC_HUNDREDS[hundreds];
    return `${ARABIC_HUNDREDS[hundreds]} و${convertHundreds(remainder)}`;
}

/**
 * Convert number to Arabic words with currency
 * @param amount - The amount to convert (e.g., 520.50)
 * @returns Arabic word representation (e.g., "خمسمائة وعشرون ريال وخمسون هللة")
 */
export function numberToArabicWords(amount: number): string {
    if (amount === 0) return 'صفر ريال';

    const intPart = Math.floor(Math.abs(amount));
    const decimalPart = Math.round((Math.abs(amount) - intPart) * 100);

    let result = '';
    let remaining = intPart;

    // Handle large numbers (billions, millions, thousands)
    for (const scale of ARABIC_SCALE) {
        if (remaining >= scale.value) {
            const count = Math.floor(remaining / scale.value);
            remaining = remaining % scale.value;

            if (count === 1) {
                result += scale.singular + ' ';
            } else if (count === 2) {
                result += scale.dual + ' ';
            } else if (count >= 3 && count <= 10) {
                result += `${convertHundreds(count)} ${scale.plural} `;
            } else {
                result += `${convertHundreds(count)} ${scale.singular} `;
            }
        }
    }

    // Handle remaining hundreds
    if (remaining > 0) {
        if (result) result += 'و';
        result += convertHundreds(remaining);
    }

    // Add currency (Riyal)
    result = result.trim() + ' ريال';

    // Add halalas if present
    if (decimalPart > 0) {
        result += ` و${convertHundreds(decimalPart)} هللة`;
    }

    return result;
}

/**
 * Format currency with proper formatting rules:
 * - Two decimal places
 * - "." as decimal separator
 * - Space as thousand separator
 * - Always Western/English numerals (0-9)
 * - LTR direction for correct display in RTL context
 */
export function formatCurrency(amount: number, language: Language = 'ar'): string {
    // Use en-US locale to ensure Western numerals (0-9)
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });

    // Format and replace commas with spaces
    const formatted = formatter.format(amount).replace(/,/g, ' ');

    const currency = language === 'ar' ? 'ريال' : 'SAR';

    // Use Unicode LTR mark (U+200E) to ensure correct number direction in RTL
    // \u200E = Left-to-Right Mark
    const ltr = '\u200E';
    return `${ltr}${formatted}${ltr} ${currency}`;
}

/**
 * Format number with proper formatting rules:
 * - Space as thousand separator
 * - Optional decimal places
 * - Always Western/English numerals (0-9)
 * - LTR direction for correct display in RTL context
 */
export function formatNumber(num: number, decimals: number = 0, language: Language = 'ar'): string {
    // Use en-US locale to ensure Western numerals (0-9)
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: true
    });

    // Format and replace commas with spaces
    const formatted = formatter.format(num).replace(/,/g, ' ');

    // Use Unicode LTR mark (U+200E) to ensure correct number direction in RTL
    const ltr = '\u200E';
    return `${ltr}${formatted}${ltr}`;
}

/**
 * Get currency with words for display
 * Returns both numeric and word format
 */
export function formatCurrencyWithWords(amount: number, language: Language = 'ar'): {
    numeric: string;
    words: string;
} {
    return {
        numeric: formatCurrency(amount, language),
        words: language === 'ar' ? numberToArabicWords(amount) : formatCurrency(amount, language)
    };
}
