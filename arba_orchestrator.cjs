/**
 * ARBA Orchestrator V8.1
 * خط الأنابيب الرئيسي — يربط كل المحركات ببعضها
 * 
 * المدخلات: ملف Excel (.xlsx/.xls) أو PDF (.pdf)
 * المخرجات: ملف Excel مُسعّر مع 15% ربح + تنبيهات لونية
 * 
 * Usage: node arba_orchestrator.cjs <input_file> [region]
 * Example: node arba_orchestrator.cjs "مسودة.xlsx" northern_borders
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');

// Import ARBA V8.1 Engines
const SanitizerEngine = require('./sanitizer_engine.cjs');
const { DoubleAgentConsensus } = require('./double_agent_extractor.cjs');
const ClassificationEngine = require('./classification_rules.cjs');
const AsymmetricPricer = require('./asymmetric_pricer.cjs');

const PROFIT_MARGIN = 1.15; // 15% profit

class ArbaOrchestrator {
    constructor(region = 'riyadh') {
        this.sanitizer = new SanitizerEngine();
        this.consensus = new DoubleAgentConsensus();
        this.classifier = new ClassificationEngine();
        this.pricer = new AsymmetricPricer();
        this.region = region;
        this.locationMultiplier = 1.0;

        // Load location multiplier
        try {
            const locPath = path.join(__dirname, 'data', 'location_multipliers.json');
            const locData = JSON.parse(fs.readFileSync(locPath, 'utf-8'));
            const regionData = locData.regions[region];
            if (regionData) {
                this.locationMultiplier = regionData.factor;
                console.log(`📍 المنطقة: ${regionData.nameAr} (معامل: ${regionData.factor})`);
            }
        } catch (e) {
            console.warn('[Orchestrator] Location file not found, using default 1.0');
        }
    }

    // ══════════════════════════════════════════════
    // 1. INPUT: Read Excel or PDF
    // ══════════════════════════════════════════════

    readExcel(filePath) {
        console.log(`\n📂 قراءة ملف Excel: ${path.basename(filePath)}`);
        const wb = xlsx.readFile(filePath);
        const allItems = [];
        
        // Skip summary/code sheets
        const skipSheets = ['codes', 'summary', 'notes', 'cover'];

        for (const sheetName of wb.SheetNames) {
            if (skipSheets.some(s => sheetName.toLowerCase().includes(s))) continue;
            
            const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
            if (!rows || rows.length < 2) continue;

            // Auto-detect column layout by finding header row
            let colMap = null;
            let headerRowIdx = -1;

            for (let i = 0; i < Math.min(10, rows.length); i++) {
                const r = rows[i];
                if (!r) continue;
                const joined = r.map(c => String(c || '').toLowerCase()).join('|');

                // Pattern 1: ITEM | SCOPE OF WORK | UNIT | QTY | RATE | AMOUNT
                if (joined.includes('scope') || joined.includes('description')) {
                    colMap = this._detectColumns(r);
                    headerRowIdx = i;
                    break;
                }
                // Pattern 2: # | وصف البند | الوحدة | الكمية
                if (joined.includes('وصف') || joined.includes('البند')) {
                    colMap = this._detectColumns(r);
                    headerRowIdx = i;
                    break;
                }
            }

            if (!colMap) {
                // Default fallback: [0]=seq, [1]=desc, [2]=unit, [3]=qty
                colMap = { desc: 1, unit: 2, qty: 3, rate: 4, amount: 5 };
                headerRowIdx = 0;
            }

            // Extract items from this sheet
            let sheetItems = 0;
            let currentSection = '';
            for (let i = headerRowIdx + 1; i < rows.length; i++) {
                const r = rows[i];
                if (!r) continue;

                const desc = String(r[colMap.desc] || '').trim();
                const unit = String(r[colMap.unit] || '').trim();
                const qty = Number(r[colMap.qty]) || 0;
                const existingRate = Number(r[colMap.rate]) || 0;
                const existingAmount = Number(r[colMap.amount]) || 0;

                // Skip if no description
                if (!desc || desc.length < 2) continue;

                // Skip summary/total rows
                const dl = desc.toLowerCase();
                if (dl.includes('total')) continue;        // catches: Total, Sub-Total, TOTAL, Total of page
                if (dl.startsWith('sub -')) continue;      // SUB - TOTAL DIV
                if (dl.startsWith('sub-')) continue;
                if (dl.includes('carried to')) continue;
                if (dl.includes('kingdom of')) continue;
                if (dl.includes('bill of quantities')) continue;
                if (dl.includes('vat') && dl.includes('15')) continue;
                if (dl.includes('general provisions')) continue;
                if (dl.includes('re farm')) continue;
                if (dl.includes('main building')) continue;
                if (desc.startsWith('DIV ') || desc.startsWith('DIV.')) continue;
                if (desc.startsWith('DIVISION')) continue;
                if (desc.startsWith('*')) continue;

                // Section headers (SCOPE OF WORK, category titles, etc.)
                if (qty <= 0 && existingRate <= 0 && existingAmount <= 0) {
                    // Save as section context but don't add as item
                    if (desc.length > 5 && !dl.includes('scope of work')) {
                        currentSection = desc;
                    }
                    continue;
                }

                const seq = r[0] || allItems.length + 1;

                allItems.push({
                    seq,
                    desc,
                    unit,
                    qty: qty || 1,
                    existingRate,
                    existingAmount,
                    section: currentSection,
                    sheet: sheetName,
                    row: i + 1
                });
                sheetItems++;
            }
            
            if (sheetItems > 0) {
                console.log(`   📄 Sheet "${sheetName}": ${sheetItems} بند`);
            }
        }

        console.log(`   📋 إجمالي البنود المستخرجة: ${allItems.length}`);
        return allItems;
    }

    /**
     * Auto-detect column positions from header row
     */
    _detectColumns(headerRow) {
        const map = { desc: 1, unit: 2, qty: 3, rate: 4, amount: 5 };
        
        headerRow.forEach((cell, idx) => {
            const h = String(cell || '').toLowerCase();
            if (h.includes('scope') || h.includes('description') || h.includes('وصف')) map.desc = idx;
            if (h.includes('unit') || h.includes('الوحدة')) map.unit = idx;
            if (h.includes('qty') || h.includes('الكمية') || h.includes('quantity')) map.qty = idx;
            if (h.includes('rate') || h.includes('u/price') || h.includes('سعر')) map.rate = idx;
            if (h.includes('amount') || h.includes('price') || h.includes('إجمالي') || h.includes('المبلغ')) map.amount = idx;
        });

        return map;
    }

    readPDF(filePath) {
        console.log(`\n📂 قراءة ملف PDF: ${path.basename(filePath)}`);
        // Use pdf2json for PDF extraction
        const PDFParser = require('pdf2json');
        
        return new Promise((resolve, reject) => {
            const parser = new PDFParser();
            parser.on('pdfParser_dataReady', (pdfData) => {
                const pages = pdfData.Pages || [];
                let allText = '';
                pages.forEach(page => {
                    const texts = (page.Texts || [])
                        .map(t => t.R.map(r => {
                            try { return decodeURIComponent(r.T); }
                            catch(e) { return r.T; }
                        }).join(''))
                        .join(' ');
                    allText += texts + '\n';
                });

                // Parse text into items (basic line-by-line)
                const lines = allText.split('\n').filter(l => l.trim().length > 10);
                const items = lines.map((line, i) => ({
                    seq: i + 1,
                    desc: line.trim(),
                    unit: '',
                    qty: 1,
                    row: i + 1
                }));

                console.log(`   📋 تم استخراج ${items.length} سطر من الـ PDF`);
                resolve(items);
            });
            parser.on('pdfParser_dataError', reject);
            parser.loadPDF(filePath);
        });
    }

    // ══════════════════════════════════════════════
    // 2. PROCESS: The Full Pipeline
    // ══════════════════════════════════════════════

    processItems(rawItems) {
        console.log(`\n🧠 بدء المعالجة (${rawItems.length} بند)...\n`);

        const results = [];
        let classified = 0, unclassified = 0, flagged = 0;
        let pricedFromBenchmark = 0, pricedFromFile = 0, unpriced = 0;

        for (const item of rawItems) {
            // Step 1: Sanitize
            const { frozen, sanitized } = this.sanitizer.processItem(item.desc);

            // Step 2: Double Agent Consensus (Agent A classify + Agent B audit)
            const agentResult = this.consensus.execute(frozen, sanitized);
            const classification = this.classifier.classify(sanitized);

            // Step 3: Calculate price (Smart 3-tier pricing)
            let baseRate = 0;
            let priceSource = '';

            // ═══ SMART 3-TIER PRICING (File-First Strategy) ═══
            // السعر الموجود في الملف الأصلي هو الأدق لأنه مخصص للمشروع
            // الـ Benchmark يُستخدم فقط كاحتياطي للبنود بدون سعر

            // Tier 1: Use existing rate from the original file (MOST ACCURATE)
            if (item.existingRate > 0) {
                baseRate = item.existingRate;
                priceSource = 'سعر الملف الأصلي';
                pricedFromFile++;
            }
            // Tier 2: Calculate from existing amount / qty
            else if (item.existingAmount > 0 && item.qty > 0) {
                baseRate = this.pricer.round2(item.existingAmount / item.qty);
                priceSource = 'محسوب (المبلغ/الكمية)';
                pricedFromFile++;
            }
            // Tier 3: Use ARBA benchmark as fallback
            else if (classification.baseRate > 0) {
                baseRate = classification.baseRate;
                priceSource = 'ARBA Benchmark';
                pricedFromBenchmark++;
            }
            // No price source at all
            else {
                priceSource = 'بدون سعر — يحتاج تسعير يدوي';
                unpriced++;
            }
            
            // Apply location multiplier
            baseRate = this.pricer.round2(baseRate * this.locationMultiplier);
            
            const sellRate = this.pricer.round2(baseRate * PROFIT_MARGIN);
            const totalCost = this.pricer.round2(baseRate * item.qty);
            const totalSell = this.pricer.round2(sellRate * item.qty);
            const profit = this.pricer.round2(totalSell - totalCost);

            // Determine flag color
            let flag = 'NONE';
            let flagReason = '';

            if (!classification.matched) {
                flag = 'RED';
                flagReason = 'بند غير مصنف — يحتاج مراجعة بشرية';
                unclassified++;
            } else if (baseRate <= 0) {
                flag = 'RED';
                flagReason = 'مصنف لكن بدون سعر — يحتاج تسعير يدوي';
                flagged++;
            } else if (agentResult.audit.severity === 'RED') {
                flag = 'RED';
                flagReason = agentResult.audit.details?.join(' | ') || 'كلمة استبعاد مكتشفة';
                flagged++;
            } else if (agentResult.audit.severity === 'YELLOW') {
                flag = 'ORANGE';
                flagReason = agentResult.audit.details?.join(' | ') || 'كلمة إدراج — تحقق من التغطية';
                flagged++;
            } else {
                classified++;
            }

            results.push({
                seq: item.seq,
                frozenDesc: frozen,
                sanitizedDesc: sanitized,
                category: classification.category,
                ruleId: classification.ruleId || 'N/A',
                unit: item.unit || classification.unit,
                qty: item.qty,
                baseRate,
                sellRate,
                totalCost,
                totalSell,
                profit,
                priceSource,
                flag,
                flagReason,
            });
        }

        console.log(`✅ مصنف: ${classified} | ⚠️ مُعلّم: ${flagged} | ❌ غير مصنف: ${unclassified}`);
        console.log(`💰 مصادر الأسعار: Benchmark=${pricedFromBenchmark} | ملف أصلي=${pricedFromFile} | بدون سعر=${unpriced}`);
        return results;
    }

    // ══════════════════════════════════════════════
    // 3. OUTPUT: Write Branded Excel
    // ══════════════════════════════════════════════

    async writeExcel(results, outputPath) {
        console.log(`\n📊 كتابة ملف الإكسل النهائي...`);

        const wb = new ExcelJS.Workbook();
        
        // ── Sheet 1: BOQ المُسعّر ──
        const ws = wb.addWorksheet('جدول الكميات المسعر', {
            views: [{ rightToLeft: true }]
        });

        // Header row
        ws.columns = [
            { header: '#', key: 'seq', width: 6 },
            { header: 'وصف البند', key: 'frozenDesc', width: 55 },
            { header: 'التصنيف', key: 'ruleId', width: 18 },
            { header: 'الوحدة', key: 'unit', width: 10 },
            { header: 'الكمية', key: 'qty', width: 10 },
            { header: 'سعر التكلفة', key: 'baseRate', width: 14 },
            { header: 'سعر البيع', key: 'sellRate', width: 14 },
            { header: 'إجمالي التكلفة', key: 'totalCost', width: 16 },
            { header: 'إجمالي البيع', key: 'totalSell', width: 16 },
            { header: 'الربح', key: 'profit', width: 12 },
            { header: 'مصدر السعر', key: 'priceSource', width: 22 },
            { header: 'الحالة', key: 'flagReason', width: 40 },
        ];

        // Style header
        ws.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };
        ws.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 30;

        // Add data rows with conditional coloring
        results.forEach((r, idx) => {
            const row = ws.addRow(r);
            row.alignment = { vertical: 'middle', wrapText: true };

            // Dynamic row height based on description length
            const descLen = (r.frozenDesc || '').length;
            row.height = Math.max(20, Math.ceil(descLen / 40) * 18);

            // Flag coloring (Zero-Green Policy: NO green!)
            if (r.flag === 'RED') {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0' } };
            } else if (r.flag === 'ORANGE') {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } };
            }
            // NO green for "clean" items — Zero-Green Policy!

            // Number formatting
            ['baseRate', 'sellRate', 'totalCost', 'totalSell', 'profit'].forEach(key => {
                const cell = row.getCell(key);
                cell.numFmt = '#,##0.00';
            });
        });

        // ── Sheet 2: ملخص مالي ──
        const summary = wb.addWorksheet('ملخص مالي', {
            views: [{ rightToLeft: true }]
        });

        const totalCost = results.reduce((s, r) => s + r.totalCost, 0);
        const totalSell = results.reduce((s, r) => s + r.totalSell, 0);
        const totalProfit = results.reduce((s, r) => s + r.profit, 0);
        const redCount = results.filter(r => r.flag === 'RED').length;
        const orangeCount = results.filter(r => r.flag === 'ORANGE').length;

        const summaryData = [
            ['البند', 'القيمة'],
            ['عدد البنود', results.length],
            ['إجمالي التكلفة', Math.round(totalCost)],
            ['إجمالي البيع (15%)', Math.round(totalSell)],
            ['إجمالي الربح', Math.round(totalProfit)],
            ['شامل ضريبة 15%', Math.round(totalSell * 1.15)],
            ['بنود تحتاج مراجعة (أحمر)', redCount],
            ['بنود تحتاج تأكيد (برتقالي)', orangeCount],
            ['المنطقة', this.region],
            ['معامل المنطقة', this.locationMultiplier],
        ];

        summaryData.forEach((row, i) => {
            const r = summary.addRow(row);
            if (i === 0) {
                r.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
                r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };
            }
            r.height = 28;
        });

        summary.getColumn(1).width = 30;
        summary.getColumn(2).width = 25;

        await wb.xlsx.writeFile(outputPath);
        console.log(`\n✅ تم حفظ عرض السعر: ${outputPath}`);
        console.log(`   💰 إجمالي البيع: ${Math.round(totalSell).toLocaleString()} ريال`);
        console.log(`   📈 الربح: ${Math.round(totalProfit).toLocaleString()} ريال`);
        console.log(`   🔴 بنود تحتاج مراجعة: ${redCount}`);
        console.log(`   🟠 بنود تحتاج تأكيد: ${orangeCount}`);
    }

    // ══════════════════════════════════════════════
    // 4. MAIN: Run the full pipeline
    // ══════════════════════════════════════════════

    async run(inputFile) {
        console.log('═'.repeat(60));
        console.log('🚀 ARBA V8.1 — محرك التسعير الذكي');
        console.log('═'.repeat(60));

        const ext = path.extname(inputFile).toLowerCase();
        let items;

        if (ext === '.pdf') {
            items = await this.readPDF(inputFile);
        } else {
            items = this.readExcel(inputFile);
        }

        if (!items || items.length === 0) {
            console.error('❌ لم يتم العثور على بنود في الملف!');
            return;
        }

        const results = this.processItems(items);
        
        const outName = path.basename(inputFile, ext) + '_ARBA_PRICED.xlsx';
        const outPath = path.join(path.dirname(inputFile), outName);
        
        await this.writeExcel(results, outPath);

        console.log('\n' + '═'.repeat(60));
        console.log('✅ ARBA V8.1 — اكتملت العملية بنجاح!');
        console.log('═'.repeat(60));
    }
}

module.exports = ArbaOrchestrator;

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node arba_orchestrator.cjs <input_file> [region]');
        console.log('Example: node arba_orchestrator.cjs "مسودة.xlsx" northern_borders');
        console.log('\nRegions: riyadh, jeddah, dammam, makkah, northern_borders, tabuk, abha, jazan, etc.');
        process.exit(1);
    }

    const inputFile = args[0];
    const region = args[1] || 'riyadh';
    
    const orchestrator = new ArbaOrchestrator(region);
    orchestrator.run(inputFile).catch(e => {
        console.error('❌ خطأ:', e.message);
    });
}
