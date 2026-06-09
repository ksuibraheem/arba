import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

async function parsePdf(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1); // 1 = text mode

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      resolve(pdfParser.getRawTextContent());
    });

    pdfParser.loadPDF(filePath);
  });
}

async function run() {
  const dir = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER');
  const files = ['Contract Draft.pdf', 'SOW.pdf', 'TBC-FM-1226_SUPPLIER.pdf'];
  
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) {
      try {
        console.log(`\n--- Reading ${file} ---`);
        const text = await parsePdf(p);
        
        const cities = ['الرياض', 'مكة', 'جدة', 'الدمام', 'عرعر', 'المدينة', 'بريدة', 'القصيم', 'تبوك'];
        for (const city of cities) {
          if (text.includes(city)) {
            console.log(`✅ وجدت مدينة: ${city}`);
          }
        }
        
        // طباعة سياق حول كلمة "مدينة"
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.includes('مدينة') || line.includes('منطقة')) {
            console.log('سياق:', line.trim());
          }
        }
      } catch (err) {
        console.log(`فشل قراءة ${file}`);
      }
    }
  }
}

run();
