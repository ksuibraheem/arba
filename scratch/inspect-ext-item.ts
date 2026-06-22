import { FULL_ITEMS_DATABASE } from '../constants.ts';

const ids = [
  'EXT-QS-QSFU-DIV2-1983', 
  'EXT-QS-QSFU-DIV1-1454', 
  'EXT-QS-QSFU-DIV2-1918', 
  'EXT-QS-QSFU-DIV9-1302', 
  'EXT-QS-QSFU-DIV2-2439', 
  'EXT-QS-QSFU-DIV2-1981', 
  'EL-P-14', 
  'GS01.01'
];

console.log('--- Inspecting Matched IDs ---');
for (const id of ids) {
  const item = FULL_ITEMS_DATABASE.find(i => i.id === id);
  if (item) {
    console.log(`\nID: ${id}`);
    console.log(`Category: ${item.category}`);
    console.log(`Name AR: ${item.name.ar}`);
    console.log(`Name EN: ${item.name.en}`);
    console.log(`Price: Mat=${item.baseMaterial} Lab=${item.baseLabor}`);
  } else {
    console.log(`\nID: ${id} - NOT FOUND`);
  }
}
