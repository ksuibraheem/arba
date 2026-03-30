/**
 * بنود خاصة بالمزارع
 * Farm Specific Construction Items
 * Note: 'farm' is not in the current ProjectType union — these items use type 'villa' as a placeholder
 * until the ProjectType is extended to include 'farm'.
 * For now, we export them so they can be manually included if needed.
 */

import { BaseItem, ProjectType } from '../types';
import {
    SUPPLIERS_CONCRETE, SUPPLIERS_STEEL, SUPPLIERS_HVAC,
    SUPPLIERS_ELECTRICAL, SUPPLIERS_PLUMBING,
    SUPPLIERS_HEAVY_EQUIPMENT, SUPPLIERS_LANDSCAPING,
    SUPPLIERS_INSULATION, SUPPLIERS_SOLAR, SUPPLIERS_TANKS
} from './suppliers';

// Farm is not currently in ProjectType, so we'll type these as 'all' for now
// They can be filtered by category and id prefix "FM" in the UI
export const FARM_ITEMS: BaseItem[] = [
    // ================= FM01. الآبار والمياه =================
    { id: "FM01.01", category: "mep_plumb", type: "farm", name: { ar: "حفر بئر ارتوازي (عمق 100م)", en: "Artesian Well Drilling (100m)", fr: "Forage Puits Artésien (100m)", zh: "自流井钻探(100米)" }, unit: "م.ط", qty: 100, baseMaterial: 300, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_HEAVY_EQUIPMENT, sbc: "SBC-Well", soilFactor: true, dependency: 'fixed' },
    { id: "FM01.02", category: "mep_plumb", type: "farm", name: { ar: "مضخة بئر غاطسة (30 حصان)", en: "Submersible Pump (30 HP)", fr: "Pompe Immergée (30 CV)", zh: "潜水泵(30马力)" }, unit: "عدد", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-WellPmp", soilFactor: false, dependency: 'fixed' },
    { id: "FM01.03", category: "mep_plumb", type: "farm", name: { ar: "خزان مياه أرضي كبير (50,000 لتر)", en: "Large Ground Water Tank (50,000L)", fr: "Grand Réservoir (50,000L)", zh: "大型地面水箱(50,000升)" }, unit: "عدد", qty: 1, baseMaterial: 18000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_TANKS, sbc: "SBC 701-LTnk", soilFactor: false, dependency: 'fixed' },
    { id: "FM01.04", category: "mep_plumb", type: "farm", name: { ar: "شبكة ري بالتنقيط (Drip Irrigation)", en: "Drip Irrigation Network", fr: "Réseau Irrigation Goutte à Goutte", zh: "滴灌网络" }, unit: "م.ط", qty: 5000, baseMaterial: 8, baseLabor: 3, waste: 0.1, suppliers: SUPPLIERS_PLUMBING, sbc: "SBC 701-Drip", soilFactor: false, dependency: 'land_area' },
    { id: "FM01.05", category: "mep_plumb", type: "farm", name: { ar: "شبكة ري رشاشات محورية (Center Pivot)", en: "Center Pivot Irrigation System", fr: "Système Pivot Central", zh: "中心支架喷灌系统" }, unit: "مجموعة", qty: 1, baseMaterial: 80000, baseLabor: 15000, waste: 0, suppliers: SUPPLIERS_HEAVY_EQUIPMENT, sbc: "SBC-Pivot", soilFactor: false, dependency: 'fixed' },

    // ================= FM02. المباني الزراعية =================
    { id: "FM02.01", category: "structure", type: "farm", name: { ar: "صوبة زراعية (Greenhouse 30×10م)", en: "Greenhouse (30x10m)", fr: "Serre Agricole (30x10m)", zh: "温室大棚(30x10米)" }, unit: "م2", qty: 300, baseMaterial: 120, baseLabor: 50, waste: 0.08, suppliers: SUPPLIERS_STEEL, sbc: "SBC-GHouse", soilFactor: false, dependency: 'fixed' },
    { id: "FM02.02", category: "structure", type: "farm", name: { ar: "حظائر حيوانات (حديد + ساندوتش بانل)", en: "Animal Barns (Steel + Panels)", fr: "Étables (Acier + Panneaux)", zh: "畜棚(钢结构+板材)" }, unit: "م2", qty: 200, baseMaterial: 180, baseLabor: 70, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Barn", soilFactor: false, dependency: 'fixed' },
    { id: "FM02.03", category: "structure", type: "farm", name: { ar: "مخزن أعلاف ومعدات", en: "Feed & Equipment Storage", fr: "Stockage Aliments et Équipements", zh: "饲料和设备仓库" }, unit: "م2", qty: 100, baseMaterial: 150, baseLabor: 60, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-FeedStore", soilFactor: false, dependency: 'fixed' },
    { id: "FM02.04", category: "structure", type: "farm", name: { ar: "حاضنة دواجن (Poultry House)", en: "Poultry House", fr: "Poulailler", zh: "禽舍" }, unit: "م2", qty: 300, baseMaterial: 200, baseLabor: 80, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-Poultry", soilFactor: false, dependency: 'fixed' },

    // ================= FM03. الطاقة والكهرباء =================
    { id: "FM03.01", category: "mep_elec", type: "farm", name: { ar: "نظام طاقة شمسية مزرعة (50 كيلو واط)", en: "Farm Solar Power System (50kW)", fr: "Système Solaire Ferme (50kW)", zh: "农场太阳能系统(50千瓦)" }, unit: "مجموعة", qty: 1, baseMaterial: 140000, baseLabor: 25000, waste: 0, suppliers: SUPPLIERS_SOLAR, sbc: "SBC 401-FrmSol", soilFactor: false, dependency: 'fixed' },
    { id: "FM03.02", category: "mep_elec", type: "farm", name: { ar: "مولد كهرباء ديزل (100 كيلو)", en: "Diesel Generator (100kW)", fr: "Groupe Électrogène (100kW)", zh: "柴油发电机(100千瓦)" }, unit: "عدد", qty: 1, baseMaterial: 60000, baseLabor: 5000, waste: 0, suppliers: SUPPLIERS_ELECTRICAL, sbc: "SBC 401-FrmGen", soilFactor: false, dependency: 'fixed' },

    // ================= FM04. الأسوار والبوابات =================
    { id: "FM04.01", category: "architecture", type: "farm", name: { ar: "سور شبكي زراعي (Chain Link) مع أعمدة", en: "Chain Link Fence with Posts", fr: "Clôture Grillagée avec Poteaux", zh: "铁丝网围栏带柱" }, unit: "م.ط", qty: 500, baseMaterial: 80, baseLabor: 30, waste: 0.05, suppliers: SUPPLIERS_STEEL, sbc: "SBC-ChainFence", soilFactor: false, dependency: 'land_area' },
    { id: "FM04.02", category: "architecture", type: "farm", name: { ar: "بوابة مزرعة رئيسية (حديد منزلق)", en: "Main Farm Gate (Sliding Steel)", fr: "Portail Principal Ferme", zh: "农场主大门(滑动钢)" }, unit: "عدد", qty: 1, baseMaterial: 6000, baseLabor: 1500, waste: 0, suppliers: SUPPLIERS_STEEL, sbc: "SBC-FrmGate", soilFactor: false, dependency: 'fixed' },

    // ================= FM05. البنية التحتية =================
    { id: "FM05.01", category: "architecture", type: "farm", name: { ar: "طرق داخلية ترابية مدموكة", en: "Compacted Dirt Internal Roads", fr: "Routes Internes en Terre Compactée", zh: "压实土路(内部)" }, unit: "م2", qty: 2000, baseMaterial: 10, baseLabor: 8, waste: 0, suppliers: SUPPLIERS_HEAVY_EQUIPMENT, sbc: "SBC-DirtRd", soilFactor: false, dependency: 'land_area' },
    { id: "FM05.02", category: "mep_plumb", type: "farm", name: { ar: "حوض سمكي (Aquaculture Pond)", en: "Aquaculture Fish Pond", fr: "Bassin Piscicole", zh: "鱼塘" }, unit: "م3", qty: 200, baseMaterial: 50, baseLabor: 30, waste: 0.1, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC-FishPond", soilFactor: false, dependency: 'fixed' },
    { id: "FM05.03", category: "structure", type: "farm", name: { ar: "سكن عمال مزرعة (4 غرف)", en: "Farm Workers Housing (4 Rooms)", fr: "Logement Ouvriers (4 Chambres)", zh: "农场工人宿舍(4间)" }, unit: "م2", qty: 60, baseMaterial: 400, baseLabor: 200, waste: 0.05, suppliers: SUPPLIERS_CONCRETE, sbc: "SBC 304-FrmHouse", soilFactor: false, dependency: 'fixed' },

    // ================= FM06. التبريد والتخزين =================
    { id: "FM06.01", category: "mep_hvac", type: "farm", name: { ar: "غرفة تبريد محاصيل (Cold Room)", en: "Crop Cold Storage Room", fr: "Chambre Froide Cultures", zh: "农产品冷库" }, unit: "م3", qty: 50, baseMaterial: 800, baseLabor: 300, waste: 0.05, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-ColdRoom", soilFactor: false, dependency: 'fixed' },
    { id: "FM06.02", category: "mep_hvac", type: "farm", name: { ar: "نظام تهوية حظائر (مراوح + فتحات)", en: "Barn Ventilation System (Fans + Vents)", fr: "Ventilation Étables", zh: "畜棚通风系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: SUPPLIERS_HVAC, sbc: "SBC 501-BarnVn", soilFactor: false, dependency: 'fixed' },
];
