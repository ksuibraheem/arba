const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'training_data', 'trained', 'brain_mega_training.json');
if (fs.existsSync(filePath)) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const shafa = data.sources['AL_SHAFA_Villa_A'];
  if (shafa && shafa.items && shafa.items.length > 0) {
    console.log('Keys of first item:', Object.keys(shafa.items[0]));
    console.log('First item:', shafa.items[0]);
    console.log('Second item:', shafa.items[1]);
  }
}
