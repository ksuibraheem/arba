"use strict";
/**
 * Arba Full-Spectrum Stress Test
 * اختبار الإجهاد الشامل لبوابة API
 *
 * Tests:
 * 1. Generate Arba_Security_Test.xlsx with competitor data + quantitative rows
 * 2. Test RegEx Scanner → Expect BLOCKED
 * 3. Test Purge → Strip competitor names & metadata
 * 4. Test Formula Engine → [(400 × 1.1) + 50] × 1.15 = 563.50
 * 5. Log full execution path
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fileParser_1 = require("./fileParser");
const sanitizationEngine_1 = require("./sanitizationEngine");
const formulaEngine_1 = require("./formulaEngine");
// =================== CONFIG ===================
const OUTPUT_DIR = path.join(__dirname, '..', 'test_output');
const TEST_FILE = path.join(OUTPUT_DIR, 'Arba_Security_Test.xlsx');
const REPORT_FILE = path.join(OUTPUT_DIR, 'stress_test_report.json');
// Color codes for terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const results = [];
const pipelineLog = [];
function logStage(stage, status, detail, ms) {
    pipelineLog.push({ stage, status, detail, ms });
    const icon = status === 'PASS' ? `${GREEN}✅` : status === 'FAIL' ? `${RED}❌` : `${YELLOW}⚠️`;
    console.log(`  ${icon} ${BOLD}${stage}${RESET}: ${detail} ${CYAN}(${ms}ms)${RESET}`);
}
// =================== STEP 1: Generate Test Excel ===================
function generateTestExcel() {
    console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  📝 STEP 1: Generating Arba_Security_Test.xlsx${RESET}`);
    console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`);
    const wb = XLSX.utils.book_new();
    // Sheet with test data
    const testData = [
        // Header row
        ['Item Description', 'Unit', 'Quantity', 'Material Cost', 'Labor Cost', 'Equipment Cost', 'Wastage %'],
        // Row 1: Arab Contractors trigger
        ['Supply and installation of concrete as per Arab Contractors standards', 'm³', 100, 400, 50, 0, 10],
        // Row 2: More competitor references (for additional RegEx triggers)
        ['Bin Laden Group approved precast panels for المقاولون العرب project', 'm²', 200, 350, 80, 25, 8],
        // Row 3: Clean quantitative data (for formula validation)
        ['Standard reinforcement steel Grade 60', 'ton', 50, 400, 50, 0, 10],
        // Row 4: Additional clean data
        ['Portland Cement OPC Type I', 'bag', 500, 25, 5, 0, 5],
        // Row 5: More data with equipment
        ['Ready mix concrete C30 supply and pour', 'm³', 150, 280, 45, 35, 12],
    ];
    const ws = XLSX.utils.aoa_to_sheet(testData);
    // Add competitor metadata (Properties that should be purged)
    wb.Props = {
        Title: 'Saudi Binladin Group - Confidential Pricing',
        Author: 'Ahmed - Arab Contractors مهندس',
        Company: 'المقاولون العرب - Arab Contractors Co.',
        Comments: 'Internal pricing document - Nesma Holdings review',
        LastAuthor: 'Bin Laden Engineering',
        CreatedDate: new Date('2024-01-15'),
    };
    XLSX.utils.book_append_sheet(wb, ws, 'Binladin Pricing Sheet');
    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    // Also save to disk for reference
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(TEST_FILE, buffer);
    console.log(`  ${GREEN}✅${RESET} File created: ${TEST_FILE}`);
    console.log(`  📊 Rows: ${testData.length - 1} data rows + 1 header`);
    console.log(`  🏷️  Metadata: Infected with competitor names`);
    console.log(`  📛 Sheet name: "Binladin Pricing Sheet" (competitor-branded)`);
    return buffer;
}
// =================== STEP 2: Test Pipeline ===================
async function runPipelineTest(buffer) {
    console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  🔬 STEP 2: Running Full Pipeline Test${RESET}`);
    console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`);
    const totalStart = Date.now();
    // ── Stage 1: Parse ──
    const parseStart = Date.now();
    let parseResult;
    try {
        parseResult = await (0, fileParser_1.parseFile)(buffer, 'Arba_Security_Test.xlsx');
        const parseMs = Date.now() - parseStart;
        logStage('Parse', 'PASS', `${parseResult.sheets.length} sheets, ${parseResult.sheets[0]?.rowCount || 0} rows, type: ${parseResult.fileType}`, parseMs);
        results.push({
            testName: 'File Parsing',
            status: 'PASS',
            expected: 'Parse Excel file successfully',
            actual: `Parsed ${parseResult.sheets.length} sheet(s), ${parseResult.sheets[0]?.rowCount} rows`,
            durationMs: parseMs,
        });
    }
    catch (err) {
        logStage('Parse', 'FAIL', err.message, Date.now() - parseStart);
        results.push({
            testName: 'File Parsing',
            status: 'FAIL',
            expected: 'Parse Excel file',
            actual: err.message,
            durationMs: Date.now() - parseStart,
        });
        return;
    }
    // ── Stage 2: Security Scan (RegEx) ──
    const scanStart = Date.now();
    let scanReport;
    try {
        scanReport = (0, sanitizationEngine_1.scanForFingerprints)(parseResult.sheets, parseResult.metadata);
        const scanMs = Date.now() - scanStart;
        const blockedStatus = scanReport.securityAlertLevel;
        const isBlocked = blockedStatus === 'BLOCKED';
        logStage('Security Scan', isBlocked ? 'PASS' : 'FAIL', `Alert: ${blockedStatus}, Matches: ${scanReport.totalMatches}, Critical: ${scanReport.criticalCount}`, scanMs);
        // Log detected companies
        console.log(`\n  ${BOLD}🕵️  Detected Companies:${RESET}`);
        scanReport.matches.forEach((m, i) => {
            const icon = m.severity === 'critical' ? '🔴' : m.severity === 'warning' ? '🟡' : '🔵';
            console.log(`    ${icon} ${m.pattern} [${m.severity}] — "${m.context?.substring(0, 60)}..."`);
        });
        results.push({
            testName: 'RegEx Security Scan — BLOCKED Detection',
            status: isBlocked ? 'PASS' : 'FAIL',
            expected: 'securityAlertLevel = BLOCKED',
            actual: `securityAlertLevel = ${blockedStatus}, ${scanReport.totalMatches} matches`,
            durationMs: scanMs,
            details: {
                totalMatches: scanReport.totalMatches,
                criticalCount: scanReport.criticalCount,
                warningCount: scanReport.warningCount,
                detectedCompanies: scanReport.matches.map((m) => ({
                    name: m.pattern,
                    severity: m.severity,
                    category: m.companyCategory,
                })),
            },
        });
    }
    catch (err) {
        logStage('Security Scan', 'FAIL', err.message, Date.now() - scanStart);
        return;
    }
    // ── Stage 3: Metadata Analysis ──
    console.log(`\n  ${BOLD}📋 Infected Metadata (Before Purge):${RESET}`);
    const metadata = parseResult.metadata;
    Object.entries(metadata).forEach(([key, val]) => {
        if (val && String(val).length > 0) {
            console.log(`    📌 ${key}: "${val}"`);
        }
    });
    // ── Stage 4: Purge ──
    const purgeStart = Date.now();
    try {
        const purgeResult = (0, sanitizationEngine_1.executePurge)(parseResult.sheets, parseResult.metadata, scanReport.matches);
        const purgeMs = Date.now() - purgeStart;
        logStage('Purge', 'PASS', `Removed ${purgeResult.removedItems.length} competitor references`, purgeMs);
        // Show what was purged
        console.log(`\n  ${BOLD}🧹 Purged Items:${RESET}`);
        purgeResult.removedItems.slice(0, 10).forEach((item) => {
            console.log(`    🗑️  "${item.content?.substring(0, 70)}..." [${item.type}]`);
        });
        results.push({
            testName: 'Purge — Competitor Stripping',
            status: purgeResult.removedItems.length > 0 ? 'PASS' : 'FAIL',
            expected: 'Competitor names and metadata stripped',
            actual: `${purgeResult.removedItems.length} items purged`,
            durationMs: purgeMs,
            details: {
                removedCount: purgeResult.removedItems.length,
                samples: purgeResult.removedItems.slice(0, 5),
            },
        });
        // Apply white-label
        const whiteLabeledSheets = (0, sanitizationEngine_1.applyWhiteLabel)(purgeResult.sanitizedSheets);
        console.log(`\n  ${BOLD}🏷️  White-Labeled Sheet Names:${RESET}`);
        whiteLabeledSheets.forEach((s) => {
            console.log(`    ✨ "${s.sheetName}"`);
        });
    }
    catch (err) {
        logStage('Purge', 'FAIL', err.message, Date.now() - purgeStart);
    }
    // ── Stage 5: Formula Engine Test ──
    console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  🔢 STEP 3: Formula Engine Validation${RESET}`);
    console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`);
    const formulaStart = Date.now();
    try {
        // Test the exact formula: Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
        // Material=400, Wastage=10% (0.1 decimal), Labor=50, Equipment=0, Overheads=15% (1.15)
        // Expected: [(400 × 1.1) + 50 + 0] × 1.15 = [440 + 50] × 1.15 = 490 × 1.15 = 563.50
        const testItem = {
            name_ar: 'اختبار حديد تسليح',
            name_en: 'Standard reinforcement steel Grade 60',
            unit: 'ton',
            qty: 1,
            materials: 400,
            labor: 50,
            equipment: 0,
            waste: 0.10, // 10% as decimal
            category: 'structure',
        };
        const processed = (0, formulaEngine_1.processImportedItems)([testItem], {
            overheadMultiplier: 1.15,
            profitMargin: 0,
            contingency: 0,
        });
        const p = processed[0];
        const actualTotal = Math.round(p.totalUnitCost * 100) / 100;
        const expectedTotal = 563.50;
        const formulaPass = Math.abs(actualTotal - expectedTotal) < 0.01;
        const formulaMs = Date.now() - formulaStart;
        console.log(`\n  ${BOLD}📐 Formula Breakdown:${RESET}`);
        console.log(`    Materials:    ${CYAN}400 SAR${RESET}`);
        console.log(`    Wastage:      ${CYAN}10% (×1.1)${RESET}`);
        console.log(`    Labor:        ${CYAN}50 SAR${RESET}`);
        console.log(`    Equipment:    ${CYAN}0 SAR${RESET}`);
        console.log(`    Overheads:    ${CYAN}15% (×1.15)${RESET}`);
        console.log(`    ─────────────────────────`);
        console.log(`    ${BOLD}Formula:${RESET}  [(400 × 1.1) + 50 + 0] × 1.15`);
        console.log(`    ${BOLD}Step 1:${RESET}   400 × 1.1 = ${YELLOW}440${RESET} (materials + wastage)`);
        console.log(`    ${BOLD}Step 2:${RESET}   440 + 50 + 0 = ${YELLOW}490${RESET} (direct costs)`);
        console.log(`    ${BOLD}Step 3:${RESET}   490 × 1.15 = ${BOLD}${formulaPass ? GREEN : RED}${actualTotal}${RESET}`);
        console.log(`    ${BOLD}Expected:${RESET} ${GREEN}${expectedTotal}${RESET}`);
        console.log(`    ${BOLD}Status:${RESET}   ${formulaPass ? `${GREEN}✅ MATCH` : `${RED}❌ MISMATCH`}${RESET}`);
        logStage('Formula Engine', formulaPass ? 'PASS' : 'FAIL', `Result: ${actualTotal}, Expected: ${expectedTotal}`, formulaMs);
        results.push({
            testName: 'Formula Engine — [(400×1.1)+50]×1.15 = 563.50',
            status: formulaPass ? 'PASS' : 'FAIL',
            expected: `${expectedTotal}`,
            actual: `${actualTotal}`,
            durationMs: formulaMs,
            details: {
                materialWithWaste: p.materialsCost + p.wastageCost,
                directCost: p.directCost,
                overheadAmount: p.overheadAmount,
                totalUnitCost: p.totalUnitCost,
            },
        });
        console.log(`\n  ${BOLD}🔗 Full processImportedItems with Qty=50:${RESET}`);
        const testItemBulk = {
            name_ar: 'حديد تسليح',
            name_en: 'Standard reinforcement steel Grade 60',
            unit: 'ton',
            qty: 50,
            materials: 400,
            labor: 50,
            equipment: 0,
            waste: 0.10,
            category: 'structure',
        };
        const processedBulk = (0, formulaEngine_1.processImportedItems)([testItemBulk], {
            overheadMultiplier: 1.15,
            profitMargin: 0,
            contingency: 0,
        });
        if (processedBulk.length > 0) {
            const pb = processedBulk[0];
            console.log(`    Item: ${pb.name.en || pb.name.ar}`);
            console.log(`    Unit Cost: ${CYAN}${Math.round(pb.totalUnitCost * 100) / 100} SAR${RESET}`);
            console.log(`    Line Price (×50): ${CYAN}${Math.round(pb.totalLinePrice * 100) / 100} SAR${RESET}`);
            console.log(`    Expected Line: ${GREEN}${563.50 * 50} SAR${RESET}`);
        }
    }
    catch (err) {
        logStage('Formula Engine', 'FAIL', err.message, Date.now() - formulaStart);
        results.push({
            testName: 'Formula Engine',
            status: 'FAIL',
            expected: '563.50',
            actual: err.message,
            durationMs: Date.now() - formulaStart,
        });
    }
    // ── Stage 6: Auto-Map Columns Test ──
    const mapStart = Date.now();
    console.log(`\n  ${BOLD}🗺️  Column Auto-Mapping Test:${RESET}`);
    try {
        const primarySheet = parseResult.sheets[0];
        const mappings = (0, fileParser_1.autoMapColumns)(primarySheet.headers, parseResult.columnTypes);
        Object.entries(mappings).forEach(([source, target]) => {
            console.log(`    📍 "${source}" → ${CYAN}${target}${RESET}`);
        });
        const mappedCount = Object.keys(mappings).length;
        logStage('Column Auto-Map', mappedCount > 0 ? 'PASS' : 'FAIL', `${mappedCount} columns auto-mapped from ${primarySheet.headers.length} headers`, Date.now() - mapStart);
        results.push({
            testName: 'Column Auto-Mapping',
            status: mappedCount > 0 ? 'PASS' : 'FAIL',
            expected: 'Auto-map columns to Arba schema',
            actual: `${mappedCount} columns mapped`,
            durationMs: Date.now() - mapStart,
            details: mappings,
        });
    }
    catch (err) {
        logStage('Column Auto-Map', 'FAIL', err.message, Date.now() - mapStart);
    }
    // ── TOTAL TIME ──
    const totalMs = Date.now() - totalStart;
    console.log(`\n  ${CYAN}⏱️  Total pipeline time: ${BOLD}${totalMs}ms${RESET}`);
    return totalMs;
}
// =================== STEP 3: Generate Report ===================
function generateReport(totalMs) {
    console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  📊 FINAL REPORT — Developer Panel Sign-Off${RESET}`);
    console.log(`${CYAN}═══════════════════════════════════════════════${RESET}\n`);
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;
    // Summary table
    console.log(`  ┌─────────────────────────────────────────────────────────┐`);
    console.log(`  │  ${BOLD}Arba API Gateway — Full-Spectrum Stress Test${RESET}          │`);
    console.log(`  ├─────────────────────────────────────────────────────────┤`);
    console.log(`  │  Tests Run:     ${BOLD}${total}${RESET}                                       │`);
    console.log(`  │  ${GREEN}Passed:        ${BOLD}${passed}${RESET}                                       │`);
    if (failed > 0) {
        console.log(`  │  ${RED}Failed:        ${BOLD}${failed}${RESET}                                       │`);
    }
    console.log(`  │  Total Time:    ${CYAN}${totalMs}ms${RESET}                                   │`);
    console.log(`  │  Status:        ${passed === total ? `${GREEN}${BOLD}ALL TESTS PASSED ✅` : `${RED}${BOLD}${failed} TESTS FAILED ❌`}${RESET}     │`);
    console.log(`  └─────────────────────────────────────────────────────────┘\n`);
    // Detailed results
    results.forEach((r, i) => {
        const icon = r.status === 'PASS' ? `${GREEN}✅` : `${RED}❌`;
        console.log(`  ${icon} ${BOLD}Test ${i + 1}: ${r.testName}${RESET}`);
        console.log(`     Expected: ${r.expected}`);
        console.log(`     Actual:   ${r.actual}`);
        console.log(`     Time:     ${r.durationMs}ms\n`);
    });
    // Save report to JSON
    const report = {
        testSuite: 'Arba API Gateway — Full-Spectrum Stress Test',
        timestamp: new Date().toISOString(),
        environment: 'local_node',
        totalDurationMs: totalMs,
        summary: { total, passed, failed },
        results,
        pipelineLog,
        formulas: {
            locked: true,
            formula: 'Total = [(Materials × Wastage) + Labor + Equipment] × Overheads',
            executionEnv: 'Cloud Functions only',
        },
    };
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(`  📄 Full report saved: ${REPORT_FILE}`);
}
// =================== MAIN ===================
async function main() {
    console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║  🏗️  ARBA API GATEWAY — STRESS TEST PROTOCOL  ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚═══════════════════════════════════════════════╝${RESET}`);
    console.log(`  ${new Date().toISOString()}`);
    console.log(`  Server-Only Execution — Formula Lockdown Active 🔒\n`);
    // Step 1: Generate test file
    const buffer = generateTestExcel();
    // Step 2: Run pipeline
    const totalMs = await runPipelineTest(buffer);
    // Step 3: Report
    generateReport(totalMs || 0);
}
main().catch(err => {
    console.error(`\n${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});
//# sourceMappingURL=stressTest.js.map