/**
 * بنود مراكز التسوق والمولات
 * Shopping Mall Items
 * تعريف: المول يحتاج سستم تجاري ضخم — تشيلر + BMS جونسون كنترولز + شبكات عالية الكثافة
 */
import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_STEEL, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_ELEVATORS,
    SUPPLIERS_PLUMBING, SUPPLIERS_SMART_SECURITY, SUPPLIERS_FACADES,
    SUPPLIERS_TILES, SUPPLIERS_BMS_ELV, SUPPLIERS_NETWORKING,
    SUPPLIERS_GENERATORS, SUPPLIERS_TANKS
} from './suppliers';

export const MALL_ITEMS: BaseItem[] = [
    // ================= ML01. الهيكل الإنشائي المتقدم =================
    { id: "ML01.01", category: "structure", type: "mall", name: { ar: "خرسانة ما بعد الشد (Post-Tension)", en: "Post-Tension Concrete Slabs", fr: "Béton Post-Contraint", zh: "后张混凝土" }, unit: "م3", qty: 500, baseMaterial: 380, baseLabor: 200, waste: 0.03, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-PT", soilFactor: false, dependency: 'build_area' },
    { id: "ML01.02", category: "structure", type: "mall", name: { ar: "جسور فولاذية (بحرات كبيرة)", en: "Steel Beams (Long Span)", fr: "Poutres Acier", zh: "钢梁(大跨度)" }, unit: "طن", qty: 80, baseMaterial: 4500, baseLabor: 800, waste: 0.03, suppliers: SUPPLIERS_STEEL, sbc: "SBC 304-STL", soilFactor: false, dependency: 'build_area' },
    { id: "ML01.03", category: "structure", type: "mall", name: { ar: "سقف زجاجي Skylight", en: "Glass Skylight Roof", fr: "Verrière (Skylight)", zh: "玻璃天窗" }, unit: "م2", qty: 200, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-Sky", soilFactor: false, dependency: 'fixed' },

    // ================= ML02. المحلات التجارية =================
    { id: "ML02.01", category: "architecture", type: "mall", name: { ar: "تجهيز محل تجاري (Shell & Core)", en: "Retail Unit Shell & Core", fr: "Local Commercial (Coque)", zh: "商铺(毛坯)" }, unit: "م2", qty: 2000, baseMaterial: 250, baseLabor: 100, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Shop", soilFactor: false, dependency: 'build_area' },
    { id: "ML02.02", category: "architecture", type: "mall", name: { ar: "واجهات محلات زجاج + ألمنيوم", en: "Shop Fronts (Glass + Aluminum)", fr: "Vitrines Commerciales", zh: "商铺玻璃铝合金立面" }, unit: "م2", qty: 500, baseMaterial: 450, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-SF", soilFactor: false, dependency: 'build_area' },
    { id: "ML02.03", category: "architecture", type: "mall", name: { ar: "ممرات ومنطقة مشتركة (رخام + إضاءة)", en: "Common Area (Marble + Lighting)", fr: "Espaces Communs", zh: "公共区域(大理石+照明)" }, unit: "م2", qty: 3000, baseMaterial: 400, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Com", soilFactor: false, dependency: 'build_area' },

    // ================= ML03. النقل الرأسي =================
    { id: "ML03.01", category: "mep_elec", type: "mall", name: { ar: "مصاعد ركاب بانورامية", en: "Panoramic Passenger Elevators", fr: "Ascenseurs Panoramiques", zh: "全景观光电梯" }, unit: "عدد", qty: 4, baseMaterial: 150000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC 401-PanElev", soilFactor: false, dependency: 'fixed' },
    { id: "ML03.02", category: "mep_elec", type: "mall", name: { ar: "سلالم كهربائية (Escalators)", en: "Escalators", fr: "Escaliers Mécaniques", zh: "自动扶梯" }, unit: "عدد", qty: 8, baseMaterial: 120000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC 401-Esc", soilFactor: false, dependency: 'fixed' },
    { id: "ML03.03", category: "mep_elec", type: "mall", name: { ar: "ممرات متحركة (Travelators)", en: "Travelators / Moving Walkways", fr: "Tapis Roulants", zh: "自动人行道" }, unit: "عدد", qty: 4, baseMaterial: 100000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC 401-Trav", soilFactor: false, dependency: 'fixed' },

    // ================= ML04. التكييف المركزي =================
    { id: "ML04.01", category: "mep_hvac", type: "mall", name: { ar: "تشيلر مركزي (500 طن × 3)", en: "Central Chiller (500TR x3)", fr: "Chiller Central (500TR x3)", zh: "中央冷水机组(500冷吨×3)" }, unit: "عدد", qty: 3, baseMaterial: 400000, baseLabor: 55000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-MlChl", soilFactor: false, dependency: 'fixed' }, // v2.0: سعر سوق 2026
    { id: "ML04.02", category: "mep_hvac", type: "mall", name: { ar: "وحدات مناولة هواء (AHU)", en: "Air Handling Units (AHU)", fr: "Centrales de Traitement d'Air", zh: "空气处理机组" }, unit: "عدد", qty: 12, baseMaterial: 30000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-MlAHU", soilFactor: false, dependency: 'fixed' },
    { id: "ML04.03", category: "mep_hvac", type: "mall", name: { ar: "مجاري هواء (Ductwork)", en: "GI Ductwork", fr: "Réseau de Gaines", zh: "镀锌风管" }, unit: "م2", qty: 5000, baseMaterial: 80, baseLabor: 40, waste: 0.1, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-MlDuct", soilFactor: false, dependency: 'build_area' },

    // ================= ML05. الحريق والسلامة =================
    { id: "ML05.01", category: "safety", type: "mall", name: { ar: "شبكة رشاشات حريق كاملة", en: "Full Sprinkler Network", fr: "Réseau Sprinkler Complet", zh: "全面喷淋网络" }, unit: "م2", qty: 10000, baseMaterial: 40, baseLabor: 18, waste: 0.05, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-MlSprk", soilFactor: false, dependency: 'build_area' },
    { id: "ML05.02", category: "safety", type: "mall", name: { ar: "مضخات حريق (Triple Set)", en: "Fire Pump Triple Set", fr: "Groupe Pompes Incendie", zh: "消防泵组(三联)" }, unit: "مجموعة", qty: 1, baseMaterial: 120000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-MlPump", soilFactor: false, dependency: 'fixed' },
    { id: "ML05.03", category: "safety", type: "mall", name: { ar: "نظام شفط دخان ميكانيكي", en: "Mechanical Smoke Exhaust System", fr: "Système Désenfumage Mécanique", zh: "机械排烟系统" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-MlSmoke", soilFactor: false, dependency: 'fixed' },
    { id: "ML05.04", category: "safety", type: "mall", name: { ar: "أبواب مقاومة حريق (2 ساعة)", en: "Fire Rated Doors (2 Hour)", fr: "Portes Coupe-Feu (2H)", zh: "防火门(2小时)" }, unit: "عدد", qty: 30, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-MlFDoor", soilFactor: false, dependency: 'fixed' },

    // ================= ML06. الكهرباء المتقدمة =================
    { id: "ML06.01", category: "mep_elec", type: "mall", name: { ar: "محول كهرباء (2000 KVA) × 2", en: "Power Transformer (2000 KVA) x2", fr: "Transformateur (2000 KVA)", zh: "电力变压器(2000KVA)×2" }, unit: "عدد", qty: 2, baseMaterial: 200000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MlTrf", soilFactor: false, dependency: 'fixed' },
    { id: "ML06.02", category: "mep_elec", type: "mall", name: { ar: "لوحة رئيسية + لوحات فرعية", en: "Main + Sub Distribution Boards", fr: "TGBT + Tableaux Divisionnaires", zh: "主配电柜+分配电柜" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MlMDB", soilFactor: false, dependency: 'fixed' },
    { id: "ML06.03", category: "mep_elec", type: "mall", name: { ar: "بسبار (Rising Main)", en: "Busbar Rising Main", fr: "Canalisation Montante", zh: "母线槽" }, unit: "م.ط", qty: 80, baseMaterial: 1500, baseLabor: 400, waste: 0.03, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MlBus", soilFactor: false, dependency: 'build_area' },
    { id: "ML06.04", category: "mep_elec", type: "mall", name: { ar: "UPS مركزي", en: "Central UPS System", fr: "Onduleur Central", zh: "中央UPS" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MlUPS", soilFactor: false, dependency: 'fixed' },

    // ================= ML07. المواقف =================
    { id: "ML07.01", category: "structure", type: "mall", name: { ar: "مواقف سيارات قبو (تشطيب)", en: "Basement Parking (Finishing)", fr: "Parking Sous-Sol", zh: "地下停车场" }, unit: "م2", qty: 5000, baseMaterial: 200, baseLabor: 100, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-ML-Park", soilFactor: false, dependency: 'build_area' },
    { id: "ML07.02", category: "mep_elec", type: "mall", name: { ar: "نظام إدارة مواقف ذكي", en: "Smart Parking System", fr: "Parking Intelligent", zh: "智能停车系统" }, unit: "مجموعة", qty: 1, baseMaterial: 120000, baseLabor: 30000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-ML-SPark", soilFactor: false, dependency: 'fixed' },

    // ================= ML08. السباكة والصرف =================
    { id: "ML08.01", category: "mep_plumb", type: "mall", name: { ar: "خزان مياه أرضي 200م³", en: "Underground Water Tank 200m³", fr: "Réservoir Souterrain 200m³", zh: "地下水箱200m³" }, unit: "مجموعة", qty: 1, baseMaterial: 50000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-MlTank", soilFactor: true, dependency: 'fixed' },
    { id: "ML08.02", category: "mep_plumb", type: "mall", name: { ar: "خزان حريق أرضي 300م³", en: "Fire Water Tank 300m³", fr: "Réservoir Incendie 300m³", zh: "消防水箱300m³" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-MlFTnk", soilFactor: true, dependency: 'fixed' },
    { id: "ML08.03", category: "mep_plumb", type: "mall", name: { ar: "فاصل شحوم Food Court", en: "Food Court Grease Trap", fr: "Bac à Graisse Food Court", zh: "美食广场隔油器" }, unit: "عدد", qty: 3, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MlGT", soilFactor: false, dependency: 'fixed' },
    { id: "ML08.04", category: "mep_plumb", type: "mall", name: { ar: "نظام صرف أمطار", en: "Storm Water Drainage", fr: "Réseau Eaux Pluviales", zh: "雨水排水系统" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 12000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MlStorm", soilFactor: false, dependency: 'land_area' },

    // ================= ML09. الأنظمة الذكية والتيار الخفيف =================
    // تعريف: المول يحتاج BMS جونسون كنترولز + WiFi عالي الكثافة Ruckus + عد زوار
    { id: "ML09.01", category: "mep_elec", type: "mall", name: { ar: "نظام إدارة المبنى (BMS — Johnson Controls)", en: "Building Management System (BMS)", fr: "Système Gestion Bâtiment (GTB)", zh: "楼宇管理系统(BMS)" }, unit: "مجموعة", qty: 1, baseMaterial: 200000, baseLabor: 50000, waste: 0, suppliers: SUPPLIERS_BMS_ELV, sbc: "SBC-BMS", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.02", category: "mep_elec", type: "mall", name: { ar: "شاشات عرض رقمية (Digital Signage)", en: "Digital Signage Displays", fr: "Affichage Numérique", zh: "数字标牌" }, unit: "عدد", qty: 20, baseMaterial: 8000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-ML-Dig", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.03", category: "mep_elec", type: "mall", name: { ar: "مولد كهرباء ديزل احتياطي × 2", en: "Backup Diesel Generator x2", fr: "Groupe Électrogène x2", zh: "备用柴油发电机×2" }, unit: "عدد", qty: 2, baseMaterial: 200000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_GENERATORS, sbc: "SBC 401-Gen", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.04", category: "mep_elec", type: "mall", name: { ar: "شبكة بيانات (300 نقطة)", en: "Data Network (300 Points)", fr: "Réseau Données (300 Points)", zh: "数据网络(300点)" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-MlNet", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.05", category: "mep_elec", type: "mall", name: { ar: "WiFi مركزي عالي الكثافة (50 AP — Ruckus)", en: "High-Density WiFi (50 AP — Ruckus)", fr: "WiFi Haute Densité (50 AP)", zh: "高密度WiFi(50 AP)" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-MlWiFi", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.06", category: "mep_elec", type: "mall", name: { ar: "CCTV (100 كاميرا IP)", en: "CCTV System (100 IP Cameras)", fr: "CCTV (100 Caméras IP)", zh: "监控系统(100 IP摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-MlCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.07", category: "mep_elec", type: "mall", name: { ar: "Access Control (30 باب)", en: "Access Control (30 Doors)", fr: "Contrôle d'Accès (30 Portes)", zh: "门禁(30门)" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-MlAC", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.08", category: "mep_elec", type: "mall", name: { ar: "نظام PA مركزي", en: "Public Address System", fr: "Système Sonorisation", zh: "公共广播系统" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-MlPA", soilFactor: false, dependency: 'fixed' },
    { id: "ML09.09", category: "mep_elec", type: "mall", name: { ar: "نظام عد زوار (People Counter)", en: "People Counting System", fr: "Système Comptage Visiteurs", zh: "客流量统计系统" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-MlPpl", soilFactor: false, dependency: 'fixed' },
];
