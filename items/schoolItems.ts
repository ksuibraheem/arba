/**
 * بنود خاصة بالمدارس والمعاهد
 * School / Institute Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_TILES, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY, SUPPLIERS_PLUMBING,
    SUPPLIERS_PAINT, SUPPLIERS_DOORS, SUPPLIERS_LANDSCAPING,
    SUPPLIERS_SMART_SECURITY, SUPPLIERS_SANITARY, SUPPLIERS_STEEL
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
    { id: "SC03.04", category: "architecture", type: "school", name: { ar: "مظلات حديد لساحة المدرسة", en: "Steel Shade for School Courtyard", fr: "Auvents Métalliques Cour", zh: "学校庭院钢结构遮阳" }, unit: "م2", qty: 200, baseMaterial: 220, baseLabor: 90, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Shade", soilFactor: false, dependency: 'fixed' },

    // ================= SC04. القاعات والمرافق =================
    { id: "SC04.01", category: "architecture", type: "school", name: { ar: "مسرح/قاعة متعددة الأغراض", en: "Auditorium / Multi-Purpose Hall", fr: "Auditorium / Salle Polyvalente", zh: "礼堂/多功能厅" }, unit: "م2", qty: 150, baseMaterial: 400, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Hall", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.02", category: "mep_elec", type: "school", name: { ar: "نظام صوت قاعة (Sound System)", en: "Hall Sound System", fr: "Système Son Auditorium", zh: "礼堂音响系统" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HlSnd", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.03", category: "architecture", type: "school", name: { ar: "مكتبة (أرفف + إضاءة + تكييف)", en: "Library (Shelving + Lighting + AC)", fr: "Bibliothèque", zh: "图书馆" }, unit: "م2", qty: 80, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Lib", soilFactor: false, dependency: 'fixed' },
    { id: "SC04.04", category: "architecture", type: "school", name: { ar: "مقصف/كافتيريا (تجهيز كامل)", en: "Cafeteria (Full Fit-out)", fr: "Cantine Complète", zh: "食堂(全装修)" }, unit: "م2", qty: 60, baseMaterial: 400, baseLabor: 180, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Cafe", soilFactor: false, dependency: 'fixed' },

    // ================= SC05. الأمان والسلامة المدرسية =================
    { id: "SC05.01", category: "safety", type: "school", name: { ar: "نظام إنذار حريق مدرسي شامل", en: "School Fire Alarm System", fr: "Système Alarme Incendie École", zh: "学校消防报警系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-SchFire", soilFactor: false, dependency: 'fixed' },
    { id: "SC05.02", category: "mep_elec", type: "school", name: { ar: "كاميرات مراقبة (ساحات + ممرات + بوابات)", en: "CCTV (Courtyards + Corridors + Gates)", fr: "CCTV (Cours + Couloirs + Portails)", zh: "监控(操场+走廊+门口)" }, unit: "كاميرا", qty: 24, baseMaterial: 500, baseLabor: 150, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "SC05.03", category: "mep_elec", type: "school", name: { ar: "نظام جرس مدرسي إلكتروني", en: "Electronic School Bell System", fr: "Système Sonnerie Électronique", zh: "电子校铃系统" }, unit: "مجموعة", qty: 1, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Bell", soilFactor: false, dependency: 'fixed' },
    { id: "SC05.04", category: "mep_elec", type: "school", name: { ar: "نظام التحكم بالبوابات (Access Control)", en: "Gate Access Control System", fr: "Contrôle d'Accès Portail", zh: "门禁控制系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-SchAcc", soilFactor: false, dependency: 'fixed' },

    // ================= SC06. دورات المياه =================
    { id: "SC06.01", category: "mep_plumb", type: "school", name: { ar: "دورات مياه طلاب (بنين - 3 وحدات)", en: "Students' Restrooms (Boys - 3 units)", fr: "Sanitaires Élèves (Garçons)", zh: "学生卫生间(男-3间)" }, unit: "مجموعة", qty: 3, baseMaterial: 6000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SANITARY, sbc: "SBC 701-SchWC", soilFactor: false, dependency: 'fixed' },
    { id: "SC06.02", category: "mep_plumb", type: "school", name: { ar: "مشرب مياه (Drinking Fountain)", en: "Water Drinking Fountain Station", fr: "Fontaine à Eau", zh: "饮水台" }, unit: "عدد", qty: 6, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Drink", soilFactor: false, dependency: 'fixed' },
    { id: "SC06.03", category: "mep_plumb", type: "school", name: { ar: "مصلى (وضوء + سجاد)", en: "Prayer Room (Wudu + Carpet)", fr: "Salle de Prière", zh: "祈祷室(小净处+地毯)" }, unit: "م2", qty: 30, baseMaterial: 200, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Pray", soilFactor: false, dependency: 'fixed' },
];
