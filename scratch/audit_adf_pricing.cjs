const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const hbPricedPath = path.join(__dirname, '..', 'pricing_files', 'hafr_albatin_raw_ARBA_PRICED.xlsx');
const ryPricedPath = path.join(__dirname, '..', 'pricing_files', 'riyadh_raw_ARBA_PRICED.xlsx');

console.log('=== AUDITING ARBA PRICED OUTPUTS ===');

function auditFile(filePath, projectName, multiplier) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
    const wb = xlsx.readFile(filePath);
    const sheet = wb.Sheets['جدول الكميات المسعر'];
    if (!sheet) {
        console.error(`Sheet "جدول الكميات المسعر" not found in ${filePath}`);
        return null;
    }
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`\nProject: ${projectName}`);
    console.log(`Total priced rows: ${rows.length}`);

    // Group by description to check internal duplication consistency
    const groups = {};
    rows.forEach(r => {
        const desc = String(r['وصف البند'] || '').trim();
        const baseRate = Number(r['سعر التكلفة']) || 0;
        const sellRate = Number(r['سعر البيع']) || 0;
        const unit = String(r['الوحدة'] || '').trim();
        const qty = Number(r['الكمية']) || 0;
        
        if (!groups[desc]) {
            groups[desc] = [];
        }
        groups[desc].push({ baseRate, sellRate, unit, qty, row: r['#'] });
    });

    let duplicateDescs = 0;
    let inconsistentDuplicates = 0;
    const inconsistencies = [];

    Object.entries(groups).forEach(([desc, items]) => {
        if (items.length > 1) {
            duplicateDescs++;
            const rates = items.map(it => it.baseRate);
            const firstRate = rates[0];
            const allSame = rates.every(r => r === firstRate);
            if (!allSame) {
                inconsistentDuplicates++;
                inconsistencies.push({
                    desc,
                    rates: items.map(it => `Row ${it.row}: ${it.baseRate} SAR`),
                });
            }
        }
    });

    console.log(`Number of duplicate descriptions: ${duplicateDescs}`);
    console.log(`Number of inconsistent duplicates (different prices for same item): ${inconsistentDuplicates}`);
    if (inconsistentDuplicates > 0) {
        console.warn('⚠️ WARNING: Inconsistent internal duplicate pricing found!');
        console.log(JSON.stringify(inconsistencies.slice(0, 5), null, 2));
    } else {
        console.log('✅ PASS: All internal duplicate descriptions have consistent pricing.');
    }

    // Check specific items: بوكلين, شيول, جكات
    const equipmentItems = [];
    const propItems = [];
    rows.forEach(r => {
        const desc = String(r['وصف البند'] || '').trim();
        const baseRate = Number(r['سعر التكلفة']) || 0;
        const sellRate = Number(r['سعر البيع']) || 0;
        const qty = Number(r['الكمية']) || 0;
        const priceSource = String(r['مصدر السعر'] || '');

        if (desc.includes('بوكلين') || desc.includes('شيول') || desc.toLowerCase().includes('excavator') || desc.toLowerCase().includes('loader')) {
            equipmentItems.push({ desc, baseRate, sellRate, qty, priceSource });
        }
        if (desc.includes('جك') || desc.includes('Props') || desc.toLowerCase().includes('prop')) {
            propItems.push({ desc, baseRate, sellRate, qty, priceSource });
        }
    });

    console.log(`Equipment items found: ${equipmentItems.length}`);
    equipmentItems.forEach(it => {
        console.log(`  - [${it.priceSource}] ${it.desc.substring(0, 50)}... -> Cost: ${it.baseRate} SAR | Sell: ${it.sellRate} SAR`);
    });

    console.log(`Prop/Scaffolding items found: ${propItems.length}`);
    propItems.forEach(it => {
        console.log(`  - [${it.priceSource}] ${it.desc.substring(0, 50)}... -> Cost: ${it.baseRate} SAR | Sell: ${it.sellRate} SAR`);
    });

    return { groups, rows };
}

const hbData = auditFile(hbPricedPath, 'Hafr Al-Batin (Multiplier 1.13)', 1.13);
const ryData = auditFile(ryPricedPath, 'Riyadh (Multiplier 1.0)', 1.0);

if (hbData && ryData) {
    // Cross-project audit: Find items in both projects
    console.log('\n=== CROSS-PROJECT AUDIT ===');
    const commonItems = [];
    Object.keys(hbData.groups).forEach(desc => {
        if (ryData.groups[desc]) {
            const hbItems = hbData.groups[desc];
            const ryItems = ryData.groups[desc];
            commonItems.push({
                desc,
                hbRate: hbItems[0].baseRate,
                ryRate: ryItems[0].baseRate
            });
        }
    });

    console.log(`Number of common items between Riyadh and Hafr Al-Batin: ${commonItems.length}`);
    let correctFactorMatch = 0;
    let factorMismatch = 0;
    const mismatches = [];

    commonItems.forEach(it => {
        // Since Hafr Al-Batin has multiplier 1.13, its rate should be approximately 1.13 * Riyadh rate
        const expectedHbRate = Math.round(it.ryRate * 1.13 * 100) / 100;
        const diff = Math.abs(it.hbRate - expectedHbRate);
        // Allow tiny rounding difference (0.02 SAR)
        if (diff <= 0.05 || it.hbRate === 0 && it.ryRate === 0) {
            correctFactorMatch++;
        } else {
            factorMismatch++;
            mismatches.push({
                desc: it.desc.substring(0, 50),
                hbRate: it.hbRate,
                ryRate: it.ryRate,
                expectedHbRate,
                diff
            });
        }
    });

    console.log(`Consistent cross-project multiplier pricing: ${correctFactorMatch}`);
    console.log(`Inconsistent multiplier pricing: ${factorMismatch}`);
    if (factorMismatch > 0) {
        console.log('Mismatches sample (first 10):');
        console.table(mismatches.slice(0, 10));
    } else {
        console.log('✅ PASS: All cross-project common items are priced consistently with the regional multipliers.');
    }
}
