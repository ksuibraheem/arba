const x = require('xlsx');
const SRC = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\جداول لتسعير (نماذج)\\\\مشروع الصندوق الزراعي عرعر\\\\مشروع الصندوق الزراعي عرعر\\\\مسودة للتسعير.xlsx';

try {
  const wb = x.readFile(SRC);
  const d = x.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const K = Object.keys(d[0]);
  
  console.log(d.slice(25, 30));
} catch(e) { console.error('Error reading file:', e.message); }
