/**
 * بنود المستودعات
 * Warehouse Items
 * تعريف: المستودع يحتاج PEB + أبواب صناعية + رشاشات + CCTV
 */
import { BaseItem } from '../types';
import {
    SUPPLIERS_STEEL, SUPPLIERS_CONCRETE, SUPPLIERS_ELECTRICAL,
    SUPPLIERS_FIRE_SAFETY, SUPPLIERS_HVAC, SUPPLIERS_SMART_SECURITY,
    SUPPLIERS_HEAVY_EQUIPMENT, SUPPLIERS_DOORS
} from './suppliers';

export const WAREHOUSE_ITEMS: BaseItem[] = [
    { id: "WH01.01", category: "structure", type: "warehouse", name: { ar: "هيكل حديد مستودع (PEB)", en: "Pre-Engineered Steel Building", fr: "Bâtiment Métallique Préfabriqué", zh: "预制钢结构" }, unit: "م2", qty: 2000, baseMaterial: 350, baseLabor: 100, waste: 0.03, suppliers: SUPPLIERS_STEEL, sbc: "SBC 304-PEB", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.02", category: "structure", type: "warehouse", name: { ar: "ساندوتش بانل جدران", en: "Sandwich Panel Walls", fr: "Panneaux Sandwich Murs", zh: "夹芯板墙" }, unit: "م2", qty: 800, baseMaterial: 120, baseLabor: 40, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-WH-Wall", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.03", category: "structure", type: "warehouse", name: { ar: "ساندوتش بانل سقف", en: "Sandwich Panel Roof", fr: "Panneaux Sandwich Toiture", zh: "夹芯板屋顶" }, unit: "م2", qty: 2000, baseMaterial: 140, baseLabor: 50, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-WH-Roof", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.04", category: "external_works", type: "warehouse", name: { ar: "أرضية خرسانية صناعية مقواة", en: "Reinforced Industrial Floor", fr: "Sol Industriel Renforcé", zh: "加强工业地面" }, unit: "م2", qty: 2000, baseMaterial: 100, baseLabor: 45, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-WH-Flr", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.05", category: "architecture", type: "warehouse", name: { ar: "أبواب شحن (Dock Levelers)", en: "Loading Dock Levelers", fr: "Niveleurs de Quai", zh: "装卸平台" }, unit: "عدد", qty: 4, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HEAVY_EQUIPMENT, sbc: "SBC-WH-Dock", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.06", category: "architecture", type: "warehouse", name: { ar: "أبواب أوفرهيد (Overhead)", en: "Overhead Roller Doors", fr: "Portes Sectionnelles", zh: "卷帘大门" }, unit: "عدد", qty: 6, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_DOORS, sbc: "SBC-WH-OHD", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.07", category: "furniture", type: "warehouse", name: { ar: "أرفف تخزين صناعية (Racking)", en: "Industrial Storage Racking", fr: "Rayonnages Industriels", zh: "工业货架" }, unit: "م.ط", qty: 200, baseMaterial: 800, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-WH-Rack", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.08", category: "safety", type: "warehouse", name: { ar: "نظام رشاشات حريق مستودع", en: "Warehouse Sprinkler System", fr: "Sprinkler Entrepôt", zh: "仓库喷淋系统" }, unit: "م2", qty: 2000, baseMaterial: 35, baseLabor: 15, waste: 0.05, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-Spr", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.09", category: "mep_elec", type: "warehouse", name: { ar: "إنارة صناعية LED عالية", en: "High Bay LED Lighting", fr: "Éclairage LED Industriel", zh: "工业LED照明" }, unit: "عدد", qty: 60, baseMaterial: 1200, baseLabor: 300, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-HB", soilFactor: false, dependency: 'build_area' },
    { id: "WH01.10", category: "architecture", type: "warehouse", name: { ar: "مكاتب إدارية ميزانين", en: "Mezzanine Office Space", fr: "Bureaux Mezzanine", zh: "夹层办公室" }, unit: "م2", qty: 150, baseMaterial: 1200, baseLabor: 500, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-WH-Mezz", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.11", category: "mep_hvac", type: "warehouse", name: { ar: "تهوية طبيعية وميكانيكية", en: "Natural & Mechanical Ventilation", fr: "Ventilation Naturelle et Mécanique", zh: "自然和机械通风" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-Vent", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.12", category: "external_works", type: "warehouse", name: { ar: "ساحة شاحنات إسفلت", en: "Truck Yard Asphalt", fr: "Cour Camions Asphalte", zh: "卡车场沥青" }, unit: "م2", qty: 500, baseMaterial: 80, baseLabor: 35, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-WH-Yard", soilFactor: false, dependency: 'land_area' },
    { id: "WH01.13", category: "mep_elec", type: "warehouse", name: { ar: "CCTV مستودع (10 كاميرات)", en: "Warehouse CCTV (10 Cameras)", fr: "CCTV Entrepôt", zh: "仓库监控(10摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 10000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-WhCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "WH01.14", category: "mep_elec", type: "warehouse", name: { ar: "Access Control + حضور عمال", en: "Access Control + Attendance", fr: "Contrôle Accès + Pointage", zh: "门禁+考勤" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-WhAC", soilFactor: false, dependency: 'fixed' },
];
