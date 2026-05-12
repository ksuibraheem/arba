/**
 * بنود خاصة بالفنادق والنُزُل
 * Hotel / Inn Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_FACADES,
    SUPPLIERS_PAINT, SUPPLIERS_PLUMBING, SUPPLIERS_ELEVATORS,
    SUPPLIERS_SANITARY, SUPPLIERS_SMART_SECURITY, SUPPLIERS_KITCHENS,
    SUPPLIERS_SWIMMING_POOLS, SUPPLIERS_COMMERCIAL_KITCHEN, SUPPLIERS_DOORS,
    SUPPLIERS_INSULATION, SUPPLIERS_STEEL,
    SUPPLIERS_BMS_ELV, SUPPLIERS_NETWORKING, SUPPLIERS_GENERATORS, SUPPLIERS_TANKS
} from './suppliers';

export const HOTEL_ITEMS: BaseItem[] = [
    // ================= HT01. الغرف الفندقية =================
    { id: "HT01.01", category: "architecture", type: "hotel", name: { ar: "تجهيز غرفة فندقية ستاندرد (تشطيب + أثاث ثابت)", en: "Standard Hotel Room Fit-out", fr: "Aménagement Chambre Standard", zh: "标准客房装修" }, unit: "غرفة", qty: 50, baseMaterial: 15000, baseLabor: 5000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-HtlRm", soilFactor: false, dependency: 'build_area' },
    { id: "HT01.02", category: "architecture", type: "hotel", name: { ar: "تجهيز جناح فندقي (Suite)", en: "Hotel Suite Fit-out", fr: "Aménagement Suite", zh: "套房装修" }, unit: "جناح", qty: 5, baseMaterial: 35000, baseLabor: 10000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Suite", soilFactor: false, dependency: 'fixed' },
    { id: "HT01.03", category: "mep_plumb", type: "hotel", name: { ar: "حمامات غرف فندقية (أدوات صحية + تشطيب)", en: "Hotel Room Bathrooms (Sanitary + Finish)", fr: "Salle de Bain Chambre Hôtel", zh: "酒店客房浴室" }, unit: "حمام", qty: 55, baseMaterial: 5000, baseLabor: 1500, waste: 0.05, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-HtlWC", soilFactor: false, dependency: 'build_area' },
    { id: "HT01.04", category: "architecture", type: "hotel", name: { ar: "أبواب غرف فندقية (إلكترونية + مقاومة حريق)", en: "Hotel Room Doors (Electronic + Fire-Rated)", fr: "Portes Chambre Hôtel", zh: "酒店房间门(电子+防火)" }, unit: "عدد", qty: 55, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_DOORS, sbc: "SBC 201-HtlDr", soilFactor: false, dependency: 'build_area' },

    // ================= HT02. اللوبي والاستقبال =================
    { id: "HT02.01", category: "architecture", type: "hotel", name: { ar: "لوبي فندق فاخر (رخام + إضاءة ديكورية)", en: "Premium Hotel Lobby (Marble + Decorative Lighting)", fr: "Hall Hôtel Luxe", zh: "豪华酒店大堂" }, unit: "م2", qty: 150, baseMaterial: 600, baseLabor: 250, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-HtlLby", soilFactor: false, dependency: 'fixed' },
    { id: "HT02.02", category: "architecture", type: "hotel", name: { ar: "كاونتر استقبال (Reception Desk)", en: "Reception Desk", fr: "Comptoir Réception", zh: "前台接待柜台" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Rcpt", soilFactor: false, dependency: 'fixed' },
    { id: "HT02.03", category: "architecture", type: "hotel", name: { ar: "منطقة انتظار (Lounge)", en: "Waiting Lounge Area", fr: "Zone d'Attente (Lounge)", zh: "等候休息区" }, unit: "م2", qty: 40, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Lounge", soilFactor: false, dependency: 'fixed' },

    // ================= HT03. المطاعم والمطابخ التجارية =================
    { id: "HT03.01", category: "architecture", type: "hotel", name: { ar: "مطبخ تجاري مركزي (Commercial Kitchen)", en: "Central Commercial Kitchen", fr: "Cuisine Commerciale Centrale", zh: "中央商用厨房" }, unit: "م2", qty: 80, baseMaterial: 1500, baseLabor: 500, waste: 0.05, suppliers: SUPPLIERS_KITCHENS, sbc: "SBC-ComKit", soilFactor: false, dependency: 'fixed' },
    { id: "HT03.02", category: "architecture", type: "hotel", name: { ar: "مطعم رئيسي (تجهيز + تشطيب)", en: "Main Restaurant (Fit-out)", fr: "Restaurant Principal", zh: "主餐厅(装修)" }, unit: "م2", qty: 120, baseMaterial: 450, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Rest", soilFactor: false, dependency: 'fixed' },
    { id: "HT03.03", category: "architecture", type: "hotel", name: { ar: "كافيه/بار (تجهيز + تشطيب)", en: "Café/Bar Fit-out", fr: "Café/Bar", zh: "咖啡厅/吧台装修" }, unit: "م2", qty: 50, baseMaterial: 500, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Cafe", soilFactor: false, dependency: 'fixed' },
    { id: "HT03.04", category: "mep_hvac", type: "hotel", name: { ar: "شفاط مطبخ تجاري (Hood System)", en: "Commercial Kitchen Hood System", fr: "Hotte Cuisine Commerciale", zh: "商用厨房排烟系统" }, unit: "مجموعة", qty: 1, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-Hood", soilFactor: false, dependency: 'fixed' },

    // ================= HT04. المسبح والسبا =================
    { id: "HT04.01", category: "structure", type: "hotel", name: { ar: "مسبح فندقي (15×8م)", en: "Hotel Pool (15x8m)", fr: "Piscine Hôtel (15x8m)", zh: "酒店泳池(15x8米)" }, unit: "مجموعة", qty: 1, baseMaterial: 45000, baseLabor: 15000, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-HtlPool", soilFactor: false, dependency: 'fixed' },
    { id: "HT04.02", category: "architecture", type: "hotel", name: { ar: "منطقة سبا وساونا", en: "Spa & Sauna Area", fr: "Zone Spa et Sauna", zh: "水疗和桑拿区" }, unit: "م2", qty: 60, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Spa", soilFactor: false, dependency: 'fixed' },
    { id: "HT04.03", category: "architecture", type: "hotel", name: { ar: "صالة رياضية (Gym)", en: "Fitness Center (Gym)", fr: "Salle de Sport", zh: "健身中心" }, unit: "م2", qty: 50, baseMaterial: 400, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Gym", soilFactor: false, dependency: 'fixed' },

    // ================= HT05. خدمات الفندق =================
    { id: "HT05.01", category: "mep_plumb", type: "hotel", name: { ar: "غسيل مركزي (Laundry Room)", en: "Central Laundry Room", fr: "Buanderie Centrale", zh: "中央洗衣房" }, unit: "م2", qty: 40, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Lndr", soilFactor: false, dependency: 'fixed' },
    { id: "HT05.02", category: "mep_elec", type: "hotel", name: { ar: "نظام إدارة الغرف (Room Management System)", en: "Room Management System (RMS)", fr: "Système Gestion Chambres", zh: "客房管理系统(RMS)" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-RMS", soilFactor: false, dependency: 'fixed' },
    { id: "HT05.03", category: "mep_elec", type: "hotel", name: { ar: "نظام IPTV للغرف", en: "Room IPTV System", fr: "Système IPTV Chambres", zh: "客房IPTV系统" }, unit: "نقطة", qty: 55, baseMaterial: 600, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-IPTV", soilFactor: false, dependency: 'build_area' },
    { id: "HT05.04", category: "architecture", type: "hotel", name: { ar: "قاعة اجتماعات/مؤتمرات", en: "Conference/Meeting Rooms", fr: "Salles de Conférence", zh: "会议室" }, unit: "م2", qty: 80, baseMaterial: 450, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Conf", soilFactor: false, dependency: 'fixed' },
    { id: "HT05.05", category: "mep_elec", type: "hotel", name: { ar: "قفل غرف إلكتروني (Card Access)", en: "Electronic Room Locks (Card Access)", fr: "Serrures Électroniques (Cartes)", zh: "电子房间锁(卡片)" }, unit: "عدد", qty: 55, baseMaterial: 800, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-CardLk", soilFactor: false, dependency: 'build_area' },

    // ================= HT06. المصاعد =================
    { id: "HT06.01", category: "mep_elec", type: "hotel", name: { ar: "مصاعد ضيوف (2 مصعد)", en: "Guest Elevators (x2)", fr: "Ascenseurs Clients (x2)", zh: "客用电梯(2部)" }, unit: "عدد", qty: 2, baseMaterial: 140000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-HtlElev", soilFactor: false, dependency: 'fixed' },
    { id: "HT06.02", category: "mep_elec", type: "hotel", name: { ar: "مصعد خدمة", en: "Service Elevator", fr: "Monte-Charge", zh: "服务电梯" }, unit: "عدد", qty: 1, baseMaterial: 100000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-SrvElev", soilFactor: false, dependency: 'fixed' },

    // ================= HT07. السلامة =================
    { id: "HT07.01", category: "safety", type: "hotel", name: { ar: "نظام حريق شامل (Sprinkler + إنذار + مضخات)", en: "Full Fire System (Sprinkler + Alarm + Pumps)", fr: "Système Incendie Complet", zh: "全面消防系统" }, unit: "مجموعة", qty: 1, baseMaterial: 70000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-HtlFire", soilFactor: false, dependency: 'fixed' },

    // ================= HT08. السستم الكهربائي =================
    { id: "HT08.01", category: "mep_elec", type: "hotel", name: { ar: "محول كهرباء (1000 KVA)", en: "Power Transformer (1000 KVA)", fr: "Transformateur (1000 KVA)", zh: "电力变压器(1000KVA)" }, unit: "عدد", qty: 1, baseMaterial: 120000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-HtlTrf", soilFactor: false, dependency: 'fixed' },
    { id: "HT08.02", category: "mep_elec", type: "hotel", name: { ar: "مولد ديزل احتياطي (400 KVA)", en: "Backup Generator (400 KVA)", fr: "Groupe Électrogène (400KVA)", zh: "备用柴油发电机(400KVA)" }, unit: "عدد", qty: 1, baseMaterial: 200000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_GENERATORS, sbc: "SBC 401-HtlGen", soilFactor: false, dependency: 'fixed' },
    { id: "HT08.03", category: "mep_elec", type: "hotel", name: { ar: "UPS مركزي (سيرفرات + POS)", en: "Central UPS (Servers + POS)", fr: "Onduleur Central", zh: "中央UPS" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-HtlUPS", soilFactor: false, dependency: 'fixed' },
    { id: "HT08.04", category: "mep_elec", type: "hotel", name: { ar: "ATS تحويل أوتوماتيكي", en: "Automatic Transfer Switch", fr: "Inverseur Automatique", zh: "自动转换开关" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-HtlATS", soilFactor: false, dependency: 'fixed' },
    { id: "HT08.05", category: "mep_elec", type: "hotel", name: { ar: "بسبار رئيسي", en: "Busbar Rising Main", fr: "Canalisation Montante", zh: "母线槽" }, unit: "م.ط", qty: 30, baseMaterial: 1200, baseLabor: 400, waste: 0.03, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-HtlBus", soilFactor: false, dependency: 'build_area' },

    // ================= HT09. تكييف فندقي مركزي =================
    { id: "HT09.01", category: "mep_hvac", type: "hotel", name: { ar: "تشيلر مركزي (150 طن)", en: "Central Chiller (150 TR)", fr: "Chiller Central (150 TR)", zh: "中央冷水机组(150冷吨)" }, unit: "عدد", qty: 1, baseMaterial: 250000, baseLabor: 40000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-HtlChl", soilFactor: false, dependency: 'fixed' },
    { id: "HT09.02", category: "mep_hvac", type: "hotel", name: { ar: "AHU (4 وحدات)", en: "Air Handling Units (4)", fr: "CTA (4 Unités)", zh: "AHU(4台)" }, unit: "عدد", qty: 4, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-HtlAHU", soilFactor: false, dependency: 'fixed' },
    { id: "HT09.03", category: "mep_hvac", type: "hotel", name: { ar: "FCU غرف فندقية (55 وحدة)", en: "Hotel Room FCU (55 Units)", fr: "FCU Chambres (55 Unités)", zh: "客房FCU(55台)" }, unit: "عدد", qty: 55, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-HtlFCU", soilFactor: false, dependency: 'build_area' },
    { id: "HT09.04", category: "mep_hvac", type: "hotel", name: { ar: "مجاري هواء + عزل", en: "Ductwork + Insulation", fr: "Gaines + Isolation", zh: "风管+保温" }, unit: "م2", qty: 1500, baseMaterial: 90, baseLabor: 45, waste: 0.1, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-HtlDuct", soilFactor: false, dependency: 'build_area' },
    { id: "HT09.05", category: "mep_elec", type: "hotel", name: { ar: "BMS فندقي (جونسون كنترولز)", en: "Hotel BMS (Johnson Controls)", fr: "GTB Hôtelier", zh: "酒店BMS" }, unit: "مجموعة", qty: 1, baseMaterial: 100000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_BMS_ELV, sbc: "SBC 501-HtlBMS", soilFactor: false, dependency: 'fixed' },

    // ================= HT10. سباكة فندقية =================
    { id: "HT10.01", category: "mep_plumb", type: "hotel", name: { ar: "سخان مركزي (Calorifier) × 2", en: "Central Calorifier x2", fr: "Chauffe-eau Central x2", zh: "中央热水器×2" }, unit: "عدد", qty: 2, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-HtlCal", soilFactor: false, dependency: 'fixed' },
    { id: "HT10.02", category: "mep_plumb", type: "hotel", name: { ar: "خزان مياه أرضي + علوي", en: "Underground + Roof Water Tanks", fr: "Réservoirs Souterrain + Toiture", zh: "地下+屋顶水箱" }, unit: "مجموعة", qty: 1, baseMaterial: 20000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-HtlTank", soilFactor: true, dependency: 'fixed' },
    { id: "HT10.03", category: "mep_plumb", type: "hotel", name: { ar: "فاصل شحوم كبير (Grease Trap)", en: "Large Grease Trap", fr: "Grand Bac à Graisse", zh: "大型隔油器" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-HtlGT", soilFactor: false, dependency: 'fixed' },
    { id: "HT10.04", category: "mep_plumb", type: "hotel", name: { ar: "نظام غاز مركزي للمطبخ", en: "Central Gas System (Kitchen)", fr: "Gaz Central Cuisine", zh: "中央燃气系统" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 4000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-HtlGas", soilFactor: false, dependency: 'fixed' },

    // ================= HT11. تيار خفيف فندقي =================
    // تعريف: الفندق يحتاج WiFi Cisco Meraki (واجهة ضيوف) + IPTV + Mini Bar ذكي
    { id: "HT11.01", category: "mep_elec", type: "hotel", name: { ar: "WiFi فندقي (Cisco Meraki — Enterprise)", en: "Hotel WiFi (Cisco Meraki)", fr: "WiFi Hôtelier (Cisco Meraki)", zh: "酒店WiFi(Cisco Meraki)" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-HtlWiFi", soilFactor: false, dependency: 'fixed' },
    { id: "HT11.02", category: "mep_elec", type: "hotel", name: { ar: "نظام Mini Bar ذكي (55 غرفة)", en: "Smart Mini Bar System (55 Rooms)", fr: "Mini Bar Intelligent", zh: "智能迷你吧(55间)" }, unit: "غرفة", qty: 55, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HtlMBar", soilFactor: false, dependency: 'fixed' },
    { id: "HT11.03", category: "mep_elec", type: "hotel", name: { ar: "شبكة بيانات + CCTV (30 كاميرا)", en: "Data Network + CCTV (30 Cameras)", fr: "Réseau + CCTV", zh: "数据网络+监控(30摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-HtlNet", soilFactor: false, dependency: 'fixed' },
    { id: "HT11.04", category: "mep_elec", type: "hotel", name: { ar: "Access Control + خزائن إلكترونية", en: "Access Control + Electronic Safes", fr: "Contrôle Accès + Coffres", zh: "门禁+电子保险箱" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HtlAC", soilFactor: false, dependency: 'fixed' },
];
