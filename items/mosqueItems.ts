/**
 * بنود خاصة بالمساجد والجوامع
 * Mosque Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_FACADES,
    SUPPLIERS_PAINT, SUPPLIERS_PLUMBING, SUPPLIERS_STEEL,
    SUPPLIERS_INSULATION, SUPPLIERS_SMART_SECURITY, SUPPLIERS_SANITARY
} from './suppliers';

export const MOSQUE_ITEMS: BaseItem[] = [
    // ================= M01. القبب والمآذن =================
    { id: "M01.01", category: "structure", type: "mosque", name: { ar: "قبة رئيسية (خرسانة + تكسية)", en: "Main Dome (Concrete + Cladding)", fr: "Dôme Principal", zh: "主穹顶(混凝土+覆面)" }, unit: "مجموعة", qty: 1, baseMaterial: 45000, baseLabor: 15000, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-Dome", soilFactor: false, dependency: 'fixed' },
    { id: "M01.02", category: "structure", type: "mosque", name: { ar: "قبب فرعية صغيرة", en: "Small Secondary Domes", fr: "Petits Dômes Secondaires", zh: "小型次穹顶" }, unit: "عدد", qty: 4, baseMaterial: 8000, baseLabor: 3000, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-SDome", soilFactor: false, dependency: 'fixed' },
    { id: "M01.03", category: "structure", type: "mosque", name: { ar: "مئذنة (ارتفاع 20م)", en: "Minaret (20m Height)", fr: "Minaret (20m)", zh: "宣礼塔(20米)" }, unit: "عدد", qty: 1, baseMaterial: 60000, baseLabor: 20000, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-Min", soilFactor: false, dependency: 'fixed' },
    { id: "M01.04", category: "architecture", type: "mosque", name: { ar: "تكسية قبة بنحاس/ألمنيوم ذهبي", en: "Dome Cladding (Gold Aluminum/Copper)", fr: "Revêtement Dôme (Alu Doré)", zh: "穹顶覆面(金色铝/铜)" }, unit: "م2", qty: 60, baseMaterial: 500, baseLabor: 200, waste: 0.08, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-DomeCld", soilFactor: false, dependency: 'fixed' },
    { id: "M01.05", category: "mep_elec", type: "mosque", name: { ar: "إنارة مئذنة وقبب (LED خارجية)", en: "Minaret & Dome External LED Lighting", fr: "Éclairage LED Minaret et Dômes", zh: "宣礼塔和穹顶外部LED照明" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MinLt", soilFactor: false, dependency: 'fixed' },

    // ================= M02. المصلى الرئيسي =================
    { id: "M02.01", category: "architecture", type: "mosque", name: { ar: "سجاد مسجد فاخر (صوف/أكريليك)", en: "Premium Mosque Carpet (Wool/Acrylic)", fr: "Moquette Mosquée Premium", zh: "高级清真寺地毯" }, unit: "م2", qty: 500, baseMaterial: 120, baseLabor: 20, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-MCrpt", soilFactor: false, dependency: 'build_area' },
    { id: "M02.02", category: "architecture", type: "mosque", name: { ar: "محراب (رخام/حجر منقوش)", en: "Mihrab (Carved Marble/Stone)", fr: "Mihrab (Marbre Sculpté)", zh: "壁龛(雕刻大理石/石材)" }, unit: "مجموعة", qty: 1, baseMaterial: 20000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Mihrab", soilFactor: false, dependency: 'fixed' },
    { id: "M02.03", category: "architecture", type: "mosque", name: { ar: "منبر خطبة (خشب/رخام)", en: "Khutba Pulpit (Wood/Marble)", fr: "Minbar (Bois/Marbre)", zh: "讲坛(木/大理石)" }, unit: "عدد", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Minbar", soilFactor: false, dependency: 'fixed' },
    { id: "M02.04", category: "architecture", type: "mosque", name: { ar: "ثريا مسجد كريستال كبيرة", en: "Large Crystal Mosque Chandelier", fr: "Grand Lustre Cristal Mosquée", zh: "大型水晶清真寺吊灯" }, unit: "عدد", qty: 1, baseMaterial: 25000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Chand", soilFactor: false, dependency: 'fixed' },
    { id: "M02.05", category: "architecture", type: "mosque", name: { ar: "أعمدة داخلية رخام (تكسية)", en: "Internal Marble Column Cladding", fr: "Revêtement Marbre Colonnes", zh: "室内大理石柱面" }, unit: "م2", qty: 100, baseMaterial: 300, baseLabor: 120, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-MCol", soilFactor: false, dependency: 'build_area' },
    { id: "M02.06", category: "architecture", type: "mosque", name: { ar: "أقواس إسلامية (جبس/GRC)", en: "Islamic Arches (Gypsum/GRC)", fr: "Arcs Islamiques", zh: "伊斯兰拱门(石膏/GRC)" }, unit: "عدد", qty: 10, baseMaterial: 3000, baseLabor: 1500, waste: 0.05, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-Arch", soilFactor: false, dependency: 'fixed' },

    // ================= M03. نظام الصوت والأذان =================
    { id: "M03.01", category: "mep_elec", type: "mosque", name: { ar: "نظام صوت المسجد (مكبرات داخلية + خارجية)", en: "Mosque Sound System (Internal + External)", fr: "Système Son Mosquée", zh: "清真寺音响系统(内+外)" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-MSnd", soilFactor: false, dependency: 'fixed' },
    { id: "M03.02", category: "mep_elec", type: "mosque", name: { ar: "نظام أذان أوتوماتيكي", en: "Automatic Adhan System", fr: "Système Adhan Automatique", zh: "自动宣礼系统" }, unit: "مجموعة", qty: 1, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Adhan", soilFactor: false, dependency: 'fixed' },
    { id: "M03.03", category: "mep_elec", type: "mosque", name: { ar: "شاشة عرض أوقات الصلاة", en: "Prayer Time Display Screen", fr: "Écran Horaires Prières", zh: "礼拜时间显示屏" }, unit: "عدد", qty: 2, baseMaterial: 2500, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-PrayScr", soilFactor: false, dependency: 'fixed' },

    // ================= M04. الوضوء والخدمات =================
    { id: "M04.01", category: "mep_plumb", type: "mosque", name: { ar: "مواضي (20 حنفية) — رجال", en: "Wudu Area (20 Taps) — Men", fr: "Zone Ablutions (20 Robinets) — Hommes", zh: "小净处(20龙头)-男" }, unit: "مجموعة", qty: 1, baseMaterial: 10000, baseLabor: 4000, waste: 0.05, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-Wudu", soilFactor: false, dependency: 'fixed' },
    { id: "M04.02", category: "mep_plumb", type: "mosque", name: { ar: "مواضي (10 حنفية) — نساء", en: "Wudu Area (10 Taps) — Women", fr: "Zone Ablutions (10 Robinets) — Femmes", zh: "小净处(10龙头)-女" }, unit: "مجموعة", qty: 1, baseMaterial: 6000, baseLabor: 2500, waste: 0.05, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-WuduW", soilFactor: false, dependency: 'fixed' },
    { id: "M04.03", category: "mep_plumb", type: "mosque", name: { ar: "دورات مياه مسجد (رجال + نساء)", en: "Mosque Restrooms (Men + Women)", fr: "Sanitaires Mosquée", zh: "清真寺卫生间(男+女)" }, unit: "مجموعة", qty: 2, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-MWC", soilFactor: false, dependency: 'fixed' },

    // ================= M05. المصلى والساحة الخارجية =================
    { id: "M05.01", category: "architecture", type: "mosque", name: { ar: "ساحة خارجية (رخام + إنارة)", en: "External Courtyard (Marble + Lighting)", fr: "Cour Extérieure (Marbre + Éclairage)", zh: "室外广场(大理石+照明)" }, unit: "م2", qty: 200, baseMaterial: 200, baseLabor: 80, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-MCourt", soilFactor: false, dependency: 'land_area' },
    { id: "M05.02", category: "architecture", type: "mosque", name: { ar: "مظلات ساحة المسجد (معدنية)", en: "Mosque Courtyard Shade Structures", fr: "Auvents Cour Mosquée", zh: "清真寺庭院遮阳结构" }, unit: "م2", qty: 100, baseMaterial: 230, baseLabor: 100, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-MShade", soilFactor: false, dependency: 'fixed' },
    { id: "M05.03", category: "architecture", type: "mosque", name: { ar: "مواقف سيارات مظللة", en: "Shaded Car Parking", fr: "Parking Couvert", zh: "遮阳停车场" }, unit: "م2", qty: 120, baseMaterial: 200, baseLabor: 90, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Shade", soilFactor: false, dependency: 'fixed' },

    // ================= M06. مصلى النساء ومرافق إضافية =================
    { id: "M06.01", category: "architecture", type: "mosque", name: { ar: "مصلى نساء (تجهيز + حواجز)", en: "Women's Prayer Hall (Fit-out + Partitions)", fr: "Salle de Prière Femmes", zh: "女性祈祷厅(装修+隔断)" }, unit: "م2", qty: 100, baseMaterial: 250, baseLabor: 100, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-WPray", soilFactor: false, dependency: 'fixed' },
    { id: "M06.02", category: "architecture", type: "mosque", name: { ar: "غرفة إمام + مكتب إدارة المسجد", en: "Imam Room + Mosque Admin Office", fr: "Bureau Imam + Administration", zh: "伊玛目室+清真寺管理办公室" }, unit: "م2", qty: 25, baseMaterial: 300, baseLabor: 120, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Imam", soilFactor: false, dependency: 'fixed' },
    { id: "M06.03", category: "architecture", type: "mosque", name: { ar: "مكتبة مسجد صغيرة", en: "Small Mosque Library", fr: "Petite Bibliothèque Mosquée", zh: "小型清真寺图书室" }, unit: "م2", qty: 15, baseMaterial: 200, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-MLib", soilFactor: false, dependency: 'fixed' },
];
