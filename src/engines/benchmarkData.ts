/**
 * ARBA Engine V9.0 — Benchmark Data (Browser-Compatible)
 * بيانات الأسعار المرجعية — 106+ سعر
 * أسعار سوق السعودية 2026 — أسعار صافية (تكلفة فقط بدون ربح)
 * ⚠️ V9 Fix: تم تحويل جميع الأسعار من gross إلى net بقسمتها على 1.15
 */

export interface BenchmarkRate {
  rate: number;
  unit: string;
  category: string;
  priceType: 'net' | 'gross'; // net = تكلفة فقط، gross = شامل ربح
}

export interface BenchmarkData {
  [key: string]: BenchmarkRate;
}

export const BENCHMARK_RATES: BenchmarkData = {
  // ═══ EARTHWORKS ═══
  excavation: { rate: 22, unit: 'م3', category: 'earthworks', priceType: 'net' },
  backfill: { rate: 33, unit: 'م3', category: 'earthworks', priceType: 'net' },
  termite: { rate: 17, unit: 'م2', category: 'earthworks', priceType: 'net' },

  // ═══ CONCRETE ═══
  blinding: { rate: 261, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_footing: { rate: 765, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_tiebeam: { rate: 1043, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_sog: { rate: 635, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_neck: { rate: 1235, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_column: { rate: 1217, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_slab_solid: { rate: 835, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_stair: { rate: 1061, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_hordi: { rate: 826, unit: 'م3', category: 'concrete', priceType: 'net' },

  // ═══ MASONRY ═══
  block_20_ext: { rate: 70, unit: 'م2', category: 'masonry', priceType: 'net' },
  block_15_int: { rate: 57, unit: 'م2', category: 'masonry', priceType: 'net' },
  block_20_parapet: { rate: 74, unit: 'م2', category: 'masonry', priceType: 'net' },

  // ═══ FINISHES ═══
  plaster_ext: { rate: 39, unit: 'م2', category: 'finishes', priceType: 'net' },
  plaster_int: { rate: 33, unit: 'م2', category: 'finishes', priceType: 'net' },
  plaster_ceiling: { rate: 35, unit: 'م2', category: 'finishes', priceType: 'net' },
  stone_riyadh: { rate: 243, unit: 'م2', category: 'finishes', priceType: 'net' },
  marble_floor: { rate: 217, unit: 'م2', category: 'finishes', priceType: 'net' },
  marble_stair: { rate: 261, unit: 'م2', category: 'finishes', priceType: 'net' },
  granite_counter: { rate: 304, unit: 'م2', category: 'finishes', priceType: 'net' },
  porcelain_60: { rate: 113, unit: 'م2', category: 'finishes', priceType: 'net' },
  porcelain_wall: { rate: 104, unit: 'م2', category: 'finishes', priceType: 'net' },
  ceramic_wall: { rate: 87, unit: 'م2', category: 'finishes', priceType: 'net' },
  paint_int: { rate: 28, unit: 'م2', category: 'finishes', priceType: 'net' },
  paint_ext: { rate: 37, unit: 'م2', category: 'finishes', priceType: 'net' },
  paint_epoxy: { rate: 57, unit: 'م2', category: 'finishes', priceType: 'net' },
  paint_ceiling: { rate: 26, unit: 'م2', category: 'finishes', priceType: 'net' },
  gypsum_board: { rate: 70, unit: 'م2', category: 'finishes', priceType: 'net' },
  gypsum_tile: { rate: 52, unit: 'م2', category: 'finishes', priceType: 'net' },
  gypsum_cornice: { rate: 43, unit: 'م.ط', category: 'finishes', priceType: 'net' },

  // ═══ DOORS ═══
  door_wood: { rate: 1565, unit: 'عدد', category: 'doors', priceType: 'net' },
  door_steel: { rate: 2174, unit: 'عدد', category: 'doors', priceType: 'net' },
  door_fire: { rate: 3043, unit: 'عدد', category: 'doors', priceType: 'net' },
  door_alum: { rate: 3043, unit: 'عدد', category: 'doors', priceType: 'net' },
  door_glass: { rate: 3913, unit: 'عدد', category: 'doors', priceType: 'net' },

  // ═══ WINDOWS ═══
  window_alum: { rate: 609, unit: 'م2', category: 'windows', priceType: 'net' },
  curtain_wall: { rate: 783, unit: 'م2', category: 'windows', priceType: 'net' },

  // ═══ ELECTRICAL ═══
  elec_panel: { rate: 6957, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_genset: { rate: 156522, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_transformer: { rate: 82609, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_light_led: { rate: 243, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_outlet: { rate: 74, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_switch: { rate: 57, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_wire: { rate: 39, unit: 'م.ط', category: 'electrical', priceType: 'net' },
  elec_cable_tray: { rate: 157, unit: 'م.ط', category: 'electrical', priceType: 'net' },
  elec_conduit: { rate: 30, unit: 'م.ط', category: 'electrical', priceType: 'net' },
  elec_breaker: { rate: 304, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_light_emrg: { rate: 391, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_earthing: { rate: 2174, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_ups: { rate: 21739, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_ats: { rate: 30435, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_cctv_cam: { rate: 1565, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_access: { rate: 3043, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_intercom: { rate: 1913, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_data_point: { rate: 304, unit: 'نقطة', category: 'electrical', priceType: 'net' },
  elec_light: { rate: 223, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_pa: { rate: 304, unit: 'عدد', category: 'electrical', priceType: 'net' },

  // ═══ HVAC ═══
  ac_split: { rate: 3913, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_duct: { rate: 74, unit: 'م.ط', category: 'hvac', priceType: 'net' },
  ac_diffuser: { rate: 217, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_package: { rate: 24348, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_vrf: { rate: 39130, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_fcu: { rate: 5652, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_ahu: { rate: 73913, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_damper: { rate: 391, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_thermostat: { rate: 330, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_exhaust: { rate: 2435, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_fresh: { rate: 2783, unit: 'عدد', category: 'hvac', priceType: 'net' },
  ac_insul: { rate: 57, unit: 'م2', category: 'hvac', priceType: 'net' },

  // ═══ PLUMBING ═══
  plumb_wc: { rate: 1043, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_basin: { rate: 696, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_heater_50: { rate: 2174, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_valve: { rate: 74, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_floor_drain: { rate: 104, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_pump: { rate: 15652, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_tank_gnd: { rate: 13043, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_manhole: { rate: 3913, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_septic: { rate: 30435, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_ppr_25: { rate: 24, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_ppr_32: { rate: 33, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_ppr_50: { rate: 48, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_pipe_75: { rate: 74, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_pipe_110: { rate: 96, unit: 'م.ط', category: 'plumbing', priceType: 'net' },

  // ═══ FIRE SYSTEMS ═══
  fire_ext_6: { rate: 304, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_hose_cab: { rate: 2435, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_pump_sys: { rate: 104348, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_auto: { rate: 74, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_pipe_4: { rate: 83, unit: 'م.ط', category: 'fire', priceType: 'net' },
  fire_alarm: { rate: 262, unit: 'عدد', category: 'fire', priceType: 'net' },

  // ═══ EXTERNAL ═══
  landscape_paving: { rate: 78, unit: 'م2', category: 'external', priceType: 'net' },
  landscape_asphalt: { rate: 74, unit: 'م2', category: 'external', priceType: 'net' },

  // ═══ MEP ═══
  elevator: { rate: 243478, unit: 'عدد', category: 'mep', priceType: 'net' },

  // ═══ V8.2 — NEW CATEGORIES (15 إضافة) ═══
  waterproofing: { rate: 48, unit: 'م2', category: 'finishes', priceType: 'net' },
  thermal_insul: { rate: 39, unit: 'م2', category: 'finishes', priceType: 'net' },
  rebar: { rate: 2783, unit: 'طن', category: 'concrete', priceType: 'net' },
  precast: { rate: 391, unit: 'م2', category: 'concrete', priceType: 'net' },
  screed: { rate: 30, unit: 'م2', category: 'finishes', priceType: 'net' },
  handrail: { rate: 304, unit: 'م.ط', category: 'metalwork', priceType: 'net' },
  steel_struct: { rate: 15652, unit: 'طن', category: 'structure', priceType: 'net' },
  access_cover: { rate: 696, unit: 'عدد', category: 'external', priceType: 'net' },
  car_shade: { rate: 130, unit: 'م2', category: 'external', priceType: 'net' },
  pergola: { rate: 2174, unit: 'م2', category: 'external', priceType: 'net' },
  rolling_shutter: { rate: 3043, unit: 'عدد', category: 'doors', priceType: 'net' },
  rc_beam: { rate: 1130, unit: 'م3', category: 'concrete', priceType: 'net' },
  rc_tank: { rate: 1304, unit: 'م3', category: 'concrete', priceType: 'net' },
  roof_system: { rate: 104, unit: 'م2', category: 'finishes', priceType: 'net' },
  landscaping: { rate: 70, unit: 'م2', category: 'external', priceType: 'net' },

  // ═══ V8.2 EXPANSION — New Benchmark Rates ═══

  // HVAC
  hvac_split: { rate: 3913, unit: 'عدد', category: 'hvac', priceType: 'net' },
  hvac_central: { rate: 391, unit: 'طن تبريد', category: 'hvac', priceType: 'net' },
  hvac_cassette: { rate: 4783, unit: 'عدد', category: 'hvac', priceType: 'net' },
  hvac_ducting: { rate: 74, unit: 'م.ط', category: 'hvac', priceType: 'net' },
  hvac_chiller: { rate: 304348, unit: 'عدد', category: 'hvac', priceType: 'net' },
  hvac_exhaust: { rate: 1043, unit: 'عدد', category: 'hvac', priceType: 'net' },

  // Electrical (new entries only — panel/cable_tray/transformer/ups/earthing already in main section)
  elec_generator: { rate: 217391, unit: 'عدد', category: 'electrical', priceType: 'net' },
  elec_lighting: { rate: 304, unit: 'نقطة', category: 'electrical', priceType: 'net' },
  elec_socket: { rate: 157, unit: 'نقطة', category: 'electrical', priceType: 'net' },

  // Plumbing (new entries only — pump already in main section)
  plumb_supply: { rate: 48, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_drain: { rate: 57, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  plumb_fixtures: { rate: 2174, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_tank: { rate: 10435, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  plumb_heater: { rate: 3043, unit: 'عدد', category: 'plumbing', priceType: 'net' },

  // Fire Protection (new entries only — alarm already in main section)
  fire_sprinkler: { rate: 243, unit: 'نقطة', category: 'fire', priceType: 'net' },
  fire_pump: { rate: 73913, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_extinguisher: { rate: 304, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_hose: { rate: 2435, unit: 'عدد', category: 'fire', priceType: 'net' },
  fire_cabinet: { rate: 3043, unit: 'عدد', category: 'fire', priceType: 'net' },

  // Demolition
  demo_concrete: { rate: 157, unit: 'م3', category: 'earthworks', priceType: 'net' },
  demo_masonry: { rate: 30, unit: 'م2', category: 'earthworks', priceType: 'net' },
  demo_general: { rate: 22, unit: 'م2', category: 'earthworks', priceType: 'net' },

  // Temporary Works
  temp_scaffolding: { rate: 39, unit: 'م2', category: 'structure', priceType: 'net' },
  temp_hoarding: { rate: 196, unit: 'م.ط', category: 'structure', priceType: 'net' },
  temp_dewatering: { rate: 13043, unit: 'مقطوعية', category: 'earthworks', priceType: 'net' },

  // Smart Systems
  bms: { rate: 156522, unit: 'مجموعة', category: 'mep', priceType: 'net' },
  cctv: { rate: 2174, unit: 'نقطة', category: 'mep', priceType: 'net' },
  access_control: { rate: 6957, unit: 'باب', category: 'mep', priceType: 'net' },
  intercom: { rate: 3043, unit: 'نقطة', category: 'mep', priceType: 'net' },

  // Solar
  solar_panel: { rate: 739, unit: 'لوح', category: 'mep', priceType: 'net' },
  solar_heater: { rate: 5652, unit: 'عدد', category: 'mep', priceType: 'net' },

  // Waterproofing Variants
  wp_bitumen: { rate: 57, unit: 'م2', category: 'finishes', priceType: 'net' },
  wp_bathroom: { rate: 65, unit: 'م2', category: 'finishes', priceType: 'net' },
  wp_roof: { rate: 52, unit: 'م2', category: 'finishes', priceType: 'net' },
  wp_foundation: { rate: 61, unit: 'م2', category: 'finishes', priceType: 'net' },

  // Insulation Variants
  insul_eps: { rate: 35, unit: 'م2', category: 'finishes', priceType: 'net' },
  insul_xps: { rate: 48, unit: 'م2', category: 'finishes', priceType: 'net' },
  insul_rockwool: { rate: 43, unit: 'م2', category: 'finishes', priceType: 'net' },
  insul_polyurethane: { rate: 57, unit: 'م2', category: 'finishes', priceType: 'net' },

  // Facade Variants
  facade_grc: { rate: 391, unit: 'م2', category: 'finishes', priceType: 'net' },
  facade_alucobond: { rate: 330, unit: 'م2', category: 'finishes', priceType: 'net' },
  facade_curtainwall: { rate: 1043, unit: 'م2', category: 'finishes', priceType: 'net' },
  facade_stone: { rate: 304, unit: 'م2', category: 'finishes', priceType: 'net' },

  // Pool / Fountain — V9: مقسّم إلى بناء كامل vs تشطيب فقط
  pool: { rate: 300, unit: 'م2', category: 'external', priceType: 'net' },          // تشطيب فقط (عزل+بلاط) — الافتراضي
  pool_full: { rate: 2174, unit: 'م2', category: 'external', priceType: 'net' },     // بناء مسبح كامل من الصفر
  pool_finish: { rate: 300, unit: 'م2', category: 'external', priceType: 'net' },    // تشطيب وعزل فقط
  fountain: { rate: 8000, unit: 'عدد', category: 'external', priceType: 'net' },     // نافورة تشطيب
  fountain_full: { rate: 21739, unit: 'عدد', category: 'external', priceType: 'net' }, // نافورة بناء كامل

  // Steel Structure
  steel_column: { rate: 15652, unit: 'طن', category: 'structure', priceType: 'net' },
  steel_beam: { rate: 14783, unit: 'طن', category: 'structure', priceType: 'net' },
  steel_truss: { rate: 17391, unit: 'طن', category: 'structure', priceType: 'net' },
  steel_purlin: { rate: 12174, unit: 'طن', category: 'structure', priceType: 'net' },

  // ═══ Additional Benchmarks ═══
  kitchen_cabinet: { rate: 3043, unit: 'م.ط', category: 'finishes', priceType: 'net' },
  kitchen_counter: { rate: 696, unit: 'م.ط', category: 'finishes', priceType: 'net' },
  wardrobe: { rate: 2435, unit: 'م.ط', category: 'finishes', priceType: 'net' },
  ceiling_metal: { rate: 104, unit: 'م2', category: 'finishes', priceType: 'net' },
  ceiling_linear: { rate: 122, unit: 'م2', category: 'finishes', priceType: 'net' },
  ceiling_baffle: { rate: 157, unit: 'م2', category: 'finishes', priceType: 'net' },
  raised_floor: { rate: 217, unit: 'م2', category: 'finishes', priceType: 'net' },
  retaining_wall: { rate: 1565, unit: 'م3', category: 'concrete', priceType: 'net' },
  manhole: { rate: 3913, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  septic_tank: { rate: 30435, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  curb: { rate: 57, unit: 'م.ط', category: 'external', priceType: 'net' },
  interlock: { rate: 83, unit: 'م2', category: 'external', priceType: 'net' },
  staircase: { rate: 391, unit: 'م2', category: 'finishes', priceType: 'net' },
  expansion_joint: { rate: 104, unit: 'م.ط', category: 'concrete', priceType: 'net' },

  // ═══ V9.0 — MAINTENANCE & RENOVATION RATES ═══
  remove_tiles: { rate: 15, unit: 'م2', category: 'finishes', priceType: 'net' },
  remove_paint: { rate: 8, unit: 'م2', category: 'finishes', priceType: 'net' },
  remove_plaster: { rate: 12, unit: 'م2', category: 'finishes', priceType: 'net' },
  remove_ceiling: { rate: 18, unit: 'م2', category: 'finishes', priceType: 'net' },
  remove_door: { rate: 150, unit: 'عدد', category: 'doors', priceType: 'net' },
  remove_window: { rate: 120, unit: 'عدد', category: 'windows', priceType: 'net' },
  remove_sanitary: { rate: 200, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  repair_concrete: { rate: 350, unit: 'م2', category: 'concrete', priceType: 'net' },
  repair_crack: { rate: 120, unit: 'م.ط', category: 'concrete', priceType: 'net' },
  repair_plaster: { rate: 45, unit: 'م2', category: 'finishes', priceType: 'net' },
  repair_wp: { rate: 65, unit: 'م2', category: 'finishes', priceType: 'net' },
  repair_pipe: { rate: 85, unit: 'م.ط', category: 'plumbing', priceType: 'net' },
  repair_elec: { rate: 150, unit: 'نقطة', category: 'electrical', priceType: 'net' },
  reno_floor: { rate: 130, unit: 'م2', category: 'finishes', priceType: 'net' },
  reno_bathroom: { rate: 1200, unit: 'م2', category: 'finishes', priceType: 'net' },
  reno_kitchen: { rate: 2500, unit: 'م.ط', category: 'finishes', priceType: 'net' },
  reno_facade: { rate: 250, unit: 'م2', category: 'finishes', priceType: 'net' },
  strengthen_carbon: { rate: 450, unit: 'م2', category: 'concrete', priceType: 'net' },
  strengthen_frp: { rate: 380, unit: 'م2', category: 'concrete', priceType: 'net' },
  strengthen_jacketing: { rate: 2800, unit: 'م3', category: 'concrete', priceType: 'net' },
  strengthen_epoxy_inject: { rate: 180, unit: 'م.ط', category: 'concrete', priceType: 'net' },
  cleaning_facade: { rate: 12, unit: 'م2', category: 'external', priceType: 'net' },
  cleaning_tank: { rate: 800, unit: 'عدد', category: 'plumbing', priceType: 'net' },
  cleaning_general: { rate: 5, unit: 'م2', category: 'external', priceType: 'net' },
  test_concrete: { rate: 350, unit: 'عدد', category: 'concrete', priceType: 'net' },
  test_soil: { rate: 500, unit: 'عدد', category: 'earthworks', priceType: 'net' },
  test_load: { rate: 3000, unit: 'عدد', category: 'concrete', priceType: 'net' },
  sealant: { rate: 25, unit: 'م.ط', category: 'finishes', priceType: 'net' },
};

/** Location multipliers for Saudi regions */
export const LOCATION_MULTIPLIERS: Record<string, { factor: number; nameAr: string; nameEn: string }> = {
  riyadh: { factor: 1.0, nameAr: 'الرياض', nameEn: 'Riyadh' },
  jeddah: { factor: 1.05, nameAr: 'جدة', nameEn: 'Jeddah' },
  dammam: { factor: 1.02, nameAr: 'الدمام', nameEn: 'Dammam' },
  makkah: { factor: 1.08, nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
  madinah: { factor: 1.06, nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
  northern_borders: { factor: 1.12, nameAr: 'الحدود الشمالية', nameEn: 'Northern Borders' },
  tabuk: { factor: 1.10, nameAr: 'تبوك', nameEn: 'Tabuk' },
  abha: { factor: 1.07, nameAr: 'أبها', nameEn: 'Abha' },
  jazan: { factor: 1.09, nameAr: 'جازان', nameEn: 'Jazan' },
  hail: { factor: 1.08, nameAr: 'حائل', nameEn: 'Hail' },
  qassim: { factor: 1.04, nameAr: 'القصيم', nameEn: 'Qassim' },
  najran: { factor: 1.11, nameAr: 'نجران', nameEn: 'Najran' },
  aljouf: { factor: 1.10, nameAr: 'الجوف', nameEn: 'Al Jouf' },
  albaha: { factor: 1.09, nameAr: 'الباحة', nameEn: 'Al Baha' },
};

// ═══════════════════════════════════════════════════
// 🧠 Brain Auto-Update Integration (V8.2)
// ═══════════════════════════════════════════════════

/**
 * يقرأ تعديلات التعلّم من brainLearningService ويُرجع السعر المعدّل
 * إذا وجد 3+ تعديلات متشابهة → يستخدم السعر المتعلّم
 * وإلا → يرجع السعر الأصلي من BENCHMARK_RATES
 */
export function getEffectiveRate(ruleId: string): number {
  const baseRate = BENCHMARK_RATES[ruleId]?.rate || 0;

  try {
    const raw = localStorage.getItem('arba_brain_auto_updates');
    if (raw) {
      const updates: Record<string, { suggestedRate: number; learningCount: number }> = JSON.parse(raw);
      if (updates[ruleId] && updates[ruleId].learningCount >= 3) {
        return updates[ruleId].suggestedRate;
      }
    }
  } catch { /* fallback to base */ }

  return baseRate;
}

/**
 * يُطبّق كل تعديلات التعلّم على نسخة من BENCHMARK_RATES
 * يُستخدم لعرض الأسعار المحدّثة في واجهة المقارنة
 */
export function getLearnedBenchmarks(): BenchmarkData {
  const learned = { ...BENCHMARK_RATES };

  try {
    const raw = localStorage.getItem('arba_brain_auto_updates');
    if (raw) {
      const updates: Record<string, { suggestedRate: number; learningCount: number }> = JSON.parse(raw);
      for (const [ruleId, update] of Object.entries(updates)) {
        if (learned[ruleId] && update.learningCount >= 3) {
          learned[ruleId] = { ...learned[ruleId], rate: update.suggestedRate };
        }
      }
    }
  } catch { /* fallback */ }

  return learned;
}

/**
 * عدد الأسعار المحدّثة تلقائياً من التعلّم
 */
export function getAutoUpdateCount(): number {
  try {
    const raw = localStorage.getItem('arba_brain_auto_updates');
    if (raw) {
      return Object.keys(JSON.parse(raw)).length;
    }
  } catch { /* */ }
  return 0;
}

/** Category labels in Arabic and English */
export const CATEGORY_LABELS: Record<string, { ar: string; en: string; icon: string }> = {
  earthworks: { ar: 'أعمال ترابية', en: 'Earthworks', icon: '🏗️' },
  concrete: { ar: 'خرسانة', en: 'Concrete', icon: '🧱' },
  masonry: { ar: 'بناء', en: 'Masonry', icon: '🧱' },
  finishes: { ar: 'تشطيبات', en: 'Finishes', icon: '🎨' },
  doors: { ar: 'أبواب', en: 'Doors', icon: '🚪' },
  windows: { ar: 'نوافذ', en: 'Windows', icon: '🪟' },
  electrical: { ar: 'كهرباء', en: 'Electrical', icon: '⚡' },
  hvac: { ar: 'تكييف', en: 'HVAC', icon: '❄️' },
  plumbing: { ar: 'سباكة', en: 'Plumbing', icon: '🚿' },
  fire: { ar: 'إطفاء حريق', en: 'Fire Systems', icon: '🔥' },
  external: { ar: 'أعمال خارجية', en: 'External', icon: '🌳' },
  mep: { ar: 'أنظمة MEP', en: 'MEP Systems', icon: '⚙️' },
  metalwork: { ar: 'أعمال معدنية', en: 'Metalwork', icon: '🔩' },
  structure: { ar: 'هياكل حديد', en: 'Steel Structure', icon: '🏗️' },
  unclassified: { ar: 'غير مصنف', en: 'Unclassified', icon: '❓' },
};
