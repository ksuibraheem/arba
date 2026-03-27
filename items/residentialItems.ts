/**
 * بنود خاصة بالعمارات السكنية
 * Residential Building Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_ELEVATORS,
    SUPPLIERS_PLUMBING, SUPPLIERS_SANITARY, SUPPLIERS_SMART_SECURITY,
    SUPPLIERS_PAINT, SUPPLIERS_DOORS, SUPPLIERS_STEEL,
    SUPPLIERS_INSULATION
} from './suppliers';

export const RESIDENTIAL_ITEMS: BaseItem[] = [
    // ================= RB01. الشقق السكنية =================
    { id: "RB01.01", category: "architecture", type: "residential_building", name: { ar: "تشطيب شقة سكنية (2 غرفة نوم)", en: "2-Bedroom Apartment Finishing", fr: "Finition Appartement 2 Chambres", zh: "两居室公寓装修" }, unit: "شقة", qty: 8, baseMaterial: 25000, baseLabor: 10000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Apt2", soilFactor: false, dependency: 'build_area' },
    { id: "RB01.02", category: "architecture", type: "residential_building", name: { ar: "تشطيب شقة سكنية (3 غرف نوم)", en: "3-Bedroom Apartment Finishing", fr: "Finition Appartement 3 Chambres", zh: "三居室公寓装修" }, unit: "شقة", qty: 4, baseMaterial: 32000, baseLabor: 12000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Apt3", soilFactor: false, dependency: 'build_area' },
    { id: "RB01.03", category: "architecture", type: "residential_building", name: { ar: "مطابخ شقق (ألمنيوم/خشب)", en: "Apartment Kitchens", fr: "Cuisines Appartements", zh: "公寓厨房" }, unit: "عدد", qty: 12, baseMaterial: 5000, baseLabor: 1200, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC-AptKit", soilFactor: false, dependency: 'fixed' },

    // ================= RB02. المساحات المشتركة =================
    { id: "RB02.01", category: "architecture", type: "residential_building", name: { ar: "مدخل عمارة (لوبي + إنارة)", en: "Building Entrance Lobby", fr: "Hall d'Entrée Immeuble", zh: "公寓楼入口大厅" }, unit: "م2", qty: 30, baseMaterial: 350, baseLabor: 150, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-BldLby", soilFactor: false, dependency: 'fixed' },
    { id: "RB02.02", category: "architecture", type: "residential_building", name: { ar: "ممرات وأدراج مشتركة (تشطيب)", en: "Common Corridors & Stairways (Finishing)", fr: "Couloirs et Escaliers Communs", zh: "公共走廊和楼梯(装修)" }, unit: "م2", qty: 200, baseMaterial: 150, baseLabor: 60, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Corr", soilFactor: false, dependency: 'build_area' },
    { id: "RB02.03", category: "architecture", type: "residential_building", name: { ar: "صناديق بريد مقيمين", en: "Resident Mailboxes", fr: "Boîtes aux Lettres Résidents", zh: "住户信箱" }, unit: "مجموعة", qty: 1, baseMaterial: 2000, baseLabor: 300, waste: 0, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Mailbox", soilFactor: false, dependency: 'fixed' },

    // ================= RB03. المصعد والسلالم =================
    { id: "RB03.01", category: "mep_elec", type: "residential_building", name: { ar: "مصعد سكني (6 أشخاص / 5 وقفات)", en: "Residential Elevator (6 Person / 5 Stops)", fr: "Ascenseur Résidentiel (6 Pers / 5 Niveaux)", zh: "住宅电梯(6人/5停靠)" }, unit: "عدد", qty: 1, baseMaterial: 100000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-ResElev", soilFactor: false, dependency: 'fixed' },

    // ================= RB04. المواقف =================
    { id: "RB04.01", category: "structure", type: "residential_building", name: { ar: "مواقف سيارات أرضية (كل شقة موقفين)", en: "Ground Parking (2 Spots per Apt)", fr: "Parking Sol (2 Places/Appt)", zh: "地面停车场(每户2位)" }, unit: "م2", qty: 300, baseMaterial: 50, baseLabor: 25, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-GParking", soilFactor: false, dependency: 'land_area' },
    { id: "RB04.02", category: "architecture", type: "residential_building", name: { ar: "مظلات مواقف سيارات", en: "Parking Shade Structures", fr: "Abris Parking", zh: "停车遮阳棚" }, unit: "م2", qty: 300, baseMaterial: 200, baseLabor: 90, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Shade", soilFactor: false, dependency: 'land_area' },

    // ================= RB05. الخدمات المشتركة =================
    { id: "RB05.01", category: "mep_plumb", type: "residential_building", name: { ar: "خزانات مياه مركزية (علوي + أرضي)", en: "Central Water Tanks (Roof + Ground)", fr: "Réservoirs Eau Centraux", zh: "中央水箱(屋顶+地面)" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-CTank", soilFactor: false, dependency: 'fixed' },
    { id: "RB05.02", category: "mep_plumb", type: "residential_building", name: { ar: "مضخات مياه مركزية (Booster)", en: "Central Water Booster Pumps", fr: "Surpresseurs Centraux", zh: "中央增压泵" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-CBst", soilFactor: false, dependency: 'fixed' },
    { id: "RB05.03", category: "mep_elec", type: "residential_building", name: { ar: "لوحة كهرباء رئيسية للعمارة", en: "Building Main Distribution Board", fr: "Tableau Principal Immeuble", zh: "公寓楼主配电板" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-BldMDB", soilFactor: false, dependency: 'fixed' },
    { id: "RB05.04", category: "mep_elec", type: "residential_building", name: { ar: "عدادات كهرباء منفصلة (لكل شقة)", en: "Individual Electric Meters (Per Apt)", fr: "Compteurs Individuels", zh: "独立电表(每户)" }, unit: "عدد", qty: 12, baseMaterial: 500, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-IndMtr", soilFactor: false, dependency: 'fixed' },

    // ================= RB06. السلامة =================
    { id: "RB06.01", category: "safety", type: "residential_building", name: { ar: "نظام إنذار حريق شامل", en: "Full Fire Alarm System", fr: "Système Alarme Incendie Complet", zh: "全面火灾报警系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-ResFire", soilFactor: false, dependency: 'fixed' },
    { id: "RB06.02", category: "mep_elec", type: "residential_building", name: { ar: "إنارة طوارئ (ممرات + أدراج)", en: "Emergency Lighting (Corridors + Stairs)", fr: "Éclairage d'Urgence", zh: "应急照明(走廊+楼梯)" }, unit: "عدد", qty: 20, baseMaterial: 150, baseLabor: 50, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-EmLt", soilFactor: false, dependency: 'build_area' },
    { id: "RB06.03", category: "mep_elec", type: "residential_building", name: { ar: "نظام إنتركم مركزي (باب خارجي ↔ شقق)", en: "Central Intercom System (Gate ↔ Apartments)", fr: "Interphone Central", zh: "中央对讲系统(大门↔公寓)" }, unit: "مجموعة", qty: 1, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-BldInt", soilFactor: false, dependency: 'fixed' },
    { id: "RB06.04", category: "mep_elec", type: "residential_building", name: { ar: "كاميرات مراقبة (مداخل + مواقف + أسطح)", en: "CCTV (Entrances + Parking + Roofs)", fr: "CCTV (Entrées + Parkings + Toits)", zh: "监控(入口+停车场+屋顶)" }, unit: "مجموعة", qty: 1, baseMaterial: 6000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-BldCCTV", soilFactor: false, dependency: 'fixed' },

    // ================= RB07. غرفة قمامة وخدمات =================
    { id: "RB07.01", category: "architecture", type: "residential_building", name: { ar: "غرفة قمامة مركزية + حاويات", en: "Central Trash Room + Bins", fr: "Local Poubelles + Conteneurs", zh: "中央垃圾房+垃圾桶" }, unit: "مجموعة", qty: 1, baseMaterial: 3000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-Trash", soilFactor: false, dependency: 'fixed' },
    { id: "RB07.02", category: "architecture", type: "residential_building", name: { ar: "غرفة حارس (بوابة)", en: "Guard Room (Gate)", fr: "Loge Gardien", zh: "门卫室" }, unit: "م2", qty: 10, baseMaterial: 450, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-Grd", soilFactor: false, dependency: 'fixed' },
];
