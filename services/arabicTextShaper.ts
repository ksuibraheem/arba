/**
 * Arabic Text Shaper for jsPDF
 * معالج النصوص العربية — ربط الحروف + دعم RTL
 * 
 * Handles:
 * 1. Arabic letter joining (initial, medial, final, isolated forms)
 * 2. Ligatures (لا، لأ، لإ، لآ)
 * 3. RTL text reversal for jsPDF rendering
 * 4. Mixed Arabic/English (BiDi) text handling
 */

// =================== ARABIC LETTER FORMS ===================
// Each Arabic letter has up to 4 forms: [isolated, final, initial, medial]
// Letters that don't connect to the left only have 2 forms: [isolated, final]

const ARABIC_FORMS: Record<string, string[]> = {
    // Letter: [isolated, final, initial, medial]
    'ا': ['\uFE8D', '\uFE8E'],                          // Alef (non-connecting)
    'أ': ['\uFE83', '\uFE84'],                          // Alef with Hamza above
    'إ': ['\uFE87', '\uFE88'],                          // Alef with Hamza below
    'آ': ['\uFE81', '\uFE82'],                          // Alef with Madda
    'ب': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'],    // Ba
    'ت': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'],    // Ta
    'ث': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],    // Tha
    'ج': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],    // Jim
    'ح': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],    // Ha
    'خ': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],    // Kha
    'د': ['\uFEA9', '\uFEAA'],                          // Dal (non-connecting)
    'ذ': ['\uFEAB', '\uFEAC'],                          // Thal (non-connecting)
    'ر': ['\uFEAD', '\uFEAE'],                          // Ra (non-connecting)
    'ز': ['\uFEAF', '\uFEB0'],                          // Zay (non-connecting)
    'س': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],    // Sin
    'ش': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],    // Shin
    'ص': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],    // Sad
    'ض': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],    // Dad
    'ط': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],    // Taa
    'ظ': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],    // Thaa
    'ع': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'],    // Ain
    'غ': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'],    // Ghain
    'ف': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'],    // Fa
    'ق': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'],    // Qaf
    'ك': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],    // Kaf
    'ل': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],    // Lam
    'م': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],    // Mim
    'ن': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],    // Nun
    'ه': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],    // Ha
    'و': ['\uFEED', '\uFEEE'],                          // Waw (non-connecting)
    'ي': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],    // Ya
    'ى': ['\uFEEF', '\uFEF0'],                          // Alef Maksura
    'ة': ['\uFE93', '\uFE94'],                          // Ta Marbuta
    'ء': ['\uFE80'],                                      // Hamza (isolated only)
    'ؤ': ['\uFE85', '\uFE86'],                          // Waw with Hamza
    'ئ': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],    // Ya with Hamza
};

// Letters that connect to the next letter (have initial/medial forms)
const CONNECTING_LETTERS = new Set([
    'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'س', 'ش', 'ص', 'ض',
    'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن',
    'ه', 'ي', 'ئ',
]);

// Tashkeel (diacritics) - should be ignored for shaping
const TASHKEEL = new Set([
    '\u064B', '\u064C', '\u064D', '\u064E', '\u064F',
    '\u0650', '\u0651', '\u0652', '\u0670',
]);

// =================== LAM-ALEF LIGATURES ===================

const LAM_ALEF_LIGATURES: Record<string, [string, string]> = {
    'ا': ['\uFEFB', '\uFEFC'],  // Lam + Alef
    'أ': ['\uFEF7', '\uFEF8'],  // Lam + Alef with Hamza above
    'إ': ['\uFEF9', '\uFEFA'],  // Lam + Alef with Hamza below
    'آ': ['\uFEF5', '\uFEF6'],  // Lam + Alef with Madda
};

// =================== HELPER FUNCTIONS ===================

function isArabicChar(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 0x0600 && code <= 0x06FF) || // Arabic block
        (code >= 0xFE70 && code <= 0xFEFF) || // Arabic Presentation Forms-B
        (code >= 0xFB50 && code <= 0xFDFF);    // Arabic Presentation Forms-A
}

function isTashkeel(char: string): boolean {
    return TASHKEEL.has(char);
}

function canConnectLeft(char: string): boolean {
    return CONNECTING_LETTERS.has(char);
}

function hasForm(char: string): boolean {
    return char in ARABIC_FORMS;
}

// Form indices: 0=isolated, 1=final, 2=initial, 3=medial
function getForm(char: string, formIndex: number): string {
    const forms = ARABIC_FORMS[char];
    if (!forms) return char;

    // Non-connecting letters only have 2 forms (isolated + final)
    if (forms.length <= 2) {
        if (formIndex === 1 || formIndex === 3) return forms[1] || forms[0];
        return forms[0];
    }

    return forms[formIndex] || forms[0];
}

