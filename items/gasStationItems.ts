/**
 * بنود محطات الوقود والخدمات
 * Gas Station & Service Station Items
 */
import { BaseItem } from '../types';

export const GAS_STATION_ITEMS: BaseItem[] = [
    // ================= GS01. خزانات الوقود =================
    { id: "GS01.01", category: "structure", type: "gas_station", name: { ar: "خزان وقود تحت الأرض (بنزين 91)", en: "Underground Fuel Tank (91 Octane)", fr: "Réservoir Souterrain (91)", zh: "地下油箱(91号)" }, unit: "عدد", qty: 2, baseMaterial: 45000, baseLabor: 15000, waste: 0, suppliers: [], sbc: "SBC-GS-Tank", soilFactor: true, dependency: 'fixed' },
    { id: "GS01.02", category: "structure", type: "gas_station", name: { ar: "خزان وقود تحت الأرض (بنزين 95)", en: "Underground Fuel Tank (95 Octane)", fr: "Réservoir Souterrain (95)", zh: "地下油箱(95号)" }, unit: "عدد", qty: 1, baseMaterial: 45000, baseLabor: 15000, waste: 0, suppliers: [], sbc: "SBC-GS-Tank", soilFactor: true, dependency: 'fixed' },
    { id: "GS01.03", category: "structure", type: "gas_station", name: { ar: "خزان وقود ديزل", en: "Diesel Fuel Tank", fr: "Réservoir Diesel", zh: "柴油箱" }, unit: "عدد", qty: 1, baseMaterial: 40000, baseLabor: 12000, waste: 0, suppliers: [], sbc: "SBC-GS-Tank", soilFactor: true, dependency: 'fixed' },
    { id: "GS01.04", category: "site", type: "gas_station", name: { ar: "حفر وتركيب خزانات وقود", en: "Tank Excavation & Installation", fr: "Excavation et Installation", zh: "油箱开挖安装" }, unit: "عدد", qty: 4, baseMaterial: 0, baseLabor: 8000, waste: 0, suppliers: [], sbc: "SBC-GS-Exc", soilFactor: true, dependency: 'fixed' },

    // ================= GS02. مضخات الوقود =================
    { id: "GS02.01", category: "architecture", type: "gas_station", name: { ar: "مضخة وقود متعددة الفوهات", en: "Multi-Nozzle Fuel Dispenser", fr: "Distributeur Multi-Buses", zh: "多嘴加油机" }, unit: "عدد", qty: 6, baseMaterial: 35000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC-GS-Pump", soilFactor: false, dependency: 'fixed' },
    { id: "GS02.02", category: "mep_elec", type: "gas_station", name: { ar: "نظام قياس وتحكم وقود إلكتروني", en: "Electronic Fuel Management System", fr: "Système Gestion Carburant", zh: "电子燃料管理系统" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: [], sbc: "SBC-GS-EMS", soilFactor: false, dependency: 'fixed' },
    { id: "GS02.03", category: "mep_plumb", type: "gas_station", name: { ar: "أنابيب وقود (من الخزان للمضخة)", en: "Fuel Pipeline (Tank to Dispenser)", fr: "Pipeline Carburant", zh: "燃料管道" }, unit: "م.ط", qty: 80, baseMaterial: 250, baseLabor: 100, waste: 0.05, suppliers: [], sbc: "SBC-GS-Pipe", soilFactor: false, dependency: 'fixed' },

    // ================= GS03. المظلات والإنشاءات =================
    { id: "GS03.01", category: "structure", type: "gas_station", name: { ar: "مظلة محطة وقود (هيكل حديد)", en: "Station Canopy (Steel Structure)", fr: "Auvent Station", zh: "加油站雨棚" }, unit: "م2", qty: 400, baseMaterial: 350, baseLabor: 150, waste: 0.05, suppliers: [], sbc: "SBC-GS-Can", soilFactor: false, dependency: 'fixed' },
    { id: "GS03.02", category: "architecture", type: "gas_station", name: { ar: "مبنى إداري ومتجر (Mini Market)", en: "Admin Building & Mini Market", fr: "Bâtiment Admin & Mini Market", zh: "管理楼和便利店" }, unit: "م2", qty: 120, baseMaterial: 1800, baseLabor: 800, waste: 0.05, suppliers: [], sbc: "SBC-GS-Bld", soilFactor: false, dependency: 'fixed' },
    { id: "GS03.03", category: "architecture", type: "gas_station", name: { ar: "دورات مياه عامة (رجال/نساء)", en: "Public Restrooms (M/F)", fr: "Toilettes Publiques", zh: "公共卫生间" }, unit: "م2", qty: 40, baseMaterial: 1500, baseLabor: 600, waste: 0.05, suppliers: [], sbc: "SBC-GS-WC", soilFactor: false, dependency: 'fixed' },
    { id: "GS03.04", category: "architecture", type: "gas_station", name: { ar: "مصلى (رجال/نساء)", en: "Prayer Room (M/F)", fr: "Salle de Prière", zh: "祈祷室" }, unit: "م2", qty: 30, baseMaterial: 1200, baseLabor: 500, waste: 0.05, suppliers: [], sbc: "SBC-GS-Pray", soilFactor: false, dependency: 'fixed' },

    // ================= GS04. السلامة والحماية =================
    { id: "GS04.01", category: "fire_protection", type: "gas_station", name: { ar: "نظام إطفاء حريق رغوي (Foam)", en: "Foam Fire Suppression System", fr: "Système Mousse Anti-Incendie", zh: "泡沫灭火系统" }, unit: "مجموعة", qty: 1, baseMaterial: 40000, baseLabor: 15000, waste: 0, suppliers: [], sbc: "SBC 901-Foam", soilFactor: false, dependency: 'fixed' },
    { id: "GS04.02", category: "fire_protection", type: "gas_station", name: { ar: "طفايات حريق بودرة (ABC)", en: "ABC Powder Extinguishers", fr: "Extincteurs Poudre ABC", zh: "ABC粉末灭火器" }, unit: "عدد", qty: 12, baseMaterial: 350, baseLabor: 30, waste: 0, suppliers: [], sbc: "SBC 901-Ext", soilFactor: false, dependency: 'fixed' },
    { id: "GS04.03", category: "safety", type: "gas_station", name: { ar: "نظام كشف تسرب وقود", en: "Fuel Leak Detection System", fr: "Détection Fuite Carburant", zh: "燃料泄漏检测" }, unit: "مجموعة", qty: 1, baseMaterial: 18000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC-GS-Leak", soilFactor: false, dependency: 'fixed' },
    { id: "GS04.04", category: "safety", type: "gas_station", name: { ar: "نظام تهوية أبخرة وقود", en: "Vapor Recovery System", fr: "Récupération Vapeurs", zh: "油气回收系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC-GS-Vapor", soilFactor: false, dependency: 'fixed' },
    { id: "GS04.05", category: "safety", type: "gas_station", name: { ar: "حواجز خرسانية حماية المضخات", en: "Concrete Bollards (Pump Protection)", fr: "Bornes Protection Pompes", zh: "混凝土防撞柱" }, unit: "عدد", qty: 16, baseMaterial: 800, baseLabor: 300, waste: 0, suppliers: [], sbc: "SBC-GS-Boll", soilFactor: false, dependency: 'fixed' },

    // ================= GS05. الأرضيات والموقع =================
    { id: "GS05.01", category: "external_works", type: "gas_station", name: { ar: "أرضية خرسانية مقاومة للوقود", en: "Fuel-Resistant Concrete Floor", fr: "Sol Béton Résistant", zh: "耐燃料混凝土地面" }, unit: "م2", qty: 600, baseMaterial: 120, baseLabor: 60, waste: 0.05, suppliers: [], sbc: "SBC-GS-Flr", soilFactor: false, dependency: 'land_area' },
    { id: "GS05.02", category: "external_works", type: "gas_station", name: { ar: "إسفلت مواقف ومداخل", en: "Asphalt Parking & Access", fr: "Asphalte Parking", zh: "停车场沥青" }, unit: "م2", qty: 300, baseMaterial: 80, baseLabor: 40, waste: 0.05, suppliers: [], sbc: "SBC-GS-Asph", soilFactor: false, dependency: 'land_area' },
    { id: "GS05.03", category: "external_works", type: "gas_station", name: { ar: "لوحات إرشادية وتسعيرة", en: "Signage & Price Boards", fr: "Signalisation et Prix", zh: "标识和价格牌" }, unit: "عدد", qty: 6, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: [], sbc: "SBC-GS-Sign", soilFactor: false, dependency: 'fixed' },
    { id: "GS05.04", category: "mep_elec", type: "gas_station", name: { ar: "إنارة LED محطة (أعمدة + مظلة)", en: "LED Lighting (Poles + Canopy)", fr: "Éclairage LED Station", zh: "LED照明" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: [], sbc: "SBC 401-GS", soilFactor: false, dependency: 'fixed' },

    // ================= GS06. خدمات إضافية =================
    { id: "GS06.01", category: "architecture", type: "gas_station", name: { ar: "مغسلة سيارات آلية", en: "Automatic Car Wash", fr: "Lavage Auto", zh: "自动洗车" }, unit: "عدد", qty: 1, baseMaterial: 80000, baseLabor: 20000, waste: 0, suppliers: [], sbc: "SBC-GS-Wash", soilFactor: false, dependency: 'fixed' },
    { id: "GS06.02", category: "architecture", type: "gas_station", name: { ar: "مركز تغيير زيوت", en: "Oil Change Center", fr: "Centre Vidange", zh: "换油中心" }, unit: "عدد", qty: 1, baseMaterial: 35000, baseLabor: 10000, waste: 0, suppliers: [], sbc: "SBC-GS-Oil", soilFactor: false, dependency: 'fixed' },
    { id: "GS06.03", category: "architecture", type: "gas_station", name: { ar: "ماكينة هواء إطارات (مجاني)", en: "Free Air Machine", fr: "Gonflage Pneus", zh: "免费充气机" }, unit: "عدد", qty: 2, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: [], sbc: "SBC-GS-Air", soilFactor: false, dependency: 'fixed' },
    { id: "GS06.04", category: "smart_systems", type: "gas_station", name: { ar: "نظام كاميرات مراقبة CCTV", en: "CCTV Surveillance System", fr: "Vidéosurveillance", zh: "监控系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC 401-CCTV", soilFactor: false, dependency: 'fixed' },
];
