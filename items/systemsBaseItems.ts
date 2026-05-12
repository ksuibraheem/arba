/**
 * بنود السستم التشغيلي العامة — تنطبق على كل المشاريع الكبيرة
 * Operating Systems Base Items (type: 'all')
 * 
 * تعريف السستم التشغيلي:
 * كل الأنظمة الميكانيكية والكهربائية والإلكترونية التي تجعل المبنى "يعمل"
 * في المشاريع الكبيرة (أبراج، مولات، مستشفيات) يمثل 40-60% من التكلفة
 * 
 * الأقسام المغطاة:
 * - 09.xx: النظام الكهربائي المتقدم (محولات، بسبار، لوحات، ATS)
 * - 10.xx: التكييف المركزي (تشيلر، AHU، FCU، دكت)
 * - 08.xx: السباكة المتقدمة (خزانات، صرف، حريق)
 * - 15.xx: الحماية من الحريق المتقدمة (رشاشات، مضخات، FM200)
 * - 18.xx: التيار الخفيف ELV (شبكات، CCTV، BMS، WiFi)
 * 
 * ملاحظة للعرض الفني: كل بند يحتوي على sbc (كود SBC) ومواصفات فنية ضمن الاسم
 */

import { BaseItem } from '../types';
import {
    SUPPLIERS_ELECTRICAL, SUPPLIERS_HVAC, SUPPLIERS_PLUMBING,
    SUPPLIERS_FIRE_SAFETY, SUPPLIERS_SMART_SECURITY, SUPPLIERS_TANKS,
    SUPPLIERS_GENERATORS, SUPPLIERS_BMS_ELV, SUPPLIERS_NETWORKING
} from './suppliers';

