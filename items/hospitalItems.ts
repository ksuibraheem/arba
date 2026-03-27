/**
 * بنود خاصة بالمستشفيات والمراكز الطبية
 * Hospital / Medical Center Specific Construction Items
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_STEEL, SUPPLIERS_HVAC,
    SUPPLIERS_FACADES, SUPPLIERS_ELECTRICAL, SUPPLIERS_FIRE_SAFETY,
    SUPPLIERS_PLUMBING, SUPPLIERS_INSULATION, SUPPLIERS_PAINT,
    SUPPLIERS_DOORS, SUPPLIERS_TILES, SUPPLIERS_ELEVATORS,
    SUPPLIERS_SANITARY, SUPPLIERS_SMART_SECURITY
} from './suppliers';

export const HOSPITAL_ITEMS: BaseItem[] = [
    // ================= H01. الغازات الطبية =================
    { id: "H01.01", category: "mep_plumb", type: "hospital", name: { ar: "شبكة أكسجين طبي (Central O2)", en: "Medical Oxygen Network", fr: "Réseau Oxygène Médical", zh: "中心供氧系统" }, unit: "نقطة", qty: 50, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedO2", soilFactor: false, dependency: 'build_area' },
    { id: "H01.02", category: "mep_plumb", type: "hospital", name: { ar: "شبكة هواء طبي مضغوط", en: "Medical Air System", fr: "Air Médical Comprimé", zh: "医用压缩空气" }, unit: "نقطة", qty: 30, baseMaterial: 600, baseLabor: 250, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedAir", soilFactor: false, dependency: 'build_area' },
    { id: "H01.03", category: "mep_plumb", type: "hospital", name: { ar: "شبكة شفط طبي (Vacuum)", en: "Medical Vacuum System", fr: "Système Vide Médical", zh: "医用负压吸引系统" }, unit: "نقطة", qty: 30, baseMaterial: 700, baseLabor: 280, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedVac", soilFactor: false, dependency: 'build_area' },
    { id: "H01.04", category: "mep_plumb", type: "hospital", name: { ar: "غرفة أسطوانات غازات (Manifold Room)", en: "Gas Cylinder Manifold Room", fr: "Salle des Bouteilles de Gaz", zh: "气瓶间" }, unit: "مجموعة", qty: 1, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedMan", soilFactor: false, dependency: 'fixed' },

    // ================= H02. غرف العمليات =================
    { id: "H02.01", category: "architecture", type: "hospital", name: { ar: "تجهيز غرفة عمليات (أرضيات + جدران مضادة للبكتيريا)", en: "Operating Room Fit-out (Anti-Bacterial Finish)", fr: "Aménagement Bloc Opératoire", zh: "手术室装修(抗菌)" }, unit: "م2", qty: 40, baseMaterial: 1500, baseLabor: 500, waste: 0.05, suppliers: SUPPLIERS_PAINT, sbc: "SBC 201-OR", soilFactor: false, dependency: 'fixed' },
    { id: "H02.02", category: "mep_hvac", type: "hospital", name: { ar: "تكييف غرف عمليات (HEPA + ضغط موجب)", en: "OR HVAC (HEPA + Positive Pressure)", fr: "HVAC Bloc Op. (HEPA)", zh: "手术室暖通(HEPA+正压)" }, unit: "مجموعة", qty: 2, baseMaterial: 45000, baseLabor: 12000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-ORHvac", soilFactor: false, dependency: 'fixed' },
    { id: "H02.03", category: "mep_elec", type: "hospital", name: { ar: "أضواء عمليات جراحية (Surgical Lights)", en: "Surgical Lights", fr: "Éclairages Chirurgicaux", zh: "手术无影灯" }, unit: "عدد", qty: 2, baseMaterial: 25000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-SurLt", soilFactor: false, dependency: 'fixed' },
    { id: "H02.04", category: "architecture", type: "hospital", name: { ar: "أبواب انزلاقية أوتوماتيكية (غرف عمليات)", en: "Automatic Sliding Doors (OR)", fr: "Portes Coulissantes Auto (Bloc Op.)", zh: "自动推拉门(手术室)" }, unit: "عدد", qty: 4, baseMaterial: 5000, baseLabor: 1200, waste: 0, suppliers: SUPPLIERS_DOORS, sbc: "SBC 201-ORDr", soilFactor: false, dependency: 'fixed' },

    // ================= H03. التعقيم والنظافة =================
    { id: "H03.01", category: "mep_plumb", type: "hospital", name: { ar: "وحدة تعقيم مركزية (CSSD)", en: "Central Sterile Supply Department (CSSD)", fr: "Stérilisation Centrale", zh: "中心供应室(CSSD)" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-CSSD", soilFactor: false, dependency: 'fixed' },
    { id: "H03.02", category: "mep_plumb", type: "hospital", name: { ar: "نظام معالجة نفايات طبية", en: "Medical Waste Treatment System", fr: "Traitement Déchets Médicaux", zh: "医疗废物处理系统" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedWst", soilFactor: false, dependency: 'fixed' },
    { id: "H03.03", category: "mep_plumb", type: "hospital", name: { ar: "نظام التخلص من مياه الصرف الطبي", en: "Medical Wastewater Treatment", fr: "Traitement Eaux Médicales", zh: "医疗废水处理" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 6000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-MedWW", soilFactor: false, dependency: 'fixed' },

    // ================= H04. المصاعد المتخصصة =================
    { id: "H04.01", category: "mep_elec", type: "hospital", name: { ar: "مصاعد مرضى (سرير + مرافق)", en: "Patient Bed Elevator", fr: "Ascenseur Lit Patient", zh: "病床电梯" }, unit: "عدد", qty: 2, baseMaterial: 160000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-PtElev", soilFactor: false, dependency: 'fixed' },
    { id: "H04.02", category: "mep_elec", type: "hospital", name: { ar: "مصعد زوار", en: "Visitor Elevator", fr: "Ascenseur Visiteurs", zh: "访客电梯" }, unit: "عدد", qty: 1, baseMaterial: 100000, baseLabor: 18000, waste: 0, suppliers: SUPPLIERS_ELEVATORS, sbc: "SBC-VisElev", soilFactor: false, dependency: 'fixed' },

    // ================= H05. الطوارئ =================
    { id: "H05.01", category: "architecture", type: "hospital", name: { ar: "مدخل طوارئ (Canopy + رصيف إسعاف)", en: "Emergency Entrance (Canopy + Ambulance Bay)", fr: "Entrée Urgences (Auvent)", zh: "急诊入口(雨棚+救护车位)" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-ER", soilFactor: false, dependency: 'fixed' },
    { id: "H05.02", category: "mep_elec", type: "hospital", name: { ar: "نظام استدعاء ممرضات (Nurse Call)", en: "Nurse Call System", fr: "Système d'Appel Infirmier", zh: "护士呼叫系统" }, unit: "نقطة", qty: 40, baseMaterial: 200, baseLabor: 80, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-NCall", soilFactor: false, dependency: 'build_area' },
    { id: "H05.03", category: "mep_elec", type: "hospital", name: { ar: "نظام كهرباء طوارئ (UPS طبي)", en: "Medical UPS System", fr: "UPS Médical", zh: "医用UPS系统" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MedUPS", soilFactor: false, dependency: 'fixed' },
    { id: "H05.04", category: "mep_elec", type: "hospital", name: { ar: "مولد كهرباء طوارئ طبي (500 KVA)", en: "Medical Emergency Generator (500 KVA)", fr: "Groupe Électrogène Médical", zh: "医用应急发电机(500KVA)" }, unit: "عدد", qty: 1, baseMaterial: 250000, baseLabor: 30000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MedGen", soilFactor: false, dependency: 'fixed' },

    // ================= H06. التشطيبات الطبية =================
    { id: "H06.01", category: "architecture", type: "hospital", name: { ar: "أرضيات فينيل طبية (PVC Homogeneous)", en: "Medical Vinyl Flooring (PVC Homogeneous)", fr: "Sol Vinyle Médical", zh: "医用PVC地面" }, unit: "م2", qty: 500, baseMaterial: 120, baseLabor: 40, waste: 0.08, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-MedFlr", soilFactor: false, dependency: 'build_area' },
    { id: "H06.02", category: "architecture", type: "hospital", name: { ar: "جدران مضادة للبكتيريا (HPL)", en: "Anti-Bacterial Wall Panels (HPL)", fr: "Panneaux Anti-Bactériens", zh: "抗菌墙板(HPL)" }, unit: "م2", qty: 300, baseMaterial: 150, baseLabor: 50, waste: 0.08, suppliers: SUPPLIERS_PAINT, sbc: "SBC 201-ABWall", soilFactor: false, dependency: 'build_area' },
    { id: "H06.03", category: "architecture", type: "hospital", name: { ar: "أسقف معدنية نظيفة (Clean Room Ceiling)", en: "Clean Room Metal Ceiling", fr: "Plafond Salle Blanche", zh: "洁净室金属天花板" }, unit: "م2", qty: 200, baseMaterial: 180, baseLabor: 60, waste: 0.08, suppliers: SUPPLIERS_FACADES, sbc: "SBC 201-ClnCl", soilFactor: false, dependency: 'build_area' },

    // ================= H07. أنظمة الحريق المتقدمة =================
    { id: "H07.01", category: "safety", type: "hospital", name: { ar: "نظام إطفاء حريق شامل (Sprinkler + مضخات)", en: "Full Fire Suppression System", fr: "Système Extinction Incendie Complet", zh: "全面灭火系统" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-HspFire", soilFactor: false, dependency: 'fixed' },
    { id: "H07.02", category: "safety", type: "hospital", name: { ar: "نظام إخلاء ذوي الاحتياجات الخاصة", en: "Disabled Evacuation System", fr: "Système Évacuation PMR", zh: "残障人员疏散系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-EvPMR", soilFactor: false, dependency: 'fixed' },

    // ================= H08. الأنظمة التقنية =================
    { id: "H08.01", category: "mep_elec", type: "hospital", name: { ar: "نظام المعلومات الصحية (HIS Infrastructure)", en: "Health Information System Infrastructure", fr: "Infrastructure SIH", zh: "医院信息系统基础设施" }, unit: "مجموعة", qty: 1, baseMaterial: 50000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HIS", soilFactor: false, dependency: 'fixed' },
    { id: "H08.02", category: "mep_elec", type: "hospital", name: { ar: "نظام اتصالات موحد (IP Phone + WiFi)", en: "Unified Communication System (IP + WiFi)", fr: "Système Communication Unifié", zh: "统一通信系统(IP电话+WiFi)" }, unit: "مجموعة", qty: 1, baseMaterial: 30000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-UCom", soilFactor: false, dependency: 'fixed' },
    { id: "H08.03", category: "mep_elec", type: "hospital", name: { ar: "نظام مراقبة وأمن (CCTV + Access Control)", en: "Security System (CCTV + Access Control)", fr: "Système Sécurité (CCTV + Contrôle)", zh: "安防系统(监控+门禁)" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-HspSec", soilFactor: false, dependency: 'fixed' },

    // ================= H09. أقسام متخصصة =================
    { id: "H09.01", category: "architecture", type: "hospital", name: { ar: "تجهيز غرفة أشعة (تدريع رصاص)", en: "Radiology Room (Lead Shielding)", fr: "Salle Radiologie (Blindage Plomb)", zh: "放射室(铅屏蔽)" }, unit: "م2", qty: 30, baseMaterial: 2000, baseLabor: 600, waste: 0.05, suppliers: SUPPLIERS_INSULATION, sbc: "SBC 201-Xray", soilFactor: false, dependency: 'fixed' },
    { id: "H09.02", category: "architecture", type: "hospital", name: { ar: "صيدلية (تجهيز أرفف + تبريد)", en: "Pharmacy (Shelving + Cooling)", fr: "Pharmacie (Rayonnage + Refrig.)", zh: "药房(货架+冷藏)" }, unit: "م2", qty: 40, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Pharm", soilFactor: false, dependency: 'fixed' },
    { id: "H09.03", category: "architecture", type: "hospital", name: { ar: "مختبر تحاليل (Lab Fit-out)", en: "Laboratory Fit-out", fr: "Aménagement Laboratoire", zh: "实验室装修" }, unit: "م2", qty: 50, baseMaterial: 1200, baseLabor: 400, waste: 0.05, suppliers: SUPPLIERS_TILES, sbc: "SBC 201-Lab", soilFactor: false, dependency: 'fixed' },
];
