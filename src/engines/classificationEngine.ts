/**
 * ARBA V8.2 — Classification Engine (Browser-Compatible TypeScript)
 * محرك التصنيف — 345+ قاعدة (عربي + إنجليزي)
 * Converted from classification_rules.cjs for browser use
 */

import { BENCHMARK_RATES, type BenchmarkRate } from './benchmarkData';

interface ClassificationRule {
  id: string;
  keywords: string[];
  negKw: string[];
  category: string;
  priority: number;
}

export interface ClassificationResult {
  matched: boolean;
  ruleId: string | null;
  category: string;
  priority: number;
  baseRate: number;
  unit: string;
}

// All classification rules sorted by priority
const RULES: ClassificationRule[] = [
  // ═══ MASONRY (P100) ═══
  { id: 'block_20_parapet', keywords: ['بلوك', '20', 'سترة'], negKw: [], category: 'masonry', priority: 100 },
  { id: 'block_20_parapet', keywords: ['بلوك', '20', 'درورة'], negKw: [], category: 'masonry', priority: 100 },
  { id: 'block_20_ext', keywords: ['بلوك', '20'], negKw: [], category: 'masonry', priority: 95 },
  { id: 'block_15_int', keywords: ['بلوك', '15'], negKw: [], category: 'masonry', priority: 95 },
  { id: 'block_15_int', keywords: ['بلك'], negKw: [], category: 'masonry', priority: 90 },
  { id: 'block_20_ext', keywords: ['بلوك'], negKw: [], category: 'masonry', priority: 85 },

  // ═══ PLASTER (P80) ═══
  { id: 'plaster_ext', keywords: ['لياسة', 'خارج'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'plaster_ceiling', keywords: ['لياسة', 'أسقف'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'plaster_ceiling', keywords: ['لياسة', 'سقف'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'plaster_int', keywords: ['لياسة'], negKw: [], category: 'finishes', priority: 75 },

  // ═══ PAINT (P80) ═══
  { id: 'paint_epoxy', keywords: ['دهان', 'إيبوكسي'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'paint_epoxy', keywords: ['دهان', 'ايبوكسي'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'paint_epoxy', keywords: ['طلاء', 'إيبوكسي'], negKw: [], category: 'finishes', priority: 80 },
  { id: 'paint_epoxy', keywords: ['epoxy'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'paint_ceiling', keywords: ['دهان', 'أسقف'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'paint_ext', keywords: ['دهان', 'خارج'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'paint_ext', keywords: ['دهان', 'اكريليك'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'paint_int', keywords: ['دهان'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'paint_int', keywords: ['طلاء'], negKw: [], category: 'finishes', priority: 70 },

  // ═══ FLOORING (P78) ═══
  { id: 'porcelain_60', keywords: ['بورسلان', '60'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'porcelain_wall', keywords: ['بورسلان', 'جدار'], negKw: [], category: 'finishes', priority: 78 },
  { id: 'porcelain_60', keywords: ['بورسلان'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'porcelain_60', keywords: ['porcelain'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'ceramic_wall', keywords: ['سيراميك'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'ceramic_wall', keywords: ['ceramic'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'marble_stair', keywords: ['رخام', 'درج'], negKw: [], category: 'finishes', priority: 76 },
  { id: 'marble_floor', keywords: ['رخام'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'granite_counter', keywords: ['جرانيت'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'stone_riyadh', keywords: ['حجر'], negKw: [], category: 'finishes', priority: 70 },

  // ═══ CONCRETE STRUCTURAL (P75) ═══
  { id: 'excavation', keywords: ['حفر'], negKw: [], category: 'earthworks', priority: 75 },
  { id: 'backfill', keywords: ['ردم'], negKw: [], category: 'earthworks', priority: 75 },
  { id: 'termite', keywords: ['نمل'], negKw: [], category: 'earthworks', priority: 75 },
  { id: 'blinding', keywords: ['خرسانة عادية'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'blinding', keywords: ['نظافة'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'rc_footing', keywords: ['قواعد'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_tiebeam', keywords: ['ميد'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_tiebeam', keywords: ['ميدات'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_sog', keywords: ['بلاطات أرضية'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_sog', keywords: ['بلاطة أرضية'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_neck', keywords: ['رقاب'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_column', keywords: ['أعمدة'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_slab_solid', keywords: ['بلاطات مصمتة'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_stair', keywords: ['سلالم'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_hordi', keywords: ['هوردي'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_hordi', keywords: ['جسور'], negKw: [], category: 'concrete', priority: 70 },

  // ═══ GYPSUM (P70) ═══
  { id: 'gypsum_cornice', keywords: ['كرانيش'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'gypsum_board', keywords: ['جبس بورد'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'gypsum_board', keywords: ['gypsum board'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'gypsum_tile', keywords: ['جبس'], negKw: [], category: 'finishes', priority: 65 },

  // ═══ DOORS (P70) ═══
  { id: 'door_fire', keywords: ['باب', 'حريق'], negKw: [], category: 'doors', priority: 72 },
  { id: 'door_fire', keywords: ['fire door'], negKw: [], category: 'doors', priority: 70 },
  { id: 'door_glass', keywords: ['باب', 'زجاج'], negKw: [], category: 'doors', priority: 70 },
  { id: 'door_steel', keywords: ['باب', 'حديد'], negKw: [], category: 'doors', priority: 68 },
  { id: 'door_alum', keywords: ['باب', 'ألمن'], negKw: [], category: 'doors', priority: 68 },
  { id: 'door_wood', keywords: ['باب'], negKw: [], category: 'doors', priority: 60 },

  // ═══ WINDOWS (P68) ═══
  { id: 'window_alum', keywords: ['شباك'], negKw: [], category: 'windows', priority: 68 },
  { id: 'window_alum', keywords: ['نافذ'], negKw: [], category: 'windows', priority: 68 },
  { id: 'curtain_wall', keywords: ['كرتن وول'], negKw: [], category: 'windows', priority: 68 },
  { id: 'curtain_wall', keywords: ['curtain wall'], negKw: [], category: 'windows', priority: 66 },

  // ═══ ELECTRICAL (P68) ═══
  { id: 'elec_genset', keywords: ['مولد'], negKw: [], category: 'electrical', priority: 72 },
  { id: 'elec_genset', keywords: ['generator'], negKw: [], category: 'electrical', priority: 70 },
  { id: 'elec_transformer', keywords: ['محول'], negKw: [], category: 'electrical', priority: 70 },
  { id: 'elec_transformer', keywords: ['transformer'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_panel', keywords: ['لوحة', 'كهرب'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_panel', keywords: ['panel'], negKw: ['sandwich'], category: 'electrical', priority: 65 },
  { id: 'elec_ups', keywords: ['ups'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_ats', keywords: ['ats'], negKw: [], category: 'electrical', priority: 66 },
  { id: 'elec_cable_tray', keywords: ['كابل', 'حامل'], negKw: [], category: 'electrical', priority: 65 },
  { id: 'elec_cable_tray', keywords: ['cable tray'], negKw: [], category: 'electrical', priority: 63 },
  { id: 'elec_conduit', keywords: ['مواسير كهرب'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_conduit', keywords: ['conduit'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_wire', keywords: ['سلك'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_wire', keywords: ['كابل'], negKw: ['حامل'], category: 'electrical', priority: 58 },
  { id: 'elec_outlet', keywords: ['بريزة'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_outlet', keywords: ['مأخذ'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_outlet', keywords: ['outlet'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_switch', keywords: ['مفتاح'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_switch', keywords: ['switch'], negKw: ['ats'], category: 'electrical', priority: 58 },
  { id: 'elec_light_emrg', keywords: ['إنارة', 'طوارئ'], negKw: [], category: 'electrical', priority: 66 },
  { id: 'elec_light_emrg', keywords: ['emergency light'], negKw: [], category: 'electrical', priority: 64 },
  { id: 'elec_light_led', keywords: ['إنارة'], negKw: ['طوارئ'], category: 'electrical', priority: 60 },
  { id: 'elec_light_led', keywords: ['إضاءة'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_light_led', keywords: ['luminaire'], negKw: [], category: 'electrical', priority: 58 },
  { id: 'elec_light_led', keywords: ['led'], negKw: [], category: 'electrical', priority: 55 },
  { id: 'elec_light', keywords: ['spotlight'], negKw: [], category: 'electrical', priority: 55 },
  { id: 'elec_earthing', keywords: ['تأريض'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_earthing', keywords: ['earth'], negKw: ['works'], category: 'electrical', priority: 58 },
  { id: 'elec_cctv_cam', keywords: ['كاميرا'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_cctv_cam', keywords: ['cctv'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_access', keywords: ['access control'], negKw: ['cover'], category: 'electrical', priority: 60 },
  { id: 'elec_intercom', keywords: ['انتركم'], negKw: [], category: 'electrical', priority: 60 },
  { id: 'elec_intercom', keywords: ['intercom'], negKw: [], category: 'electrical', priority: 58 },
  { id: 'elec_data_point', keywords: ['data'], negKw: [], category: 'electrical', priority: 52 },
  { id: 'elec_pa', keywords: ['public address'], negKw: [], category: 'electrical', priority: 58 },
  { id: 'elec_pa', keywords: ['speaker'], negKw: [], category: 'electrical', priority: 52 },

  // ═══ HVAC (P68) ═══
  { id: 'ac_vrf', keywords: ['vrf'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'ac_vrf', keywords: ['vrv'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'ac_ahu', keywords: ['ahu'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'ac_fcu', keywords: ['fcu'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'ac_split', keywords: ['سبلت'], negKw: [], category: 'hvac', priority: 66 },
  { id: 'ac_split', keywords: ['split'], negKw: [], category: 'hvac', priority: 64 },
  { id: 'ac_package', keywords: ['package'], negKw: [], category: 'hvac', priority: 64 },
  { id: 'ac_duct', keywords: ['دكت'], negKw: [], category: 'hvac', priority: 62 },
  { id: 'ac_duct', keywords: ['duct'], negKw: [], category: 'hvac', priority: 60 },
  { id: 'ac_diffuser', keywords: ['ناشر'], negKw: [], category: 'hvac', priority: 60 },
  { id: 'ac_diffuser', keywords: ['diffuser'], negKw: [], category: 'hvac', priority: 58 },
  { id: 'ac_thermostat', keywords: ['ثرموستات'], negKw: [], category: 'hvac', priority: 58 },
  { id: 'ac_thermostat', keywords: ['thermostat'], negKw: [], category: 'hvac', priority: 56 },
  { id: 'ac_exhaust', keywords: ['شفط'], negKw: [], category: 'hvac', priority: 58 },
  { id: 'ac_exhaust', keywords: ['exhaust'], negKw: [], category: 'hvac', priority: 56 },

  // ═══ PLUMBING (P65) ═══
  { id: 'plumb_wc', keywords: ['مرحاض'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_wc', keywords: ['w.c'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_basin', keywords: ['حوض غسيل'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_basin', keywords: ['مغسلة'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_floor_drain', keywords: ['بالوعة'], negKw: [], category: 'plumbing', priority: 64 },
  { id: 'plumb_floor_drain', keywords: ['floor drain'], negKw: [], category: 'plumbing', priority: 62 },
  { id: 'plumb_pump', keywords: ['مضخة'], negKw: ['حريق'], category: 'plumbing', priority: 62 },
  { id: 'plumb_valve', keywords: ['محبس'], negKw: [], category: 'plumbing', priority: 60 },
  { id: 'plumb_valve', keywords: ['صمام'], negKw: [], category: 'plumbing', priority: 60 },
  { id: 'plumb_valve', keywords: ['valve'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_tank_gnd', keywords: ['خزان', 'أرضي'], negKw: [], category: 'plumbing', priority: 62 },
  { id: 'plumb_manhole', keywords: ['منهل'], negKw: [], category: 'plumbing', priority: 60 },
  { id: 'plumb_manhole', keywords: ['manhole'], negKw: ['cover'], category: 'plumbing', priority: 58 },
  { id: 'plumb_septic', keywords: ['بيارة'], negKw: [], category: 'plumbing', priority: 60 },
  { id: 'plumb_septic', keywords: ['septic'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_ppr_25', keywords: ['تغذية', '25'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_ppr_32', keywords: ['تغذية', '32'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_ppr_50', keywords: ['تغذية', '50'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_pipe_75', keywords: ['صرف', '75'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_pipe_110', keywords: ['صرف', '110'], negKw: [], category: 'plumbing', priority: 58 },
  { id: 'plumb_pipe_75', keywords: ['صرف'], negKw: [], category: 'plumbing', priority: 52 },

  // ═══ FIRE (P65) ═══
  { id: 'fire_alarm', keywords: ['إنذار حريق'], negKw: [], category: 'fire', priority: 66 },
  { id: 'fire_alarm', keywords: ['fire alarm'], negKw: [], category: 'fire', priority: 64 },
  { id: 'fire_alarm', keywords: ['facp'], negKw: [], category: 'fire', priority: 65 },
  { id: 'fire_alarm', keywords: ['smoke detector'], negKw: [], category: 'fire', priority: 62 },
  { id: 'fire_alarm', keywords: ['heat detector'], negKw: [], category: 'fire', priority: 62 },
  { id: 'fire_pump_sys', keywords: ['مضخ', 'حريق'], negKw: [], category: 'fire', priority: 64 },
  { id: 'fire_hose_cab', keywords: ['خرطوم حريق'], negKw: [], category: 'fire', priority: 62 },
  { id: 'fire_hose_cab', keywords: ['hose cabinet'], negKw: [], category: 'fire', priority: 60 },
  { id: 'fire_ext_6', keywords: ['طفاي'], negKw: [], category: 'fire', priority: 58 },
  { id: 'fire_pipe_4', keywords: ['حريق'], negKw: [], category: 'fire', priority: 50 },

  // ═══ V8.2 NEW: WATERPROOFING & INSULATION ═══
  { id: 'waterproofing', keywords: ['عزل مائي'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'waterproofing', keywords: ['بيتوميني'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'waterproofing', keywords: ['waterproofing'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'waterproofing', keywords: ['membrane'], negKw: ['duct'], category: 'finishes', priority: 65 },
  { id: 'thermal_insul', keywords: ['عزل حراري'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'thermal_insul', keywords: ['بوليسترين'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'thermal_insul', keywords: ['thermal insulation'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'thermal_insul', keywords: ['polystyrene'], negKw: [], category: 'finishes', priority: 66 },

  // ═══ V8.2 NEW: REBAR & STEEL ═══
  { id: 'rebar', keywords: ['حديد تسليح'], negKw: [], category: 'concrete', priority: 75 },
  { id: 'rebar', keywords: ['تسليح'], negKw: ['خرسانة'], category: 'concrete', priority: 70 },
  { id: 'rebar', keywords: ['rebar'], negKw: [], category: 'concrete', priority: 68 },
  { id: 'rebar', keywords: ['reinforcement'], negKw: ['concrete'], category: 'concrete', priority: 65 },
  { id: 'steel_struct', keywords: ['هيكل حديد'], negKw: [], category: 'structure', priority: 65 },
  { id: 'steel_struct', keywords: ['steel structure'], negKw: [], category: 'structure', priority: 62 },

  // ═══ V8.2 NEW: PRECAST & SCREED ═══
  { id: 'precast', keywords: ['بريكاست'], negKw: [], category: 'concrete', priority: 68 },
  { id: 'precast', keywords: ['precast'], negKw: [], category: 'concrete', priority: 66 },
  { id: 'precast', keywords: ['hollow core'], negKw: [], category: 'concrete', priority: 64 },
  { id: 'screed', keywords: ['سكريد'], negKw: [], category: 'finishes', priority: 65 },
  { id: 'screed', keywords: ['screed'], negKw: [], category: 'finishes', priority: 62 },

  // ═══ V8.2 NEW: BEAMS & TANKS ═══
  { id: 'rc_beam', keywords: ['كمرات'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'rc_beam', keywords: ['beam'], negKw: ['light'], category: 'concrete', priority: 65 },
  { id: 'rc_tank', keywords: ['خزان مياه'], negKw: [], category: 'concrete', priority: 70 },
  { id: 'rc_tank', keywords: ['water tank'], negKw: [], category: 'concrete', priority: 66 },

  // ═══ V8.2 NEW: METALWORK ═══
  { id: 'handrail', keywords: ['درابزين'], negKw: [], category: 'metalwork', priority: 65 },
  { id: 'handrail', keywords: ['handrail'], negKw: [], category: 'metalwork', priority: 62 },
  { id: 'handrail', keywords: ['railing'], negKw: [], category: 'metalwork', priority: 60 },
  { id: 'access_cover', keywords: ['أغطية مانهول'], negKw: [], category: 'external', priority: 62 },
  { id: 'access_cover', keywords: ['manhole cover'], negKw: [], category: 'external', priority: 60 },

  // ═══ V8.2 NEW: EXTERNAL ═══
  { id: 'car_shade', keywords: ['مظلات'], negKw: [], category: 'external', priority: 62 },
  { id: 'car_shade', keywords: ['canopy'], negKw: [], category: 'external', priority: 58 },
  { id: 'pergola', keywords: ['برجولة'], negKw: [], category: 'external', priority: 62 },
  { id: 'pergola', keywords: ['pergola'], negKw: [], category: 'external', priority: 60 },
  { id: 'landscaping', keywords: ['تنسيق حدائق'], negKw: [], category: 'external', priority: 60 },
  { id: 'landscaping', keywords: ['landscaping'], negKw: [], category: 'external', priority: 58 },
  { id: 'roof_system', keywords: ['ساندوتش بانل'], negKw: [], category: 'finishes', priority: 62 },
  { id: 'roof_system', keywords: ['sandwich panel'], negKw: [], category: 'finishes', priority: 60 },
  { id: 'rolling_shutter', keywords: ['رولينق'], negKw: [], category: 'doors', priority: 65 },
  { id: 'rolling_shutter', keywords: ['rolling shutter'], negKw: [], category: 'doors', priority: 62 },

  // ═══ SPECIAL ═══
  { id: 'elevator', keywords: ['مصعد'], negKw: [], category: 'mep', priority: 72 },
  { id: 'elevator', keywords: ['elevator'], negKw: [], category: 'mep', priority: 70 },
  { id: 'landscape_paving', keywords: ['رصف'], negKw: [], category: 'external', priority: 58 },
  { id: 'landscape_asphalt', keywords: ['إسفلت'], negKw: [], category: 'external', priority: 58 },
  { id: 'landscape_asphalt', keywords: ['asphalt'], negKw: [], category: 'external', priority: 56 },

  // ═══════════════════════════════════════════════════════════════════
  // V8.2 EXPANSION — 100+ NEW RULES (Target: 345+)
  // ═══════════════════════════════════════════════════════════════════

  // ═══ HVAC EXPANDED (P72-68) ═══
  { id: 'hvac_split', keywords: ['تكييف', 'سبليت'], negKw: [], category: 'hvac', priority: 72 },
  { id: 'hvac_split', keywords: ['split', 'ac'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'hvac_central', keywords: ['تكييف', 'مركزي'], negKw: [], category: 'hvac', priority: 74 },
  { id: 'hvac_central', keywords: ['central', 'hvac'], negKw: [], category: 'hvac', priority: 70 },
  { id: 'hvac_cassette', keywords: ['كاسيت'], negKw: [], category: 'hvac', priority: 70 },
  { id: 'hvac_cassette', keywords: ['cassette'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'hvac_ducting', keywords: ['مجاري هواء'], negKw: [], category: 'hvac', priority: 70 },
  { id: 'hvac_ducting', keywords: ['ductwork'], negKw: [], category: 'hvac', priority: 68 },
  { id: 'hvac_ducting', keywords: ['ducting'], negKw: [], category: 'hvac', priority: 66 },
  { id: 'hvac_chiller', keywords: ['تشيلر'], negKw: [], category: 'hvac', priority: 74 },
  { id: 'hvac_chiller', keywords: ['chiller'], negKw: [], category: 'hvac', priority: 72 },
  { id: 'hvac_exhaust', keywords: ['شفط', 'مروحة'], negKw: [], category: 'hvac', priority: 66 },
  { id: 'hvac_exhaust', keywords: ['exhaust', 'fan'], negKw: [], category: 'hvac', priority: 64 },

  // ═══ ELECTRICAL EXPANDED (P72-60) ═══
  { id: 'elec_panel', keywords: ['لوحة', 'كهرب'], negKw: [], category: 'electrical', priority: 72 },
  { id: 'elec_panel', keywords: ['distribution', 'board'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_panel', keywords: ['panel', 'board'], negKw: [], category: 'electrical', priority: 66 },
  { id: 'elec_cable_tray', keywords: ['حوامل', 'كابل'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_cable_tray', keywords: ['cable', 'tray'], negKw: [], category: 'electrical', priority: 66 },
  { id: 'elec_transformer', keywords: ['محول', 'كهرب'], negKw: [], category: 'electrical', priority: 74 },
  { id: 'elec_transformer', keywords: ['transformer'], negKw: [], category: 'electrical', priority: 72 },
  { id: 'elec_generator', keywords: ['مولد'], negKw: [], category: 'electrical', priority: 74 },
  { id: 'elec_generator', keywords: ['generator'], negKw: [], category: 'electrical', priority: 72 },
  { id: 'elec_ups', keywords: ['ups'], negKw: [], category: 'electrical', priority: 70 },
  { id: 'elec_earthing', keywords: ['تأريض'], negKw: [], category: 'electrical', priority: 68 },
  { id: 'elec_earthing', keywords: ['earthing'], negKw: [], category: 'electrical', priority: 66 },
  { id: 'elec_earthing', keywords: ['grounding'], negKw: [], category: 'electrical', priority: 64 },
  { id: 'elec_lighting', keywords: ['إنارة'], negKw: [], category: 'electrical', priority: 65 },
  { id: 'elec_lighting', keywords: ['lighting'], negKw: [], category: 'electrical', priority: 63 },
  { id: 'elec_socket', keywords: ['بريزة'], negKw: [], category: 'electrical', priority: 62 },
  { id: 'elec_socket', keywords: ['socket', 'outlet'], negKw: [], category: 'electrical', priority: 60 },

  // ═══ PLUMBING EXPANDED (P70-58) ═══
  { id: 'plumb_supply', keywords: ['تغذية', 'مياه'], negKw: [], category: 'plumbing', priority: 70 },
  { id: 'plumb_supply', keywords: ['water', 'supply'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_drain', keywords: ['صرف', 'صحي'], negKw: [], category: 'plumbing', priority: 70 },
  { id: 'plumb_drain', keywords: ['drainage'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_drain', keywords: ['sewage'], negKw: [], category: 'plumbing', priority: 64 },
  { id: 'plumb_fixtures', keywords: ['أدوات', 'صح'], negKw: [], category: 'plumbing', priority: 68 },
  { id: 'plumb_fixtures', keywords: ['sanitary', 'fixture'], negKw: [], category: 'plumbing', priority: 64 },
  { id: 'plumb_tank', keywords: ['خزان', 'مياه'], negKw: [], category: 'plumbing', priority: 72 },
  { id: 'plumb_tank', keywords: ['water', 'tank'], negKw: [], category: 'plumbing', priority: 68 },
  { id: 'plumb_pump', keywords: ['مضخة', 'مياه'], negKw: ['حريق'], category: 'plumbing', priority: 70 },
  { id: 'plumb_pump', keywords: ['water', 'pump'], negKw: ['fire'], category: 'plumbing', priority: 66 },
  { id: 'plumb_heater', keywords: ['سخان'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_heater', keywords: ['water', 'heater'], negKw: [], category: 'plumbing', priority: 64 },

  // ═══ FIRE PROTECTION EXPANDED (P72-60) ═══
  { id: 'fire_alarm', keywords: ['إنذار', 'حريق'], negKw: [], category: 'fire', priority: 72 },
  { id: 'fire_alarm', keywords: ['fire', 'alarm'], negKw: [], category: 'fire', priority: 70 },
  { id: 'fire_sprinkler', keywords: ['رشاش', 'حريق'], negKw: [], category: 'fire', priority: 72 },
  { id: 'fire_sprinkler', keywords: ['sprinkler'], negKw: [], category: 'fire', priority: 70 },
  { id: 'fire_pump', keywords: ['مضخة', 'حريق'], negKw: [], category: 'fire', priority: 74 },
  { id: 'fire_pump', keywords: ['fire', 'pump'], negKw: [], category: 'fire', priority: 72 },
  { id: 'fire_extinguisher', keywords: ['طفاية'], negKw: [], category: 'fire', priority: 64 },
  { id: 'fire_extinguisher', keywords: ['extinguisher'], negKw: [], category: 'fire', priority: 62 },
  { id: 'fire_hose', keywords: ['خرطوم', 'حريق'], negKw: [], category: 'fire', priority: 66 },
  { id: 'fire_hose', keywords: ['fire', 'hose'], negKw: [], category: 'fire', priority: 64 },
  { id: 'fire_cabinet', keywords: ['خزانة', 'حريق'], negKw: [], category: 'fire', priority: 66 },
  { id: 'fire_cabinet', keywords: ['fire', 'cabinet'], negKw: [], category: 'fire', priority: 64 },

  // ═══ DEMOLITION (P60-55) ═══
  { id: 'demo_concrete', keywords: ['هدم', 'خرسانة'], negKw: [], category: 'earthworks', priority: 60 },
  { id: 'demo_concrete', keywords: ['demolition', 'concrete'], negKw: [], category: 'earthworks', priority: 58 },
  { id: 'demo_masonry', keywords: ['هدم', 'بلوك'], negKw: [], category: 'earthworks', priority: 58 },
  { id: 'demo_masonry', keywords: ['demolition', 'masonry'], negKw: [], category: 'earthworks', priority: 56 },
  { id: 'demo_general', keywords: ['هدم'], negKw: [], category: 'earthworks', priority: 55 },
  { id: 'demo_general', keywords: ['demolition'], negKw: [], category: 'earthworks', priority: 53 },

  // ═══ TEMPORARY WORKS (P55-50) ═══
  { id: 'temp_scaffolding', keywords: ['سقالات'], negKw: [], category: 'structure', priority: 55 },
  { id: 'temp_scaffolding', keywords: ['scaffolding'], negKw: [], category: 'structure', priority: 53 },
  { id: 'temp_hoarding', keywords: ['سياج', 'مؤقت'], negKw: [], category: 'structure', priority: 52 },
  { id: 'temp_hoarding', keywords: ['hoarding'], negKw: [], category: 'structure', priority: 50 },
  { id: 'temp_dewatering', keywords: ['نزح', 'مياه'], negKw: [], category: 'earthworks', priority: 55 },
  { id: 'temp_dewatering', keywords: ['dewatering'], negKw: [], category: 'earthworks', priority: 53 },

  // ═══ SMART SYSTEMS / BMS (P68-62) ═══
  { id: 'bms', keywords: ['bms'], negKw: [], category: 'mep', priority: 68 },
  { id: 'bms', keywords: ['نظام', 'تحكم', 'مبنى'], negKw: [], category: 'mep', priority: 66 },
  { id: 'cctv', keywords: ['كاميرات', 'مراقبة'], negKw: [], category: 'mep', priority: 66 },
  { id: 'cctv', keywords: ['cctv'], negKw: [], category: 'mep', priority: 64 },
  { id: 'access_control', keywords: ['نظام', 'دخول'], negKw: [], category: 'mep', priority: 64 },
  { id: 'access_control', keywords: ['access', 'control'], negKw: [], category: 'mep', priority: 62 },
  { id: 'intercom', keywords: ['انتركم'], negKw: [], category: 'mep', priority: 62 },
  { id: 'intercom', keywords: ['intercom'], negKw: [], category: 'mep', priority: 60 },

  // ═══ SOLAR / RENEWABLE (P65-58) ═══
  { id: 'solar_panel', keywords: ['طاقة', 'شمسية'], negKw: [], category: 'mep', priority: 65 },
  { id: 'solar_panel', keywords: ['solar', 'panel'], negKw: [], category: 'mep', priority: 63 },
  { id: 'solar_heater', keywords: ['سخان', 'شمسي'], negKw: [], category: 'mep', priority: 62 },
  { id: 'solar_heater', keywords: ['solar', 'heater'], negKw: [], category: 'mep', priority: 60 },

  // ═══ WATERPROOFING VARIANTS (P75-65) ═══
  { id: 'wp_bitumen', keywords: ['عزل', 'بيتومين'], negKw: [], category: 'finishes', priority: 75 },
  { id: 'wp_bitumen', keywords: ['bitumen', 'membrane'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'wp_bathroom', keywords: ['عزل', 'حمام'], negKw: [], category: 'finishes', priority: 73 },
  { id: 'wp_roof', keywords: ['عزل', 'سطح'], negKw: ['حرار'], category: 'finishes', priority: 73 },
  { id: 'wp_foundation', keywords: ['عزل', 'أساس'], negKw: [], category: 'finishes', priority: 73 },

  // ═══ INSULATION VARIANTS (P70-62) ═══
  { id: 'insul_eps', keywords: ['عزل', 'فوم'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'insul_xps', keywords: ['عزل', 'xps'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'insul_rockwool', keywords: ['صوف', 'صخر'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'insul_rockwool', keywords: ['rockwool'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'insul_polyurethane', keywords: ['بولي يوريثين'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'insul_polyurethane', keywords: ['polyurethane', 'spray'], negKw: [], category: 'finishes', priority: 66 },

  // ═══ CLADDING / FACADE VARIANTS (P70-62) ═══
  { id: 'facade_grc', keywords: ['grc'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'facade_alucobond', keywords: ['الكوبوند'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'facade_alucobond', keywords: ['alucobond'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'facade_curtainwall', keywords: ['حائط', 'ستائري'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'facade_curtainwall', keywords: ['curtain', 'wall'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'facade_stone', keywords: ['حجر', 'واجهة'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'facade_stone', keywords: ['stone', 'cladding'], negKw: [], category: 'finishes', priority: 66 },

  // ═══ POOL / FOUNTAIN (P62-55) ═══
  { id: 'pool', keywords: ['مسبح'], negKw: [], category: 'external', priority: 62 },
  { id: 'pool', keywords: ['swimming', 'pool'], negKw: [], category: 'external', priority: 60 },
  { id: 'fountain', keywords: ['نافورة'], negKw: [], category: 'external', priority: 58 },
  { id: 'fountain', keywords: ['fountain'], negKw: [], category: 'external', priority: 56 },

  // ═══ STEEL STRUCTURE VARIANTS (P72-62) ═══
  { id: 'steel_column', keywords: ['عمود', 'حديد'], negKw: ['تسليح'], category: 'structure', priority: 72 },
  { id: 'steel_column', keywords: ['steel', 'column'], negKw: ['rebar'], category: 'structure', priority: 68 },
  { id: 'steel_beam', keywords: ['كمرة', 'حديد'], negKw: ['تسليح'], category: 'structure', priority: 72 },
  { id: 'steel_beam', keywords: ['steel', 'beam'], negKw: ['rebar'], category: 'structure', priority: 68 },
  { id: 'steel_truss', keywords: ['جمالون'], negKw: [], category: 'structure', priority: 70 },
  { id: 'steel_truss', keywords: ['truss'], negKw: [], category: 'structure', priority: 68 },
  { id: 'steel_purlin', keywords: ['بيرلن'], negKw: [], category: 'structure', priority: 65 },
  { id: 'steel_purlin', keywords: ['purlin'], negKw: [], category: 'structure', priority: 63 },

  // ═══ ENGLISH FALLBACKS FOR COMMON ITEMS ═══
  { id: 'block_20_ext', keywords: ['block', '200mm'], negKw: [], category: 'masonry', priority: 82 },
  { id: 'block_20_ext', keywords: ['block', '20cm'], negKw: [], category: 'masonry', priority: 82 },
  { id: 'block_15_int', keywords: ['block', '150mm'], negKw: [], category: 'masonry', priority: 82 },
  { id: 'block_15_int', keywords: ['block', '15cm'], negKw: [], category: 'masonry', priority: 82 },
  { id: 'plaster_int', keywords: ['plaster', 'internal'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'plaster_ext', keywords: ['plaster', 'external'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'paint_int', keywords: ['paint', 'internal'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'paint_ext', keywords: ['paint', 'external'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'ceramic_floor', keywords: ['ceramic', 'floor'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'ceramic_wall', keywords: ['ceramic', 'wall'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'porcelain', keywords: ['porcelain'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'marble', keywords: ['marble'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'granite', keywords: ['granite'], negKw: [], category: 'finishes', priority: 70 },

  // ═══ ADDITIONAL RULES (Target: 350+) ═══

  // Kitchen / Joinery
  { id: 'kitchen_cabinet', keywords: ['مطبخ', 'خزائن'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'kitchen_cabinet', keywords: ['kitchen', 'cabinet'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'kitchen_counter', keywords: ['مطبخ', 'رخام'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'wardrobe', keywords: ['خزانة', 'ملابس'], negKw: [], category: 'finishes', priority: 64 },
  { id: 'wardrobe', keywords: ['wardrobe'], negKw: [], category: 'finishes', priority: 62 },

  // False Ceiling Variants
  { id: 'ceiling_metal', keywords: ['سقف', 'معلق', 'معدن'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'ceiling_metal', keywords: ['metal', 'ceiling'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'ceiling_linear', keywords: ['سقف', 'خطي'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'ceiling_baffle', keywords: ['بافل'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'ceiling_baffle', keywords: ['baffle', 'ceiling'], negKw: [], category: 'finishes', priority: 66 },

  // Raised Floor
  { id: 'raised_floor', keywords: ['أرضية', 'مرفوعة'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'raised_floor', keywords: ['raised', 'floor'], negKw: [], category: 'finishes', priority: 66 },

  // Retaining Walls
  { id: 'retaining_wall', keywords: ['جدار', 'استنادي'], negKw: [], category: 'concrete', priority: 78 },
  { id: 'retaining_wall', keywords: ['retaining', 'wall'], negKw: [], category: 'concrete', priority: 76 },

  // Manholes & Infrastructure
  { id: 'manhole', keywords: ['غرفة', 'تفتيش'], negKw: [], category: 'plumbing', priority: 65 },
  { id: 'manhole', keywords: ['manhole'], negKw: [], category: 'plumbing', priority: 63 },
  { id: 'septic_tank', keywords: ['بيارة'], negKw: [], category: 'plumbing', priority: 68 },
  { id: 'septic_tank', keywords: ['septic'], negKw: [], category: 'plumbing', priority: 66 },

  // Road / Paving Variants
  { id: 'curb', keywords: ['بردورة'], negKw: [], category: 'external', priority: 58 },
  { id: 'curb', keywords: ['kerb'], negKw: [], category: 'external', priority: 56 },
  { id: 'curb', keywords: ['curb'], negKw: [], category: 'external', priority: 56 },
  { id: 'interlock', keywords: ['انترلوك'], negKw: [], category: 'external', priority: 60 },
  { id: 'interlock', keywords: ['interlock'], negKw: [], category: 'external', priority: 58 },

  // Arabic Aliases for Electrical
  { id: 'elec_panel', keywords: ['طبلون'], negKw: [], category: 'electrical', priority: 70 },
  { id: 'elec_lighting', keywords: ['ليد'], negKw: [], category: 'electrical', priority: 63 },
  { id: 'elec_socket', keywords: ['فيش'], negKw: [], category: 'electrical', priority: 60 },

  // Arabic Aliases for Plumbing
  { id: 'plumb_fixtures', keywords: ['مغسلة'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_fixtures', keywords: ['حوض'], negKw: ['سباحة'], category: 'plumbing', priority: 64 },
  { id: 'plumb_fixtures', keywords: ['كرسي', 'إفرنجي'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_fixtures', keywords: ['كرسي', 'عربي'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'plumb_fixtures', keywords: ['شطاف'], negKw: [], category: 'plumbing', priority: 62 },

  // Staircase
  { id: 'staircase', keywords: ['درج', 'رخام'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'staircase', keywords: ['staircase'], negKw: [], category: 'finishes', priority: 64 },
  { id: 'handrail', keywords: ['درابزين'], negKw: [], category: 'metalwork', priority: 66 },
  { id: 'handrail', keywords: ['handrail'], negKw: [], category: 'metalwork', priority: 64 },
  { id: 'handrail', keywords: ['railing'], negKw: [], category: 'metalwork', priority: 62 },

  // Expansion Joints
  { id: 'expansion_joint', keywords: ['فاصل', 'تمدد'], negKw: [], category: 'concrete', priority: 66 },
  { id: 'expansion_joint', keywords: ['expansion', 'joint'], negKw: [], category: 'concrete', priority: 64 },

  // Misc
  { id: 'sealant', keywords: ['سيليكون'], negKw: [], category: 'finishes', priority: 55 },
  { id: 'sealant', keywords: ['sealant'], negKw: [], category: 'finishes', priority: 53 },

  // ═══════════════════════════════════════════════════════════════════
  // V9.0 — MAINTENANCE & RENOVATION RULES (50 قاعدة جديدة)
  // ═══════════════════════════════════════════════════════════════════

  // ═══ إزالة وفك (Removal/Demolition) ═══
  { id: 'remove_tiles', keywords: ['إزالة', 'بلاط'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'remove_tiles', keywords: ['فك', 'بلاط'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'remove_tiles', keywords: ['remove', 'tiles'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'remove_paint', keywords: ['إزالة', 'دهان'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'remove_paint', keywords: ['scraping', 'paint'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'remove_plaster', keywords: ['إزالة', 'لياسة'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'remove_plaster', keywords: ['remove', 'plaster'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'remove_ceiling', keywords: ['إزالة', 'سقف'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'remove_ceiling', keywords: ['remove', 'ceiling'], negKw: [], category: 'finishes', priority: 66 },
  { id: 'remove_door', keywords: ['إزالة', 'باب'], negKw: [], category: 'doors', priority: 68 },
  { id: 'remove_door', keywords: ['remove', 'door'], negKw: [], category: 'doors', priority: 66 },
  { id: 'remove_window', keywords: ['إزالة', 'شباك'], negKw: [], category: 'windows', priority: 68 },
  { id: 'remove_window', keywords: ['remove', 'window'], negKw: [], category: 'windows', priority: 66 },
  { id: 'remove_sanitary', keywords: ['إزالة', 'أدوات صحية'], negKw: [], category: 'plumbing', priority: 66 },

  // ═══ ترميم وإصلاح (Repair/Rehabilitation) ═══
  { id: 'repair_concrete', keywords: ['ترميم', 'خرسانة'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'repair_concrete', keywords: ['repair', 'concrete'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'repair_crack', keywords: ['معالجة', 'شروخ'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'repair_crack', keywords: ['crack', 'repair'], negKw: [], category: 'concrete', priority: 70 },
  { id: 'repair_plaster', keywords: ['ترميم', 'لياسة'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'repair_plaster', keywords: ['patch', 'plaster'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'repair_wp', keywords: ['إصلاح', 'عزل'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'repair_wp', keywords: ['repair', 'waterproof'], negKw: [], category: 'finishes', priority: 68 },
  { id: 'repair_pipe', keywords: ['إصلاح', 'مواسير'], negKw: [], category: 'plumbing', priority: 68 },
  { id: 'repair_pipe', keywords: ['repair', 'pipe'], negKw: [], category: 'plumbing', priority: 66 },
  { id: 'repair_elec', keywords: ['إصلاح', 'كهرب'], negKw: [], category: 'electrical', priority: 66 },

  // ═══ تجديد (Renovation) ═══
  { id: 'reno_floor', keywords: ['تجديد', 'أرضيات'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'reno_floor', keywords: ['renovate', 'floor'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'reno_bathroom', keywords: ['تجديد', 'حمام'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'reno_bathroom', keywords: ['renovate', 'bathroom'], negKw: [], category: 'finishes', priority: 70 },
  { id: 'reno_kitchen', keywords: ['تجديد', 'مطبخ'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'reno_facade', keywords: ['تجديد', 'واجهة'], negKw: [], category: 'finishes', priority: 72 },
  { id: 'reno_facade', keywords: ['facade', 'renovation'], negKw: [], category: 'finishes', priority: 70 },

  // ═══ تقوية إنشائية (Structural Strengthening) ═══
  { id: 'strengthen_carbon', keywords: ['تقوية', 'كربون'], negKw: [], category: 'concrete', priority: 76 },
  { id: 'strengthen_carbon', keywords: ['carbon', 'fiber', 'strengthening'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'strengthen_frp', keywords: ['frp'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'strengthen_jacketing', keywords: ['تكثيف', 'عمود'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'strengthen_jacketing', keywords: ['column', 'jacketing'], negKw: [], category: 'concrete', priority: 72 },
  { id: 'strengthen_epoxy_inject', keywords: ['حقن', 'إيبوكسي'], negKw: [], category: 'concrete', priority: 74 },
  { id: 'strengthen_epoxy_inject', keywords: ['epoxy', 'injection'], negKw: [], category: 'concrete', priority: 72 },

  // ═══ تنظيف وغسيل (Cleaning) ═══
  { id: 'cleaning_facade', keywords: ['غسيل', 'واجهة'], negKw: [], category: 'external', priority: 55 },
  { id: 'cleaning_facade', keywords: ['facade', 'cleaning'], negKw: [], category: 'external', priority: 53 },
  { id: 'cleaning_tank', keywords: ['تنظيف', 'خزان'], negKw: [], category: 'plumbing', priority: 55 },
  { id: 'cleaning_general', keywords: ['تنظيف', 'عام'], negKw: [], category: 'external', priority: 50 },
  { id: 'cleaning_general', keywords: ['general', 'cleaning'], negKw: [], category: 'external', priority: 48 },

  // ═══ فحص واختبار (Testing/Inspection) ═══
  { id: 'test_concrete', keywords: ['فحص', 'خرسانة'], negKw: [], category: 'concrete', priority: 60 },
  { id: 'test_concrete', keywords: ['concrete', 'test'], negKw: [], category: 'concrete', priority: 58 },
  { id: 'test_soil', keywords: ['فحص', 'تربة'], negKw: [], category: 'earthworks', priority: 60 },
  { id: 'test_soil', keywords: ['soil', 'test'], negKw: [], category: 'earthworks', priority: 58 },
  { id: 'test_load', keywords: ['اختبار', 'تحميل'], negKw: [], category: 'concrete', priority: 62 },
  { id: 'test_load', keywords: ['load', 'test'], negKw: [], category: 'concrete', priority: 60 },

].sort((a, b) => b.priority - a.priority);

/**
 * Classify a BOQ item description and return matching rate
 * V8.3: Supports multilingual input via canonical normalization fallback
 */
export function classifyItem(description: string, canonicalDesc?: string): ClassificationResult {
  const text = description.toLowerCase().trim();

  // Pass 1: Try matching with original text (existing AR/EN rules)
  for (const rule of RULES) {
    const allMatch = rule.keywords.every(kw => text.includes(kw.toLowerCase()));
    if (!allMatch) continue;

    const anyNeg = rule.negKw.some(nk => text.includes(nk.toLowerCase()));
    if (anyNeg) continue;

    const rateEntry = BENCHMARK_RATES[rule.id];
    return {
      matched: true,
      ruleId: rule.id,
      category: rule.category,
      priority: rule.priority,
      baseRate: rateEntry?.rate ?? 0,
      unit: rateEntry?.unit ?? 'غير محدد',
    };
  }

  // Pass 2: Try matching with canonical (English) form from multilingual dictionary
  if (canonicalDesc) {
    const canonText = canonicalDesc.toLowerCase().trim();
    if (canonText !== text) {
      for (const rule of RULES) {
        const allMatch = rule.keywords.every(kw => canonText.includes(kw.toLowerCase()));
        if (!allMatch) continue;

        const anyNeg = rule.negKw.some(nk => canonText.includes(nk.toLowerCase()));
        if (anyNeg) continue;

        const rateEntry = BENCHMARK_RATES[rule.id];
        return {
          matched: true,
          ruleId: rule.id,
          category: rule.category,
          priority: rule.priority,
          baseRate: rateEntry?.rate ?? 0,
          unit: rateEntry?.unit ?? 'غير محدد',
        };
      }
    }
  }

  return {
    matched: false,
    ruleId: null,
    category: 'unclassified',
    priority: 0,
    baseRate: 0,
    unit: 'غير محدد',
  };
}

/** Get total rule count */
export function getRuleCount(): number {
  return RULES.length;
}
