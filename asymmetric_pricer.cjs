/**
 * ARBA Engine V8.1
 * Module: Asymmetric Pricer & Unbalanced Guard — HARDENED
 * 
 * [FIX] Pro-Rata distribution instead of even split.
 * [FIX] Floating point precision (toFixed(2) on all financials).
 * [NEW] Spill-Over Ceiling Check (re-validates Division 01 after injection).
 * [NEW] Reads benchmark from data/market_benchmark.json.
 */

const fs = require('fs');
const path = require('path');

class AsymmetricPricer {
    constructor(benchmarkPath) {
        this.overflowVault = {
            totalExcess: 0,
            log: []
        };
        
        this.DEVIATION_THRESHOLD = 1.15; // +15% max over benchmark
        this.DIVISION01_CEILING = 1.30;  // Division 01 items can't grow > 30%
        
        // Load benchmark data
        this.benchmark = {};
        try {
            const bPath = benchmarkPath || path.join(__dirname, 'data', 'market_benchmark.json');
            const raw = JSON.parse(fs.readFileSync(bPath, 'utf-8'));
            this.benchmark = raw.rates || {};
        } catch (e) {
            console.warn('[AsymmetricPricer] No benchmark file found, using empty benchmark.');
        }
    }

    /**
     * Round to 2 decimal places (SAR precision: Halala)
     */
    round2(val) {
        return Math.round(val * 100) / 100;
    }

    /**
     * Look up benchmark rate for a given item type.
     */
    getBenchmarkRate(itemType) {
        const entry = this.benchmark[itemType];
        return entry ? entry.rate : null;
    }

    /**
     * Evaluates a single BOQ item and trims excess if unbalanced.
     */
    evaluateItemPrice(item) {
        const ambiguityCost = this.round2(item.baseRate * (item.ambiguityMargin / 100));
        const rawRate = this.round2(item.baseRate + ambiguityCost);
        
        // Look up benchmark (use provided or from file)
        const benchmarkRate = item.benchmark || this.getBenchmarkRate(item.type) || rawRate;
        const ceilingRate = this.round2(benchmarkRate * this.DEVIATION_THRESHOLD);
        
        let finalUnitRate = rawRate;
        let excessPerUnit = 0;

        if (rawRate > ceilingRate) {
            finalUnitRate = ceilingRate;
            excessPerUnit = this.round2(rawRate - ceilingRate);
            
            const totalExcessForThisItem = this.round2(excessPerUnit * item.quantity);
            
            this.overflowVault.totalExcess = this.round2(
                this.overflowVault.totalExcess + totalExcessForThisItem
            );
            this.overflowVault.log.push({
                itemId: item.id,
                division: item.division,
                spilledAmount: totalExcessForThisItem,
                reason: `Raw ${rawRate} > Ceiling ${ceilingRate} (benchmark ${benchmarkRate})`
            });
        }

        return {
            itemId: item.id,
            safeUnitRate: this.round2(finalUnitRate),
            totalCost: this.round2(finalUnitRate * item.quantity),
            isTrimmed: rawRate > ceilingRate,
            rawRate,
            ceilingRate,
        };
    }

    /**
     * [FIX] Pro-Rata distribution of overflow (not even split!)
     * [NEW] Ceiling check after injection.
     */
    allocateOverflow(projectBoqItems) {
        if (this.overflowVault.totalExcess <= 0) return projectBoqItems;

        const spillTargets = ['Mobilization', 'HSE', 'Insurance'];

        // Find safe General Requirements items
        const safeItems = projectBoqItems.filter(
            i => spillTargets.includes(i.category) && i.unit === 'L.S'
        );

        if (safeItems.length === 0) {
            console.warn("[WARNING] No safe Lump Sum items to absorb overflow!");
            return projectBoqItems;
        }

        // [FIX] Pro-Rata: distribute proportionally to each item's original cost
        const totalSafeCost = safeItems.reduce((sum, i) => sum + i.totalCost, 0);
        
        if (totalSafeCost === 0) {
            console.warn("[WARNING] All safe items have zero cost, cannot distribute.");
            return projectBoqItems;
        }

        let distributed = 0;
        safeItems.forEach(target => {
            const originalCost = target.totalCost;
            const share = this.round2(
                (originalCost / totalSafeCost) * this.overflowVault.totalExcess
            );
            
            target.totalCost = this.round2(target.totalCost + share);
            target.overflowAbsorbed = share;
            
            // [NEW] Ceiling Check: did this item grow too much?
            const growthRatio = target.totalCost / originalCost;
            if (growthRatio > this.DIVISION01_CEILING) {
                target.ceilingWarning = `⚠️ Item grew ${Math.round((growthRatio - 1) * 100)}% — exceeds ${Math.round((this.DIVISION01_CEILING - 1) * 100)}% ceiling!`;
            }
            
            distributed += share;
        });

        console.log(`[SPILL-OVER] ${this.overflowVault.totalExcess} SAR distributed (Pro-Rata) across ${safeItems.length} items.`);
        
        this.overflowVault.totalExcess = 0;
        return projectBoqItems;
    }
}

module.exports = AsymmetricPricer;

// Quick Test Block
if (require.main === module) {
    const pricer = new AsymmetricPricer();
    
    console.log("=== ARBA Asymmetric Pricer V8.1 (Hardened) ===\n");

    // Test: Plaster 5000 m2. Base: 45. Ambiguity: +30%. Benchmark: 50.
    const item1 = {
        id: 101, type: 'plaster_ext', division: '09 - Finishes',
        quantity: 5000, unit: 'm2',
        baseRate: 45, ambiguityMargin: 30, benchmark: 50
    };

    const result = pricer.evaluateItemPrice(item1);
    
    console.log("[Item 1: Plaster]");
    console.log(`  Raw Rate: ${result.rawRate} SAR`);
    console.log(`  Ceiling: ${result.ceilingRate} SAR`);
    console.log(`  Safe Rate: ${result.safeUnitRate} SAR`);
    console.log(`  Trimmed: ${result.isTrimmed}`);
    console.log(`  Overflow Vault: ${pricer.overflowVault.totalExcess} SAR`);

    // Mock Division 01 items (unequal sizes to test Pro-Rata)
    const boq = [
        { id: 10, category: 'Mobilization', unit: 'L.S', totalCost: 200000 },
        { id: 11, category: 'HSE', unit: 'L.S', totalCost: 50000 },
    ];

    console.log("\n[Pro-Rata Distribution]");
    console.log(`  Before: Mobilization=${boq[0].totalCost}, HSE=${boq[1].totalCost}`);
    pricer.allocateOverflow(boq);
    console.log(`  After:  Mobilization=${boq[0].totalCost} (+${boq[0].overflowAbsorbed}), HSE=${boq[1].totalCost} (+${boq[1].overflowAbsorbed})`);
    
    // Verify Pro-Rata: Mobilization should get 80%, HSE 20%
    const mobRatio = Math.round(boq[0].overflowAbsorbed / (boq[0].overflowAbsorbed + boq[1].overflowAbsorbed) * 100);
    const hseRatio = 100 - mobRatio;
    console.log(`  Ratios: Mobilization=${mobRatio}%, HSE=${hseRatio}% (expected: 80%/20%)`);
    
    // Check for ceiling warnings
    boq.forEach(b => {
        if (b.ceilingWarning) console.log(`  ${b.ceilingWarning}`);
    });
}
