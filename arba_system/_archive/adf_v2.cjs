const xlsx=require('xlsx');
const SRC='C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\ط¬ط¯ط§ظˆظ„ ظ„طھط³ط¹ظٹط± (ظ†ظ…ط§ط°ط¬)\\ظ…ط´ط±ظˆط¹ ط§ظ„طµظ†ط¯ظˆظ‚ ط§ظ„ط²ط±ط§ط¹ظٹ ط¹ط±ط¹ط±\\ظ…ط´ط±ظˆط¹ ط§ظ„طµظ†ط¯ظˆظ‚ ط§ظ„ط²ط±ط§ط¹ظٹ ط¹ط±ط¹ط±\\ظ…ط³ظˆط¯ط© ظ„ظ„طھط³ط¹ظٹط±.xlsx';
const OUT='C:\\Users\\ksuib\\Desktop\\ADF_Arar_Priced_v2_15pct.xlsx';
const P=1.15;
// Rates SAR per unit - Arar market (northern borders +5% logistics)
const R={
excavation:25,backfill:38,termite:20,
blinding:300,rc_footing:880,rc_tiebeam:1200,rc_sog:730,rc_neck:1420,
rc_tank:1180,rc_column:1400,rc_slab_solid:960,rc_stair:1220,rc_canopy:1000,
rc_hordi:950,rc_fence:900,
block_20_ext:80,block_15_int:65,block_20_parapet:85,
plaster_ext:45,plaster_int:38,plaster_ceiling:40,
alum_tube:350,logo:8000,
stone_riyadh:280,marble_stair:300,marble_floor:250,granite_counter:350,
porcelain_60:130,porcelain_wall:120,ceramic_wall:100,ceramic_20:90,
paint_int:32,paint_ext:42,paint_epoxy:65,paint_ceiling:30,
gypsum_board:80,gypsum_tile:60,gypsum_cornice:50,
door_wood:1800,door_wood_hidden:2200,door_steel:2500,door_fire:3500,door_alum:3500,door_glass:4500,
door_slide_auto:25000,gate_steel:18000,gate_slide:35000,
window_alum:700,skylight:1200,curtain_wall:900,
handrail_ss:600,handrail_glass:900,
elec_cable_tray:120,elec_conduit:45,elec_wire:12,elec_panel:8000,
elec_ups:35000,elec_genset:180000,elec_transformer:95000,elec_ats:25000,
elec_outlet:85,elec_switch:65,elec_light_led:280,elec_light_down:180,
elec_light_ext:350,elec_light_emrg:250,elec_light_exit:300,
elec_earthing:15000,elec_lightning:12000,elec_bms:45000,
elec_cctv_cam:1500,elec_cctv_dvr:8000,elec_access:3500,elec_intercom:2500,
elec_pa:15000,elec_clock:8000,elec_queue:12000,elec_display:5000,
elec_data_point:350,elec_server_rack:8000,elec_fiber:25,
elec_telephone:250,elec_tv:1200,
ac_split:4500,ac_package:18000,ac_vrf:3500,ac_fcu:5500,ac_ahu:35000,
ac_duct:85,ac_diffuser:250,ac_damper:450,ac_insul:55,ac_pipe:120,
ac_pump:8000,ac_expansion:4000,ac_control:2500,ac_thermostat:350,
ac_exhaust:1800,ac_fresh:2200,ac_curtain:3500,
plumb_pipe_110:65,plumb_pipe_75:50,plumb_pipe_50:40,plumb_pipe_32:30,plumb_pipe_25:25,
plumb_ppr_63:55,plumb_ppr_50:45,plumb_ppr_32:30,plumb_ppr_25:22,plumb_ppr_20:18,
plumb_wc:1200,plumb_basin:800,plumb_kitchen_sink:1500,plumb_floor_drain:180,
plumb_cleanout:250,plumb_vent:150,plumb_roof_drain:350,
plumb_heater_200:5500,plumb_heater_50:2500,plumb_pump:3800,plumb_valve:450,
plumb_tank_gnd:25000,plumb_tank_roof:8000,plumb_sewage:15000,plumb_grease:12000,
plumb_manhole:4500,plumb_septic:35000,
fire_ext_6:350,fire_ext_co2:650,fire_hose_cab:2800,fire_pipe_4:180,fire_pipe_3:150,
fire_pipe_2:120,fire_pump_sys:85000,fire_blanket:250,fire_auto:1800,
landscape_tree:800,landscape_palm:1500,landscape_grass:35,landscape_soil:25,
landscape_irrig:45,landscape_border:55,landscape_light:1200,landscape_bench:2500,
landscape_bin:800,landscape_flag:3500,landscape_paving:90,landscape_gravel:30,
landscape_asphalt:85,landscape_curb:65,landscape_shade:250,landscape_barrier:2500,
landscape_strip:35,landscape_bumper:350,landscape_projector:8000,landscape_security:3500,
elevator:280000,
};
// Read source
const wb=xlsx.readFile(SRC);
const rows=xlsx.utils.sheet_to_json(wb.Sheets['ظˆط±ظ‚ط©1'],{header:1});
const projName=rows[0]?.[0]||'ظ…ط´ط±ظˆط¹';
const refNo=rows[1]?.[0]||'';
const deadline=rows[2]?.[0]||'';
console.log('ًں“‹ '+projName);
console.log('ًں”¢ '+refNo);
console.log('ًں“… '+deadline);

