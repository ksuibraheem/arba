/**
 * ARBA V11.3 — Universal File Reader Service
 * يقرأ ملفات Excel, PDF, DXF, Word مع استخراج البيانات الهيكلية
 * كل المكتبات تُحمّل lazily عند الحاجة فقط
 */

export type FileType = 'xlsx' | 'xls' | 'csv' | 'pdf' | 'dxf' | 'dwg' | 'docx' | 'image' | 'unknown';

export interface FileReadResult {
  fileName: string;
  fileType: FileType;
  fileSizeBytes: number;
  processedAt: Date;
  durationMs: number;
  success: boolean;
  error?: string;
  
  // Extracted data
  tables?: ExtractedTable[];          // For Excel/PDF/Word tables
  text?: string;                      // Raw text content
  layers?: DXFLayer[];                // For DXF files
  metadata?: Record<string, string>;  // File metadata
  boqItems?: ExtractedBOQItem[];      // Auto-detected BOQ items
}

export interface ExtractedTable {
  name: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
}

export interface DXFLayer {
  name: string;
  color: number;
  entityCount: number;
  entities: { type: string; data: Record<string, unknown> }[];
}

export interface ExtractedBOQItem {
  description: string;
  quantity?: number;
  unit?: string;
  price?: number;
  category?: string;
  confidence: number; // 0-1 how confident the extraction is
}

class FileReaderService {
  
  /** Detect file type from extension */
  detectType(fileName: string): FileType {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, FileType> = {
      'xlsx': 'xlsx', 'xls': 'xls', 'csv': 'csv',
      'pdf': 'pdf',
      'dxf': 'dxf', 'dwg': 'dwg',
      'docx': 'docx', 'doc': 'docx',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'bmp': 'image', 'tiff': 'image',
    };
    return typeMap[ext] || 'unknown';
  }
  
  /** Read any supported file */
  async readFile(file: File): Promise<FileReadResult> {
    const start = Date.now();
    const fileType = this.detectType(file.name);
    
    try {
      let result: Partial<FileReadResult>;
      
      switch (fileType) {
        case 'xlsx':
        case 'xls':
        case 'csv':
          result = await this.readExcel(file);
          break;
        case 'pdf':
          result = await this.readPDF(file);
          break;
        case 'dxf':
          result = await this.readDXF(file);
          break;
        case 'docx':
          result = await this.readWord(file);
          break;
        case 'dwg':
          return {
            fileName: file.name, fileType, fileSizeBytes: file.size,
            processedAt: new Date(), durationMs: Date.now() - start,
            success: false,
            error: 'ملفات .dwg غير مدعومة مباشرة. يرجى تصدير الملف كـ .dxf من AutoCAD.',
          };
        case 'image':
          return {
            fileName: file.name, fileType, fileSizeBytes: file.size,
            processedAt: new Date(), durationMs: Date.now() - start,
            success: true, text: '[صورة — استخدم OCR لاستخراج النص]',
          };
        default:
          return {
            fileName: file.name, fileType, fileSizeBytes: file.size,
            processedAt: new Date(), durationMs: Date.now() - start,
            success: false, error: `نوع الملف غير مدعوم: ${file.name}`,
          };
      }
      
      return {
        fileName: file.name, fileType, fileSizeBytes: file.size,
        processedAt: new Date(), durationMs: Date.now() - start,
        success: true, ...result,
      };
    } catch (err) {
      return {
        fileName: file.name, fileType, fileSizeBytes: file.size,
        processedAt: new Date(), durationMs: Date.now() - start,
        success: false, error: String(err),
      };
    }
  }
  
  /** Read Excel file — lazy loads SheetJS — with Smart Header Detection */
  private async readExcel(file: File): Promise<Partial<FileReadResult>> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    const tables: ExtractedTable[] = [];
    const boqItems: ExtractedBOQItem[] = [];
    
    // Smart BOQ keywords for Arabic/English detection (expanded)
    const KEYWORDS = {
      desc: /وصف|description|بند|item|desc|الـ.*ـوصـ|scope|work|نوع العمل|بيان|تفاصيل|المواصفات/i,
      qty: /كمية|qty|quantity|كميه/i,
      unit: /وحدة|unit|وحده/i,
      price: /سعر|price|rate|ريال|cost|إجمالي/i,
    };
    