export const SYSTEMS_BASE_ITEMS: BaseItem[] = [

    // ===================== 09. النظام الكهربائي المتقدم =====================
    // تعريف: يشمل توصيل الطاقة من شركة الكهرباء حتى آخر نقطة استخدام
    { id: "09.09", category: "mep_elec", type: "all", name: { ar: "لوحات توزيع فرعية (SMDB)", en: "Sub Main Distribution Board (SMDB)", fr: "Tableau Divisionnaire (TGBT)", zh: "分配电柜(SMDB)" }, unit: "عدد", qty: 0, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-SMDB", soilFactor: false, dependency: 'build_area' },
    { id: "09.10", category: "mep_elec", type: "all", name: { ar: "بسبار رئيسي (Bus Duct / Rising Main)", en: "Busbar Duct / Rising Main", fr: "Canalisation Électrique (Busbar)", zh: "母线槽/垂直主干" }, unit: "م.ط", qty: 0, baseMaterial: 1200, baseLabor: 400, waste: 0.03, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Busbar", soilFactor: false, dependency: 'build_area' },
    { id: "09.11", category: "mep_elec", type: "all", name: { ar: "كابلات قوى رئيسية LV (من المحول للوحة)", en: "LV Power Cables (Transformer to MDB)", fr: "Câbles BT Principaux", zh: "低压电力电缆(变压器至配电柜)" }, unit: "م.ط", qty: 0, baseMaterial: 350, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-LVCable", soilFactor: false, dependency: 'build_area' },
    { id: "09.12", category: "mep_elec", type: "all", name: { ar: "ATS تحويل أوتوماتيكي (شبكة ↔ مولد)", en: "Automatic Transfer Switch (ATS)", fr: "Inverseur de Source Automatique", zh: "自动转换开关(ATS)" }, unit: "مجموعة", qty: 0, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-ATS", soilFactor: false, dependency: 'fixed' },
    { id: "09.13", category: "mep_elec", type: "all", name: { ar: "نظام تصحيح عامل القدرة (PFC)", en: "Power Factor Correction (PFC)", fr: "Compensation du Facteur de Puissance", zh: "功率因数补偿(PFC)" }, unit: "مجموعة", qty: 0, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-PFC", soilFactor: false, dependency: 'fixed' },
    { id: "09.14", category: "mep_elec", type: "all", name: { ar: "إنارة طوارئ ولوحات خروج (Emergency/Exit)", en: "Emergency Lighting & Exit Signs", fr: "Éclairage de Secours et Signalisation", zh: "应急照明和出口标识" }, unit: "عدد", qty: 0, baseMaterial: 120, baseLabor: 40, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-EmLt", soilFactor: false, dependency: 'build_area' },
    { id: "09.15", category: "mep_elec", type: "all", name: { ar: "مجرى كابلات (Cable Tray/Ladder)", en: "Cable Tray / Ladder Rack", fr: "Chemin de Câbles", zh: "电缆桥架" }, unit: "م.ط", qty: 0, baseMaterial: 80, baseLabor: 30, waste: 0.05, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-CTray", soilFactor: false, dependency: 'build_area' },
    { id: "09.16", category: "mep_elec", type: "all", name: { ar: "محول كهرباء (Transformer 500-2000 KVA)", en: "Power Transformer (500-2000 KVA)", fr: "Transformateur de Puissance", zh: "电力变压器(500-2000KVA)" }, unit: "عدد", qty: 0, baseMaterial: 120000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-Trf", soilFactor: false, dependency: 'fixed' },
    { id: "09.17", category: "mep_elec", type: "all", name: { ar: "غرفة محول كهرباء (إنشائي + تهوية)", en: "Transformer Room (Civil + Ventilation)", fr: "Local Transformateur", zh: "变压器室(土建+通风)" }, unit: "مجموعة", qty: 0, baseMaterial: 25000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-TrfRm", soilFactor: false, dependency: 'fixed' },
    { id: "09.18", category: "mep_elec", type: "all", name: { ar: "UPS مركزي (نظام طاقة احتياطية)", en: "Central UPS System", fr: "Onduleur Central (UPS)", zh: "中央UPS系统" }, unit: "مجموعة", qty: 0, baseMaterial: 30000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-UPS", soilFactor: false, dependency: 'fixed' },

    // ===================== 10. التكييف المركزي =====================
    // تعريف: نظام التبريد والتدفئة والتهوية المركزي — للمشاريع التي تتجاوز 500م²
    { id: "10.04", category: "mep_hvac", type: "all", name: { ar: "تشيلر مركزي (Chiller — وحدة تبريد)", en: "Central Chiller Unit", fr: "Groupe Froid Central (Chiller)", zh: "中央冷水机组" }, unit: "طن تبريد", qty: 0, baseMaterial: 1400, baseLabor: 250, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-Chiller", soilFactor: false, dependency: 'build_area' }, // v2.0: سعر سوق 2026
    { id: "10.05", category: "mep_hvac", type: "all", name: { ar: "أبراج تبريد (Cooling Tower)", en: "Cooling Tower", fr: "Tour de Refroidissement", zh: "冷却塔" }, unit: "عدد", qty: 0, baseMaterial: 60000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-CT", soilFactor: false, dependency: 'fixed' },
    { id: "10.06", category: "mep_hvac", type: "all", name: { ar: "مضخات مياه مبردة (CHW Pumps)", en: "Chilled Water Pumps (Primary + Secondary)", fr: "Pompes Eau Glacée", zh: "冷冻水泵(一次+二次)" }, unit: "مجموعة", qty: 0, baseMaterial: 20000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-CHWPump", soilFactor: false, dependency: 'fixed' },
    { id: "10.07", category: "mep_hvac", type: "all", name: { ar: "وحدة مناولة هواء (AHU)", en: "Air Handling Unit (AHU)", fr: "Centrale de Traitement d'Air (CTA)", zh: "空气处理机组(AHU)" }, unit: "عدد", qty: 0, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-AHU", soilFactor: false, dependency: 'fixed' },
    { id: "10.08", category: "mep_hvac", type: "all", name: { ar: "FCU مراوح كويل (Fan Coil Unit)", en: "Fan Coil Unit (FCU)", fr: "Ventilo-Convecteur (FCU)", zh: "风机盘管(FCU)" }, unit: "عدد", qty: 0, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-FCU", soilFactor: false, dependency: 'build_area' },
    { id: "10.09", category: "mep_hvac", type: "all", name: { ar: "مجاري هواء معزولة (GI Ductwork)", en: "Insulated GI Ductwork", fr: "Gaines Isolées (GI)", zh: "保温镀锌风管" }, unit: "م2", qty: 0, baseMaterial: 80, baseLabor: 40, waste: 0.1, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-Duct", soilFactor: false, dependency: 'build_area' },
    { id: "10.10", category: "mep_hvac", type: "all", name: { ar: "ديفيوزرات وجريلات تكييف", en: "Air Diffusers & Grilles", fr: "Diffuseurs et Grilles", zh: "散流器和格栅" }, unit: "عدد", qty: 0, baseMaterial: 80, baseLabor: 25, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-Diff", soilFactor: false, dependency: 'build_area' },
    { id: "10.11", category: "mep_hvac", type: "all", name: { ar: "نظام VRF/VRV (تبريد متغير التدفق)", en: "VRF/VRV System (Variable Refrigerant)", fr: "Système VRF/VRV", zh: "VRF/VRV变冷媒流量系统" }, unit: "طن تبريد", qty: 0, baseMaterial: 5000, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-VRF", soilFactor: false, dependency: 'build_area' },

    // ===================== 08. السباكة المتقدمة =====================
    // تعريف: أنظمة المياه والصرف المتقدمة — خزانات أرضية، شبكة حريق، صرف أمطار
    { id: "08.09", category: "mep_plumb", type: "all", name: { ar: "خزان مياه أرضي خرساني", en: "Underground Concrete Water Tank", fr: "Réservoir Souterrain Béton", zh: "地下混凝土水箱" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-UGTank", soilFactor: true, dependency: 'fixed' },
    { id: "08.10", category: "mep_plumb", type: "all", name: { ar: "شبكة مياه حريق (Fire Water Line)", en: "Fire Water Network", fr: "Réseau Eau Incendie", zh: "消防水管网" }, unit: "م.ط", qty: 0, baseMaterial: 120, baseLabor: 60, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-FWLine", soilFactor: false, dependency: 'build_area' },
    { id: "08.11", category: "mep_plumb", type: "all", name: { ar: "خزان مياه حريق أرضي", en: "Fire Water Tank (Underground)", fr: "Réservoir Eau Incendie", zh: "消防水箱(地下)" }, unit: "مجموعة", qty: 0, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-FWTank", soilFactor: true, dependency: 'fixed' },
    { id: "08.12", category: "mep_plumb", type: "all", name: { ar: "نظام صرف أمطار (Storm Drainage)", en: "Storm Water Drainage System", fr: "Réseau Eaux Pluviales", zh: "雨水排水系统" }, unit: "مجموعة", qty: 1, baseMaterial: 5000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Storm", soilFactor: false, dependency: 'land_area' },
    { id: "08.13", category: "mep_plumb", type: "all", name: { ar: "سخان مياه مركزي (Calorifier)", en: "Central Water Heater (Calorifier)", fr: "Chauffe-eau Central (Calorifier)", zh: "中央热水器(容积式)" }, unit: "عدد", qty: 0, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Calor", soilFactor: false, dependency: 'fixed' },
    { id: "08.14", category: "mep_plumb", type: "all", name: { ar: "تمديدات غاز مركزي (LPG)", en: "Central LPG Gas Piping", fr: "Tuyauterie Gaz Central (GPL)", zh: "中央液化气管道" }, unit: "نقطة", qty: 0, baseMaterial: 250, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-LPG", soilFactor: false, dependency: 'fixed' },

    // ===================== 15. حماية الحريق المتقدمة =====================
    // تعريف: أنظمة إطفاء وإنذار الحريق الشاملة — إلزامية للمباني >3 أدوار أو >500م²
    { id: "15.05", category: "safety", type: "all", name: { ar: "شبكة رشاشات حريق (Sprinkler System)", en: "Fire Sprinkler System", fr: "Système Sprinkler Incendie", zh: "消防喷淋系统" }, unit: "م²", qty: 0, baseMaterial: 42, baseLabor: 18, waste: 0.05, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-Sprk", soilFactor: false, dependency: 'build_area' }, // v2.0: سعر سوق 2026
    { id: "15.06", category: "safety", type: "all", name: { ar: "مضخات حريق (Jockey + Main + Diesel)", en: "Fire Pump Set (Jockey + Electric + Diesel)", fr: "Groupe de Pompes Incendie", zh: "消防泵组(稳压+电动+柴油)" }, unit: "مجموعة", qty: 0, baseMaterial: 60000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-FPump", soilFactor: false, dependency: 'fixed' },
    { id: "15.07", category: "safety", type: "all", name: { ar: "لوحة إنذار حريق ذكية (Addressable Panel)", en: "Addressable Fire Alarm Panel", fr: "Centrale Incendie Adressable", zh: "可寻址火灾报警主机" }, unit: "مجموعة", qty: 0, baseMaterial: 40000, baseLabor: 12000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-FAlarm", soilFactor: false, dependency: 'fixed' },
    { id: "15.08", category: "safety", type: "all", name: { ar: "نظام إطفاء FM200/نوفيك (غرف كهرباء وسيرفرات)", en: "FM200/Novec Clean Agent System", fr: "Système FM200/Novec", zh: "FM200/Novec洁净灭火系统" }, unit: "مجموعة", qty: 0, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-FM200", soilFactor: false, dependency: 'fixed' },

    // ===================== 18. التيار الخفيف والأنظمة الذكية (ELV) =====================
    // تعريف: كل الأنظمة الإلكترونية منخفضة الجهد التي توفر الاتصالات والأمن والتحكم
    // في المشاريع الكبيرة تكلفة ELV تصل 500,000 - 2,000,000 ر.س
    { id: "18.01", category: "mep_elec", type: "all", name: { ar: "شبكة بيانات هيكلية (Structured Cabling CAT6A)", en: "Structured Cabling Network (CAT6A)", fr: "Câblage Structuré (CAT6A)", zh: "结构化布线(CAT6A)" }, unit: "نقطة", qty: 0, baseMaterial: 200, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-SC", soilFactor: false, dependency: 'build_area' },
    { id: "18.02", category: "mep_elec", type: "all", name: { ar: "خزانة شبكة (Network Rack 42U)", en: "Network Rack Cabinet (42U)", fr: "Baie de Brassage (42U)", zh: "网络机柜(42U)" }, unit: "عدد", qty: 0, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-NRack", soilFactor: false, dependency: 'fixed' },
    { id: "18.03", category: "mep_elec", type: "all", name: { ar: "كاميرات مراقبة IP (CCTV)", en: "IP CCTV Surveillance Camera", fr: "Caméra Surveillance IP (CCTV)", zh: "IP网络监控摄像头" }, unit: "كاميرا", qty: 0, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-CCTV", soilFactor: false, dependency: 'build_area' },
    { id: "18.04", category: "mep_elec", type: "all", name: { ar: "مسجل كاميرات شبكي (NVR)", en: "Network Video Recorder (NVR)", fr: "Enregistreur Vidéo Réseau (NVR)", zh: "网络视频录像机(NVR)" }, unit: "عدد", qty: 0, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-NVR", soilFactor: false, dependency: 'fixed' },
    { id: "18.05", category: "mep_elec", type: "all", name: { ar: "نظام تحكم دخول (Access Control)", en: "Access Control System (Card/Fingerprint)", fr: "Contrôle d'Accès (Carte/Empreinte)", zh: "门禁系统(卡/指纹)" }, unit: "باب", qty: 0, baseMaterial: 2500, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-Access", soilFactor: false, dependency: 'build_area' },
    { id: "18.06", category: "mep_elec", type: "all", name: { ar: "نظام إنتركم فيديو", en: "Video Intercom System", fr: "Interphone Vidéo", zh: "视频对讲系统" }, unit: "مجموعة", qty: 0, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-Intcom", soilFactor: false, dependency: 'fixed' },
    { id: "18.07", category: "mep_elec", type: "all", name: { ar: "نظام صوت مركزي (PA/BGM)", en: "Public Address / BGM System", fr: "Système de Sonorisation (PA)", zh: "公共广播/背景音乐系统" }, unit: "مجموعة", qty: 0, baseMaterial: 12000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-PA", soilFactor: false, dependency: 'fixed' },
    { id: "18.08", category: "mep_elec", type: "all", name: { ar: "نظام هاتف IP (VoIP/PABX)", en: "IP Telephone System (VoIP/PABX)", fr: "Téléphonie IP (VoIP/PABX)", zh: "IP电话系统(VoIP/PABX)" }, unit: "نقطة", qty: 0, baseMaterial: 300, baseLabor: 100, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-VoIP", soilFactor: false, dependency: 'build_area' },
    { id: "18.09", category: "mep_elec", type: "all", name: { ar: "WiFi مركزي (Enterprise Access Points)", en: "Enterprise WiFi System (Access Points)", fr: "WiFi Entreprise (Points d'Accès)", zh: "企业WiFi系统(AP)" }, unit: "نقطة", qty: 0, baseMaterial: 1500, baseLabor: 400, waste: 0, suppliers: SUPPLIERS_NETWORKING, sbc: "SBC 401-WiFi", soilFactor: false, dependency: 'build_area' },
    { id: "18.10", category: "mep_elec", type: "all", name: { ar: "نظام إدارة المبنى (BMS)", en: "Building Management System (BMS)", fr: "Système de Gestion du Bâtiment (GTB)", zh: "楼宇管理系统(BMS)" }, unit: "مجموعة", qty: 0, baseMaterial: 105000, baseLabor: 20000, waste: 0, suppliers: SUPPLIERS_BMS_ELV, sbc: "SBC 501-BMS", soilFactor: false, dependency: 'fixed' },
    { id: "18.11", category: "mep_elec", type: "all", name: { ar: "نظام إنذار سرقة (Intrusion Detection)", en: "Intrusion Detection / Burglar Alarm", fr: "Système Anti-Intrusion", zh: "入侵探测/防盗报警" }, unit: "مجموعة", qty: 0, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-Intrus", soilFactor: false, dependency: 'fixed' },
    { id: "18.12", category: "mep_elec", type: "all", name: { ar: "شاشات عرض رقمية (Digital Signage)", en: "Digital Signage Display System", fr: "Affichage Numérique", zh: "数字标牌显示系统" }, unit: "عدد", qty: 0, baseMaterial: 5000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-DigiSign", soilFactor: false, dependency: 'fixed' },

    // ===================== 19. Electrical Panels & Generators =====================
    { id: "19.01", category: "mep_elec", type: "all", name: { ar: "لوحة توزيع رئيسية (MDB 800A)", en: "Main Distribution Board (MDB 800A)", fr: "TGBT 800A", zh: "MDB 800A" }, unit: "عدد", qty: 0, baseMaterial: 35000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-MDB", soilFactor: false, dependency: 'fixed' },
    // 19.02 (ATS) — REMOVED: duplicate of 09.12
    { id: "19.03", category: "mep_elec", type: "all", name: { ar: "محول كهربائي (1000KVA)", en: "Electrical Transformer (1000KVA)", fr: "Transformateur", zh: "Transformer" }, unit: "عدد", qty: 0, baseMaterial: 120000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-TRF", soilFactor: false, dependency: 'fixed' },
    { id: "19.04", category: "mep_elec", type: "all", name: { ar: "مولد احتياطي (500KVA)", en: "Backup Generator (500KVA)", fr: "Groupe Électrogène", zh: "Generator" }, unit: "عدد", qty: 0, baseMaterial: 90000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_GENERATORS, sbc: "SBC 401-GEN", soilFactor: false, dependency: 'fixed' },

    // ===================== 20. Central HVAC =====================
    // 20.01 (Chiller) — REMOVED: duplicate of 10.04
    { id: "20.02", category: "mep_hvac", type: "all", name: { ar: "وحدة مناولة هواء (AHU)", en: "Air Handling Unit (AHU)", fr: "Centrale de Traitement d'Air", zh: "AHU" }, unit: "عدد", qty: 0, baseMaterial: 45000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-AHU", soilFactor: false, dependency: 'fixed' },
    { id: "20.03", category: "mep_hvac", type: "all", name: { ar: "وحدة ملف ومروحة (FCU)", en: "Fan Coil Unit (FCU)", fr: "Ventilo-convecteur", zh: "FCU" }, unit: "عدد", qty: 0, baseMaterial: 3500, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-FCU", soilFactor: false, dependency: 'build_area' },
    { id: "20.04", category: "mep_hvac", type: "all", name: { ar: "شبكة مجاري الهواء (Ductwork)", en: "HVAC Ductwork Network", fr: "Réseau de Gaines", zh: "Ducts" }, unit: "م²", qty: 0, baseMaterial: 90, baseLabor: 45, waste: 0.1, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-DCT", soilFactor: false, dependency: 'build_area' }, // v2.0: تصحيح تكرار — مطابق لـ 10.09
    { id: "20.05", category: "mep_hvac", type: "all", name: { ar: "مراوح طرد مركزي للدخان", en: "Smoke Exhaust Fans", fr: "Désenfumage", zh: "Exhaust" }, unit: "عدد", qty: 0, baseMaterial: 15000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-EXH", soilFactor: false, dependency: 'fixed' },

    // ===================== 21. Wet Riser & Fire Tank =====================
    { id: "21.01", category: "safety", type: "all", name: { ar: "شبكة مواسير الحريق (Wet Riser)", en: "Wet Riser Fire Network", fr: "Réseau Incendie Armé", zh: "Wet Riser" }, unit: "م.ط", qty: 0, baseMaterial: 120, baseLabor: 40, waste: 0.05, suppliers: SUPPLIERS_FIRE_SAFETY, sbc: "SBC 901-WR", soilFactor: false, dependency: 'build_area' },
    { id: "21.02", category: "safety", type: "all", name: { ar: "خزان مياه حريق (200م3)", en: "Fire Water Tank (200m3)", fr: "Cuve Incendie", zh: "Fire Tank" }, unit: "عدد", qty: 0, baseMaterial: 45000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 901-TNK", soilFactor: false, dependency: 'fixed' },
    // 21.03 (BMS) — REMOVED: duplicate of 18.10
    
];