// Classify and price
function getRate(desc,spec,unit,cat){
  const dd=desc.toLowerCase();
  const ss=spec.toLowerCase();
  const d=(dd+' '+ss);
  // â•گâ•گâ•گ PRIORITY 1: Block/Masonry (check FIRST - desc contains 'ط¨ظ„ظˆظƒ' or 'ط¨ظ„ظƒ')
  if(dd.includes('ط¨ظ„ظˆظƒ')||dd.includes('ط¨ظ„ظƒ')){
    if(d.includes('20')){if(d.includes('ط³طھط±ط©')||d.includes('ط¯ط±ظˆط©'))return R.block_20_parapet;return R.block_20_ext;}
    if(d.includes('15'))return R.block_15_int;
    if(d.includes('ط®ط§ط±ط¬'))return R.block_20_ext;
    return R.block_15_int;
  }
  // â•گâ•گâ•گ PRIORITY 2: Plaster (check before structural)
  if(dd.includes('ظ„ظٹط§ط³ط©')){
    if(d.includes('ط®ط§ط±ط¬'))return R.plaster_ext;
    if(d.includes('ط£ط³ظ‚ظپ'))return R.plaster_ceiling;
    return R.plaster_int;
  }
  // â•گâ•گâ•گ PRIORITY 3: Paint/Coating
  if(dd.includes('ط¯ظ‡ط§ظ†')||dd.includes('ط·ظ„ط§ط،')){
    if(d.includes('ط¥ظٹط¨ظˆظƒط³ظٹ')||d.includes('ط§ظٹط¨ظˆظƒط³ظٹ')||d.includes('epoxy'))return R.paint_epoxy;
    if(d.includes('ط£ط³ظ‚ظپ'))return R.paint_ceiling;
    if(d.includes('ط®ط§ط±ط¬')||d.includes('ط§ظƒط±ظٹظ„ظٹظƒ'))return R.paint_ext;
    return R.paint_int;
  }
  // â•گâ•گâ•گ PRIORITY 4: Flooring (porcelain/ceramic)
  if(dd.includes('ط¨ظˆط±ط³ظ„ط§ظ†')||dd.includes('porcelain')){
    if(d.includes('20x20')||d.includes('20أ—20'))return R.ceramic_20;
    if(d.includes('ط¬ط¯ط§ط±')||d.includes('ط­ط§ط¦ط·'))return R.porcelain_wall;
    return R.porcelain_60;
  }
  // â•گâ•گâ•گ PRIORITY 5: Structural (use dd=desc only, not spec)
  if(dd.includes('ط­ظپط±'))return R.excavation;
  if(dd.includes('ط±ط¯ظ…'))return R.backfill;
  if(dd.includes('ظ†ظ…ظ„'))return R.termite;
  if(dd.includes('ط®ط±ط³ط§ظ†ط© ط¹ط§ط¯ظٹط©')||dd.includes('ظ†ط¸ط§ظپط©'))return R.blinding;
  if(ss.includes('ظ‚ظˆط§ط¹ط¯')||dd.includes('ظ‚ظˆط§ط¹ط¯'))return R.rc_footing;
  if(ss.includes('ظ…ظٹط¯')||ss.includes('ظ…ظٹط¯ط§طھ'))return R.rc_tiebeam;
  if(ss.includes('ط¨ظ„ط§ط·ط§طھ ط£ط±ط¶ظٹط©')||ss.includes('ط¨ظ„ط§ط·ط© ط£ط±ط¶ظٹط©'))return R.rc_sog;
  if(ss.includes('ط±ظ‚ط§ط¨'))return R.rc_neck;
  if(ss.includes('ط®ط²ط§ظ†')||dd.includes('ط®ط²ط§ظ†'))return R.rc_tank;
  if(ss.includes('ط£ط¹ظ…ط¯ط©')||ss.includes('ط­ظˆط§ط¦ط· ط®ط±ط³ط§ظ†'))return R.rc_column;
  if(ss.includes('ط¨ظ„ط§ط·ط§طھ ظ…طµظ…طھط©'))return R.rc_slab_solid;
  if(ss.includes('ط³ظ„ط§ظ„ظ…'))return R.rc_stair;
  if(ss.includes('ظ…ط¸ظ„ط© ط§ظ„ظ…ط¯ط®ظ„')||dd.includes('ظ…ط¸ظ„ط© ط§ظ„ظ…ط¯ط®ظ„'))return R.rc_canopy;
  if(ss.includes('ظ‡ظˆط±ط¯ظٹ')||ss.includes('ط¬ط³ظˆط±'))return R.rc_hordi;
  if(ss.includes('ط£ط³ظˆط§ط±')||dd.includes('ط£ط³ظˆط§ط±'))return R.rc_fence;
  // Aluminum
  if(dd.includes('ط´ط¹ط§ط±'))return R.logo;
  if(dd.includes('طھظٹظˆط¨ط§طھ')||dd.includes('ظƒط±طھظ†'))return R.curtain_wall;
  if(dd.includes('ظˆط§ط¬ظ‡')&&d.includes('ط£ظ„ظ…ظ†'))return R.curtain_wall;
  if(d.includes('ط³ظƒط§ظٹ ظ„ط§ظٹطھ')||d.includes('skylight'))return R.skylight;
  // Stone & marble
  if(dd.includes('ط­ط¬ط±'))return R.stone_riyadh;
  if(dd.includes('ط±ط®ط§ظ…')&&d.includes('ط¯ط±ط¬'))return R.marble_stair;
  if(dd.includes('ط±ط®ط§ظ…'))return R.marble_floor;
  if(dd.includes('ط¬ط±ط§ظ†ظٹطھ'))return R.granite_counter;
  if(dd.includes('ط³ظٹط±ط§ظ…ظٹظƒ'))return R.ceramic_wall;
  // Gypsum
  if(d.includes('ظƒط±ط§ظ†ظٹط´')||d.includes('ظ…ظ‚ط±ظ†طµ'))return R.gypsum_cornice;
  if(d.includes('ط¬ط¨ط³ ط¨ظˆط±ط¯')||d.includes('gypsum board'))return R.gypsum_board;
  if(d.includes('ط¬ط¨ط³'))return R.gypsum_tile;
  // Doors
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط­ط±ظٹظ‚'))return R.door_fire;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط²ط¬ط§ط¬')&&d.includes('ط£طھظˆظ…ط§طھظٹظƒ'))return R.door_slide_auto;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط²ط¬ط§ط¬'))return R.door_glass;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ظ…ط®ظپظٹ'))return R.door_wood_hidden;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط­ط¯ظٹط¯')&&d.includes('ط³ط­ط§ط¨'))return R.gate_slide;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط­ط¯ظٹط¯'))return R.door_steel;
  if(d.includes('ط¨ط§ط¨')&&d.includes('ط£ظ„ظ…ظ†'))return R.door_alum;
  if(d.includes('ط¨ط§ط¨'))return R.door_wood;
  // Windows
  if(d.includes('ط´ط¨ط§ظƒ')||d.includes('ط´ط¨ط§ط¨ظٹظƒ')||d.includes('ظ†ط§ظپط°'))return R.window_alum;
  // Handrail
  if(d.includes('ط¯ط±ط§ط¨ط²ظٹظ†')&&d.includes('ط²ط¬ط§ط¬'))return R.handrail_glass;
  if(d.includes('ط¯ط±ط§ط¨ط²ظٹظ†'))return R.handrail_ss;
  // Elevator
  if(dd.includes('ظ…طµط¹ط¯'))return R.elevator;
  // Shade/Parking
  if(dd.includes('ظ…ط¸ظ„ط§طھ')||dd.includes('ظ…ط¸ظ„ط©'))return R.landscape_shade;
  // Projector
  if(dd.includes('ط¹ط±ط¶ ظ…ط±ط¦ظٹ')||d.includes('projector'))return R.landscape_projector;
  // Security arm
  if(dd.includes('ط£ط°ط±ط¹ ط£ظ…ظ†ظٹط©')||dd.includes('ط§ط°ط±ط¹'))return R.landscape_security;
  // Electrical
  if(d.includes('ups'))return R.elec_ups;
  if(dd.includes('ط§ظ„ظ…ظˆظ„ط¯'))return R.elec_genset;
  if(dd.includes('ظ…ط­ظˆظ„')||d.includes('transformer'))return R.elec_transformer;
  if(d.includes('ats')||d.includes('طھط­ظˆظٹظ„'))return R.elec_ats;
  if(d.includes('ظ„ظˆط­ط©')||d.includes('panel')&&d.includes('ظƒظ‡ط±ط¨'))return R.elec_panel;
  if(d.includes('ظƒط§ط¨ظ„')&&d.includes('ط­ط§ظ…ظ„'))return R.elec_cable_tray;
  if(d.includes('ظ…ظˆط§ط³ظٹط± ظƒظ‡ط±ط¨')||d.includes('conduit'))return R.elec_conduit;
  if(d.includes('ط³ظ„ظƒ')||d.includes('ظƒط§ط¨ظ„'))return R.elec_wire;
  if(d.includes('ط¨ط±ظٹط²ط©')||d.includes('ظ…ط£ط®ط°')||d.includes('outlet'))return R.elec_outlet;
  if(d.includes('ظ…ظپطھط§ط­')||d.includes('switch'))return R.elec_switch;
  if(d.includes('ط¥ظ†ط§ط±ط©')&&d.includes('ط·ظˆط§ط±ط¦'))return R.elec_light_emrg;
  if(d.includes('exit')||d.includes('ط®ط±ظˆط¬'))return R.elec_light_exit;
  if(d.includes('ط¥ظ†ط§ط±ط©')&&d.includes('ط®ط§ط±ط¬'))return R.elec_light_ext;
  if(d.includes('ط³ط¨ظˆطھ')||d.includes('down'))return R.elec_light_down;
  if(d.includes('ط¥ظ†ط§ط±ط©')||d.includes('ط¥ط¶ط§ط،ط©')||d.includes('luminaire'))return R.elec_light_led;
  if(d.includes('طھط£ط±ظٹط¶')||d.includes('earth'))return R.elec_earthing;
  if(d.includes('طµظˆط§ط¹ظ‚')||d.includes('lightning'))return R.elec_lightning;
  if(d.includes('bms')||d.includes('طھط­ظƒظ… ظ…ط¨ظ†ظ‰'))return R.elec_bms;
  if(d.includes('ظƒط§ظ…ظٹط±ط§')||d.includes('cctv'))return R.elec_cctv_cam;
  if(d.includes('dvr')||d.includes('nvr'))return R.elec_cctv_dvr;
  if(d.includes('access')||d.includes('ط¯ط®ظˆظ„'))return R.elec_access;
  if(d.includes('ط§ظ†طھط±ظƒظ…')||d.includes('intercom'))return R.elec_intercom;
  if(d.includes('طµظˆطھ')||d.includes('pa'))return R.elec_pa;
  if(d.includes('ط³ط§ط¹ط©')||d.includes('clock'))return R.elec_clock;
  if(d.includes('ط·ط§ط¨ظˆط±')||d.includes('queue'))return R.elec_queue;
  if(d.includes('ط´ط§ط´ط©')||d.includes('display'))return R.elec_display;
  if(d.includes('data')||d.includes('ط¨ظٹط§ظ†ط§طھ'))return R.elec_data_point;
  if(d.includes('server')||d.includes('ط®ط§ط¯ظ…'))return R.elec_server_rack;
  if(d.includes('ظپط§ظٹط¨ط±')||d.includes('fiber'))return R.elec_fiber;
  if(d.includes('ظ‡ط§طھظپ')||d.includes('telephone'))return R.elec_telephone;
  if(d.includes('طھظ„ظپط²ظٹظˆظ†')||d.includes('tv'))return R.elec_tv;
  // HVAC
  if(d.includes('split')||d.includes('ط³ط¨ظ„ظٹطھ'))return R.ac_split;
  if(d.includes('package'))return R.ac_package;
  if(d.includes('vrf')||d.includes('vrv'))return R.ac_vrf;
  if(d.includes('fcu'))return R.ac_fcu;
  if(d.includes('ahu'))return R.ac_ahu;
  if(d.includes('ط¯ظƒطھ')||d.includes('duct'))return R.ac_duct;
  if(d.includes('ظ†ط§ط´ط±')||d.includes('diffuser'))return R.ac_diffuser;
  if(d.includes('damper'))return R.ac_damper;
  if(d.includes('ط¹ط²ظ„ ظ…ظˆط§ط³ظٹط±')||d.includes('ط¹ط²ظ„ ط­ط±ط§ط±ظٹ')&&d.includes('طھظƒظٹظٹظپ'))return R.ac_insul;
  if(d.includes('ط«ط±ظ…ظˆط³طھط§طھ')||d.includes('thermostat'))return R.ac_thermostat;
  if(d.includes('ط´ظپط·')||d.includes('exhaust')||d.includes('ط·ط±ط¯'))return R.ac_exhaust;
  if(d.includes('ظ‡ظˆط§ط، ظ†ظ‚ظٹ')||d.includes('fresh'))return R.ac_fresh;
  if(d.includes('ط³طھط§ط±ط© ظ‡ظˆط§ط¦ظٹط©')||d.includes('air curtain'))return R.ac_curtain;
  if(d.includes('ظ…ط±ظˆط­'))return R.ac_exhaust;
  // Plumbing
  if(d.includes('ظ…ط±ط­ط§ط¶')||d.includes('w.c'))return R.plumb_wc;
  if(d.includes('ط­ظˆط¶ ط؛ط³ظٹظ„')||d.includes('ظ…ط؛ط³ظ„ط©'))return R.plumb_basin;
  if(d.includes('ط­ظˆط¶ ظ…ط·ط¨ط®')||d.includes('kitchen sink'))return R.plumb_kitchen_sink;
  if(d.includes('ط¨ط§ظ„ظˆط¹')||d.includes('floor drain'))return R.plumb_floor_drain;
  if(d.includes('طھظ†ط¸ظٹظپ')||d.includes('cleanout'))return R.plumb_cleanout;
  if(d.includes('طھظ‡ظˆظٹط©')||d.includes('vent cap'))return R.plumb_vent;
  if(d.includes('ط¬ط±ط¬ظˆط±')||d.includes('ط³ط·ط­')&&d.includes('طµط±ظپ'))return R.plumb_roof_drain;
  if(d.includes('ط³ط®ط§ظ†')&&d.includes('200'))return R.plumb_heater_200;
  if(d.includes('ط³ط®ط§ظ†'))return R.plumb_heater_50;
  if(d.includes('ظ…ط¶ط®ط©')&&d.includes('طµط±ظپ'))return R.plumb_sewage;
  if(d.includes('ظ…ط¶ط®ط©'))return R.plumb_pump;
  if(d.includes('ظ…ط­ط¨ط³')||d.includes('طµظ…ط§ظ…')||d.includes('valve'))return R.plumb_valve;
  if(d.includes('ط®ط²ط§ظ†')&&d.includes('ط£ط±ط¶ظٹ'))return R.plumb_tank_gnd;
  if(d.includes('ط®ط²ط§ظ†'))return R.plumb_tank_roof;
  if(d.includes('ط´ط­ظˆظ…')||d.includes('grease'))return R.plumb_grease;
  if(d.includes('ظ…ظ†ظ‡ظ„')||d.includes('manhole'))return R.plumb_manhole;
  if(d.includes('ط¨ظٹط§ط±ط©')||d.includes('septic'))return R.plumb_septic;
  if(d.includes('طµط±ظپ')&&d.includes('110'))return R.plumb_pipe_110;
  if(d.includes('طµط±ظپ')&&d.includes('75'))return R.plumb_pipe_75;
  if(d.includes('طµط±ظپ')&&d.includes('50'))return R.plumb_pipe_50;
  if(d.includes('طµط±ظپ'))return R.plumb_pipe_75;
  if(d.includes('طھط؛ط°ظٹط©')&&d.includes('63'))return R.plumb_ppr_63;
  if(d.includes('طھط؛ط°ظٹط©')&&d.includes('50'))return R.plumb_ppr_50;
  if(d.includes('طھط؛ط°ظٹط©')&&d.includes('32'))return R.plumb_ppr_32;
  if(d.includes('طھط؛ط°ظٹط©')&&d.includes('25'))return R.plumb_ppr_25;
  if(d.includes('طھط؛ط°ظٹط©'))return R.plumb_ppr_25;
  // Fire
  if(d.includes('ط·ظپط§ظٹ')&&d.includes('co2'))return R.fire_ext_co2;
  if(d.includes('ط·ظپط§ظٹ')&&d.includes('ط£طھظˆظ…ط§طھظٹظƒ'))return R.fire_auto;
  if(d.includes('ط·ظپط§ظٹ'))return R.fire_ext_6;
  if(d.includes('ط®ط±ط·ظˆظ… ط­ط±ظٹظ‚')||d.includes('hose cabinet'))return R.fire_hose_cab;
  if(d.includes('ظ…ط¶ط®')&&d.includes('ط­ط±ظٹظ‚'))return R.fire_pump_sys;
  if(d.includes('ط¨ط·ط§ظ†ظٹ')&&d.includes('ط­ط±ظٹظ‚'))return R.fire_blanket;
  if(d.includes('ط­ط±ظٹظ‚')&&d.includes('4'))return R.fire_pipe_4;
  if(d.includes('ط­ط±ظٹظ‚')&&d.includes('3'))return R.fire_pipe_3;
  if(d.includes('ط­ط±ظٹظ‚')&&d.includes('2'))return R.fire_pipe_2;
  if(d.includes('ط­ط±ظٹظ‚'))return R.fire_pipe_3;
  // Landscape
  if(d.includes('ط´ط¬ط±')&&!d.includes('ظ†ط®'))return R.landscape_tree;
  if(d.includes('ظ†ط®ظ„'))return R.landscape_palm;
  if(d.includes('ط¹ط´ط¨')||d.includes('ظ†ط¬ظٹظ„'))return R.landscape_grass;
  if(d.includes('طھط±ط¨ط© ط²ط±ط§ط¹ظٹط©'))return R.landscape_soil;
  if(d.includes('ط±ظٹ'))return R.landscape_irrig;
  if(d.includes('ط£ط¹ظ„ط§ظ…')||d.includes('ط¹ظ„ظ…'))return R.landscape_flag;
  if(d.includes('ط¥ظ†ط§ط±ط©')&&d.includes('ط­ط¯ط§ط¦ظ‚'))return R.landscape_light;
  if(d.includes('ظƒط±ط³ظٹ')||d.includes('ط¬ظ„ظˆط³'))return R.landscape_bench;
  if(d.includes('ظ†ظپط§ظٹط©')||d.includes('ط³ظ„ط©'))return R.landscape_bin;
  if(dd.includes('ط¥ط³ظپظ„طھ')||dd.includes('ط³ظپظ„طھظ‡')||dd.includes('ط£ط³ظپظ„طھظٹط©'))return R.landscape_asphalt;
  if(dd.includes('ط¨ط±ط¯ظˆط±')||dd.includes('curb'))return R.landscape_curb;
  if(dd.includes('ظ…طµط¯ط§طھ ظ…ظˆط§ظ‚ظپ'))return R.landscape_bumper;
  if(dd.includes('ط­ط§ط¬ط² ط´ظˆظƒظٹ'))return R.landscape_barrier;
  if(dd.includes('ط­طµظ‰')||dd.includes('gravel'))return R.landscape_gravel;
  if(dd.includes('ط±طµظپ')||dd.includes('ط¥ظ†طھط±ظ„ظˆظƒ'))return R.landscape_paving;
  if(dd.includes('ظپظˆط§طµظ„')||dd.includes('ط´ط±ط§ط¦ط­'))return R.landscape_strip;
  if(d.includes('ظ…ظˆط§ط³ظٹط±')&&d.includes('طھظƒظٹظٹظپ'))return R.ac_pipe;
  if(d.includes('ظ…ظˆط§ط³ظٹط±'))return R.plumb_pipe_75;
  return 0;
}

