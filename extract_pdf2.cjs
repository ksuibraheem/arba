const fs = require('fs');
const PDFParser = require('pdf2json');

const BASE = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\المرحلة الثانية\\فلل جدة\\';
const OUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\';

function extractPDF(filename) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    
    parser.on('pdfParser_dataReady', (pdfData) => {
      const pages = pdfData.Pages || [];
      console.log(`Pages: ${pages.length}`);
      
      let allText = '';
      pages.forEach((page, idx) => {
        try {
          const texts = (page.Texts || [])
            .map(t => {
              try {
                return t.R.map(r => {
                  try { return decodeURIComponent(r.T); }
                  catch(e) { return r.T; }
                }).join('');
              } catch(e) { return ''; }
            })
            .join(' ');
          allText += `\n--- PAGE ${idx + 1} ---\n${texts}\n`;
        } catch(e) {}
      });
      
      console.log(`Total characters: ${allText.length}`);
      const safeName = filename.replace(/[^\w]/g, '_');
      fs.writeFileSync(OUT + `extracted_${safeName}.txt`, allText, 'utf8');
      console.log(`Saved to: extracted_${safeName}.txt`);
      
      // Show first 5000 chars
      console.log(`\n--- First 5000 chars ---`);
      console.log(allText.substring(0, 5000));
      console.log(`\n--- Mid section (pages 5-10) ---`);
      const midStart = allText.indexOf('--- PAGE 5 ---');
      if (midStart > 0) console.log(allText.substring(midStart, midStart + 3000));
      
      resolve(allText);
    });
    
    parser.on('pdfParser_dataError', (err) => {
      reject(err);
    });
    
    parser.loadPDF(BASE + filename);
  });
}

(async () => {
  try {
    console.log('Extracting price offer PDF...');
    const text = await extractPDF('عرض سعر شامل تخفيض للفلل .pdf');
    console.log('\n✅ Done');
  } catch(e) {
    console.error('Fatal:', e.message);
  }
})();
