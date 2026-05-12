/**
 * بنود المباني الحكومية
 * Government Building Items
 * تعريف: المبنى الحكومي يحتاج أنظمة IT متقدمة + queue system + access control صارم
 */
import { BaseItem } from '../types';
import {
    SUPPLIERS_TILES, SUPPLIERS_FACADES, SUPPLIERS_ELEVATORS,
    SUPPLIERS_CONCRETE, SUPPLIERS_ELECTRICAL, SUPPLIERS_SMART_SECURITY,
    SUPPLIERS_NETWORKING, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_HVAC
} from './suppliers';

export const GOVERNMENT_ITEMS: BaseItem[] = [
    { id: "GV01.01", category: "architecture", type: "government", name: { ar: "قاعة اجتماعات رئيسية", en: "Main Conference Hall", fr: "Salle de Conférence", zh: "主会议厅" }, unit: "م2", qty: 100, baseMaterial: 800, baseLabor: 400, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Conf", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.02", category: "architecture", type: "government", name: { ar: "صالة استقبال مراجعين", en: "Public Reception Hall", fr: "Hall d'Accueil Public", zh: "公共接待大厅" }, unit: "م2", qty: 200, baseMaterial: 600, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Recv", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.03", category: "architecture", type: "government", name: { ar: "كاونترات خدمة مراجعين", en: "Service Counters", fr: "Comptoirs Service", zh: "服务柜台" }, unit: "عدد", qty: 10, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC-GV-Counter", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.04", category: "mep_elec", type: "government", name: { ar: "نظام أرقام انتظار إلكتروني", en: "Electronic Queue System", fr: "Système File d'Attente", zh: "电子排队系统" }, unit: "مجموعة", qty: 1, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-GV-Queue", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.05", category: "architecture", type: "government", name: { ar: "أرشيف ومخزن وثائق", en: "Archive & Document Storage", fr: "Archives et Stockage", zh: "档案室" }, unit: "م2", qty: 80, baseMaterial: 500, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-GV-Arch", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.06", category: "mep_elec", type: "government", name: { ar: "شبكة حاسب آلي وسيرفرات", en: "Computer Network & Servers", fr: "Réseau Informatique", zh: "计算机网络和服务器" }, unit: "مجموعة", qty: 1, baseMaterial: 50000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-IT", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.07", category: "mep_elec", type: "government", name: { ar: "نظام تحكم دخول (Access Control)", en: "Access Control System", fr: "Contrôle d'Accès", zh: "门禁系统" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-GV-Access", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.08", category: "architecture", type: "government", name: { ar: "مصلى (رجال + نساء)", en: "Prayer Room (M/F)", fr: "Salle de Prière", zh: "祈祷室" }, unit: "م2", qty: 50, baseMaterial: 500, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-GV-Pray", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.09", category: "architecture", type: "government", name: { ar: "كافتيريا موظفين", en: "Staff Cafeteria", fr: "Cafétéria Personnel", zh: "员工餐厅" }, unit: "م2", qty: 60, baseMaterial: 600, baseLabor: 250, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-GV-Cafe", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.10", category: "architecture", type: "government", name: { ar: "واجهة مبنى حكومي (حجر + زجاج)", en: "Government Building Facade", fr: "Façade Bâtiment Gouvernemental", zh: "政府大楼外立面" }, unit: "م2", qty: 500, baseMaterial: 400, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-GVFac", soilFactor: false, dependency: 'build_area' },
    { id: "GV01.11", category: "mep_elec", type: "government", name: { ar: "مصعد ركاب حكومي", en: "Government Passenger Elevator", fr: "Ascenseur Gouvernemental", zh: "政府客梯" }, unit: "عدد", qty: 2, baseMaterial: 120000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-Elev", soilFactor: false, dependency: 'fixed' },
    { id: "GV01.12", category: "external_works", type: "government", name: { ar: "مواقف سيارات (موظفين + مراجعين)", en: "Parking (Staff + Visitors)", fr: "Parking (Personnel + Visiteurs)", zh: "停车场" }, unit: "م2", qty: 300, baseMaterial: 80, baseLabor: 35, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-GV-Park", soilFactor: false, dependency: 'land_area' },

    // ================= GV02. السستم التشغيلي =================
    { id: "GV02.01", category: "mep_elec", type: "government", name: { ar: "CCTV حكومي (25 كاميرا)", en: "Government CCTV (25 Cameras)", fr: "CCTV Gouvernemental", zh: "政府监控(25摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-GvCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "GV02.02", category: "mep_elec", type: "government", name: { ar: "WiFi حكومي Enterprise", en: "Government Enterprise WiFi", fr: "WiFi Gouvernemental", zh: "政府企业WiFi" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 6000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-GvWiFi", soilFactor: false, dependency: 'fixed' },
    { id: "GV02.03", category: "mep_elec", type: "government", name: { ar: "نظام PA وإذاعة داخلية", en: "PA & Internal Broadcasting", fr: "Système PA Interne", zh: "PA和内部广播" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-GvPA", soilFactor: false, dependency: 'fixed' },
    { id: "GV02.04", category: "safety", type: "government", name: { ar: "نظام إنذار حريق ذكي", en: "Addressable Fire Alarm", fr: "Alarme Incendie Adressable", zh: "可寻址火灾报警" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 6000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-GvFire", soilFactor: false, dependency: 'fixed' },
    { id: "GV02.05", category: "mep_elec", type: "government", name: { ar: "شاشات عرض رقمية (Digital Signage)", en: "Digital Signage Displays", fr: "Affichage Numérique", zh: "数字标牌" }, unit: "عدد", qty: 6, baseMaterial: 5000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-GvSign", soilFactor: false, dependency: 'fixed' },
    { id: "GV02.06", category: "mep_elec", type: "government", name: { ar: "محول كهرباء (750 KVA)", en: "Transformer (750 KVA)", fr: "Transformateur (750 KVA)", zh: "变压器(750KVA)" }, unit: "عدد", qty: 1, baseMaterial: 100000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-GvTrf", soilFactor: false, dependency: 'fixed' },
];
