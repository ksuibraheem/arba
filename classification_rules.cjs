/**
 * ARBA Engine V8.1
 * Module: Classification Rules (الوكيل A الحقيقي — محرك التصنيف)
 * 
 * Extracted & cleaned from adf_pricer.cjs (150+ rules)
 * Each rule: { keywords[], negativeKeywords[], rateKey, category, priority }
 * Higher priority = checked first (most specific wins)
 */

const fs = require('fs');
const path = require('path');

class ClassificationEngine {
    constructor() {
        // Load benchmark rates
        try {
            const bPath = path.join(__dirname, 'data', 'market_benchmark.json');
            const raw = JSON.parse(fs.readFileSync(bPath, 'utf-8'));
            this.rates = raw.rates || {};
        } catch (e) {
            console.warn('[ClassificationEngine] No benchmark file found.');
            this.rates = {};
        }

        // Classification rules (ordered by priority: highest first)
        this.rules = [
            // ══════════ PRIORITY 1: Masonry / Block (check FIRST) ══════════
            { id: 'block_20_parapet', keywords: ['بلوك', '20', 'سترة'], negKw: [], category: 'masonry', priority: 100 },
            { id: 'block_20_parapet', keywords: ['بلوك', '20', 'درورة'], negKw: [], category: 'masonry', priority: 100 },
            { id: 'block_20_ext', keywords: ['بلوك', '20'], negKw: [], category: 'masonry', priority: 95 },
            { id: 'block_15_int', keywords: ['بلوك', '15'], negKw: [], category: 'masonry', priority: 95 },
            { id: 'block_15_int', keywords: ['بلك'], negKw: [], category: 'masonry', priority: 90 },
            { id: 'block_20_ext', keywords: ['بلوك'], negKw: [], category: 'masonry', priority: 85 },

            // ══════════ PRIORITY 2: Plaster ══════════
            { id: 'plaster_ext', keywords: ['لياسة', 'خارج'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'plaster_ceiling', keywords: ['لياسة', 'أسقف'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'plaster_ceiling', keywords: ['لياسة', 'سقف'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'plaster_int', keywords: ['لياسة'], negKw: [], category: 'finishes', priority: 75 },

            // ══════════ PRIORITY 3: Paint ══════════
            { id: 'paint_epoxy', keywords: ['دهان', 'إيبوكسي'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'paint_epoxy', keywords: ['دهان', 'ايبوكسي'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'paint_epoxy', keywords: ['طلاء', 'إيبوكسي'], negKw: [], category: 'finishes', priority: 80 },
            { id: 'paint_ceiling', keywords: ['دهان', 'أسقف'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'paint_ext', keywords: ['دهان', 'خارج'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'paint_ext', keywords: ['دهان', 'اكريليك'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'paint_int', keywords: ['دهان'], negKw: [], category: 'finishes', priority: 70 },
            { id: 'paint_int', keywords: ['طلاء'], negKw: [], category: 'finishes', priority: 70 },

            // ══════════ PRIORITY 4: Flooring ══════════
            { id: 'porcelain_60', keywords: ['بورسلان'], negKw: ['جدار', 'حائط'], category: 'finishes', priority: 75 },
            { id: 'porcelain_wall', keywords: ['بورسلان', 'جدار'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'porcelain_wall', keywords: ['بورسلان', 'حائط'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'ceramic_wall', keywords: ['سيراميك'], negKw: [], category: 'finishes', priority: 72 },
            { id: 'marble_stair', keywords: ['رخام', 'درج'], negKw: [], category: 'finishes', priority: 78 },
            { id: 'marble_floor', keywords: ['رخام'], negKw: [], category: 'finishes', priority: 72 },
            { id: 'granite_counter', keywords: ['جرانيت'], negKw: [], category: 'finishes', priority: 72 },
            { id: 'stone_riyadh', keywords: ['حجر'], negKw: [], category: 'finishes', priority: 72 },

            // ══════════ PRIORITY 5: Structural Concrete ══════════
            { id: 'blinding', keywords: ['خرسانة عادية'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'blinding', keywords: ['نظافة'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'rc_footing', keywords: ['قواعد'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_tiebeam', keywords: ['ميد'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_tiebeam', keywords: ['ميدات'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_sog', keywords: ['بلاطة أرضية'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_sog', keywords: ['بلاطات أرضية'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_neck', keywords: ['رقاب'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_column', keywords: ['أعمدة'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_column', keywords: ['حوائط خرسان'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_slab_solid', keywords: ['بلاطات مصمتة'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_stair', keywords: ['سلالم'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_hordi', keywords: ['هوردي'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_hordi', keywords: ['جسور'], negKw: [], category: 'concrete', priority: 60 },

            // ══════════ Earthworks ══════════
            { id: 'excavation', keywords: ['حفر'], negKw: [], category: 'earthworks', priority: 55 },
            { id: 'backfill', keywords: ['ردم'], negKw: [], category: 'earthworks', priority: 55 },
            { id: 'termite', keywords: ['نمل'], negKw: [], category: 'earthworks', priority: 55 },

            // ══════════ Gypsum ══════════
            { id: 'gypsum_cornice', keywords: ['كرانيش'], negKw: [], category: 'finishes', priority: 65 },
            { id: 'gypsum_cornice', keywords: ['مقرنص'], negKw: [], category: 'finishes', priority: 65 },
            { id: 'gypsum_board', keywords: ['جبس بورد'], negKw: [], category: 'finishes', priority: 62 },
            { id: 'gypsum_tile', keywords: ['جبس'], negKw: [], category: 'finishes', priority: 58 },

            // ══════════ Doors ══════════
            { id: 'door_fire', keywords: ['باب', 'حريق'], negKw: [], category: 'doors', priority: 80 },
            { id: 'door_glass', keywords: ['باب', 'زجاج', 'أتوماتيك'], negKw: [], category: 'doors', priority: 78 },
            { id: 'door_glass', keywords: ['باب', 'زجاج'], negKw: [], category: 'doors', priority: 75 },
            { id: 'door_steel', keywords: ['باب', 'حديد'], negKw: [], category: 'doors', priority: 72 },
            { id: 'door_alum', keywords: ['باب', 'ألمنيوم'], negKw: [], category: 'doors', priority: 72 },
            { id: 'door_wood', keywords: ['باب'], negKw: [], category: 'doors', priority: 60 },

            // ══════════ Windows ══════════
            { id: 'window_alum', keywords: ['شباك'], negKw: [], category: 'windows', priority: 60 },
            { id: 'window_alum', keywords: ['نافذ'], negKw: [], category: 'windows', priority: 60 },
            { id: 'curtain_wall', keywords: ['كرتن'], negKw: [], category: 'windows', priority: 65 },

            // ══════════ Electrical ══════════
            { id: 'elec_genset', keywords: ['مولد'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_transformer', keywords: ['محول'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_panel', keywords: ['لوحة', 'كهرب'], negKw: [], category: 'electrical', priority: 68 },
            { id: 'elec_light_led', keywords: ['إنارة'], negKw: ['طوارئ'], category: 'electrical', priority: 60 },
            { id: 'elec_light_led', keywords: ['إضاءة'], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_outlet', keywords: ['بريزة'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_outlet', keywords: ['مأخذ'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_switch', keywords: ['مفتاح'], negKw: [], category: 'electrical', priority: 58 },

            // ══════════ HVAC ══════════
            { id: 'ac_split', keywords: ['سبلت'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_split', keywords: ['split'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_duct', keywords: ['دكت'], negKw: [], category: 'hvac', priority: 62 },
            { id: 'ac_diffuser', keywords: ['ناشر'], negKw: [], category: 'hvac', priority: 60 },

            // ══════════ Plumbing ══════════
            { id: 'plumb_wc', keywords: ['مرحاض'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['حوض غسيل'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['مغسلة'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_heater_50', keywords: ['سخان'], negKw: [], category: 'plumbing', priority: 62 },

            // ══════════ Fire ══════════
            { id: 'fire_ext_6', keywords: ['طفاي'], negKw: [], category: 'fire', priority: 60 },
            { id: 'fire_hose_cab', keywords: ['خرطوم حريق'], negKw: [], category: 'fire', priority: 62 },

            // ══════════ Landscape / External ══════════
            { id: 'landscape_asphalt', keywords: ['إسفلت'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscape_asphalt', keywords: ['أسفلت'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscape_paving', keywords: ['رصف'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscape_paving', keywords: ['إنترلوك'], negKw: [], category: 'external', priority: 55 },

            // ══════════ Elevator ══════════
            { id: 'elevator', keywords: ['مصعد'], negKw: [], category: 'mep', priority: 70 },

            // ════════════════════════════════════════════════════════
            // ENGLISH RULES (for international BOQs like RE Farm)
            // ════════════════════════════════════════════════════════

            // ── Plumbing (Sanitary Fixtures) ──
            { id: 'plumb_wc', keywords: ['wc'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_wc', keywords: ['water closet'], negKw: [], category: 'plumbing', priority: 68 },
            { id: 'plumb_wc', keywords: ['toilet'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['wash basin'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['lavatory'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['sink'], negKw: ['kitchen'], category: 'plumbing', priority: 62 },
            { id: 'plumb_basin', keywords: ['kitchen sink'], negKw: [], category: 'plumbing', priority: 68 },
            { id: 'plumb_floor_drain', keywords: ['floor drain'], negKw: [], category: 'plumbing', priority: 60 },
            { id: 'plumb_heater_50', keywords: ['water heater'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_heater_50', keywords: ['shower'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_valve', keywords: ['valve'], negKw: ['fire'], category: 'plumbing', priority: 55 },
            { id: 'plumb_pump', keywords: ['pump'], negKw: ['fire', 'concrete'], category: 'plumbing', priority: 60 },
            { id: 'plumb_tank_gnd', keywords: ['water tank'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_manhole', keywords: ['manhole'], negKw: [], category: 'plumbing', priority: 60 },
            { id: 'plumb_septic', keywords: ['septic'], negKw: [], category: 'plumbing', priority: 62 },

            // ── Plumbing (Pipes) ──
            { id: 'plumb_ppr_25', keywords: ['ppr', '25'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_ppr_32', keywords: ['ppr', '32'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_ppr_50', keywords: ['ppr', '50'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_pipe_110', keywords: ['upvc', '110'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_pipe_75', keywords: ['upvc', '75'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_pipe_50', keywords: ['upvc', '50'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_ppr_25', keywords: ['pipe', '20 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_ppr_25', keywords: ['pipe', '25 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_ppr_32', keywords: ['pipe', '32 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_ppr_50', keywords: ['pipe', '50 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_pipe_75', keywords: ['pipe', '75 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_pipe_110', keywords: ['pipe', '110 mm'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_pipe_75', keywords: ['dia'], negKw: ['cable'], category: 'plumbing', priority: 40 },

            // ── Electrical ──
            { id: 'elec_panel', keywords: ['mdb'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_panel', keywords: ['smdb'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_panel', keywords: ['distribution panel'], negKw: [], category: 'electrical', priority: 68 },
            { id: 'elec_panel', keywords: ['dp '], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_panel', keywords: ['panel'], negKw: ['solar'], category: 'electrical', priority: 55 },
            { id: 'elec_cable_tray', keywords: ['cable tray'], negKw: [], category: 'electrical', priority: 62 },
            { id: 'elec_conduit', keywords: ['conduit'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_wire', keywords: ['cable'], negKw: ['tray'], category: 'electrical', priority: 55 },
            { id: 'elec_outlet', keywords: ['outlet'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_outlet', keywords: ['socket'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_switch', keywords: ['switch'], negKw: ['ats', 'transfer'], category: 'electrical', priority: 55 },
            { id: 'elec_light_led', keywords: ['light'], negKw: ['emergency', 'exit'], category: 'electrical', priority: 55 },
            { id: 'elec_light_led', keywords: ['luminaire'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_light_led', keywords: ['led'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_light_emrg', keywords: ['emergency light'], negKw: [], category: 'electrical', priority: 62 },
            { id: 'elec_earthing', keywords: ['earthing'], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_earthing', keywords: ['grounding'], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_ups', keywords: ['ups'], negKw: [], category: 'electrical', priority: 65 },
            { id: 'elec_genset', keywords: ['generator'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_transformer', keywords: ['transformer'], negKw: [], category: 'electrical', priority: 70 },
            { id: 'elec_ats', keywords: ['ats'], negKw: [], category: 'electrical', priority: 65 },
            { id: 'elec_ats', keywords: ['transfer switch'], negKw: [], category: 'electrical', priority: 65 },
            { id: 'elec_cctv_cam', keywords: ['cctv'], negKw: [], category: 'electrical', priority: 62 },
            { id: 'elec_cctv_cam', keywords: ['camera'], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_access', keywords: ['access control'], negKw: [], category: 'electrical', priority: 62 },
            { id: 'elec_intercom', keywords: ['intercom'], negKw: [], category: 'electrical', priority: 60 },
            { id: 'elec_data_point', keywords: ['data point'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_data_point', keywords: ['data outlet'], negKw: [], category: 'electrical', priority: 58 },

            // ── HVAC (English) ──
            { id: 'ac_split', keywords: ['split unit'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_split', keywords: ['split ac'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_package', keywords: ['package unit'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_vrf', keywords: ['vrf'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_vrf', keywords: ['vrv'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_fcu', keywords: ['fcu'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_ahu', keywords: ['ahu'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_duct', keywords: ['duct'], negKw: [], category: 'hvac', priority: 60 },
            { id: 'ac_diffuser', keywords: ['diffuser'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_damper', keywords: ['damper'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_thermostat', keywords: ['thermostat'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_exhaust', keywords: ['exhaust fan'], negKw: [], category: 'hvac', priority: 60 },
            { id: 'ac_fresh', keywords: ['fresh air'], negKw: [], category: 'hvac', priority: 60 },
            { id: 'ac_insul', keywords: ['insulation', 'duct'], negKw: [], category: 'hvac', priority: 55 },

            // ── Fire (English) ──
            { id: 'fire_ext_6', keywords: ['fire extinguisher'], negKw: [], category: 'fire', priority: 62 },
            { id: 'fire_hose_cab', keywords: ['hose cabinet'], negKw: [], category: 'fire', priority: 64 },
            { id: 'fire_hose_cab', keywords: ['hose reel'], negKw: [], category: 'fire', priority: 64 },
            { id: 'fire_pump_sys', keywords: ['fire pump'], negKw: [], category: 'fire', priority: 68 },
            { id: 'fire_auto', keywords: ['sprinkler'], negKw: [], category: 'fire', priority: 65 },
            { id: 'fire_auto', keywords: ['fire alarm'], negKw: [], category: 'fire', priority: 65 },
            { id: 'fire_pipe_4', keywords: ['fire', 'pipe'], negKw: [], category: 'fire', priority: 55 },

            // ── Concrete (English) ──
            { id: 'blinding', keywords: ['lean concrete'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'blinding', keywords: ['blinding'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'rc_footing', keywords: ['footing'], negKw: [], category: 'concrete', priority: 62 },
            { id: 'rc_footing', keywords: ['foundation'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_tiebeam', keywords: ['tie beam'], negKw: [], category: 'concrete', priority: 62 },
            { id: 'rc_tiebeam', keywords: ['grade beam'], negKw: [], category: 'concrete', priority: 62 },
            { id: 'rc_sog', keywords: ['slab on grade'], negKw: [], category: 'concrete', priority: 62 },
            { id: 'rc_column', keywords: ['column'], negKw: [], category: 'concrete', priority: 58 },
            { id: 'rc_slab_solid', keywords: ['slab'], negKw: ['grade'], category: 'concrete', priority: 55 },
            { id: 'rc_stair', keywords: ['stair'], negKw: [], category: 'concrete', priority: 58 },
            { id: 'rc_hordi', keywords: ['rib slab'], negKw: [], category: 'concrete', priority: 60 },
            { id: 'rc_hordi', keywords: ['post tension'], negKw: [], category: 'concrete', priority: 60 },

            // ── Masonry (English) ──
            { id: 'block_20_ext', keywords: ['block', '200'], negKw: [], category: 'masonry', priority: 70 },
            { id: 'block_15_int', keywords: ['block', '150'], negKw: [], category: 'masonry', priority: 70 },
            { id: 'block_20_ext', keywords: ['masonry'], negKw: [], category: 'masonry', priority: 55 },
            { id: 'block_20_ext', keywords: ['blockwork'], negKw: [], category: 'masonry', priority: 60 },

            // ── Doors & Windows (English) ──
            { id: 'door_fire', keywords: ['fire door'], negKw: [], category: 'doors', priority: 78 },
            { id: 'door_fire', keywords: ['fire rated door'], negKw: [], category: 'doors', priority: 80 },
            { id: 'door_wood', keywords: ['wooden door'], negKw: [], category: 'doors', priority: 62 },
            { id: 'door_steel', keywords: ['steel door'], negKw: [], category: 'doors', priority: 65 },
            { id: 'door_glass', keywords: ['glass door'], negKw: [], category: 'doors', priority: 68 },
            { id: 'door_alum', keywords: ['aluminium door'], negKw: [], category: 'doors', priority: 65 },
            { id: 'door_alum', keywords: ['aluminum door'], negKw: [], category: 'doors', priority: 65 },
            { id: 'window_alum', keywords: ['window'], negKw: [], category: 'windows', priority: 55 },
            { id: 'curtain_wall', keywords: ['curtain wall'], negKw: [], category: 'windows', priority: 65 },

            // ── Finishes (English) ──
            { id: 'paint_int', keywords: ['paint'], negKw: ['epoxy', 'exterior'], category: 'finishes', priority: 55 },
            { id: 'paint_epoxy', keywords: ['epoxy'], negKw: [], category: 'finishes', priority: 65 },
            { id: 'plaster_int', keywords: ['plaster'], negKw: [], category: 'finishes', priority: 55 },
            { id: 'porcelain_60', keywords: ['porcelain'], negKw: [], category: 'finishes', priority: 58 },
            { id: 'ceramic_wall', keywords: ['ceramic'], negKw: [], category: 'finishes', priority: 55 },
            { id: 'marble_floor', keywords: ['marble'], negKw: [], category: 'finishes', priority: 58 },
            { id: 'granite_counter', keywords: ['granite'], negKw: [], category: 'finishes', priority: 58 },
            { id: 'gypsum_board', keywords: ['gypsum board'], negKw: [], category: 'finishes', priority: 60 },
            { id: 'gypsum_board', keywords: ['drywall'], negKw: [], category: 'finishes', priority: 58 },

            // ── Landscape (English) ──
            { id: 'landscape_asphalt', keywords: ['asphalt'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscape_paving', keywords: ['paving'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscape_paving', keywords: ['interlock'], negKw: [], category: 'external', priority: 55 },

            // ── Elevator (English) ──
            { id: 'elevator', keywords: ['elevator'], negKw: [], category: 'mep', priority: 70 },
            { id: 'elevator', keywords: ['lift'], negKw: [], category: 'mep', priority: 65 },

            // ── Earthworks (English) ──
            { id: 'excavation', keywords: ['excavat'], negKw: [], category: 'earthworks', priority: 55 },
            { id: 'backfill', keywords: ['backfill'], negKw: [], category: 'earthworks', priority: 55 },
            { id: 'termite', keywords: ['termite'], negKw: [], category: 'earthworks', priority: 55 },

            // ── General (English) ──
            { id: 'rc_footing', keywords: ['concrete'], negKw: ['block', 'precast'], category: 'concrete', priority: 45 },
            { id: 'plumb_pipe_75', keywords: ['supply, installation, testing'], negKw: ['electric', 'cable', 'panel', 'light', 'mdb', 'smdb'], category: 'plumbing', priority: 35 },

            // ════════════════════════════════════════════════════════
            // MEP-SPECIFIC RULES (RE Farm BOQ patterns)
            // ════════════════════════════════════════════════════════

            // ── Pipe Diameters (standalone "XX mm dia") ──
            { id: 'plumb_ppr_25', keywords: ['20 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_25', keywords: ['25 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_32', keywords: ['32 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_32', keywords: ['40 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_50', keywords: ['50 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_pipe_75', keywords: ['63 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_pipe_75', keywords: ['75 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_pipe_75', keywords: ['80 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_pipe_110', keywords: ['100 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_pipe_110', keywords: ['110 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_25', keywords: ['15 mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 50 },
            { id: 'plumb_ppr_25', keywords: ['mm dia'], negKw: ['cable', 'conduit'], category: 'plumbing', priority: 38 },

            // ── Sanitary Fixtures (long English descriptions) ──
            { id: 'plumb_basin', keywords: ['lavatories'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_basin', keywords: ['lavatory'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_wc', keywords: ['water closet'], negKw: [], category: 'plumbing', priority: 68 },
            { id: 'plumb_basin', keywords: ['kitchen sink'], negKw: [], category: 'plumbing', priority: 68 },
            { id: 'plumb_heater_50', keywords: ['shower head'], negKw: [], category: 'plumbing', priority: 62 },
            { id: 'plumb_heater_50', keywords: ['bath tub'], negKw: [], category: 'plumbing', priority: 62 },
            { id: 'plumb_heater_50', keywords: ['bathtub'], negKw: [], category: 'plumbing', priority: 62 },
            { id: 'plumb_valve', keywords: ['hand spray'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_valve', keywords: ['ablution'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_valve', keywords: ['non return valve'], negKw: [], category: 'plumbing', priority: 58 },
            { id: 'plumb_valve', keywords: ['hose bibb'], negKw: [], category: 'plumbing', priority: 55 },
            { id: 'plumb_floor_drain', keywords: ['trench drain'], negKw: [], category: 'plumbing', priority: 60 },

            // ── Pumps ──
            { id: 'plumb_pump', keywords: ['booster pump'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_pump', keywords: ['circulating pump'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_pump', keywords: ['sump pump'], negKw: [], category: 'plumbing', priority: 65 },
            { id: 'plumb_pump', keywords: ['duplex'], negKw: [], category: 'plumbing', priority: 55 },

            // ── Water Heaters ──
            { id: 'plumb_heater_50', keywords: ['ewh'], negKw: [], category: 'plumbing', priority: 60 },
            { id: 'plumb_heater_50', keywords: ['c-ewh'], negKw: [], category: 'plumbing', priority: 62 },
            { id: 'plumb_heater_50', keywords: ['gallon'], negKw: [], category: 'plumbing', priority: 50 },

            // ── VRF/VRV Systems (LG Multi-V codes) ──
            { id: 'ac_vrf', keywords: ['multi-v'], negKw: [], category: 'hvac', priority: 70 },
            { id: 'ac_vrf', keywords: ['outdoor unit'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_vrf', keywords: ['indoor unit'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_vrf', keywords: ['grun'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_vrf', keywords: ['grnu'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_vrf', keywords: ['arnu'], negKw: [], category: 'hvac', priority: 68 },
            { id: 'ac_vrf', keywords: ['ceiling concealed'], negKw: [], category: 'hvac', priority: 65 },
            { id: 'ac_vrf', keywords: ['y branch'], negKw: [], category: 'hvac', priority: 55 },
            { id: 'ac_vrf', keywords: ['remote controller'], negKw: [], category: 'hvac', priority: 55 },
            { id: 'ac_vrf', keywords: ['central controller'], negKw: [], category: 'hvac', priority: 55 },
            { id: 'ac_vrf', keywords: ['ac smart'], negKw: [], category: 'hvac', priority: 55 },

            // ── Exhaust Fans (EF-XX codes) ──
            { id: 'ac_exhaust', keywords: ['ef-'], negKw: [], category: 'hvac', priority: 55 },
            { id: 'ac_fresh', keywords: ['faf-'], negKw: [], category: 'hvac', priority: 55 },

            // ── Duct Types ──
            { id: 'ac_duct', keywords: ['supply', 'return', 'air duct'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_duct', keywords: ['exhaust air duct'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_duct', keywords: ['fresh air duct'], negKw: [], category: 'hvac', priority: 58 },
            { id: 'ac_duct', keywords: ['air flow'], negKw: [], category: 'hvac', priority: 52 },

            // ── Diffusers & Grilles (codes) ──
            { id: 'ac_diffuser', keywords: ['sd-'], negKw: [], category: 'hvac', priority: 50 },
            { id: 'ac_diffuser', keywords: ['rd-'], negKw: [], category: 'hvac', priority: 50 },
            { id: 'ac_diffuser', keywords: ['sld-'], negKw: [], category: 'hvac', priority: 50 },
            { id: 'ac_diffuser', keywords: ['rld-'], negKw: [], category: 'hvac', priority: 50 },
            { id: 'ac_diffuser', keywords: ['eld-'], negKw: [], category: 'hvac', priority: 50 },
            { id: 'ac_diffuser', keywords: ['sag'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_diffuser', keywords: ['rag'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_damper', keywords: ['dv-'], negKw: [], category: 'hvac', priority: 50 },

            // ── Refrigerant Piping (fractions like 3/8", 1/2") ──
            { id: 'ac_vrf', keywords: ['3/8"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['1/2"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['5/8"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['3/4"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['1/4"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['7/8"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['1 1/8"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['1 3/8"'], negKw: [], category: 'hvac', priority: 48 },
            { id: 'ac_vrf', keywords: ['1 5/8"'], negKw: [], category: 'hvac', priority: 48 },

            // ════════════════════════════════════════════════════════
            // ELECTRICAL CABLES & ACCESSORIES (RE Farm Elec BOQ)
            // ════════════════════════════════════════════════════════

            // ── Power Cables (CU/XLPE/PVC) ──
            { id: 'elec_wire', keywords: ['xlpe'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_wire', keywords: ['cu.'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_wire', keywords: ['mm2'], negKw: ['tray'], category: 'electrical', priority: 50 },
            { id: 'elec_wire', keywords: ['cx'], negKw: [], category: 'electrical', priority: 48 },

            // ── Cable Trays ──
            { id: 'elec_cable_tray', keywords: ['mm*', 'thickness'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_cable_tray', keywords: ['tray'], negKw: [], category: 'electrical', priority: 52 },

            // ── Circuit Breakers ──
            { id: 'elec_breaker', keywords: ['1-ph'], negKw: [], category: 'electrical', priority: 52 },
            { id: 'elec_breaker', keywords: ['3-ph'], negKw: [], category: 'electrical', priority: 52 },
            { id: 'elec_breaker', keywords: ['mccb'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_breaker', keywords: ['mcb'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_breaker', keywords: ['rccb'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_breaker', keywords: ['230v'], negKw: [], category: 'electrical', priority: 45 },
            { id: 'elec_breaker', keywords: ['400v'], negKw: [], category: 'electrical', priority: 45 },

            // ── Conduit & Accessories ──
            { id: 'elec_conduit', keywords: ['pvc', 'mm'], negKw: ['pipe', 'drain'], category: 'electrical', priority: 45 },
            { id: 'elec_conduit', keywords: ['gi'], negKw: ['pipe'], category: 'electrical', priority: 42 },

            // ── Wiring Accessories ──
            { id: 'elec_outlet', keywords: ['13a'], negKw: [], category: 'electrical', priority: 50 },
            { id: 'elec_outlet', keywords: ['15a'], negKw: [], category: 'electrical', priority: 50 },
            { id: 'elec_outlet', keywords: ['20a'], negKw: [], category: 'electrical', priority: 48 },
            { id: 'elec_outlet', keywords: ['30a'], negKw: [], category: 'electrical', priority: 48 },

            // ── Low Current Systems ──
            { id: 'elec_data_point', keywords: ['cat6'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_data_point', keywords: ['fiber'], negKw: ['glass'], category: 'electrical', priority: 55 },
            { id: 'elec_data_point', keywords: ['rj45'], negKw: [], category: 'electrical', priority: 55 },

            // ════════════════════════════════════════════════════════
            // LIGHTING FIXTURES (TYPE-L codes from RE Farm)
            // ════════════════════════════════════════════════════════
            { id: 'elec_light', keywords: ['type-l'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_light', keywords: ['type-f'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_light', keywords: ['led strip'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_light', keywords: ['chandelier'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_light', keywords: ['downlight'], negKw: [], category: 'electrical', priority: 55 },
            { id: 'elec_light', keywords: ['spotlight'], negKw: [], category: 'electrical', priority: 55 },

            // ════════════════════════════════════════════════════════
            // FIRE ALARM SYSTEM
            // ════════════════════════════════════════════════════════
            { id: 'fire_alarm', keywords: ['facp'], negKw: [], category: 'fire', priority: 65 },
            { id: 'fire_alarm', keywords: ['smoke detector'], negKw: [], category: 'fire', priority: 62 },
            { id: 'fire_alarm', keywords: ['heat detector'], negKw: [], category: 'fire', priority: 62 },
            { id: 'fire_alarm', keywords: ['manual station'], negKw: [], category: 'fire', priority: 60 },
            { id: 'fire_alarm', keywords: ['sounder'], negKw: [], category: 'fire', priority: 58 },
            { id: 'fire_alarm', keywords: ['monitor module'], negKw: [], category: 'fire', priority: 58 },
            { id: 'fire_alarm', keywords: ['addressable'], negKw: [], category: 'fire', priority: 52 },

            // ════════════════════════════════════════════════════════
            // PA / SOUND / LOW CURRENT SYSTEMS
            // ════════════════════════════════════════════════════════
            { id: 'elec_pa', keywords: ['public address'], negKw: [], category: 'electrical', priority: 58 },
            { id: 'elec_pa', keywords: ['speaker'], negKw: [], category: 'electrical', priority: 52 },
            { id: 'elec_pa', keywords: ['microphone'], negKw: [], category: 'electrical', priority: 52 },
            { id: 'elec_pa', keywords: ['idt'], negKw: [], category: 'electrical', priority: 48 },
            { id: 'elec_cctv_cam', keywords: ['work station'], negKw: [], category: 'electrical', priority: 52 },
            { id: 'elec_cctv_cam', keywords: ['workstation'], negKw: [], category: 'electrical', priority: 52 },

            // ════════════════════════════════════════════════════════
            // V8.2 — WATERPROOFING & INSULATION (عزل مائي وحراري)
            // ════════════════════════════════════════════════════════
            { id: 'waterproofing', keywords: ['عزل مائي'], negKw: [], category: 'finishes', priority: 72 },
            { id: 'waterproofing', keywords: ['بيتوميني'], negKw: [], category: 'finishes', priority: 70 },
            { id: 'waterproofing', keywords: ['غشاء عزل'], negKw: [], category: 'finishes', priority: 70 },
            { id: 'waterproofing', keywords: ['waterproofing'], negKw: [], category: 'finishes', priority: 68 },
            { id: 'waterproofing', keywords: ['bitumen'], negKw: [], category: 'finishes', priority: 68 },
            { id: 'waterproofing', keywords: ['membrane'], negKw: ['duct'], category: 'finishes', priority: 65 },
            { id: 'thermal_insul', keywords: ['عزل حراري'], negKw: [], category: 'finishes', priority: 72 },
            { id: 'thermal_insul', keywords: ['بوليسترين'], negKw: [], category: 'finishes', priority: 68 },
            { id: 'thermal_insul', keywords: ['فوم عازل'], negKw: [], category: 'finishes', priority: 68 },
            { id: 'thermal_insul', keywords: ['thermal insulation'], negKw: [], category: 'finishes', priority: 66 },
            { id: 'thermal_insul', keywords: ['polystyrene'], negKw: [], category: 'finishes', priority: 66 },
            { id: 'thermal_insul', keywords: ['eps'], negKw: ['step'], category: 'finishes', priority: 60 },

            // ════════════════════════════════════════════════════════
            // V8.2 — REBAR & STEEL (حديد تسليح وهيكل حديد)
            // ════════════════════════════════════════════════════════
            { id: 'rebar', keywords: ['حديد تسليح'], negKw: [], category: 'concrete', priority: 75 },
            { id: 'rebar', keywords: ['تسليح'], negKw: ['خرسانة'], category: 'concrete', priority: 70 },
            { id: 'rebar', keywords: ['rebar'], negKw: [], category: 'concrete', priority: 68 },
            { id: 'rebar', keywords: ['reinforcement'], negKw: ['concrete'], category: 'concrete', priority: 65 },
            { id: 'rebar', keywords: ['steel bar'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'steel_struct', keywords: ['هيكل حديد'], negKw: [], category: 'structure', priority: 65 },
            { id: 'steel_struct', keywords: ['إنشاءات معدنية'], negKw: [], category: 'structure', priority: 65 },
            { id: 'steel_struct', keywords: ['steel structure'], negKw: [], category: 'structure', priority: 62 },
            { id: 'steel_struct', keywords: ['structural steel'], negKw: [], category: 'structure', priority: 62 },

            // ════════════════════════════════════════════════════════
            // V8.2 — PRECAST & SCREED (مسبقة الصب وسكريد)
            // ════════════════════════════════════════════════════════
            { id: 'precast', keywords: ['مسبقة الصب'], negKw: [], category: 'concrete', priority: 68 },
            { id: 'precast', keywords: ['بريكاست'], negKw: [], category: 'concrete', priority: 68 },
            { id: 'precast', keywords: ['precast'], negKw: [], category: 'concrete', priority: 66 },
            { id: 'precast', keywords: ['pre-cast'], negKw: [], category: 'concrete', priority: 66 },
            { id: 'precast', keywords: ['hollow core'], negKw: [], category: 'concrete', priority: 64 },
            { id: 'precast', keywords: ['hollowcore'], negKw: [], category: 'concrete', priority: 64 },
            { id: 'screed', keywords: ['سكريد'], negKw: [], category: 'finishes', priority: 65 },
            { id: 'screed', keywords: ['تسوية أرضية'], negKw: [], category: 'finishes', priority: 65 },
            { id: 'screed', keywords: ['screed'], negKw: [], category: 'finishes', priority: 62 },
            { id: 'screed', keywords: ['floor leveling'], negKw: [], category: 'finishes', priority: 60 },

            // ════════════════════════════════════════════════════════
            // V8.2 — CONCRETE BEAMS & TANKS (كمرات وخزانات)
            // ════════════════════════════════════════════════════════
            { id: 'rc_beam', keywords: ['كمرات'], negKw: [], category: 'concrete', priority: 72 },
            { id: 'rc_beam', keywords: ['الكمر'], negKw: [], category: 'concrete', priority: 72 },
            { id: 'rc_beam', keywords: ['beam'], negKw: ['light'], category: 'concrete', priority: 65 },
            { id: 'rc_beam', keywords: ['girder'], negKw: [], category: 'concrete', priority: 65 },
            { id: 'rc_tank', keywords: ['خزان مياه'], negKw: [], category: 'concrete', priority: 70 },
            { id: 'rc_tank', keywords: ['حمام سباحة'], negKw: [], category: 'concrete', priority: 70 },
            { id: 'rc_tank', keywords: ['water tank'], negKw: [], category: 'concrete', priority: 66 },
            { id: 'rc_tank', keywords: ['pool'], negKw: ['car'], category: 'concrete', priority: 64 },
            { id: 'rc_tank', keywords: ['cistern'], negKw: [], category: 'concrete', priority: 64 },

            // ════════════════════════════════════════════════════════
            // V8.2 — METALWORK (درابزين وأغطية)
            // ════════════════════════════════════════════════════════
            { id: 'handrail', keywords: ['درابزين'], negKw: [], category: 'metalwork', priority: 65 },
            { id: 'handrail', keywords: ['حماية درج'], negKw: [], category: 'metalwork', priority: 65 },
            { id: 'handrail', keywords: ['handrail'], negKw: [], category: 'metalwork', priority: 62 },
            { id: 'handrail', keywords: ['railing'], negKw: [], category: 'metalwork', priority: 60 },
            { id: 'handrail', keywords: ['balustrade'], negKw: [], category: 'metalwork', priority: 60 },
            { id: 'access_cover', keywords: ['أغطية مانهول'], negKw: [], category: 'external', priority: 62 },
            { id: 'access_cover', keywords: ['أغطية'], negKw: ['بلاستيك'], category: 'external', priority: 55 },
            { id: 'access_cover', keywords: ['manhole cover'], negKw: [], category: 'external', priority: 60 },
            { id: 'access_cover', keywords: ['access cover'], negKw: [], category: 'external', priority: 60 },

            // ════════════════════════════════════════════════════════
            // V8.2 — EXTERNAL (مظلات، برجولة، تنسيق، أسطح)
            // ════════════════════════════════════════════════════════
            { id: 'car_shade', keywords: ['مظلات'], negKw: [], category: 'external', priority: 62 },
            { id: 'car_shade', keywords: ['مظلة سيارات'], negKw: [], category: 'external', priority: 65 },
            { id: 'car_shade', keywords: ['car shade'], negKw: [], category: 'external', priority: 60 },
            { id: 'car_shade', keywords: ['canopy'], negKw: [], category: 'external', priority: 58 },
            { id: 'pergola', keywords: ['برجولة'], negKw: [], category: 'external', priority: 62 },
            { id: 'pergola', keywords: ['pergola'], negKw: [], category: 'external', priority: 60 },
            { id: 'landscaping', keywords: ['تنسيق حدائق'], negKw: [], category: 'external', priority: 60 },
            { id: 'landscaping', keywords: ['زراعة'], negKw: [], category: 'external', priority: 55 },
            { id: 'landscaping', keywords: ['landscaping'], negKw: [], category: 'external', priority: 58 },
            { id: 'landscaping', keywords: ['planting'], negKw: [], category: 'external', priority: 55 },
            { id: 'roof_system', keywords: ['تغطية أسطح'], negKw: [], category: 'finishes', priority: 62 },
            { id: 'roof_system', keywords: ['ساندوتش بانل'], negKw: [], category: 'finishes', priority: 62 },
            { id: 'roof_system', keywords: ['sandwich panel'], negKw: [], category: 'finishes', priority: 60 },
            { id: 'roof_system', keywords: ['roof system'], negKw: [], category: 'finishes', priority: 58 },

            // ════════════════════════════════════════════════════════
            // V8.2 — ROLLING SHUTTERS (رولينق شتر)
            // ════════════════════════════════════════════════════════
            { id: 'rolling_shutter', keywords: ['رولينق'], negKw: [], category: 'doors', priority: 65 },
            { id: 'rolling_shutter', keywords: ['ابواب لف'], negKw: [], category: 'doors', priority: 65 },
            { id: 'rolling_shutter', keywords: ['أبواب لف'], negKw: [], category: 'doors', priority: 65 },
            { id: 'rolling_shutter', keywords: ['rolling shutter'], negKw: [], category: 'doors', priority: 62 },
            { id: 'rolling_shutter', keywords: ['roller door'], negKw: [], category: 'doors', priority: 60 },
        ];

        // Sort by priority descending (most specific first)
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Classify a sanitized BOQ item description.
     * Returns the best matching rule + rate.
     */
    classify(sanitizedText) {
        const text = sanitizedText.toLowerCase ? sanitizedText.toLowerCase() : sanitizedText;

        for (const rule of this.rules) {
            // All keywords must match
            const allMatch = rule.keywords.every(kw => text.includes(kw));
            if (!allMatch) continue;

            // No negative keywords should match
            const anyNeg = rule.negKw.some(nk => text.includes(nk));
            if (anyNeg) continue;

            // Found a match!
            const rateEntry = this.rates[rule.id];
            const rate = rateEntry ? rateEntry.rate : 0;

            return {
                matched: true,
                ruleId: rule.id,
                category: rule.category,
                priority: rule.priority,
                baseRate: rate,
                unit: rateEntry ? rateEntry.unit : 'غير محدد',
            };
        }

        // No match found
        return {
            matched: false,
            ruleId: null,
            category: 'unclassified',
            priority: 0,
            baseRate: 0,
            unit: 'غير محدد',
        };
    }
}

module.exports = ClassificationEngine;

if (require.main === module) {
    const engine = new ClassificationEngine();
    const tests = [
        "توريد وتركيب بلوك خرساني سماكة 20 سم",
        "لياسة خارجية بسماكة 2 سم",
        "دهان بلاستيك 3 أوجه",
        "خرسانة مسلحة للقواعد",
        "توريد وتركيب باب حريق",
        "تركيب مكيف سبلت 2 طن",
        "بلاط بورسلان 60×60",
        "حفر وردم للأساسات",
        "مصعد كهربائي 6 أشخاص",
        "بند غريب غير معروف",
    ];

    console.log("=== ARBA Classification Engine V8.1 ===\n");
    tests.forEach((t, i) => {
        const r = engine.classify(t);
        const icon = r.matched ? '✅' : '❌';
        console.log(`${icon} "${t}"`);
        console.log(`   → ${r.ruleId || 'NO MATCH'} | ${r.category} | ${r.baseRate} SAR/${r.unit}\n`);
    });
}
