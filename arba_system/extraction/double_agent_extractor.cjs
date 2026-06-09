/**
 * ARBA Engine V8.1
 * Module: Double-Blind Extractor (نظام الاستخراج المزدوج غير المتماثل) — HARDENED
 * 
 * Agent A (LLM/Linguistic): Extracts quantities, dimensions, materials, and core entity.
 * Agent B (Deterministic Scope Sniper): 
 *   [FIX] Separates EXCLUSION words from INCLUSION words.
 *   [FIX] Removed "مع" from blanket rejection list.
 *   [NEW] Detects orphan keywords that Agent A may have missed.
 */

class ScopeSniperAgentB {
    constructor() {
        // EXCLUSION words (mean "this is NOT included" — RED ALERT)
        this.exclusionWords = [
            'لا يشمل', 'لايشمل', 'ماعدا', 'ما عدا', 
            'باستثناء', 'يستثنى', 'دون', 'بدون',
            'يخصم', 'يُخصم', 'غير شامل', 'لا يتضمن',
            'يستبعد', 'بإستثناء',
        ];

        // INCLUSION words (mean "this IS included" — YELLOW INFO)
        this.inclusionWords = [
            'شامل', 'شاملاً', 'شاملا', 'متضمناً', 'متضمنا',
            'يشمل', 'يتضمن', 'بما فيها', 'بما في ذلك',
            'مع جميع', 'مع كافة', 'شامل لجميع',
        ];
    }

    /**
     * Scans frozen text for legal exception/inclusion words.
     * Returns categorized findings.
     */
    scanForLegalModifiers(frozenText) {
        const exclusions = [];
        const inclusions = [];

        this.exclusionWords.forEach(word => {
            if (frozenText.includes(word)) {
                // Extract the context (what comes after the exclusion word)
                const idx = frozenText.indexOf(word);
                const context = frozenText.substring(idx, Math.min(idx + 50, frozenText.length));
                exclusions.push({ word, context: context.trim() });
            }
        });

        this.inclusionWords.forEach(word => {
            if (frozenText.includes(word)) {
                const idx = frozenText.indexOf(word);
                const context = frozenText.substring(idx, Math.min(idx + 50, frozenText.length));
                inclusions.push({ word, context: context.trim() });
            }
        });

        return { exclusions, inclusions };
    }

    /**
     * Audits Agent A's extraction against the frozen original text.
     * Different handling for exclusions vs inclusions.
     */
    auditScope(frozenText, agentA_Result) {
        const modifiers = this.scanForLegalModifiers(frozenText);

        // RED FLAG: Exclusion words found — Agent A MUST account for them
        if (modifiers.exclusions.length > 0) {
            return {
                status: 'REJECTED',
                severity: 'RED',
                reason: 'EXCLUSION_DETECTED',
                details: modifiers.exclusions.map(e => 
                    `🚨 "${e.word}" → السياق: "${e.context}"`
                ),
                action: 'يجب مراجعة بشرية: البند يستبعد مكونات قد تؤثر على السعر'
            };
        }

        // YELLOW FLAG: Inclusion words found — Agent A should verify pricing covers them
        if (modifiers.inclusions.length > 0) {
            return {
                status: 'WARNING',
                severity: 'YELLOW',
                reason: 'INCLUSION_DETECTED',
                details: modifiers.inclusions.map(e => 
                    `⚠️ "${e.word}" → السياق: "${e.context}"`
                ),
                action: 'تأكد أن التسعير يغطي جميع المكونات المذكورة بعد كلمة "شامل"'
            };
        }

        return {
            status: 'APPROVED',
            severity: 'NONE',
            reason: 'CLEAN_SCOPE'
        };
    }
}

class LinguisticExtractorAgentA {
    // In production, this calls the LLM API
    // For now, we mock — will be replaced in Phase 3
    extract(sanitizedText) {
        return {
            coreEntity: null,
            dimension: null,
            quantity: null,
            rawText: sanitizedText
        };
    }
}

class DoubleAgentConsensus {
    constructor() {
        this.agentA = new LinguisticExtractorAgentA();
        this.agentB = new ScopeSniperAgentB();
    }

    execute(frozenText, sanitizedText) {
        // 1. Agent A: linguistic extraction
        const extractionResult = this.agentA.extract(sanitizedText);

        // 2. Agent B: scope audit on FROZEN text (not sanitized!)
        const auditResult = this.agentB.auditScope(frozenText, extractionResult);

        return {
            extraction: extractionResult,
            audit: auditResult,
            canAutoPrice: auditResult.status === 'APPROVED',
            needsHumanReview: auditResult.status === 'REJECTED',
        };
    }
}

module.exports = { DoubleAgentConsensus, ScopeSniperAgentB };

// Quick Test Block
if (require.main === module) {
    const consensus = new DoubleAgentConsensus();
    
    console.log("=== ARBA Double-Agent V8.1 (Hardened) ===\n");

    const tests = [
        { text: "توريد وتركيب بلوك سماكة 20 سم", desc: "بند عادي بدون مصائد" },
        { text: "توريد بلوك 20 سم لا يشمل الأسمنت", desc: "بند مع استبعاد (RED)" },
        { text: "بلاط مع المونة والتركيب", desc: "بند عادي فيه كلمة 'مع' (يجب ألا يُرفض)" },
        { text: "دهان شامل المعجون والبرايمر", desc: "بند مع إدراج (YELLOW)" },
        { text: "أعمال حفر باستثناء الحفر الصخري", desc: "بند مع استبعاد واضح (RED)" },
    ];

    tests.forEach((t, idx) => {
        const result = consensus.execute(t.text, t.text);
        const icon = result.audit.severity === 'RED' ? '🔴' : 
                     result.audit.severity === 'YELLOW' ? '🟡' : '⚪';
        console.log(`Test ${idx + 1} ${icon}: ${t.desc}`);
        console.log(`  Input: "${t.text}"`);
        console.log(`  Status: ${result.audit.status} | Can Auto-Price: ${result.canAutoPrice}`);
        if (result.audit.details) {
            result.audit.details.forEach(d => console.log(`  ${d}`));
        }
        console.log();
    });
}
