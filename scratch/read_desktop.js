const fs = require('fs');
const path = require('path');

const desktopNewFiles = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة';
const targetDir = path.join(__dirname, '..', 'pricing_files');

if (!fs.existsSync(desktopNewFiles)) {
    console.error('Desktop directory not found:', desktopNewFiles);
    process.exit(1);
}

const files = fs.readdirSync(desktopNewFiles);
console.log('Files on Desktop folder:');
files.forEach((f, i) => {
    console.log(`${i}: ${f} (${f.length} chars)`);
    if (f.endsWith('.xlsx')) {
        const src = path.join(desktopNewFiles, f);
        let destName = '';
        if (f.includes('حفر الباطن')) {
            destName = 'hafr_albatin_raw.xlsx';
        } else if (f.includes('الرياض')) {
            destName = 'riyadh_raw.xlsx';
        } else {
            destName = f;
        }
        const dest = path.join(targetDir, destName);
        fs.copyFileSync(src, dest);
        console.log(`Copied ${f} -> ${destName}`);
    }
});
