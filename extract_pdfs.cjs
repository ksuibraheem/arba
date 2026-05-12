const fs = require('fs');
const PDFParser = require('pdf2json');

const BASE = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\المرحلة الثانية\\فلل جدة\\';
const OUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\';

function extractPDF(filename) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📄 Extracting: ${filename}`);
    console.log(`${'='.repeat(70)}`);
    
    const parser = new PDFParser();
    
    parser.on('pdfParser_dataReady', (pdfData) => {
      const pages = pdfData.Pages || [];
      console.log(`Pages: ${pages.length}`);
      
      let allText = '';
      pages.forEach((page, idx) => {
        const texts = (page.Texts || [])
          .map(t => t.R.map(r => decodeURIComponent(r.T)).join(''))
          .join(' ');
        allText += `\n--- PAGE ${idx + 1} ---\n${texts}\n`;
      });
      
      console.log(`Total characters: ${allText.length}`);
      
      const safeName = filename.replace(/[^\w]/g, '_');
      fs.writeFileSync(OUT + `extracted_${safeName}.txt`, allText, 'utf8');
      console.log(`Saved to: extracted_${safeName}.txt`);
      
      // Show content
      console.log(`\n--- First 4000 chars ---`);
      console.log(allText.substring(0, 4000));
      
      resolve(allText);
    });
    
    parser.on('pdfParser_dataError', (err) => {
      console.error('PDF Error:', err.parserError);
      reject(err);
    });
    
    parser.loadPDF(BASE + filename);
  });
}

(async () => {
  try {
    const text1 = await extractPDF('JEDDAH HEIGHTS V20 (1).pdf');
    const text2 = await extractPDF('عرض سعر شامل تخفيض للفلل .pdf');
    console.log('\n✅ Both PDFs extracted successfully.');
  } catch(e) {
    console.error('Fatal:', e.message);
  }
})();
