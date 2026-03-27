/**
 * بنود خاصة بالفنادق والنُزُل
 * Hotel / Inn Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_FACADES,
    SUPPLIERS_PAINT, SUPPLIERS_PLUMBING, SUPPLIERS_ELEVATORS,
    SUPPLIERS_KITCHENS, SUPPLIERS_SANITARY, SUPPLIERS_SMART_SECURITY,
    SUPPLIERS_DOORS, SUPPLIERS_INSULATION, SUPPLIERS_STEEL
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
    { id: "HT05.04", category: "mep_elec", type: "hotel", name: { ar: "قاعة اجتماعات/مؤتمرات", en: "Conference/Meeting Rooms", fr: "Salles de Conférence", zh: "会议室" }, unit: "م2", qty: 80, baseMaterial: 450, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Conf", soilFactor: false, dependency: 'fixed' },
    { id: "HT05.05", category: "mep_elec", type: "hotel", name: { ar: "قفل غرف إلكتروني (Card Access)", en: "Electronic Room Locks (Card Access)", fr: "Serrures Électroniques (Cartes)", zh: "电子房间锁(卡片)" }, unit: "عدد", qty: 55, baseMaterial: 800, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-CardLk", soilFactor: false, dependency: 'build_area' },

    // ================= HT06. المصاعد =================
    { id: "HT06.01", category: "mep_elec", type: "hotel", name: { ar: "مصاعد ضيوف (2 مصعد)", en: "Guest Elevators (x2)", fr: "Ascenseurs Clients (x2)", zh: "客用电梯(2部)" }, unit: "عدد", qty: 2, baseMaterial: 140000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-HtlElev", soilFactor: false, dependency: 'fixed' },
    { id: "HT06.02", category: "mep_elec", type: "hotel", name: { ar: "مصعد خدمة", en: "Service Elevator", fr: "Monte-Charge", zh: "服务电梯" }, unit: "عدد", qty: 1, baseMaterial: 100000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-SrvElev", soilFactor: false, dependency: 'fixed' },

    // ================= HT07. السلامة =================
    { id: "HT07.01", category: "safety", type: "hotel", name: { ar: "نظام حريق شامل (Sprinkler + إنذار + مضخات)", en: "Full Fire System (Sprinkler + Alarm + Pumps)", fr: "Système Incendie Complet", zh: "全面消防系统" }, unit: "مجموعة", qty: 1, baseMaterial: 70000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-HtlFire", soilFactor: false, dependency: 'fixed' },
];