// Process
const result=[];
let totalCost=0,totalSell=0,itemCount=0,unpriced=0;
for(let i=4;i<rows.length;i++){
  const r=rows[i];
  if(!r||!r[0]||typeof r[0]!=='number')continue;
  const seq=r[0],cat=r[1]||'',item=r[2]||'',unit=r[3]||'',qty=Number(r[4])||0;
  const desc=String(r[5]||''),spec=String(r[6]||''),mandatory=r[7]||'';
  const rate=getRate(desc,spec,unit,cat);
  const cost=Math.round(qty*rate);
  const sell=Math.round(cost*P);
  const sellRate=Math.round(rate*P);
  totalCost+=cost;totalSell+=sell;itemCount++;
  if(rate===0)unpriced++;
  const risk=rate===0?'âڑ ï¸ڈ ظٹط­طھط§ط¬ ظ…ط±ط§ط¬ط¹ط©':cost>100000?'ًں”´ ط¨ظ†ط¯ ط¹ط§ظ„ظٹ ط§ظ„طھظƒظ„ظپط©':cost>50000?'ًںں، ظ…طھظˆط³ط·':'ًںں¢ ط¹ط§ط¯ظٹ';
  result.push({
    '#':seq,'ط§ظ„ظپط¦ط©':cat,'ط§ظ„ط¨ظ†ط¯':item,'ط§ظ„ظˆط­ط¯ط©':unit,'ط§ظ„ظƒظ…ظٹط©':qty,
    'ظˆطµظپ ط§ظ„ط¨ظ†ط¯':desc.substring(0,80),'ط§ظ„ظ…ظˆط§طµظپط§طھ':spec.substring(0,80),
    'ط³ط¹ط± ط§ظ„طھظƒظ„ظپط©':rate,'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„طھظƒظ„ظپط©':cost,
    'ط³ط¹ط± ط§ظ„ط¨ظٹط¹ 15%':sellRate,'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¨ظٹط¹':sell,
    'ط§ظ„ط±ط¨ط­':sell-cost,'ط§ظ„ظ…ط®ط§ط·ط±':risk
  });
}

