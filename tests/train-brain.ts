/**
 * 🧠 Brain Training Runner — يشغل تغذية الدماغ من بيانات R.E Farm
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../data/training/re_farm_mep_audit.json');

console.log('🧠 ARBA Brain — Training Mode');
console.log('='.repeat(60));

// Load data
const raw = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

console.log(`📂 المشروع: ${data.project}`);
console.log(`📐 المساحة: ${data.bua?.toLocaleString() || 'N/A'} م²`);
console.log(`📦 البنود: ${data.items?.length || 0}`);
console.log('');

// Category mapping
const CAT_MAP: Record<string, string> = {
  'MDB': 'elec_panels', 'SMDB': 'elec_panels', 'DP ': 'elec_panels',
  'switch': 'elec_switches', 'socket': 'elec_sockets',
  'TYPE-L': 'lighting', 'LED': 'lighting', 'CHANDELIER': 'lighting',
  'Cable Tray': 'cable_tray', 'mm Thickness': 'cable_tray',
  'NYY': 'cables', 'cable': 'cables',
  'FACP': 'fire_alarm', 'detector': 'fire_alarm', 'sounder': 'fire_alarm', 'manual station': 'fire_alarm', 'monitor module': 'fire_alarm',
  'camera': 'cctv', 'camara': 'cctv', 'NVR': 'cctv', 'WORK STATION': 'cctv', 'STORAGE': 'cctv',
  'speaker': 'pa_system', 'Public address': 'pa_system', 'microphone': 'pa_system',
  'RJ 45': 'data_network', 'Fiber': 'data_network', 'IDT': 'data_network',
  'earth': 'earthing',
  'Lavator': 'sanitary', 'Water Closet': 'sanitary', 'Sink': 'sanitary', 'Shower': 'sanitary', 'Hand Spray': 'sanitary', 'Ablution': 'sanitary',
  'mm dia': 'pipes_ppr', 'Trench Drain': 'drainage',
  'Pump': 'pumps', 'Booster': 'pumps',
  'AIR DUCT': 'ductwork', 'EXHAUST': 'ductwork', 'FRESH AIR': 'ductwork',
  'EF-': 'fans', 'FAF-': 'fans',
  'VRV': 'vrv_system', 'VRF': 'vrv_system',
  'Diffuser': 'air_terminals', 'SLD': 'air_terminals', 'RLD': 'air_terminals', 'SD-': 'air_terminals', 'RD-': 'air_terminals', 'SAG': 'air_terminals', 'RAG': 'air_terminals', 'ELD': 'air_terminals',
  'DV-': 'hvac_valves', 'Damper': 'hvac_dampers',
  '"': 'copper_pipes', // copper pipe sizes like 3/8", 1/2" etc
  'Isolated': 'isolators', 'Disconnect': 'disconnects',
  'Elevator': 'elevator_supply',
  'Sauna': 'sauna_supply', 'EWH': 'ewh_supply',
};

function categorize(desc: string): string {
  for (const [kw, cat] of Object.entries(CAT_MAP)) {
    if (desc.includes(kw)) return cat;
  }
  return 'uncategorized';
}

// Process items
const categories: Record<string, { items: number; totalCost: number; prices: number[]; units: string[] }> = {};
let totalFed = 0;
let totalSkipped = 0;

for (const item of (data.items || [])) {
  if (!item.boqPrice || item.boqPrice <= 0) {
    totalSkipped++;
    continue;
  }
  
  const cat = categorize(item.desc || '');
  if (!categories[cat]) {
    categories[cat] = { items: 0, totalCost: 0, prices: [], units: [] };
  }
  
  categories[cat].items++;
  categories[cat].totalCost += item.boqPrice * item.qty;
  categories[cat].prices.push(item.boqPrice);
  if (!categories[cat].units.includes(item.unit)) {
    categories[cat].units.push(item.unit);
  }
  totalFed++;
}

// Print results
console.log(`✅ تم تغذية: ${totalFed} بند`);
console.log(`⏭️ تم تخطي: ${totalSkipped} بند (بدون سعر)`);
console.log('');

console.log('📊 الأسعار المرجعية المستخلصة لكل فئة:');
console.log('-'.repeat(90));
console.log(`${'الفئة'.padEnd(20)} ${'البنود'.padStart(6)} ${'الحد الأدنى'.padStart(12)} ${'المتوسط'.padStart(12)} ${'الحد الأعلى'.padStart(12)} ${'إجمالي الفئة'.padStart(14)}`);
console.log('-'.repeat(90));

const sorted = Object.entries(categories).sort((a, b) => b[1].totalCost - a[1].totalCost);
let grandTotal = 0;

for (const [cat, info] of sorted) {
  const avg = Math.round(info.prices.reduce((s, p) => s + p, 0) / info.prices.length);
  const min = Math.round(Math.min(...info.prices));
  const max = Math.round(Math.max(...info.prices));
  grandTotal += info.totalCost;
  
  console.log(`  ${cat.padEnd(19)} ${String(info.items).padStart(6)} ${min.toLocaleString().padStart(12)} ${avg.toLocaleString().padStart(12)} ${max.toLocaleString().padStart(12)} ${Math.round(info.totalCost).toLocaleString().padStart(14)} SAR`);
}

console.log('-'.repeat(90));
console.log(`  ${'الإجمالي'.padEnd(19)} ${String(totalFed).padStart(6)} ${''.padStart(12)} ${''.padStart(12)} ${''.padStart(12)} ${Math.round(grandTotal).toLocaleString().padStart(14)} SAR`);

// Cost per m2 analysis
const bua = data.bua || 6975.87;
console.log(`\n💰 تكلفة MEP لكل م² حسب القسم (BUA = ${bua.toLocaleString()} م²):`);
console.log('-'.repeat(50));
for (const [cat, info] of sorted) {
  const perM2 = info.totalCost / bua;
  const pct = (info.totalCost / grandTotal * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(parseFloat(pct) / 2));
  console.log(`  ${cat.padEnd(19)} ${perM2.toFixed(1).padStart(8)} ر.س/م²  ${pct.padStart(5)}%  ${bar}`);
}
console.log('-'.repeat(50));
console.log(`  ${'الإجمالي MEP'.padEnd(19)} ${(grandTotal/bua).toFixed(1).padStart(8)} ر.س/م²  100.0%`);

// Save structured baseline
const baseline = {
  projectType: 'residential_farm',
  bua_m2: bua,
  mepCostPerM2: Math.round(grandTotal / bua),
  categories: Object.fromEntries(sorted.map(([cat, info]) => {
    const prices = info.prices;
    return [cat, {
      avgPrice: Math.round(prices.reduce((s,p) => s+p, 0) / prices.length),
      minPrice: Math.round(Math.min(...prices)),
      maxPrice: Math.round(Math.max(...prices)),
      samples: prices.length,
      costPerM2: Math.round(info.totalCost / bua * 100) / 100,
      percentOfTotal: Math.round(info.totalCost / grandTotal * 1000) / 10,
    }];
  })),
  trainedAt: new Date().toISOString(),
};

const outPath = path.resolve(__dirname, '../data/training/brain_baseline_farm.json');
fs.writeFileSync(outPath, JSON.stringify(baseline, null, 2));
console.log(`\n💾 تم حفظ الأسعار المرجعية: brain_baseline_farm.json`);
console.log('🧠 الدماغ جاهز للاستخدام!');
