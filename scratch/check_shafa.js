const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'training_data', 'trained', 'brain_mega_training.json');
if (fs.existsSync(filePath)) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const shafa = data.sources['AL_SHAFA_Villa_A'];
  if (shafa && shafa.sheets) {
    console.log('Project: AL_SHAFA_Villa_A');
    shafa.sheets.forEach(sheet => {
      console.log(`\nSheet: ${sheet.name}`);
      sheet.items.slice(0, 10).forEach(item => {
        console.log(` - Desc: ${item.description.substring(0, 40)} | Qty: ${item.qty} | OriginalPrice (Rate): ${item.originalPrice} | OriginalTotal: ${item.originalTotal}`);
      });
    });
  } else {
    console.log('No AL_SHAFA_Villa_A source found or no sheets.');
  }
} else {
  console.log('File does not exist');
}