// Risk analysis
const highRisk=result.filter(r=>r['ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¨ظٹط¹']>100000);
const riskData=[
  {ط§ظ„ط¨ظ†ط¯:'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„طھظƒظ„ظپط©',ط§ظ„ظ‚ظٹظ…ط©:totalCost},
  {ط§ظ„ط¨ظ†ط¯:'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¨ظٹط¹ (15%)',ط§ظ„ظ‚ظٹظ…ط©:totalSell},
  {ط§ظ„ط¨ظ†ط¯:'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط±ط¨ط­',ط§ظ„ظ‚ظٹظ…ط©:totalSell-totalCost},
  {ط§ظ„ط¨ظ†ط¯:'ط´ط§ظ…ظ„ ط¶ط±ظٹط¨ط© 15%',ط§ظ„ظ‚ظٹظ…ط©:Math.round(totalSell*1.15)},
  {ط§ظ„ط¨ظ†ط¯:'ط¹ط¯ط¯ ط§ظ„ط¨ظ†ظˆط¯',ط§ظ„ظ‚ظٹظ…ط©:itemCount},
  {ط§ظ„ط¨ظ†ط¯:'ط¨ظ†ظˆط¯ ط¨ط¯ظˆظ† ط³ط¹ط±',ط§ظ„ظ‚ظٹظ…ط©:unpriced},
  {ط§ظ„ط¨ظ†ط¯:'ط¨ظ†ظˆط¯ ط¹ط§ظ„ظٹط© ط§ظ„ظ…ط®ط§ط·ط± (>100K)',ط§ظ„ظ‚ظٹظ…ط©:highRisk.length},
  {ط§ظ„ط¨ظ†ط¯:'ط§ط­طھظٹط§ط·ظٹ ظ…ظ‚طھط±ط­ 5%',ط§ظ„ظ‚ظٹظ…ط©:Math.round(totalSell*0.05)},
  {ط§ظ„ط¨ظ†ط¯:'ط¶ظ…ط§ظ† ط§ط¨طھط¯ط§ط¦ظٹ 2%',ط§ظ„ظ‚ظٹظ…ط©:Math.round(totalSell*0.02)},
  {ط§ظ„ط¨ظ†ط¯:'ط¶ظ…ط§ظ† ظ†ظ‡ط§ط¦ظٹ 5%',ط§ظ„ظ‚ظٹظ…ط©:Math.round(totalSell*0.05)},
  {ط§ظ„ط¨ظ†ط¯:'طھط£ظ…ظٹظ† 1%',ط§ظ„ظ‚ظٹظ…ط©:Math.round(totalSell*0.01)},
];