// =================== MAIN RESHAPING FUNCTION ===================

/**
 * Reshape Arabic text for proper rendering in jsPDF
 * Handles letter joining, ligatures, and produces presentation forms
 */
export function reshapeArabic(text: string): string {
    if (!text) return text;

    // Strip tashkeel for shaping, collect positions
    const stripped: string[] = [];
    for (const char of text) {
        if (!isTashkeel(char)) {
            stripped.push(char);
        }
    }

    const result: string[] = [];
    const len = stripped.length;

    for (let i = 0; i < len; i++) {
        const char = stripped[i];

        // Skip non-Arabic characters
        if (!isArabicChar(char) || !hasForm(char)) {
            result.push(char);
            continue;
        }

        // Check for Lam-Alef ligature
        if (char === 'ل' && i + 1 < len && stripped[i + 1] in LAM_ALEF_LIGATURES) {
            const nextChar = stripped[i + 1];
            const ligature = LAM_ALEF_LIGATURES[nextChar];

            // Determine if Lam is connected from the right
            const prevChar = i > 0 ? stripped[i - 1] : '';
            const prevConnects = prevChar && isArabicChar(prevChar) && canConnectLeft(prevChar);

            result.push(prevConnects ? ligature[1] : ligature[0]);
            i++; // Skip the Alef
            continue;
        }

        // Determine position context
        const prevChar = i > 0 ? stripped[i - 1] : '';
        const nextChar = i + 1 < len ? stripped[i + 1] : '';

        const prevIsArabic = prevChar && isArabicChar(prevChar) && hasForm(prevChar);
        const nextIsArabic = nextChar && isArabicChar(nextChar) && hasForm(nextChar);
        const prevConnects = prevIsArabic && canConnectLeft(prevChar);
        const currentConnects = canConnectLeft(char);

        let formIndex: number;

        if (prevConnects && currentConnects && nextIsArabic) {
            formIndex = 3; // Medial
        } else if (prevConnects && (!nextIsArabic || !currentConnects)) {
            formIndex = 1; // Final
        } else if (!prevConnects && currentConnects && nextIsArabic) {
            formIndex = 2; // Initial
        } else {
            formIndex = 0; // Isolated
        }

        result.push(getForm(char, formIndex));
    }

    return result.join('');
}

// =================== BIDI TEXT PROCESSING ===================

/**
 * Process text for RTL display in jsPDF
 * Reverses Arabic segments while keeping numbers/Latin in correct order
 */
export function processForRTL(text: string): string {
    if (!text) return text;

    // First reshape Arabic letters
    const reshaped = reshapeArabic(text);

    // Then reverse the entire string for RTL rendering
    // jsPDF renders left-to-right, so we reverse for RTL
    return reversePreservingNumbers(reshaped);
}

/**
 * Reverse text while preserving embedded LTR sequences (numbers, Latin)
 */
function reversePreservingNumbers(text: string): string {
    const segments: { text: string; isLTR: boolean }[] = [];
    let currentSegment = '';
    let currentIsLTR = false;

    for (const char of text) {
        const code = char.charCodeAt(0);
        const isLatinOrDigit = (code >= 0x0030 && code <= 0x0039) || // 0-9
            (code >= 0x0041 && code <= 0x005A) || // A-Z
            (code >= 0x0061 && code <= 0x007A) || // a-z
            char === '.' || char === ',' || char === '-' ||
            char === '+' || char === '%' || char === '/';

        if (currentSegment && isLatinOrDigit !== currentIsLTR) {
            segments.push({ text: currentSegment, isLTR: currentIsLTR });
            currentSegment = '';
        }

        currentIsLTR = isLatinOrDigit;
        currentSegment += char;
    }

    if (currentSegment) {
        segments.push({ text: currentSegment, isLTR: currentIsLTR });
    }

    // Reverse segment order, but keep LTR segment content intact
    return segments.reverse().map(seg => {
        if (seg.isLTR) return seg.text;
        return [...seg.text].reverse().join('');
    }).join('');
}

// =================== ARABIC NUMERAL CONVERSION ===================

const HINDI_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Convert Western digits to Hindi/Arabic numerals
 * Used for Saudi engineering standards compliance
 */
export function toHindiNumerals(text: string): string {
    return text.replace(/[0-9]/g, d => HINDI_NUMERALS[parseInt(d)]);
}

/**
 * Format number with Hindi numerals and proper grouping
 */
export function formatArabicNumber(num: number, decimals: number = 2): string {
    const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return toHindiNumerals(formatted);
}