    // ── Fill Merged Cells (critical for Saudi BOQ files) ──
    const fillMergedCells = (ws: any) => {
      const merges = ws['!merges'];
      if (!merges || merges.length === 0) return;
      for (const merge of merges) {
        const anchorAddr = XLSX.utils.encode_cell({ c: merge.s.c, r: merge.s.r });
        const anchorCell = ws[anchorAddr];
        if (!anchorCell) continue;
        for (let r = merge.s.r; r <= merge.e.r; r++) {
          for (let c = merge.s.c; c <= merge.e.c; c++) {
            if (r === merge.s.r && c === merge.s.c) continue;
            ws[XLSX.utils.encode_cell({ c, r })] = { t: anchorCell.t, v: anchorCell.v };
          }
        }
      }
    };
    
    for (const sheetName of workbook.SheetNames) {
      // Fix 4: Skip summary/index sheets
      if (/ملخص|summary|index|فهرس|cover|غلاف/i.test(sheetName)) continue;
      
      const sheet = workbook.Sheets[sheetName];
      fillMergedCells(sheet); // Fix 1: Fill merged cells before reading
      const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
      
      if (jsonData.length === 0) continue;
      
      // Store raw data as table
      const firstRow = jsonData[0]?.map(h => String(h || '')) || [];
      const rawRows = jsonData.slice(1).map(r => (r || []).map(c => String(c ?? '')));
      tables.push({ name: sheetName, headers: firstRow, rows: rawRows, rowCount: rawRows.length });
      
      // ── Smart Header Detection: scan first 20 rows for column keywords ──
      let headerRowIdx = -1;
      let descCol = -1, qtyCol = -1, unitCol = -1, priceCol = -1;
      
      for (let i = 0; i < Math.min(20, jsonData.length); i++) {
        const row = jsonData[i];
        if (!row || row.length < 3) continue;
        
        let matchCount = 0;
        const tempDesc = row.findIndex(c => KEYWORDS.desc.test(String(c || '')));
        const tempQty = row.findIndex(c => KEYWORDS.qty.test(String(c || '')));
        const tempUnit = row.findIndex(c => KEYWORDS.unit.test(String(c || '')));
        const tempPrice = row.findIndex(c => KEYWORDS.price.test(String(c || '')));
        
        if (tempDesc >= 0) matchCount++;
        if (tempQty >= 0) matchCount++;
        if (tempUnit >= 0) matchCount++;
        if (tempPrice >= 0) matchCount++;
        
        if (matchCount >= 2) {
          headerRowIdx = i;
          descCol = tempDesc;
          qtyCol = tempQty;
          unitCol = tempUnit;
          priceCol = tempPrice;
          break;
        }
      }
      
      // Fallback: if no header found, try first row
      if (headerRowIdx === -1) {
        descCol = firstRow.findIndex(h => KEYWORDS.desc.test(h));
        qtyCol = firstRow.findIndex(h => KEYWORDS.qty.test(h));
        unitCol = firstRow.findIndex(h => KEYWORDS.unit.test(h));
        priceCol = firstRow.findIndex(h => KEYWORDS.price.test(h));
        if (descCol >= 0) headerRowIdx = 0;
      }
      
      // Fix 2: Validate desc column — if it contains only numbers, find the real text column
      if (headerRowIdx >= 0 && descCol >= 0) {
        const sampleRows = jsonData.slice(headerRowIdx + 1, headerRowIdx + 8);
        let numericCount = 0;
        for (const sr of sampleRows) {
          const v = String(sr?.[descCol] || '').trim();
          if (!v || v.length < 2 || /^\d+\.?\d*$/.test(v)) numericCount++;
        }
        // If >60% numeric/empty — wrong column, find the real one
        if (sampleRows.length > 0 && numericCount / sampleRows.length > 0.6) {
          let bestCol = descCol, bestScore = 0;
          const maxCols = Math.max(...sampleRows.map(r => (r || []).length));
          for (let c = 0; c < maxCols; c++) {
            if ([descCol, qtyCol, unitCol, priceCol].includes(c)) continue;
            let score = 0;
            for (const sr of sampleRows) {
              const v = String(sr?.[c] || '').trim();
              if (v.length >= 5 && /[\u0600-\u06FF]/.test(v)) score += 3;
              else if (v.length >= 3 && !/^\d+$/.test(v)) score += 1;
            }
            if (score > bestScore) { bestCol = c; bestScore = score; }
          }
          if (bestScore > 0) descCol = bestCol;
        }
      }
      
      // Extract BOQ items from rows after header
      if (headerRowIdx >= 0) {
        const dataRows = jsonData.slice(headerRowIdx + 1);
        for (const row of dataRows) {
          if (!row || row.length < 2) continue;
          
          let desc = descCol >= 0 ? String(row[descCol] || '').trim() : '';
          
          // Fallback: if desc is empty/number, scan row for longest Arabic text
          if (desc.length < 2 || /^\d+\.?\d*$/.test(desc)) {
            let bestText = '';
            for (let c = 0; c < row.length; c++) {
              if ([qtyCol, unitCol, priceCol].includes(c)) continue;
              const v = String(row[c] || '').trim();
              if (v.length > bestText.length && /[\u0600-\u06FF]/.test(v) && v.length >= 5) {
                bestText = v;
              }
            }
            if (bestText.length >= 5) desc = bestText;
          }
          
          if (desc.length < 2) continue;
          if (/^(البند|الوصف|#|م|item|desc|no|أعمال$)$/i.test(desc)) continue;
          
          // Skip section headers (text but no qty/unit)
          const qty = qtyCol >= 0 ? Number(row[qtyCol]) || undefined : undefined;
          const unit = unitCol >= 0 ? String(row[unitCol] || '').trim() : undefined;
          const price = priceCol >= 0 ? Number(row[priceCol]) || undefined : undefined;
          
          boqItems.push({
            description: desc,
            quantity: qty,
            unit,
            price,
            category: sheetName,
            confidence: (descCol >= 0 && qtyCol >= 0 && unitCol >= 0) ? 0.9 : (descCol >= 0 && qtyCol >= 0) ? 0.7 : 0.5,
          });
        }
      }
    }
    
    return {
      tables,
      boqItems,
      metadata: {
        sheets: workbook.SheetNames.join(', '),
        totalBOQ: String(boqItems.length),
      },
    };
  }
  
  /** Read PDF file — lazy loads pdfjs-dist */
  private async readPDF(file: File): Promise<Partial<FileReadResult>> {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    
    let fullText = '';
    const tables: ExtractedTable[] = [];
    
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- صفحة ${i} ---\n${pageText}`;
    }
    
    return {
      text: fullText.trim(),
      metadata: { pages: String(pdf.numPages), title: file.name },
    };
  }
  
  /** Read DXF file — lazy loads dxf-parser */
  private async readDXF(file: File): Promise<Partial<FileReadResult>> {
    const DxfParser = (await import('dxf-parser')).default;
    const text = await file.text();
    const parser = new DxfParser();
    const dxf = parser.parseSync(text);
    
    if (!dxf) throw new Error('فشل في تحليل ملف DXF');
    
    const layers: DXFLayer[] = [];
    
    if (dxf.tables?.layer?.layers) {
      for (const [name, layerData] of Object.entries(dxf.tables.layer.layers as Record<string, any>)) {
        const entities = (dxf.entities || []).filter((e: any) => e.layer === name);
        layers.push({
          name,
          color: layerData.color || 0,
          entityCount: entities.length,
          entities: entities.slice(0, 100).map((e: any) => ({ type: e.type, data: { ...e } })),
        });
      }
    }
    
    return {
      layers,
      metadata: {
        totalEntities: String(dxf.entities?.length || 0),
        totalLayers: String(layers.length),
      },
    };
  }
  
  /** Read Word file — lazy loads mammoth */
  private async readWord(file: File): Promise<Partial<FileReadResult>> {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    
    return {
      text: result.value,
      metadata: { format: 'docx' },
    };
  }
  
  /** Get supported file extensions */
  getSupportedExtensions(): string[] {
    return ['xlsx', 'xls', 'csv', 'pdf', 'dxf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];
  }
}

export const fileReaderService = new FileReaderService();
