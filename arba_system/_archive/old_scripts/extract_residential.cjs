const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function main() {
  const filePath = "C:\\Users\\ksuib\\Downloads\\اشتراطات المخابز والحلويات.pdf";
  console.log('Reading:', filePath);
  const buf = fs.readFileSync(filePath);
  
  const parser = new PDFParse(new Uint8Array(buf));
  await parser.load();
  
  const textResult = await parser.getText();
  
  if (typeof textResult === 'object' && textResult !== null && Array.isArray(textResult.pages)) {
    console.log('Pages array length:', textResult.pages.length);
    let fullText = '';
    for (let i = 0; i < textResult.pages.length; i++) {
      const pg = textResult.pages[i];
      fullText += `\n=== PAGE ${pg.num || i + 1} ===\n${pg.text}\n`;
    }
    const outPath = path.join(__dirname, 'bakeries_sweets_requirements.txt');
    fs.writeFileSync(outPath, fullText, 'utf8');
    console.log('Written:', fullText.length, 'chars to', outPath);
  }

  parser.destroy();
}

main().catch(e => console.error(e));
