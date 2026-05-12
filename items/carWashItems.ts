/**
 * بنود مغاسل السيارات
 * Car Wash Items
 * تعريف: المغسلة تحتاج WashTec/Istobal لآلات الغسيل + نظام إعادة تدوير مياه
 */
import { BaseItem } from '../types';
import {
    SUPPLIERS_STEEL, SUPPLIERS_CONCRETE, SUPPLIERS_PLUMBING,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_SMART_SECURITY, SUPPLIERS_CAR_WASH
} from './suppliers';

export const CAR_WASH_ITEMS: BaseItem[] = [
    { id: "CW01.01", category: "structure", type: "car_wash", name: { ar: "هيكل حديد مغسلة (مظلة)", en: "Car Wash Steel Canopy", fr: "Structure Acier Lavage", zh: "洗车棚钢结构" }, unit: "م2", qty: 200, baseMaterial: 300, baseLabor: 150, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-CW-Can", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.02", category: "architecture", type: "car_wash", name: { ar: "ماكينة غسيل آلي (Tunnel)", en: "Automatic Tunnel Wash Machine", fr: "Machine Tunnel Auto", zh: "隧道式洗车机" }, unit: "عدد", qty: 1, baseMaterial: 250000, baseLabor: 30000, waste: 0, suppliers: SUPPLIERS_CAR_WASH, sbc: "SBC-CW-Tunnel", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.03", category: "architecture", type: "car_wash", name: { ar: "ماكينة غسيل ذاتي (Self-Service)", en: "Self-Service Wash Bay", fr: "Baie Libre-Service", zh: "自助洗车" }, unit: "عدد", qty: 4, baseMaterial: 15000, baseLabor: 3000, waste: 0, suppliers: SUPPLIERS_CAR_WASH, sbc: "SBC-CW-Self", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.04", category: "mep_plumb", type: "car_wash", name: { ar: "نظام إعادة تدوير المياه", en: "Water Recycling System", fr: "Recyclage d'Eau", zh: "水循环系统" }, unit: "مجموعة", qty: 1, baseMaterial: 35000, baseLabor: 10000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC-CW-Recycle", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.05", category: "mep_plumb", type: "car_wash", name: { ar: "محطة تنقية مياه صرف", en: "Wastewater Treatment Station", fr: "Station Traitement Eaux", zh: "污水处理站" }, unit: "مجموعة", qty: 1, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC-CW-Treat", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.06", category: "external_works", type: "car_wash", name: { ar: "أرضية خرسانية مع ميول صرف", en: "Sloped Concrete Floor with Drainage", fr: "Sol Béton avec Pente", zh: "混凝土找坡地面" }, unit: "م2", qty: 300, baseMaterial: 100, baseLabor: 50, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-CW-Flr", soilFactor: false, dependency: 'land_area' },
    { id: "CW01.07", category: "architecture", type: "car_wash", name: { ar: "غرفة كاشير واستقبال", en: "Cashier & Reception Room", fr: "Salle Caisse", zh: "收银接待室" }, unit: "م2", qty: 15, baseMaterial: 1500, baseLabor: 600, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-CW-Office", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.08", category: "architecture", type: "car_wash", name: { ar: "غرفة تلميع وتنظيف داخلي", en: "Detailing & Interior Cleaning Room", fr: "Salle Polissage", zh: "抛光间" }, unit: "م2", qty: 40, baseMaterial: 800, baseLabor: 400, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-CW-Detail", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.09", category: "mep_elec", type: "car_wash", name: { ar: "مكانس كهربائية صناعية", en: "Industrial Vacuum Stations", fr: "Aspirateurs Industriels", zh: "工业吸尘器" }, unit: "عدد", qty: 6, baseMaterial: 3000, baseLabor: 500, waste: 0, suppliers: SUPPLIERS_CAR_WASH, sbc: "SBC-CW-Vac", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.10", category: "mep_plumb", type: "car_wash", name: { ar: "مضخات ضغط عالي", en: "High Pressure Pumps", fr: "Pompes Haute Pression", zh: "高压泵" }, unit: "عدد", qty: 4, baseMaterial: 5000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC-CW-Pump", soilFactor: false, dependency: 'fixed' },
    { id: "CW01.11", category: "mep_elec", type: "car_wash", name: { ar: "CCTV مغسلة (4 كاميرات)", en: "Car Wash CCTV (4 Cameras)", fr: "CCTV Lavage Auto", zh: "洗车监控(4摄像头)" }, unit: "مجموعة", qty: 1, baseMaterial: 4000, baseLabor: 1000, waste: 0, suppliers: SUPPLIERS_SMART_SECURITY, sbc: "SBC 401-CwCCTV", soilFactor: false, dependency: 'fixed' },
];
