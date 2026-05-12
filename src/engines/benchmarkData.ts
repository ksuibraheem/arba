/**
 * ARBA Engine V8.1 — Benchmark Data (Browser-Compatible)
 * بيانات الأسعار المرجعية — 106+ سعر
 * أسعار سوق السعودية 2026 — تشمل مواد + عمالة + ربح 15%
 */

export interface BenchmarkRate {
  rate: number;
  unit: string;
  category: string;
}

export interface BenchmarkData {
  [key: string]: BenchmarkRate;
}

export const BENCHMARK_RATES: BenchmarkData = {
  // ═══ EARTHWORKS ═══
  excavation: { rate: 25, unit: 'م3', category: 'earthworks' },
  backfill: { rate: 38, unit: 'م3', category: 'earthworks' },
  termite: { rate: 20, unit: 'م2', category: 'earthworks' },

  // ═══ CONCRETE ═══
  blinding: { rate: 300, unit: 'م3', category: 'concrete' },
  rc_footing: { rate: 880, unit: 'م3', category: 'concrete' },
  rc_tiebeam: { rate: 1200, unit: 'م3', category: 'concrete' },
  rc_sog: { rate: 730, unit: 'م3', category: 'concrete' },
  rc_neck: { rate: 1420, unit: 'م3', category: 'concrete' },
  rc_column: { rate: 1400, unit: 'م3', category: 'concrete' },
  rc_slab_solid: { rate: 960, unit: 'م3', category: 'concrete' },
  rc_stair: { rate: 1220, unit: 'م3', category: 'concrete' },
  rc_hordi: { rate: 950, unit: 'م3', category: 'concrete' },

  // ═══ MASONRY ═══
  block_20_ext: { rate: 80, unit: 'م2', category: 'masonry' },
  block_15_int: { rate: 65, unit: 'م2', category: 'masonry' },
  block_20_parapet: { rate: 85, unit: 'م2', category: 'masonry' },

  // ═══ FINISHES ═══
  plaster_ext: { rate: 45, unit: 'م2', category: 'finishes' },
  plaster_int: { rate: 38, unit: 'م2', category: 'finishes' },
  plaster_ceiling: { rate: 40, unit: 'م2', category: 'finishes' },
  stone_riyadh: { rate: 280, unit: 'م2', category: 'finishes' },
  marble_floor: { rate: 250, unit: 'م2', category: 'finishes' },
  marble_stair: { rate: 300, unit: 'م2', category: 'finishes' },
  granite_counter: { rate: 350, unit: 'م2', category: 'finishes' },
  porcelain_60: { rate: 130, unit: 'م2', category: 'finishes' },
  porcelain_wall: { rate: 120, unit: 'م2', category: 'finishes' },
  ceramic_wall: { rate: 100, unit: 'م2', category: 'finishes' },
  paint_int: { rate: 32, unit: 'م2', category: 'finishes' },
  paint_ext: { rate: 42, unit: 'م2', category: 'finishes' },
  paint_epoxy: { rate: 65, unit: 'م2', category: 'finishes' },
  paint_ceiling: { rate: 30, unit: 'م2', category: 'finishes' },
  gypsum_board: { rate: 80, unit: 'م2', category: 'finishes' },
  gypsum_tile: { rate: 60, unit: 'م2', category: 'finishes' },
  gypsum_cornice: { rate: 50, unit: 'م.ط', category: 'finishes' },

  // ═══ DOORS ═══
  door_wood: { rate: 1800, unit: 'عدد', category: 'doors' },
  door_steel: { rate: 2500, unit: 'عدد', category: 'doors' },
  door_fire: { rate: 3500, unit: 'عدد', category: 'doors' },
  door_alum: { rate: 3500, unit: 'عدد', category: 'doors' },
  door_glass: { rate: 4500, unit: 'عدد', category: 'doors' },

  // ═══ WINDOWS ═══
  window_alum: { rate: 700, unit: 'م2', category: 'windows' },
  curtain_wall: { rate: 900, unit: 'م2', category: 'windows' },

  // ═══ ELECTRICAL ═══
  elec_panel: { rate: 8000, unit: 'عدد', category: 'electrical' },
  elec_genset: { rate: 180000, unit: 'عدد', category: 'electrical' },
  elec_transformer: { rate: 95000, unit: 'عدد', category: 'electrical' },
  elec_light_led: { rate: 280, unit: 'عدد', category: 'electrical' },
  elec_outlet: { rate: 85, unit: 'عدد', category: 'electrical' },
  elec_switch: { rate: 65, unit: 'عدد', category: 'electrical' },
  elec_wire: { rate: 45, unit: 'م.ط', category: 'electrical' },
  elec_cable_tray: { rate: 180, unit: 'م.ط', category: 'electrical' },
  elec_conduit: { rate: 35, unit: 'م.ط', category: 'electrical' },
  elec_breaker: { rate: 350, unit: 'عدد', category: 'electrical' },
  elec_light_emrg: { rate: 450, unit: 'عدد', category: 'electrical' },
  elec_earthing: { rate: 2500, unit: 'عدد', category: 'electrical' },
  elec_ups: { rate: 25000, unit: 'عدد', category: 'electrical' },
  elec_ats: { rate: 35000, unit: 'عدد', category: 'electrical' },
  elec_cctv_cam: { rate: 1800, unit: 'عدد', category: 'electrical' },
  elec_access: { rate: 3500, unit: 'عدد', category: 'electrical' },
  elec_intercom: { rate: 2200, unit: 'عدد', category: 'electrical' },
  elec_data_point: { rate: 350, unit: 'نقطة', category: 'electrical' },
  elec_light: { rate: 256, unit: 'عدد', category: 'electrical' },
  elec_pa: { rate: 350, unit: 'عدد', category: 'electrical' },

  // ═══ HVAC ═══
  ac_split: { rate: 4500, unit: 'عدد', category: 'hvac' },
  ac_duct: { rate: 85, unit: 'م.ط', category: 'hvac' },
  ac_diffuser: { rate: 250, unit: 'عدد', category: 'hvac' },
  ac_package: { rate: 28000, unit: 'عدد', category: 'hvac' },
  ac_vrf: { rate: 45000, unit: 'عدد', category: 'hvac' },
  ac_fcu: { rate: 6500, unit: 'عدد', category: 'hvac' },
  ac_ahu: { rate: 85000, unit: 'عدد', category: 'hvac' },
  ac_damper: { rate: 450, unit: 'عدد', category: 'hvac' },
  ac_thermostat: { rate: 380, unit: 'عدد', category: 'hvac' },
  ac_exhaust: { rate: 2800, unit: 'عدد', category: 'hvac' },
  ac_fresh: { rate: 3200, unit: 'عدد', category: 'hvac' },
  ac_insul: { rate: 65, unit: 'م2', category: 'hvac' },

  // ═══ PLUMBING ═══
  plumb_wc: { rate: 1200, unit: 'عدد', category: 'plumbing' },
  plumb_basin: { rate: 800, unit: 'عدد', category: 'plumbing' },
  plumb_heater_50: { rate: 2500, unit: 'عدد', category: 'plumbing' },
  plumb_valve: { rate: 85, unit: 'عدد', category: 'plumbing' },
  plumb_floor_drain: { rate: 120, unit: 'عدد', category: 'plumbing' },
  plumb_pump: { rate: 18000, unit: 'عدد', category: 'plumbing' },
  plumb_tank_gnd: { rate: 15000, unit: 'عدد', category: 'plumbing' },
  plumb_manhole: { rate: 4500, unit: 'عدد', category: 'plumbing' },
  plumb_septic: { rate: 35000, unit: 'عدد', category: 'plumbing' },
  plumb_ppr_25: { rate: 28, unit: 'م.ط', category: 'plumbing' },
  plumb_ppr_32: { rate: 38, unit: 'م.ط', category: 'plumbing' },
  plumb_ppr_50: { rate: 55, unit: 'م.ط', category: 'plumbing' },
  plumb_pipe_75: { rate: 85, unit: 'م.ط', category: 'plumbing' },
  plumb_pipe_110: { rate: 110, unit: 'م.ط', category: 'plumbing' },

  // ═══ FIRE SYSTEMS ═══
  fire_ext_6: { rate: 350, unit: 'عدد', category: 'fire' },
  fire_hose_cab: { rate: 2800, unit: 'عدد', category: 'fire' },
  fire_pump_sys: { rate: 120000, unit: 'عدد', category: 'fire' },
  fire_auto: { rate: 85, unit: 'عدد', category: 'fire' },
  fire_pipe_4: { rate: 95, unit: 'م.ط', category: 'fire' },
  fire_alarm: { rate: 301, unit: 'عدد', category: 'fire' },

  // ═══ EXTERNAL ═══
  landscape_paving: { rate: 90, unit: 'م2', category: 'external' },
  landscape_asphalt: { rate: 85, unit: 'م2', category: 'external' },

  // ═══ MEP ═══
  elevator: { rate: 280000, unit: 'عدد', category: 'mep' },

  // ═══ V8.2 — NEW CATEGORIES (15 إضافة) ═══
  waterproofing: { rate: 55, unit: 'م2', category: 'finishes' },
  thermal_insul: { rate: 45, unit: 'م2', category: 'finishes' },
  rebar: { rate: 3200, unit: 'طن', category: 'concrete' },
  precast: { rate: 450, unit: 'م2', category: 'concrete' },
  screed: { rate: 35, unit: 'م2', category: 'finishes' },
  handrail: { rate: 350, unit: 'م.ط', category: 'metalwork' },
  steel_struct: { rate: 18000, unit: 'طن', category: 'structure' },
  access_cover: { rate: 800, unit: 'عدد', category: 'external' },
  car_shade: { rate: 150, unit: 'م2', category: 'external' },
  pergola: { rate: 2500, unit: 'م2', category: 'external' },
  rolling_shutter: { rate: 3500, unit: 'عدد', category: 'doors' },
  rc_beam: { rate: 1300, unit: 'م3', category: 'concrete' },
  rc_tank: { rate: 1500, unit: 'م3', category: 'concrete' },
  roof_system: { rate: 120, unit: 'م2', category: 'finishes' },
  landscaping: { rate: 80, unit: 'م2', category: 'external' },

  // ═══ V8.2 EXPANSION — New Benchmark Rates ═══

  // HVAC
  hvac_split: { rate: 4500, unit: 'عدد', category: 'hvac' },
  hvac_central: { rate: 450, unit: 'طن تبريد', category: 'hvac' },
  hvac_cassette: { rate: 5500, unit: 'عدد', category: 'hvac' },
  hvac_ducting: { rate: 85, unit: 'م.ط', category: 'hvac' },
  hvac_chiller: { rate: 350000, unit: 'عدد', category: 'hvac' },
  hvac_exhaust: { rate: 1200, unit: 'عدد', category: 'hvac' },

  // Electrical (new entries only — panel/cable_tray/transformer/ups/earthing already in main section)
  elec_generator: { rate: 250000, unit: 'عدد', category: 'electrical' },
  elec_lighting: { rate: 350, unit: 'نقطة', category: 'electrical' },
  elec_socket: { rate: 180, unit: 'نقطة', category: 'electrical' },

  // Plumbing (new entries only — pump already in main section)
  plumb_supply: { rate: 55, unit: 'م.ط', category: 'plumbing' },
  plumb_drain: { rate: 65, unit: 'م.ط', category: 'plumbing' },
  plumb_fixtures: { rate: 2500, unit: 'عدد', category: 'plumbing' },
  plumb_tank: { rate: 12000, unit: 'عدد', category: 'plumbing' },
  plumb_heater: { rate: 3500, unit: 'عدد', category: 'plumbing' },

  // Fire Protection (new entries only — alarm already in main section)
  fire_sprinkler: { rate: 280, unit: 'نقطة', category: 'fire' },
  fire_pump: { rate: 85000, unit: 'عدد', category: 'fire' },
  fire_extinguisher: { rate: 350, unit: 'عدد', category: 'fire' },
  fire_hose: { rate: 2800, unit: 'عدد', category: 'fire' },
  fire_cabinet: { rate: 3500, unit: 'عدد', category: 'fire' },

  // Demolition
  demo_concrete: { rate: 180, unit: 'م3', category: 'earthworks' },
  demo_masonry: { rate: 35, unit: 'م2', category: 'earthworks' },
  demo_general: { rate: 25, unit: 'م2', category: 'earthworks' },

  // Temporary Works
  temp_scaffolding: { rate: 45, unit: 'م2', category: 'structure' },
  temp_hoarding: { rate: 225, unit: 'م.ط', category: 'structure' },
  temp_dewatering: { rate: 15000, unit: 'مقطوعية', category: 'earthworks' },

  // Smart Systems
  bms: { rate: 180000, unit: 'مجموعة', category: 'mep' },
  cctv: { rate: 2500, unit: 'نقطة', category: 'mep' },
  access_control: { rate: 8000, unit: 'باب', category: 'mep' },
  intercom: { rate: 3500, unit: 'نقطة', category: 'mep' },

  // Solar
  solar_panel: { rate: 850, unit: 'لوح', category: 'mep' },
  solar_heater: { rate: 6500, unit: 'عدد', category: 'mep' },

  // Waterproofing Variants
  wp_bitumen: { rate: 65, unit: 'م2', category: 'finishes' },
  wp_bathroom: { rate: 75, unit: 'م2', category: 'finishes' },
  wp_roof: { rate: 60, unit: 'م2', category: 'finishes' },
  wp_foundation: { rate: 70, unit: 'م2', category: 'finishes' },

  // Insulation Variants
  insul_eps: { rate: 40, unit: 'م2', category: 'finishes' },
  insul_xps: { rate: 55, unit: 'م2', category: 'finishes' },
  insul_rockwool: { rate: 50, unit: 'م2', category: 'finishes' },
  insul_polyurethane: { rate: 65, unit: 'م2', category: 'finishes' },

  // Facade Variants
  facade_grc: { rate: 450, unit: 'م2', category: 'finishes' },
  facade_alucobond: { rate: 380, unit: 'م2', category: 'finishes' },
  facade_curtainwall: { rate: 1200, unit: 'م2', category: 'finishes' },
  facade_stone: { rate: 350, unit: 'م2', category: 'finishes' },

  // Pool / Fountain
  pool: { rate: 2500, unit: 'م2', category: 'external' },
  fountain: { rate: 25000, unit: 'عدد', category: 'external' },

  // Steel Structure
  steel_column: { rate: 18000, unit: 'طن', category: 'structure' },
  steel_beam: { rate: 17000, unit: 'طن', category: 'structure' },
  steel_truss: { rate: 20000, unit: 'طن', category: 'structure' },
  steel_purlin: { rate: 14000, unit: 'طن', category: 'structure' },

  // ═══ Additional Benchmarks ═══
  kitchen_cabinet: { rate: 3500, unit: 'م.ط', category: 'finishes' },
  kitchen_counter: { rate: 800, unit: 'م.ط', category: 'finishes' },
  wardrobe: { rate: 2800, unit: 'م.ط', category: 'finishes' },
  ceiling_metal: { rate: 120, unit: 'م2', category: 'finishes' },
  ceiling_linear: { rate: 140, unit: 'م2', category: 'finishes' },
  ceiling_baffle: { rate: 180, unit: 'م2', category: 'finishes' },
  raised_floor: { rate: 250, unit: 'م2', category: 'finishes' },
  retaining_wall: { rate: 1800, unit: 'م3', category: 'concrete' },
  manhole: { rate: 4500, unit: 'عدد', category: 'plumbing' },
  septic_tank: { rate: 35000, unit: 'عدد', category: 'plumbing' },
  curb: { rate: 65, unit: 'م.ط', category: 'external' },
  interlock: { rate: 95, unit: 'م2', category: 'external' },
  staircase: { rate: 450, unit: 'م2', category: 'finishes' },
  expansion_joint: { rate: 120, unit: 'م.ط', category: 'concrete' },
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
