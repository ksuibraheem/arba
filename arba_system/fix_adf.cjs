// Fix script - reads backup, patches classification, writes fixed version
const fs = require('fs');
const src = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\adf_pricer_backup.cjs';
let buf = fs.readFileSync(src);
if(buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF) buf=buf.slice(3);
let c = buf.toString('utf8');

// 1. Fix output path
c = c.replace('ADF_Arar_Priced_15pct', 'ADF_Arar_v2_15pct');

// 2. Split desc/spec for smarter matching
c = c.replace(
  "const d=(desc+' '+spec).toLowerCase();",
  "const dd=desc.toLowerCase();const ss=spec.toLowerCase();const d=dd+' '+ss;"
);

// 3. Add block/plaster/paint priority BEFORE structural checks
const oldStart = "  // Structural\n  if(d.includes('\u062d\u0641\u0631'))return R.excavation;";
const newStart = `  // P1: Block first (fixes gravel-in-block bug)
  if(dd.includes('\u0628\u0644\u0648\u0643')||dd.includes('\u0628\u0644\u0643')){
    if(d.includes('20'))return d.includes('\u0633\u062a\u0631\u0629')?R.block_20_parapet:R.block_20_ext;
    if(d.includes('15'))return R.block_15_int;
    return d.includes('\u062e\u0627\u0631\u062c')?R.block_20_ext:R.block_15_int;
  }
  // P2: Plaster
  if(dd.includes('\u0644\u064a\u0627\u0633\u0629'))return d.includes('\u062e\u0627\u0631\u062c')?R.plaster_ext:d.includes('\u0623\u0633\u0642\u0641')?R.plaster_ceiling:R.plaster_int;
  // P3: Paint
  if(dd.includes('\u062f\u0647\u0627\u0646')||dd.includes('\u0637\u0644\u0627\u0621')){
    if(d.includes('\u0625\u064a\u0628\u0648\u0643\u0633\u064a')||d.includes('\u0627\u064a\u0628\u0648\u0643\u0633\u064a')||d.includes('epoxy'))return R.paint_epoxy;
    return d.includes('\u0623\u0633\u0642\u0641')?R.paint_ceiling:d.includes('\u062e\u0627\u0631\u062c')||d.includes('\u0627\u0643\u0631\u064a\u0644\u064a\u0643')?R.paint_ext:R.paint_int;
  }
  // P4: Porcelain
  if(dd.includes('\u0628\u0648\u0631\u0633\u0644\u0627\u0646'))return d.includes('20')?R.ceramic_20:d.includes('\u062c\u062f\u0627\u0631')?R.porcelain_wall:R.porcelain_60;
  // P5: Structural
  if(dd.includes('\u062d\u0641\u0631'))return R.excavation;`;
c = c.replace(oldStart, newStart);

// 4. Remove duplicate block/plaster/paint/porcelain checks (now handled above)
c = c.replace("  // Masonry\n  if(d.includes('\u0628\u0644\u0648\u0643')&&d.includes('20')){if(d.includes('\u0633\u062a\u0631\u0629')||d.includes('\u062f\u0631\u0648\u0629'))return R.block_20_parapet;return R.block_20_ext;}\n  if(d.includes('\u0628\u0644\u0648\u0643')&&d.includes('15'))return R.block_15_int;\n  if(d.includes('\u0628\u0644\u0648\u0643')&&d.includes('\u062e\u0627\u0631\u062c'))return R.block_20_ext;\n  if(d.includes('\u0628\u0644\u0648\u0643'))return R.block_15_int;\n  // Plaster\n  if(d.includes('\u0644\u064a\u0627\u0633\u0629')&&d.includes('\u062e\u0627\u0631\u062c'))return R.plaster_ext;\n  if(d.includes('\u0644\u064a\u0627\u0633\u0629')&&d.includes('\u0623\u0633\u0642\u0641'))return R.plaster_ceiling;\n  if(d.includes('\u0644\u064a\u0627\u0633\u0629'))return R.plaster_int;", "  // (block/plaster moved to priority section above)");

// 5. Fix generator: only match "المولد" not "مولد" in spec
c = c.replace("if(d.includes('\u0645\u0648\u0644\u062f')||d.includes('generator'))return R.elec_genset;", "if(dd.includes('\u0627\u0644\u0645\u0648\u0644\u062f'))return R.elec_genset;");

// 6. Fix gravel: only match in desc, not spec
c = c.replace("if(d.includes('\u062d\u0635\u0649')||d.includes('gravel'))return R.landscape_gravel;", "if(dd.includes('\u062d\u0635\u0649')||dd.includes('gravel'))return R.landscape_gravel;");

// 7. Fix "سور" false match - only match أسوار explicitly
c = c.replace("if(d.includes('\u0623\u0633\u0648\u0627\u0631')||d.includes('\u0633\u0648\u0631'))return R.rc_fence;", "if(d.includes('\u0623\u0633\u0648\u0627\u0631'))return R.rc_fence;");

// Write fixed file
const dst = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\adf_v2.cjs';
const bom = Buffer.from([0xEF,0xBB,0xBF]);
fs.writeFileSync(dst, Buffer.concat([bom, Buffer.from(c,'utf8')]));
console.log('Fixed file saved to adf_v2.cjs');
