/**
 * بنود العيادات والمراكز الطبية الصغيرة
 * Clinic & Small Medical Center Items
 * تعريف: العيادة تحتاج غازات طبية + عزل رصاصي + تكييف HEPA + نظام EMR
 */
import { BaseItem } from '../types';
import {
    SUPPLIERS_TILES, SUPPLIERS_INSULATION, SUPPLIERS_HVAC,
    SUPPLIERS_PLUMBING, SUPPLIERS_ELECTRICAL, SUPPLIERS_SMART_SECURITY,
    SUPPLIERS_NETWORKING, SUPPLIERS_MEDICAL_GAS, SUPPLIERS_FIRE_SAFETY
} from './suppliers';

export const CLINIC_ITEMS: BaseItem[] = [
    { id: "CL01.01", category: "architecture", type: "clinic", name: { ar: "غرف كشف وعيادات", en: "Examination/Consultation Rooms", fr: "Salles de Consultation", zh: "诊室" }, unit: "عدد", qty: 8, baseMaterial: 8000, baseLabor: 4000, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Exam", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.02", category: "architecture", type: "clinic", name: { ar: "صالة انتظار مرضى", en: "Patient Waiting Area", fr: "Salle d'Attente", zh: "患者候诊区" }, unit: "م2", qty: 60, baseMaterial: 500, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Wait", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.03", category: "architecture", type: "clinic", name: { ar: "استقبال وتسجيل", en: "Reception & Registration", fr: "Accueil et Inscription", zh: "接待挂号" }, unit: "م2", qty: 25, baseMaterial: 600, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Recv", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.04", category: "architecture", type: "clinic", name: { ar: "صيدلية داخلية", en: "Internal Pharmacy", fr: "Pharmacie Interne", zh: "内部药房" }, unit: "م2", qty: 20, baseMaterial: 800, baseLabor: 400, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Pharm", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.05", category: "architecture", type: "clinic", name: { ar: "مختبر تحاليل", en: "Laboratory", fr: "Laboratoire", zh: "检验科" }, unit: "م2", qty: 25, baseMaterial: 1200, baseLabor: 500, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Lab", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.06", category: "architecture", type: "clinic", name: { ar: "غرفة أشعة (X-Ray)", en: "X-Ray Room", fr: "Salle de Radiologie", zh: "X光室" }, unit: "عدد", qty: 1, baseMaterial: 30000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Xray", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.07", category: "insulation", type: "clinic", name: { ar: "عزل رصاصي غرفة أشعة", en: "Lead Shielding (X-Ray Room)", fr: "Blindage Plombé", zh: "铅屏蔽" }, unit: "م2", qty: 30, baseMaterial: 800, baseLabor: 400, waste: 0.05, suppliers: SUPPLIERS_INSULATION, sbc: "SBC-CL-Lead", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.08", category: "mep_plumb", type: "clinic", name: { ar: "غازات طبية (أكسجين)", en: "Medical Gas System (Oxygen)", fr: "Gaz Médicaux", zh: "医用气体系统" }, unit: "نقطة", qty: 8, baseMaterial: 2000, baseLabor: 800, waste: 0.05, suppliers: SUPPLIERS_MEDICAL_GAS, sbc: "SBC-CL-Gas", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.09", category: "architecture", type: "clinic", name: { ar: "غرفة إجراءات بسيطة (Minor Surgery)", en: "Minor Procedure Room", fr: "Salle de Chirurgie Mineure", zh: "小手术室" }, unit: "عدد", qty: 1, baseMaterial: 20000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Minor", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.10", category: "mep_hvac", type: "clinic", name: { ar: "تكييف طبي مع فلترة HEPA", en: "Medical AC with HEPA Filtration", fr: "Climatisation Médicale HEPA", zh: "HEPA医用空调" }, unit: "عدد", qty: 4, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-HEPA", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.11", category: "mep_elec", type: "clinic", name: { ar: "نظام ملفات مرضى إلكتروني (EMR)", en: "Electronic Medical Records System", fr: "Système Dossiers Médicaux", zh: "电子病历系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-CL-EMR", soilFactor: false, dependency: 'fixed' },
    { id: "CL01.12", category: "architecture", type: "clinic", name: { ar: "أرضيات طبية vinyl مضادة للبكتيريا", en: "Anti-Bacterial Vinyl Medical Flooring", fr: "Sol Vinyle Antibactérien", zh: "抗菌乙烯基地板" }, unit: "م2", qty: 200, baseMaterial: 120, baseLabor: 40, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC-CL-Flr", soilFactor: false, dependency: 'build_area' },

    // ================= CL02. السستم التشغيلي =================
    { id: "CL02.01", category: "mep_elec", type: "clinic", name: { ar: "شبكة بيانات طبية (30 نقطة)", en: "Medical Data Network (30 Points)", fr: "Réseau Données Médical", zh: "医用数据网络(30点)" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 4000, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-ClNet", soilFactor: false, dependency: 'fixed' },
    { id: "CL02.02", category: "mep_elec", type: "clinic", name: { ar: "CCTV عيادة (8 كاميرات)", en: "Clinic CCTV (8 Cameras)", fr: "CCTV Clinique", zh: "诊所监控(8摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-ClCCTV", soilFactor: false, dependency: 'fixed' },
    { id: "CL02.03", category: "safety", type: "clinic", name: { ar: "نظام إنذار حريق", en: "Fire Alarm System", fr: "Alarme Incendie", zh: "火灾报警" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-ClFire", soilFactor: false, dependency: 'fixed' },
    { id: "CL02.04", category: "mep_elec", type: "clinic", name: { ar: "نظام استدعاء ممرضات (Nurse Call)", en: "Nurse Call System", fr: "Système Appel Infirmier", zh: "护士呼叫系统" }, unit: "نقطة", qty: 8, baseMaterial: 1500, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-ClNurse", soilFactor: false, dependency: 'fixed' },
    { id: "CL02.05", category: "mep_elec", type: "clinic", name: { ar: "نظام أرقام انتظار", en: "Queue Management System", fr: "Système File d'Attente", zh: "排队管理系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC-CL-Queue", soilFactor: false, dependency: 'fixed' },
];
