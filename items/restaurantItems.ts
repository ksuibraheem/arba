/**
 * بنود المطاعم والكافيهات
 * Restaurant & Café Items
 */
import { BaseItem } from '../types';

export const RESTAURANT_ITEMS: BaseItem[] = [
    // ================= RS01. المطبخ التجاري =================
    { id: "RS01.01", category: "furniture", type: "restaurant", name: { ar: "مطبخ تجاري ستانلس ستيل كامل", en: "Commercial Stainless Kitchen", fr: "Cuisine Commerciale Inox", zh: "商用不锈钢厨房" }, unit: "مجموعة", qty: 1, baseMaterial: 120000, baseLabor: 20000, waste: 0, suppliers: [], sbc: "SBC-RS-Kit", soilFactor: false, dependency: 'fixed' },
    { id: "RS01.02", category: "mep_hvac", type: "restaurant", name: { ar: "شفاط مطبخ صناعي (Hood)", en: "Commercial Kitchen Hood", fr: "Hotte Commerciale", zh: "商用抽油烟机" }, unit: "م.ط", qty: 6, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: [], sbc: "SBC 501-Hood", soilFactor: false, dependency: 'fixed' },
    { id: "RS01.03", category: "mep_plumb", type: "restaurant", name: { ar: "فاصل شحوم (Grease Trap)", en: "Grease Trap/Interceptor", fr: "Bac à Graisse", zh: "隔油器" }, unit: "عدد", qty: 1, baseMaterial: 5000, baseLabor: 2000, waste: 0, suppliers: [], sbc: "SBC 701-GT", soilFactor: false, dependency: 'fixed' },
    { id: "RS01.04", category: "furniture", type: "restaurant", name: { ar: "ثلاجات ومجمدات تجارية", en: "Commercial Refrigerators & Freezers", fr: "Réfrigérateurs Commerciaux", zh: "商用冰箱冷柜" }, unit: "عدد", qty: 4, baseMaterial: 15000, baseLabor: 1000, waste: 0, suppliers: [], sbc: "SBC-RS-Cold", soilFactor: false, dependency: 'fixed' },
    { id: "RS01.05", category: "mep_plumb", type: "restaurant", name: { ar: "تمديدات غاز مطبخ مركزي", en: "Central Gas Supply Piping", fr: "Tuyauterie Gaz Central", zh: "中央燃气管道" }, unit: "نقطة", qty: 8, baseMaterial: 300, baseLabor: 200, waste: 0.05, suppliers: [], sbc: "SBC 701-Gas", soilFactor: false, dependency: 'fixed' },

    // ================= RS02. صالة الطعام =================
    { id: "RS02.01", category: "architecture", type: "restaurant", name: { ar: "تشطيبات صالة طعام فاخرة", en: "Premium Dining Hall Finish", fr: "Finition Salle Premium", zh: "高级餐厅装修" }, unit: "م2", qty: 150, baseMaterial: 500, baseLabor: 250, waste: 0.05, suppliers: [], sbc: "SBC 201-Din", soilFactor: false, dependency: 'build_area' },
    { id: "RS02.02", category: "furniture", type: "restaurant", name: { ar: "أثاث مطعم (طاولات + كراسي)", en: "Restaurant Furniture (Tables + Chairs)", fr: "Mobilier Restaurant", zh: "餐厅家具" }, unit: "مقعد", qty: 60, baseMaterial: 1200, baseLabor: 100, waste: 0, suppliers: [], sbc: "SBC-RS-Furn", soilFactor: false, dependency: 'fixed' },
    { id: "RS02.03", category: "architecture", type: "restaurant", name: { ar: "كاونتر استقبال/كاشير", en: "Reception/Cashier Counter", fr: "Comptoir Réception", zh: "收银台" }, unit: "م.ط", qty: 4, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: [], sbc: "SBC-RS-Counter", soilFactor: false, dependency: 'fixed' },
    { id: "RS02.04", category: "mep_hvac", type: "restaurant", name: { ar: "تكييف صالة طعام (سبليت/مخفي)", en: "Dining Hall AC (Concealed)", fr: "Climatisation Salle", zh: "餐厅空调" }, unit: "طن تبريد", qty: 10, baseMaterial: 4000, baseLabor: 1000, waste: 0, suppliers: [], sbc: "SBC 501-AC", soilFactor: false, dependency: 'build_area' },

    // ================= RS03. السلامة والحريق =================
    { id: "RS03.01", category: "fire_protection", type: "restaurant", name: { ar: "نظام إطفاء مطبخ (Ansul/Kitchen)", en: "Kitchen Fire Suppression (Ansul)", fr: "Système Ansul Cuisine", zh: "厨房灭火系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: [], sbc: "SBC 901-Kit", soilFactor: false, dependency: 'fixed' },
    { id: "RS03.02", category: "safety", type: "restaurant", name: { ar: "كاشف غاز ودخان مطبخ", en: "Kitchen Gas & Smoke Detector", fr: "Détecteur Gaz et Fumée", zh: "厨房燃气烟雾探测器" }, unit: "عدد", qty: 4, baseMaterial: 350, baseLabor: 100, waste: 0, suppliers: [], sbc: "SBC 901-Gas", soilFactor: false, dependency: 'fixed' },

    // ================= RS04. الخدمات =================
    { id: "RS04.01", category: "architecture", type: "restaurant", name: { ar: "دورات مياه (زبائن)", en: "Customer Restrooms", fr: "Toilettes Clients", zh: "顾客卫生间" }, unit: "م2", qty: 20, baseMaterial: 1500, baseLabor: 600, waste: 0.05, suppliers: [], sbc: "SBC-RS-WC", soilFactor: false, dependency: 'fixed' },
    { id: "RS04.02", category: "architecture", type: "restaurant", name: { ar: "واجهة مطعم (زجاج + كلادينج)", en: "Restaurant Facade", fr: "Façade Restaurant", zh: "餐厅外立面" }, unit: "م2", qty: 40, baseMaterial: 600, baseLabor: 200, waste: 0.05, suppliers: [], sbc: "SBC 201-Fac", soilFactor: false, dependency: 'fixed' },
    { id: "RS04.03", category: "smart_systems", type: "restaurant", name: { ar: "نظام نقاط بيع (POS)", en: "Point of Sale System", fr: "Système de Caisse", zh: "POS系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: [], sbc: "SBC-RS-POS", soilFactor: false, dependency: 'fixed' },
    { id: "RS04.04", category: "external_works", type: "restaurant", name: { ar: "جلسات خارجية (Outdoor)", en: "Outdoor Seating Area", fr: "Terrasse Extérieure", zh: "户外座位区" }, unit: "م2", qty: 40, baseMaterial: 300, baseLabor: 150, waste: 0.05, suppliers: [], sbc: "SBC-RS-Out", soilFactor: false, dependency: 'fixed' },
];
