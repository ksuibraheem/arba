const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractPdf(filePath, outputFileName) {
  try {
    console.log('Reading:', filePath);
    const buf = fs.readFileSync(filePath);
    
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    
    const textResult = await parser.getText();
    
    if (typeof textResult === 'object' && textResult !== null && Array.isArray(textResult.pages)) {
      console.log(`Pages array length for ${outputFileName}:`, textResult.pages.length);
      let fullText = '';
      for (let i = 0; i < textResult.pages.length; i++) {
        const pg = textResult.pages[i];
        fullText += `\n=== PAGE ${pg.num || i + 1} ===\n${pg.text}\n`;
      }
      const outPath = path.join(__dirname, outputFileName);
      fs.writeFileSync(outPath, fullText, 'utf8');
      console.log('Written:', fullText.length, 'chars to', outPath);
    }
    parser.destroy();
  } catch (err) {
    console.error('Error processing', filePath, err.message);
  }
}

async function main() {
  const downloadsDir = "C:\\Users\\ksuib\\Downloads";
  const allFiles = fs.readdirSync(downloadsDir);
  
  // Filter for PDFs that have "اشتراطات" or "الاشتراطات" in the filename
  const targetFiles = allFiles.filter(f => f.endsWith('.pdf') && (f.includes('اشتراطات') || f.includes('الاشتراطات') || f.includes('شحن')));
  
  console.log(`Found ${targetFiles.length} requirement PDFs to process.`);
  
  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    const fullPath = path.join(downloadsDir, file);
    // Create a safe ascii name for the output file
    const safeName = `extracted_req_${i + 1}.txt`;
    console.log(`\nProcessing [${i+1}/${targetFiles.length}]: ${file}`);
    await extractPdf(fullPath, safeName);
    
    // Create a mapping file so we know what is what
    fs.appendFileSync(path.join(__dirname, 'extraction_mapping.txt'), `${safeName} = ${file}\n`, 'utf8');
  }
}

main().catch(console.error);
