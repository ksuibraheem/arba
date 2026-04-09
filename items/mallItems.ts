/**
 * بنود مراكز التسوق والمولات
 * Shopping Mall Items
 */
import { BaseItem } from '../types';

export const MALL_ITEMS: BaseItem[] = [
    // ================= ML01. الهيكل الإنشائي المتقدم =================
    { id: "ML01.01", category: "structure", type: "mall", name: { ar: "خرسانة ما بعد الشد (Post-Tension)", en: "Post-Tension Concrete Slabs", fr: "Béton Post-Contraint", zh: "后张混凝土" }, unit: "م3", qty: 500, baseMaterial: 380, baseLabor: 200, waste: 0.03, suppliers: [], sbc: "SBC 304-PT", soilFactor: false, dependency: 'build_area' },
    { id: "ML01.02", category: "structure", type: "mall", name: { ar: "جسور فولاذية (بحرات كبيرة)", en: "Steel Beams (Long Span)", fr: "Poutres Acier", zh: "钢梁(大跨度)" }, unit: "طن", qty: 80, baseMaterial: 4500, baseLabor: 800, waste: 0.03, suppliers: [], sbc: "SBC 304-STL", soilFactor: false, dependency: 'build_area' },
    { id: "ML01.03", category: "structure", type: "mall", name: { ar: "أساسات خوازيق (Piles)", en: "Pile Foundation", fr: "Fondation sur Pieux", zh: "桩基础" }, unit: "م.ط", qty: 200, baseMaterial: 600, baseLabor: 300, waste: 0.05, suppliers: [], sbc: "SBC 304-Pile", soilFactor: true, dependency: 'build_area' },

    // ================= ML02. المحلات التجارية =================
    { id: "ML02.01", category: "architecture", type: "mall", name: { ar: "تشطيب محلات (Shell & Core)", en: "Shop Shell & Core Fit-out", fr: "Aménagement Magasins", zh: "商铺毛坯交付" }, unit: "م2", qty: 5000, baseMaterial: 300, baseLabor: 200, waste: 0.05, suppliers: [], sbc: "SBC 201-Shop", soilFactor: false, dependency: 'build_area' },
    { id: "ML02.02", category: "architecture", type: "mall", name: { ar: "واجهات محلات زجاجية", en: "Shop Glass Frontage", fr: "Vitrine Magasins", zh: "商铺玻璃门面" }, unit: "م2", qty: 800, baseMaterial: 650, baseLabor: 200, waste: 0.05, suppliers: [], sbc: "SBC 201-Gls", soilFactor: false, dependency: 'build_area' },
    { id: "ML02.03", category: "architecture", type: "mall", name: { ar: "أبواب محلات رول (Roller Shutters)", en: "Roller Shutter Doors", fr: "Rideaux Métalliques", zh: "卷帘门" }, unit: "عدد", qty: 50, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: [], sbc: "SBC 201-Roll", soilFactor: false, dependency: 'fixed' },

    // ================= ML03. المناطق المشتركة =================
    { id: "ML03.01", category: "architecture", type: "mall", name: { ar: "أرضيات ممرات رخام/جرانيت", en: "Corridor Marble/Granite Floor", fr: "Sol Marbre Couloirs", zh: "走廊大理石地板" }, unit: "م2", qty: 3000, baseMaterial: 250, baseLabor: 80, waste: 0.08, suppliers: [], sbc: "SBC 201-Flr", soilFactor: false, dependency: 'build_area' },
    { id: "ML03.02", category: "architecture", type: "mall", name: { ar: "صالة طعام (Food Court) تشطيب", en: "Food Court Fit-out", fr: "Aire de Restauration", zh: "美食广场装修" }, unit: "م2", qty: 500, baseMaterial: 400, baseLabor: 200, waste: 0.05, suppliers: [], sbc: "SBC 201-FC", soilFactor: false, dependency: 'fixed' },
    { id: "ML03.03", category: "architecture", type: "mall", name: { ar: "منطقة ألعاب أطفال (Entertainment)", en: "Kids Entertainment Zone", fr: "Zone Jeux Enfants", zh: "儿童娱乐区" }, unit: "م2", qty: 300, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: [], sbc: "SBC-ML-Kids", soilFactor: false, dependency: 'fixed' },

    // ================= ML04. المصاعد والسلالم =================
    { id: "ML04.01", category: "elevator", type: "mall", name: { ar: "مصاعد ركاب بانورامية", en: "Panoramic Passenger Elevators", fr: "Ascenseurs Panoramiques", zh: "全景电梯" }, unit: "عدد", qty: 4, baseMaterial: 150000, baseLabor: 25000, waste: 0, suppliers: [], sbc: "SBC-Elev", soilFactor: false, dependency: 'fixed' },
    { id: "ML04.02", category: "elevator", type: "mall", name: { ar: "سلالم كهربائية (Escalators)", en: "Escalators", fr: "Escaliers Mécaniques", zh: "自动扶梯" }, unit: "عدد", qty: 8, baseMaterial: 120000, baseLabor: 20000, waste: 0, suppliers: [], sbc: "SBC-Esc", soilFactor: false, dependency: 'fixed' },
    { id: "ML04.03", category: "elevator", type: "mall", name: { ar: "ممرات متحركة (Travelators)", en: "Travelators/Moving Walkways", fr: "Trottoirs Roulants", zh: "自动人行道" }, unit: "عدد", qty: 4, baseMaterial: 100000, baseLabor: 15000, waste: 0, suppliers: [], sbc: "SBC-Trav", soilFactor: false, dependency: 'fixed' },
    { id: "ML04.04", category: "elevator", type: "mall", name: { ar: "مصعد شحن خدمي", en: "Service/Freight Elevator", fr: "Monte-Charge", zh: "货梯" }, unit: "عدد", qty: 2, baseMaterial: 100000, baseLabor: 18000, waste: 0, suppliers: [], sbc: "SBC-Elev-F", soilFactor: false, dependency: 'fixed' },

    // ================= ML05. التكييف المركزي =================
    { id: "ML05.01", category: "mep_hvac", type: "mall", name: { ar: "وحدات تبريد مركزية (Chiller)", en: "Central Chiller Units", fr: "Groupes Froid Centraux", zh: "中央冷水机组" }, unit: "طن تبريد", qty: 500, baseMaterial: 1200, baseLabor: 200, waste: 0, suppliers: [], sbc: "SBC 501-Chl", soilFactor: false, dependency: 'build_area' },
    { id: "ML05.02", category: "mep_hvac", type: "mall", name: { ar: "وحدات مناولة هواء (AHU)", en: "Air Handling Units (AHU)", fr: "Centrales de Traitement d'Air", zh: "空调箱(AHU)" }, unit: "عدد", qty: 20, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC 501-AHU", soilFactor: false, dependency: 'fixed' },
    { id: "ML05.03", category: "mep_hvac", type: "mall", name: { ar: "شبكة دكت تكييف", en: "HVAC Ductwork Network", fr: "Réseau de Gaines", zh: "暖通风管网" }, unit: "م2", qty: 5000, baseMaterial: 80, baseLabor: 40, waste: 0.1, suppliers: [], sbc: "SBC 501-Duct", soilFactor: false, dependency: 'build_area' },

    // ================= ML06. الحريق والسلامة =================
    { id: "ML06.01", category: "fire_protection", type: "mall", name: { ar: "نظام رشاشات حريق (Sprinkler)", en: "Fire Sprinkler System", fr: "Système Sprinkler", zh: "喷淋灭火系统" }, unit: "م2", qty: 10000, baseMaterial: 45, baseLabor: 20, waste: 0.05, suppliers: [], sbc: "SBC 901-Spr", soilFactor: false, dependency: 'build_area' },
    { id: "ML06.02", category: "fire_protection", type: "mall", name: { ar: "نظام إنذار ذكي (Addressable)", en: "Addressable Fire Alarm", fr: "Alarme Adressable", zh: "可寻址火灾报警" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 25000, waste: 0, suppliers: [], sbc: "SBC 901-Addr", soilFactor: false, dependency: 'fixed' },
    { id: "ML06.03", category: "fire_protection", type: "mall", name: { ar: "نظام شفط دخان (Smoke Exhaust)", en: "Smoke Exhaust System", fr: "Désenfumage", zh: "排烟系统" }, unit: "مجموعة", qty: 1, baseMaterial: 50000, baseLabor: 15000, waste: 0, suppliers: [], sbc: "SBC 901-Smoke", soilFactor: false, dependency: 'fixed' },
    { id: "ML06.04", category: "fire_protection", type: "mall", name: { ar: "أبواب حريق مصنفة (2 ساعة)", en: "2-Hour Fire Rated Doors", fr: "Portes Coupe-Feu 2h", zh: "2小时防火门" }, unit: "عدد", qty: 30, baseMaterial: 3500, baseLabor: 500, waste: 0, suppliers: [], sbc: "SBC 901-Door", soilFactor: false, dependency: 'fixed' },

    // ================= ML07. المواقف =================
    { id: "ML07.01", category: "structure", type: "mall", name: { ar: "مواقف سيارات قبو (تشطيب)", en: "Basement Parking (Finishing)", fr: "Parking Sous-Sol", zh: "地下停车场" }, unit: "م2", qty: 5000, baseMaterial: 200, baseLabor: 100, waste: 0.05, suppliers: [], sbc: "SBC-ML-Park", soilFactor: false, dependency: 'build_area' },
    { id: "ML07.02", category: "smart_systems", type: "mall", name: { ar: "نظام إدارة مواقف ذكي", en: "Smart Parking System", fr: "Parking Intelligent", zh: "智能停车系统" }, unit: "مجموعة", qty: 1, baseMaterial: 120000, baseLabor: 30000, waste: 0, suppliers: [], sbc: "SBC-ML-SPark", soilFactor: false, dependency: 'fixed' },

    // ================= ML08. الأنظمة الذكية =================
    { id: "ML08.01", category: "smart_systems", type: "mall", name: { ar: "نظام إدارة المبنى (BMS)", en: "Building Management System", fr: "Système Gestion Bâtiment", zh: "楼宇管理系统" }, unit: "مجموعة", qty: 1, baseMaterial: 200000, baseLabor: 50000, waste: 0, suppliers: [], sbc: "SBC-BMS", soilFactor: false, dependency: 'fixed' },
    { id: "ML08.02", category: "smart_systems", type: "mall", name: { ar: "شاشات عرض رقمية (Digital Signage)", en: "Digital Signage Displays", fr: "Affichage Numérique", zh: "数字标牌" }, unit: "عدد", qty: 20, baseMaterial: 8000, baseLabor: 1500, waste: 0, suppliers: [], sbc: "SBC-ML-Dig", soilFactor: false, dependency: 'fixed' },
    { id: "ML08.03", category: "mep_elec", type: "mall", name: { ar: "مولد كهرباء ديزل احتياطي", en: "Backup Diesel Generator", fr: "Groupe Électrogène", zh: "备用柴油发电机" }, unit: "عدد", qty: 2, baseMaterial: 200000, baseLabor: 20000, waste: 0, suppliers: [], sbc: "SBC 401-Gen", soilFactor: false, dependency: 'fixed' },
];
