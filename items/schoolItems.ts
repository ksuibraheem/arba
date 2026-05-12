/**
 * بنود خاصة بالمدارس والمعاهد
 * School / Institute Specific Construction Items
 * 
 * v2.0 (2026-05-06): أسعار محدثة من benchmark SOW-TBC المصحح
 * المصدر: school_maintenance_pricing.json (31 فئة، 738 بند)
 * الثقة: 0.75 (8 عينات مدارس حقيقية)
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_PLUMBING,
    SUPPLIERS_PAINT, SUPPLIERS_DOORS, SUPPLIERS_LANDSCAPING,
    SUPPLIERS_SMART_SECURITY, SUPPLIERS_SANITARY, SUPPLIERS_STEEL,
    SUPPLIERS_GENERATORS, SUPPLIERS_TANKS, SUPPLIERS_NETWORKING, SUPPLIERS_SOLAR
} from './suppliers';

export const SCHOOL_ITEMS: BaseItem[] = [
    // ================= SC01. الفصول الدراسية =================
    { id: "SC01.01", category: "architecture", type: "school", name: { ar: "تجهيز فصل دراسي (أرضيات + جدران + سبورة)", en: "Classroom Fit-out (Floors + Walls + Board)", fr: "Aménagement Salle de Classe", zh: "教室装修(地面+墙面+黑板)" }, unit: "فصل", qty: 20, baseMaterial: 8000, baseLabor: 3000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Class", soilFactor: false, dependency: 'build_area' },
    { id: "SC01.02", category: "mep_elec", type: "school", name: { ar: "سبورة ذكية تفاعلية (Smart Board)", en: "Interactive Smart Board", fr: "Tableau Blanc Interactif", zh: "交互式智能白板" }, unit: "عدد", qty: 20, baseMaterial: 4000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SmBrd", soilFactor: false, dependency: 'fixed' },
    { id: "SC01.03", category: "mep_hvac", type: "school", name: { ar: "تكييف فصول (سبليت 2.5 طن/فصل)", en: "Classroom AC (2.5 Ton Split/Class)", fr: "Clim Classe (2.5T)", zh: "教室空调(2.5匹)" }, unit: "عدد", qty: 20, baseMaterial: 3500, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-ClsAC", soilFactor: false, dependency: 'fixed' },

    // ================= SC02. المختبرات =================
    { id: "SC02.01", category: "architecture", type: "school", name: { ar: "مختبر علوم (طاولات + تمديدات غاز + أحواض)", en: "Science Lab (Tables + Gas + Sinks)", fr: "Laboratoire Sciences", zh: "科学实验室" }, unit: "مجموعة", qty: 2, baseMaterial: 25000, baseLabor: 8000, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-SciLab", soilFactor: false, dependency: 'fixed' },
    { id: "SC02.02", category: "architecture", type: "school", name: { ar: "مختبر حاسب آلي (تمديدات + تكييف)", en: "Computer Lab (Networking + AC)", fr: "Salle Informatique", zh: "计算机实验室" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-CompLab", soilFactor: false, dependency: 'fixed' },

    // ================= SC03. الساحات والملاعب =================
    { id: "SC03.01", category: "architecture", type: "school", name: { ar: "ساحة مدرسية (بلاط إنترلوك)", en: "School Courtyard (Interlock Paving)", fr: "Cour d'École (Pavé)", zh: "学校庭院(连锁砖)" }, unit: "م2", qty: 500, baseMaterial: 45, baseLabor: 25, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 201-Court", soilFactor: false, dependency: 'land_area' },
    { id: "SC03.02", category: "architecture", type: "school", name: { ar: "ملعب كرة قدم (عشب صناعي)", en: "Football Field (Artificial Turf)", fr: "Terrain Football (Gazon Synthétique)", zh: "足球场(人工草坪)" }, unit: "م2", qty: 800, baseMaterial: 130, baseLabor: 45, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-Sport", soilFactor: false, dependency: 'fixed' },
    { id: "SC03.03", category: "architecture", type: "school", name: { ar: "ملعب كرة سلة (أرضية مطاطية)", en: "Basketball Court (Rubber Surface)", fr: "Terrain Basket (Sol Caoutchouc)", zh: "篮球场(橡胶面)" }, unit: "م2", qty: 420, baseMaterial: 100, baseLabor: 35, waste: 0.05, suppliers: SUPPLIERS_LANDSCAPING, sbc: "SBC-Sport2", soilFactor: false, dependency: 'fixed' },
    { id: "SC03.04", category: "architecture", type: "school", name: { ar: "مظلات حديد لساحة المدرسة", en: "Steel Shade for School Courtyard", fr: "Auvents Métalliques Cour", zh: "学校庭院钢结构遮阳" }, unit: "م2", qty: 200, baseMaterial: 185, baseLabor: 75, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Shade", soilFactor: false, dependency: 'fixed' }, // v2.0: SOW-TBC benchmark مظلات 185 ر.س/م²

    // ================= SC04. القاعات والمرافق =================
    { id: "SC04.01", category: "architecture", type: "school", name: { ar: "مسرح/قاعة متعددة الأغراض", en: "Auditorium / Multi-Purpose Hall", fr: "Auditorium / Salle Polyvalente", zh: "礼堂/多功能厅" }, unit: "م2", qty: 150, baseMaterial: 400, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Hall", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.02", category: "mep_elec", type: "school", name: { ar: "نظام صوت قاعة (Sound System)", en: "Hall Sound System", fr: "Système Son Auditorium", zh: "礼堂音响系统" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HlSnd", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.03", category: "architecture", type: "school", name: { ar: "مكتبة (أرفف + إضاءة + تكييف)", en: "Library (Shelving + Lighting + AC)", fr: "Bibliothèque", zh: "图书馆" }, unit: "م2", qty: 80, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Lib", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.04", category: "architecture", type: "school", name: { ar: "مقصف/كافتيريا (تجهيز كامل)", en: "Cafeteria (Full Fit-out)", fr: "Cantine Complète", zh: "食堂(全装修)" }, unit: "م2", qty: 60, baseMaterial: 400, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Cafe", soilFactor: false, dependency: 'fixed' },

    // ================= SC05. الأمان والسلامة المدرسية =================
    { id: "SC05.01", category: "safety", type: "school", name: { ar: "نظام إنذار حريق مدرسي شامل", en: "School Fire Alarm System", fr: "Système Alarme Incendie École", zh: "学校消防报警系统" }, unit: "مجموعة", qty: 1, baseMaterial: 18000, baseLabor: 5500, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-SchFire", soilFactor: false, dependency: 'fixed' }, // v2.0: SOW-TBC شامل لوحة + حساسات + صفارات
    { id: "SC05.02", category: "mep_elec", type: "school", name: { ar: "كاميرات مراقبة (ساحات + ممرات + بوابات)", en: "CCTV (Courtyards + Corridors + Gates)", fr: "CCTV (Cours + Couloirs + Portails)", zh: "监控(操场+走廊+门口)" }, unit: "كاميرا", qty: 24, baseMaterial: 500, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "SC05.03", category: "mep_elec", type: "school", name: { ar: "نظام جرس مدرسي إلكتروني", en: "Electronic School Bell System", fr: "Système Sonnerie Électronique", zh: "电子校铃系统" }, unit: "مجموعة", qty: 1, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Bell", soilFactor: false, dependency: 'fixed' },
    { id: "SC05.04", category: "mep_elec", type: "school", name: { ar: "نظام التحكم بالبوابات (Access Control)", en: "Gate Access Control System", fr: "Contrôle d'Accès Portail", zh: "门禁控制系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchAcc", soilFactor: false, dependency: 'fixed' },

    // ================= SC06. دورات المياه =================
    { id: "SC06.01", category: "mep_plumb", type: "school", name: { ar: "دورات مياه طلاب (بنين - 3 وحدات)", en: "Students' Restrooms (Boys - 3 units)", fr: "Sanitaires Élèves (Garçons)", zh: "学生卫生间(男-3间)" }, unit: "مجموعة", qty: 3, baseMaterial: 6000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-SchWC", soilFactor: false, dependency: 'fixed' },
    { id: "SC06.02", category: "mep_plumb", type: "school", name: { ar: "مشرب مياه (Drinking Fountain)", en: "Water Drinking Fountain Station", fr: "Fontaine à Eau", zh: "饮水台" }, unit: "عدد", qty: 6, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Drink", soilFactor: false, dependency: 'fixed' },
    { id: "SC06.03", category: "mep_plumb", type: "school", name: { ar: "مصلى (وضوء + سجاد)", en: "Prayer Room (Wudu + Carpet)", fr: "Salle de Prière", zh: "祈祷室" }, unit: "م2", qty: 30, baseMaterial: 200, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Pray", soilFactor: false, dependency: 'fixed' },

    // ================= SC07. السستم التشغيلي =================
    { id: "SC07.01", category: "mep_elec", type: "school", name: { ar: "محول كهرباء (500 KVA)", en: "Transformer (500 KVA)", fr: "Transformateur (500 KVA)", zh: "变压器(500KVA)" }, unit: "عدد", qty: 1, baseMaterial: 80000, baseLabor: 12000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-SchTrf", soilFactor: false, dependency: 'fixed' },
    { id: "SC07.02", category: "mep_elec", type: "school", name: { ar: "شبكة بيانات مدرسية (50 نقطة)", en: "School Data Network (50 Points)", fr: "Réseau Données Scolaire", zh: "学校数据网络(50点)" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-SchNet", soilFactor: false, dependency: 'fixed' },
    { id: "SC07.03", category: "mep_elec", type: "school", name: { ar: "WiFi مدرسي (Ruckus)", en: "School WiFi (Ruckus)", fr: "WiFi Scolaire", zh: "学校WiFi" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 4000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-SchWiFi", soilFactor: false, dependency: 'fixed' },
    { id: "SC07.04", category: "mep_elec", type: "school", name: { ar: "نظام إذاعة مدرسية (PA)", en: "School PA System", fr: "Système Sonorisation Scolaire", zh: "学校广播系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchPA", soilFactor: false, dependency: 'fixed' },
    { id: "SC07.05", category: "safety", type: "school", name: { ar: "رشاشات حريق", en: "Fire Sprinkler System", fr: "Système Sprinkler", zh: "消防喷淋" }, unit: "م2", qty: 2000, baseMaterial: 42, baseLabor: 18, waste: 0.05, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-SchSprk", soilFactor: false, dependency: 'build_area' }, // v2.0: SOW-TBC benchmark شامل مواسير+رؤوس+تركيب
    { id: "SC07.06", category: "safety", type: "school", name: { ar: "إنذار حريق ذكي (Addressable)", en: "Addressable Fire Alarm", fr: "Alarme Incendie Adressable", zh: "可寻址火灾报警" }, unit: "مجموعة", qty: 1, baseMaterial: 22000, baseLabor: 5500, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-SchAlrm", soilFactor: false, dependency: 'fixed' }, // v2.0: Addressable panel + modules
    { id: "SC07.07", category: "mep_plumb", type: "school", name: { ar: "خزان مياه أرضي", en: "Underground Water Tank", fr: "Réservoir Souterrain", zh: "地下水箱" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-SchTank", soilFactor: true, dependency: 'fixed' }, // v2.0: SOW-TBC شامل حفر+عزل+مضخة
    { id: "SC07.08", category: "mep_elec", type: "school", name: { ar: "CCTV مدرسي (20 كاميرا)", en: "School CCTV (20 Cameras)", fr: "CCTV Scolaire", zh: "学校监控(20摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "SC07.09", category: "architecture", type: "school", name: { ar: "مظلة مواقف معلمين", en: "Teacher Parking Shade", fr: "Abri Parking Enseignants", zh: "教师停车棚" }, unit: "م2", qty: 150, baseMaterial: 185, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-SchPark", soilFactor: false, dependency: 'fixed' }, // v2.0: SOW-TBC benchmark مظلات
    { id: "SC07.10", category: "architecture", type: "school", name: { ar: "سور مدرسة + بوابة أمنية", en: "School Fence + Security Gate", fr: "Clôture + Portail Sécurisé", zh: "学校围栅+安全门" }, unit: "مجموعة", qty: 1, baseMaterial: 35000, baseLabor: 13000, waste: 0, suppliers: SUPPLIERS_STEEL, sbc: "SBC-SchFence", soilFactor: false, dependency: 'fixed' }, // v2.0: SOW-TBC شامل سور بلوك+حديد+بوابة كهربائية
];
