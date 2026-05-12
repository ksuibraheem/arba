/**
 * بنود خاصة بالمجمعات الرياضية والملاعب
 * Sports Complex / Stadium Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_STEEL, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_FACADES,
    SUPPLIERS_PLUMBING, SUPPLIERS_LANDSCAPING, SUPPLIERS_TILES,
    SUPPLIERS_SANITARY, SUPPLIERS_SMART_SECURITY, SUPPLIERS_PAINT,
    SUPPLIERS_FURNITURE
} from './suppliers';

export const SPORTS_ITEMS: BaseItem[] = [
    // ================= SP01. الملاعب الرئيسية =================
    { id: "SP01.01", category: "architecture", type: "sports_complex", name: { ar: "ملعب كرة قدم (عشب صناعي FIFA Quality)", en: "Football Field (FIFA Quality Artificial Turf)", fr: "Terrain Football (Gazon FIFA)", zh: "足球场(FIFA级人工草坪)" }, unit: "م2", qty: 7000, baseMaterial: 150, baseLabor: 50, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-FIFA", soilFactor: false, dependency: 'fixed' },
    { id: "SP01.02", category: "architecture", type: "sports_complex", name: { ar: "مضمار جري رياضي (Tartan Track)", en: "Running Track (Tartan Surface)", fr: "Piste d'Athlétisme (Tartan)", zh: "跑道(塑胶)" }, unit: "م2", qty: 2400, baseMaterial: 180, baseLabor: 60, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-Track", soilFactor: false, dependency: 'fixed' },
    { id: "SP01.03", category: "architecture", type: "sports_complex", name: { ar: "ملعب كرة سلة داخلي (أرضية خشب)", en: "Indoor Basketball Court (Hardwood Floor)", fr: "Terrain Basket Intérieur (Parquet)", zh: "室内篮球场(硬木地面)" }, unit: "م2", qty: 500, baseMaterial: 250, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-BBall", soilFactor: false, dependency: 'fixed' },
    { id: "SP01.04", category: "architecture", type: "sports_complex", name: { ar: "ملعب كرة طائرة (أرضية مطاطية)", en: "Volleyball Court (Rubber Floor)", fr: "Terrain Volley (Sol Caoutchouc)", zh: "排球场(橡胶地面)" }, unit: "م2", qty: 300, baseMaterial: 120, baseLabor: 40, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-VBall", soilFactor: false, dependency: 'fixed' },
    { id: "SP01.05", category: "architecture", type: "sports_complex", name: { ar: "ملاعب تنس (أرضية أكريليك)", en: "Tennis Courts (Acrylic Surface)", fr: "Courts Tennis (Surface Acrylique)", zh: "网球场(丙烯酸面)" }, unit: "م2", qty: 650, baseMaterial: 140, baseLabor: 45, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-Tennis", soilFactor: false, dependency: 'fixed' },
    { id: "SP01.06", category: "architecture", type: "sports_complex", name: { ar: "مسبح أولمبي (50×25م)", en: "Olympic Pool (50x25m)", fr: "Piscine Olympique (50x25m)", zh: "奥林匹克泳池(50x25米)" }, unit: "مجموعة", qty: 1, baseMaterial: 250000, baseLabor: 80000, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-OlPool", soilFactor: false, dependency: 'fixed' },

    // ================= SP02. المدرجات والمقاعد =================
    { id: "SP02.01", category: "structure", type: "sports_complex", name: { ar: "مدرجات خرسانية (1000 مقعد)", en: "Concrete Grandstands (1000 Seats)", fr: "Tribunes Béton (1000 Places)", zh: "混凝土看台(1000座)" }, unit: "مقعد", qty: 1000, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-Stand", soilFactor: false, dependency: 'fixed' },
    { id: "SP02.02", category: "architecture", type: "sports_complex", name: { ar: "مقاعد بلاستيكية (Spectator Seats)", en: "Plastic Spectator Seats", fr: "Sièges Spectateurs Plastique", zh: "塑料观众座椅" }, unit: "عدد", qty: 1000, baseMaterial: 120, baseLabor: 20, waste: 0.02, suppliers: SUPPLIERS_FURNITURE, sbc: "SBC-Seats", soilFactor: false, dependency: 'fixed' },
    { id: "SP02.03", category: "architecture", type: "sports_complex", name: { ar: "مظلات مدرجات (شد إنشائي)", en: "Grandstand Canopy (Tensile Structure)", fr: "Auvent Tribunes (Structure Tendue)", zh: "看台遮阳篷(张拉结构)" }, unit: "م2", qty: 500, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-SCan", soilFactor: false, dependency: 'fixed' },

    // ================= SP03. الإنارة الرياضية =================
    { id: "SP03.01", category: "mep_elec", type: "sports_complex", name: { ar: "أبراج إنارة ملعب (كشافات LED 500W)", en: "Stadium Floodlight Towers (LED 500W)", fr: "Tours d'Éclairage (LED 500W)", zh: "体育场灯光塔(LED 500W)" }, unit: "عدد", qty: 6, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Flood", soilFactor: false, dependency: 'fixed' },
    { id: "SP03.02", category: "mep_elec", type: "sports_complex", name: { ar: "لوحة نتائج إلكترونية (Scoreboard)", en: "Electronic Scoreboard", fr: "Tableau d'Affichage Électronique", zh: "电子记分牌" }, unit: "عدد", qty: 1, baseMaterial: 30000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Score", soilFactor: false, dependency: 'fixed' },
    { id: "SP03.03", category: "mep_elec", type: "sports_complex", name: { ar: "نظام صوت ملاعب (PA System)", en: "Stadium PA Sound System", fr: "Système Sonorisation Stade", zh: "体育场扩声系统" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SPA", soilFactor: false, dependency: 'fixed' },

    // ================= SP04. المرافق الخدمية =================
    { id: "SP04.01", category: "mep_plumb", type: "sports_complex", name: { ar: "غرف تبديل ملابس + دش (4 غرف)", en: "Changing Rooms + Showers (4 Rooms)", fr: "Vestiaires + Douches (4 Salles)", zh: "更衣室+淋浴(4间)" }, unit: "مجموعة", qty: 4, baseMaterial: 8000, baseLabor: 3000, waste: 0.05, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-ChRoom", soilFactor: false, dependency: 'fixed' },
    { id: "SP04.02", category: "mep_plumb", type: "sports_complex", name: { ar: "دورات مياه عامة (رجال + نساء)", en: "Public Restrooms (Men + Women)", fr: "Sanitaires Publics", zh: "公共卫生间(男+女)" }, unit: "مجموعة", qty: 4, baseMaterial: 6000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-PubWC", soilFactor: false, dependency: 'fixed' },
    { id: "SP04.03", category: "architecture", type: "sports_complex", name: { ar: "غرفة إسعافات أولية", en: "First Aid Room", fr: "Salle de Premiers Secours", zh: "急救室" }, unit: "م2", qty: 15, baseMaterial: 300, baseLabor: 120, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-FA", soilFactor: false, dependency: 'fixed' },
    { id: "SP04.04", category: "architecture", type: "sports_complex", name: { ar: "صالة رياضية (Gym) مجهزة", en: "Equipped Gym/Fitness Center", fr: "Salle de Sport Équipée", zh: "配套健身房" }, unit: "م2", qty: 100, baseMaterial: 400, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-SpGym", soilFactor: false, dependency: 'fixed' },

    // ================= SP05. المواقف والأمان =================
    { id: "SP05.01", category: "architecture", type: "sports_complex", name: { ar: "مواقف سيارات (إسفلت + تخطيط)", en: "Parking Lot (Asphalt + Marking)", fr: "Parking (Asphalte + Marquage)", zh: "停车场(沥青+标线)" }, unit: "م2", qty: 2000, baseMaterial: 50, baseLabor: 20, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-AsPark", soilFactor: false, dependency: 'land_area' },
    { id: "SP05.02", category: "mep_elec", type: "sports_complex", name: { ar: "بوابات تذاكر إلكترونية (Turnstiles)", en: "Electronic Ticket Turnstiles", fr: "Tourniquets Électroniques", zh: "电子票务闸机" }, unit: "عدد", qty: 6, baseMaterial: 5000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-Turn", soilFactor: false, dependency: 'fixed' },
    { id: "SP05.03", category: "mep_elec", type: "sports_complex", name: { ar: "كاميرات مراقبة ملاعب (20 كاميرا)", en: "Stadium CCTV (20 Cameras)", fr: "CCTV Stade (20 Caméras)", zh: "体育场监控(20摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SpCCTV", soilFactor: false, dependency: 'fixed' },
];