// Write Excel
const owb=xlsx.utils.book_new();
const s1=xlsx.utils.json_to_sheet(result);
s1['!cols']=[{wch:4},{wch:15},{wch:6},{wch:10},{wch:8},{wch:60},{wch:60},{wch:12},{wch:14},{wch:12},{wch:14},{wch:10},{wch:18}];
xlsx.utils.book_append_sheet(owb,s1,'ط¬ط¯ظˆظ„ ط§ظ„ظƒظ…ظٹط§طھ ط§ظ„ظ…ط³ط¹ط±');
const s2=xlsx.utils.json_to_sheet(riskData);
s2['!cols']=[{wch:35},{wch:20}];
xlsx.utils.book_append_sheet(owb,s2,'ظ…ظ„ط®طµ ظ…ط§ظ„ظٹ ظˆظ…ط®ط§ط·ط±');
// Category summary
const cats={};
result.forEach(r=>{const c=r['ط§ظ„ظپط¦ط©'];if(!cats[c])cats[c]={ط§ظ„ظپط¦ط©:c,ط¹ط¯ط¯_ط§ظ„ط¨ظ†ظˆط¯:0,ط§ظ„طھظƒظ„ظپط©:0,ط§ظ„ط¨ظٹط¹:0};cats[c].ط¹ط¯ط¯_ط§ظ„ط¨ظ†ظˆط¯++;cats[c].ط§ظ„طھظƒظ„ظپط©+=r['ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„طھظƒظ„ظپط©'];cats[c].ط§ظ„ط¨ظٹط¹+=r['ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¨ظٹط¹'];});
const s3=xlsx.utils.json_to_sheet(Object.values(cats));
xlsx.utils.book_append_sheet(owb,s3,'ظ…ظ„ط®طµ ط§ظ„ط£ظ‚ط³ط§ظ…');
xlsx.writeFile(owb,OUT);

