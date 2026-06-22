const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'arba_system', 'training_data', 'pending', 'ingested_projects.json');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('Ingested projects keys:', Object.keys(d.projects));
console.log('ADF_Hafr_AlBatin details:', {
  sheetsCount: d.projects.ADF_Hafr_AlBatin.sheets.length,
  summary: d.projects.ADF_Hafr_AlBatin.summary
});
console.log('ADF_Riyadh details:', {
  sheetsCount: d.projects.ADF_Riyadh.sheets.length,
  summary: d.projects.ADF_Riyadh.summary
});
