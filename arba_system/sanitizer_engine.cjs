/**
 * ARBA Engine V8.1
 * Module: Sanitizer Engine (محرك التنظيف والتجميد) — HARDENED
 * 
 * Responsibilities:
 * 1. Freeze original text (Shadow Array).
 * 2. Normalize Arabic/Hindi numerals.
 * 3. Tokenize stuck dimensions.
 * 4. [NEW] Expand common BOQ abbreviations (ت.و.ت → توريد وتركيب).
 * 5. [NEW] Fix common Arabic typos in construction terms.
 * 6. [FIX] Correct newline regex.
 */

class SanitizerEngine {
    constructor() {
        // Common abbreviations in Saudi BOQs
        this.abbreviations = {
            'ت.و.ت': 'توريد وتركيب',
            'ت و ت': 'توريد وتركيب',
            'م.م': 'متر مربع',
            'م.ط': 'متر طولي',
            'م.ك': 'متر مكعب',
            'ر.س': 'ريال سعودي',
            'خ.م': 'خرسانة مسلحة',
            'خ.ع': 'خرسانة عادية',
            'ح.ت': 'حديد تسليح',
            'ع.م': 'عزل مائي',
            'ع.ح': 'عزل حراري',
        };

        // Common typos in Saudi construction BOQs
        this.typoCorrections = {
            'خراسانة': 'خرسانة',
            'خراسانه': 'خرسانة',
            'خرسانه': 'خرسانة',
            'المنيوم': 'ألمنيوم',
            'المونيوم': 'ألمنيوم',
            'الومنيوم': 'ألمنيوم',
            'بورسلين': 'بورسلان',
            'سيرميك': 'سيراميك',
            'سراميك': 'سيراميك',
            'جبسم': 'جبس',
            'لياسه': 'لياسة',
            'دهانات': 'دهان',
            'سباكه': 'سباكة',
            'كهربا': 'كهرباء',
            'كهربائي': 'كهربائي',
            'تكيف': 'تكييف',
            'مكيفات': 'تكييف',
            'بلوكات': 'بلوك',
            'بلكات': 'بلوك',
            'إنارة': 'إنارة',
            'اناره': 'إنارة',
            'مواسير': 'مواسير',
            'ماصوره': 'ماسورة',
            'ابواب': 'أبواب',
            'شبابيك': 'نوافذ',
        };
    }

    /**
     * Converts Hindi/Arabic numerals (١٢٣) to standard numerals (123)
     */
    normalizeArabicNumbers(text) {
        if (!text) return '';
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return text.replace(/[٠-٩]/g, function(w) {
            return arabicNumbers.indexOf(w);
        });
    }

    /**
     * Separates numbers attached to Arabic units (e.g. 20سم -> 20 سم)
     */
    tokenizeDimensions(text) {
        if (!text) return '';
        let cleaned = text;
        
        // Add space between number and unit
        cleaned = cleaned.replace(/(\d+)(سم|مم|ملم|م)(?!\w)/g, '$1 $2');
        
        // Add space between dimension word and number
        cleaned = cleaned.replace(/(سماكة|سمك|ارتفاع|عرض|طول|قطر)(\d+)/g, '$1 $2');

        // Normalize dimension separators (2x3 → 2 × 3)
        cleaned = cleaned.replace(/(\d+)\s*[xX×]\s*(\d+)/g, '$1 × $2');

        return cleaned;
    }

    /**
     * [NEW] Expands common BOQ abbreviations
     */
    expandAbbreviations(text) {
        if (!text) return '';
        let expanded = text;
        for (const [abbr, full] of Object.entries(this.abbreviations)) {
            expanded = expanded.replace(new RegExp(abbr.replace(/\./g, '\\.'), 'g'), full);
        }
        return expanded;
    }

    /**
     * [NEW] Fixes common Arabic typos in construction terminology
     */
    fixTypos(text) {
        if (!text) return '';
        let fixed = text;
        for (const [typo, correct] of Object.entries(this.typoCorrections)) {
            fixed = fixed.replace(new RegExp(typo, 'g'), correct);
        }
        return fixed;
    }

    /**
     * Main pipeline: ingest a BOQ item description
     * Returns FROZEN original + SANITIZED text
     */
    processItem(originalText) {
        // 1. Freeze (Shadow Copy) — NEVER TOUCH THIS
        const frozenText = originalText || '';

        // 2. Sanitize pipeline (order matters!)
        let sanitizedText = frozenText;
        sanitizedText = this.normalizeArabicNumbers(sanitizedText);
        sanitizedText = this.expandAbbreviations(sanitizedText);
        sanitizedText = this.fixTypos(sanitizedText);
        sanitizedText = this.tokenizeDimensions(sanitizedText);
        
        // [FIX] Correct newline normalization (was \\\\r\\\\n, now proper regex)
        sanitizedText = sanitizedText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

        return {
            frozen: frozenText,
            sanitized: sanitizedText
        };
    }
}

module.exports = SanitizerEngine;

// Quick Test Block
if (require.main === module) {
    const engine = new SanitizerEngine();
    const testCases = [
        { input: "ت.و.ت بلوك سماكة٢٠سم", expected: "توريد وتركيب بلوك سماكة 20 سم" },
        { input: "خراسانه مسلحة للقواعد", expected: "خرسانة مسلحة للقواعد" },
        { input: "نافذة المنيوم مقاس 2x3م", expected: "نافذة ألمنيوم مقاس 2 × 3 م" },
        { input: "ت.و.ت سراميك أرضيات", expected: "توريد وتركيب سيراميك أرضيات" },
        { input: "دهان ٣ أوجه بدون مفصلات", expected: "دهان 3 أوجه بدون مفصلات" },
    ];

    console.log("=== ARBA Sanitizer Engine V8.1 (Hardened) ===\n");
    testCases.forEach((tc, idx) => {
        const result = engine.processItem(tc.input);
        const pass = result.sanitized === tc.expected;
        console.log(`Test ${idx + 1}: ${pass ? '✅' : '❌'}`);
        console.log(`  Input:    ${tc.input}`);
        console.log(`  Output:   ${result.sanitized}`);
        console.log(`  Expected: ${tc.expected}`);
        console.log();
    });
}
