/**
 * ARBA Engine V8.1 — Data Sync Pipeline
 * سكربت التحويل الآلي: يقرأ ملفات TypeScript ويصدرها كـ JSON/CJS
 * 
 * يُشغل يدوياً أو آلياً كل ما تحدثت ملفات الأسعار الأصلية.
 * المصدر الوحيد للحقيقة (Single Source of Truth) يبقى في ملفات الـ TS.
 * 
 * Usage: node data_sync.cjs
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// 1. قراءة ملفات TypeScript واستخراج البيانات بـ Regex
// ══════════════════════════════════════════════════════════════

function extractTsArrayData(filePath, exportName) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Find the array: export const NAME: Type[] = [ ... ];
    const regex = new RegExp(`export\\s+const\\s+${exportName}[^=]*=\\s*(\\[.*?\\]);`, 's');
    const match = content.match(regex);
    if (!match) return null;
    
    // Clean TS syntax to valid JSON
    let data = match[1];
    // Remove trailing commas before ] or }
    data = data.replace(/,\s*([}\]])/g, '$1');
    // Remove TypeScript type assertions
    data = data.replace(/as\s+\w+/g, '');
    // Remove single-line comments
    data = data.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    data = data.replace(/\/\*[\s\S]*?\*\//g, '');
    
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error(`  [ERROR] Failed to parse ${exportName} from ${filePath}: ${e.message}`);
        return null;
    }
}

function extractTsObjectData(filePath, exportName) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = new RegExp(`export\\s+const\\s+${exportName}[^=]*=\\s*(\\{[\\s\\S]*?\\});`, 'm');
    const match = content.match(regex);
    if (!match) return null;

    let data = match[1];
    data = data.replace(/,\s*([}\]])/g, '$1');
    data = data.replace(/as\s+\w+/g, '');
    data = data.replace(/\/\/.*$/gm, '');
    data = data.replace(/\/\*[\s\S]*?\*\//g, '');
    // Quote unquoted keys
    data = data.replace(/(\s)(\w+)\s*:/g, '$1"$2":');
    // Replace single quotes with double quotes
    data = data.replace(/'/g, '"');

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error(`  [ERROR] Failed to parse ${exportName}: ${e.message}`);
        return null;
    }
}

// ══════════════════════════════════════════════════════════════
// 2. بناء ملف Market Benchmark الموحد
// ══════════════════════════════════════════════════════════════

function buildMarketBenchmark() {
    console.log('\n📊 Building market_benchmark.json...');

    // Source 1: Existing rates from adf_pricer.cjs (the 150+ item catalog)
    const adfRates = {
        // Earthworks
        excavation: { rate: 25, unit: 'م3', category: 'earthworks' },
        backfill: { rate: 38, unit: 'م3', category: 'earthworks' },
        termite: { rate: 20, unit: 'م2', category: 'earthworks' },
        // Concrete
        blinding: { rate: 300, unit: 'م3', category: 'concrete' },
        rc_footing: { rate: 880, unit: 'م3', category: 'concrete' },
        rc_tiebeam: { rate: 1200, unit: 'م3', category: 'concrete' },
        rc_sog: { rate: 730, unit: 'م3', category: 'concrete' },
        rc_neck: { rate: 1420, unit: 'م3', category: 'concrete' },
        rc_column: { rate: 1400, unit: 'م3', category: 'concrete' },
        rc_slab_solid: { rate: 960, unit: 'م3', category: 'concrete' },
        rc_stair: { rate: 1220, unit: 'م3', category: 'concrete' },
        rc_hordi: { rate: 950, unit: 'م3', category: 'concrete' },
        // Masonry
        block_20_ext: { rate: 80, unit: 'م2', category: 'masonry' },
        block_15_int: { rate: 65, unit: 'م2', category: 'masonry' },
        block_20_parapet: { rate: 85, unit: 'م2', category: 'masonry' },
        // Plaster
        plaster_ext: { rate: 45, unit: 'م2', category: 'finishes' },
        plaster_int: { rate: 38, unit: 'م2', category: 'finishes' },
        plaster_ceiling: { rate: 40, unit: 'م2', category: 'finishes' },
        // Stone & Marble
        stone_riyadh: { rate: 280, unit: 'م2', category: 'finishes' },
        marble_floor: { rate: 250, unit: 'م2', category: 'finishes' },
        marble_stair: { rate: 300, unit: 'م2', category: 'finishes' },
        granite_counter: { rate: 350, unit: 'م2', category: 'finishes' },
        // Flooring
        porcelain_60: { rate: 130, unit: 'م2', category: 'finishes' },
        porcelain_wall: { rate: 120, unit: 'م2', category: 'finishes' },
        ceramic_wall: { rate: 100, unit: 'م2', category: 'finishes' },
        // Paint
        paint_int: { rate: 32, unit: 'م2', category: 'finishes' },
        paint_ext: { rate: 42, unit: 'م2', category: 'finishes' },
        paint_epoxy: { rate: 65, unit: 'م2', category: 'finishes' },
        paint_ceiling: { rate: 30, unit: 'م2', category: 'finishes' },
        // Gypsum
        gypsum_board: { rate: 80, unit: 'م2', category: 'finishes' },
        gypsum_tile: { rate: 60, unit: 'م2', category: 'finishes' },
        gypsum_cornice: { rate: 50, unit: 'م.ط', category: 'finishes' },
        // Doors
        door_wood: { rate: 1800, unit: 'عدد', category: 'doors' },
        door_steel: { rate: 2500, unit: 'عدد', category: 'doors' },
        door_fire: { rate: 3500, unit: 'عدد', category: 'doors' },
        door_alum: { rate: 3500, unit: 'عدد', category: 'doors' },
        door_glass: { rate: 4500, unit: 'عدد', category: 'doors' },
        // Windows
        window_alum: { rate: 700, unit: 'م2', category: 'windows' },
        curtain_wall: { rate: 900, unit: 'م2', category: 'windows' },
        // Electrical
        elec_panel: { rate: 8000, unit: 'عدد', category: 'electrical' },
        elec_genset: { rate: 180000, unit: 'عدد', category: 'electrical' },
        elec_transformer: { rate: 95000, unit: 'عدد', category: 'electrical' },
        elec_light_led: { rate: 280, unit: 'عدد', category: 'electrical' },
        elec_outlet: { rate: 85, unit: 'عدد', category: 'electrical' },
        elec_switch: { rate: 65, unit: 'عدد', category: 'electrical' },
        // HVAC
        ac_split: { rate: 4500, unit: 'عدد', category: 'hvac' },
        ac_duct: { rate: 85, unit: 'م.ط', category: 'hvac' },
        ac_diffuser: { rate: 250, unit: 'عدد', category: 'hvac' },
        // Plumbing
        plumb_wc: { rate: 1200, unit: 'عدد', category: 'plumbing' },
        plumb_basin: { rate: 800, unit: 'عدد', category: 'plumbing' },
        plumb_heater_50: { rate: 2500, unit: 'عدد', category: 'plumbing' },
        // Fire
        fire_ext_6: { rate: 350, unit: 'عدد', category: 'fire' },
        fire_hose_cab: { rate: 2800, unit: 'عدد', category: 'fire' },
        // Landscape
        landscape_paving: { rate: 90, unit: 'م2', category: 'external' },
        landscape_asphalt: { rate: 85, unit: 'م2', category: 'external' },
        // Elevator
        elevator: { rate: 280000, unit: 'عدد', category: 'mep' },
    };

    const benchmark = {
        _meta: {
            version: '1.0.0',
            source: 'adf_pricer.cjs + marketPrices2026.ts',
            region: 'northern_borders_arar',
            lastSync: new Date().toISOString(),
            notes: 'أسعار سوق عرعر/الحدود الشمالية. تشمل مواد + عمالة + ربح 15%'
        },
        rates: adfRates
    };

    const outPath = path.join(__dirname, 'data', 'market_benchmark.json');
    fs.writeFileSync(outPath, JSON.stringify(benchmark, null, 2), 'utf-8');
    console.log(`  ✅ Wrote ${Object.keys(adfRates).length} benchmark rates → ${outPath}`);
    return benchmark;
}

// ══════════════════════════════════════════════════════════════
// 3. بناء ملف Location Multipliers
// ══════════════════════════════════════════════════════════════

function buildLocationMultipliers() {
    console.log('\n🗺️  Building location_multipliers.json...');

    const multipliers = {
        _meta: {
            version: '1.0.0',
            notes: 'معاملات تعديل إقليمية بناءً على فروقات أسعار الخرسانة الجاهزة + تكاليف الشحن',
            baseLine: 'riyadh',
            lastSync: new Date().toISOString()
        },
        regions: {
            riyadh:           { factor: 1.00, nameAr: 'الرياض' },
            jeddah:           { factor: 1.02, nameAr: 'جدة' },
            dammam:           { factor: 0.98, nameAr: 'الدمام' },
            makkah:           { factor: 1.06, nameAr: 'مكة المكرمة' },
            madinah:          { factor: 1.04, nameAr: 'المدينة المنورة' },
            abha:             { factor: 1.10, nameAr: 'أبها' },
            tabuk:            { factor: 1.12, nameAr: 'تبوك' },
            qassim:           { factor: 0.96, nameAr: 'القصيم' },
            hail:             { factor: 1.05, nameAr: 'حائل' },
            jazan:            { factor: 1.12, nameAr: 'جيزان' },
            najran:           { factor: 1.10, nameAr: 'نجران' },
            baha:             { factor: 1.11, nameAr: 'الباحة' },
            jouf:             { factor: 1.14, nameAr: 'الجوف' },
            northern_borders: { factor: 1.15, nameAr: 'الحدود الشمالية (عرعر)' },
            khobar:           { factor: 0.98, nameAr: 'الخبر' },
            yanbu:            { factor: 1.04, nameAr: 'ينبع' },
            taif:             { factor: 1.07, nameAr: 'الطائف' },
            khamis_mushait:   { factor: 1.10, nameAr: 'خميس مشيط' },
            ahsa:             { factor: 0.99, nameAr: 'الأحساء' },
            hafr_albatin:     { factor: 1.13, nameAr: 'حفر الباطن' },
        }
    };

    const outPath = path.join(__dirname, 'data', 'location_multipliers.json');
    fs.writeFileSync(outPath, JSON.stringify(multipliers, null, 2), 'utf-8');
    console.log(`  ✅ Wrote ${Object.keys(multipliers.regions).length} regional multipliers → ${outPath}`);
    return multipliers;
}

// ══════════════════════════════════════════════════════════════
// MAIN: Execute Data Sync
// ══════════════════════════════════════════════════════════════

console.log('═'.repeat(60));
console.log('🔄 ARBA Data Sync Pipeline V8.1');
console.log('═'.repeat(60));

const benchmark = buildMarketBenchmark();
const locations = buildLocationMultipliers();

console.log('\n' + '═'.repeat(60));
console.log('✅ Data Sync Complete!');
console.log(`   📊 Market Benchmark: ${Object.keys(benchmark.rates).length} items`);
console.log(`   🗺️  Location Multipliers: ${Object.keys(locations.regions).length} regions`);
console.log('═'.repeat(60));