console.log('\nâœ… طھظ… ط§ظ„طھط³ط¹ظٹط±!');
console.log('ًں“پ '+OUT);
console.log('â•گ'.repeat(50));
console.log('ًں“‹ ط§ظ„ط¨ظ†ظˆط¯: '+itemCount);
console.log('âڑ ï¸ڈ ط¨ط¯ظˆظ† ط³ط¹ط±: '+unpriced);
console.log('ًں’° ط§ظ„طھظƒظ„ظپط©: '+totalCost.toLocaleString()+' ط±.ط³');
console.log('ًں’° ط§ظ„ط¨ظٹط¹ 15%: '+totalSell.toLocaleString()+' ط±.ط³');
console.log('ًں“ˆ ط§ظ„ط±ط¨ط­: '+(totalSell-totalCost).toLocaleString()+' ط±.ط³');
console.log('ًں“ٹ ط´ط§ظ…ظ„ ط¶ط±ظٹط¨ط©: '+Math.round(totalSell*1.15).toLocaleString()+' ط±.ط³');
console.log('â•گ'.repeat(50));
Object.values(cats).forEach(c=>console.log('  '+c['ط§ظ„ظپط¦ط©'].padEnd(25)+' | '+c.ط¹ط¯ط¯_ط§ظ„ط¨ظ†ظˆط¯+' ط¨ظ†ط¯ | '+c.ط§ظ„ط¨ظٹط¹.toLocaleString()+' ط±.ط³'));

