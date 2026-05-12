const fs = require('fs');
const path = require('path');

const pdfPath = 'c:\\Users\\ksuib\\Downloads\\الدليل الاسترشادي للكود السعودي للمباني السكنية  SBC 1101-1102 للمقاولين.pdf';

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  console.log('Pages:', doc.numPages);
  
  let allText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str).join(' ');
    allText += '\n=== PAGE ' + i + ' ===\n' + strings + '\n';
    if (i <= 3) console.log('Page ' + i + ': ' + strings.substring(0, 200));
  }
  
  const outputPath = path.join(__dirname, 'sbc_guide_text.txt');
  fs.writeFileSync(outputPath, allText, 'utf8');
  console.log('\nTotal: ' + allText.length + ' characters from ' + doc.numPages + ' pages');
  console.log('Saved: ' + outputPath);
}

main().catch(console.error);
