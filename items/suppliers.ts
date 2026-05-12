/**
 * قاعدة بيانات الموردين السعوديين الحقيقيين
 * Real Saudi Suppliers Database — shared across all project types
 */

import { SupplierOption } from '../types';

// ====================== الخرسانة الجاهزة والأسمنت ======================
export const SUPPLIERS_CONCRETE: SupplierOption[] = [
    { id: 'sup_rmx_muhaidib', name: { ar: 'المهيدب للخرسانة', en: 'Al-Muhaidib Ready Mix', fr: 'Al-Muhaidib Béton', zh: 'Al-Muhaidib预拌' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_rmx_sapac', name: { ar: 'سباك SAPAC', en: 'SAPAC Ready Mix', fr: 'SAPAC Béton', zh: 'SAPAC预拌' }, tier: 'premium', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_rmx_yamama', name: { ar: 'اليمامة للخرسانة', en: 'Yamama Ready Mix', fr: 'Yamama Béton', zh: 'Yamama预拌' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_rmx_rajhi', name: { ar: 'الراجحي للخرسانة', en: 'Al-Rajhi Ready Mix', fr: 'Al-Rajhi Béton', zh: 'Al-Rajhi预拌' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'sup_rmx_bmic', name: { ar: 'BMIC للخرسانة', en: 'BMIC Ready Mix', fr: 'BMIC Béton', zh: 'BMIC预拌' }, tier: 'budget', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_cem_yamama', name: { ar: 'إسمنت اليمامة', en: 'Yamama Cement', fr: 'Ciment Yamama', zh: 'Yamama水泥' }, tier: 'premium', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_cem_yanbu', name: { ar: 'إسمنت ينبع', en: 'Yanbu Cement', fr: 'Ciment Yanbu', zh: 'Yanbu水泥' }, tier: 'standard', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_cem_south', name: { ar: 'إسمنت الجنوبية', en: 'Southern Cement', fr: 'Ciment du Sud', zh: '南方水泥' }, tier: 'standard', priceMultiplier: 0.93, origin: 'Saudi' },
    { id: 'sup_cem_north', name: { ar: 'إسمنت الشمالية', en: 'Northern Cement', fr: 'Ciment du Nord', zh: '北方水泥' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Saudi' },
    { id: 'sup_cem_city', name: { ar: 'إسمنت المدينة', en: 'City Cement', fr: 'Ciment City', zh: '城市水泥' }, tier: 'standard', priceMultiplier: 0.97, origin: 'Saudi' },
    { id: 'sup_cem_tabuk', name: { ar: 'إسمنت تبوك', en: 'Tabuk Cement', fr: 'Ciment Tabuk', zh: 'Tabuk水泥' }, tier: 'budget', priceMultiplier: 0.92, origin: 'Saudi' },
    { id: 'sup_cem_najran', name: { ar: 'إسمنت نجران', en: 'Najran Cement', fr: 'Ciment Najran', zh: 'Najran水泥' }, tier: 'budget', priceMultiplier: 0.91, origin: 'Saudi' },
    { id: 'sup_cem_hail', name: { ar: 'إسمنت حائل', en: 'Hail Cement', fr: 'Ciment Hail', zh: 'Hail水泥' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Saudi' },
];

// ====================== الحديد والصلب ======================
export const SUPPLIERS_STEEL: SupplierOption[] = [
    { id: 'sup_stl_sabic', name: { ar: 'حديد سابك (حديد)', en: 'SABIC (Hadeed)', fr: 'SABIC (Hadeed)', zh: 'SABIC(哈迪德)' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_stl_rajhi', name: { ar: 'حديد الراجحي', en: 'Al-Rajhi Steel', fr: 'Acier Al-Rajhi', zh: 'Al-Rajhi钢铁' }, tier: 'premium', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_stl_ahli', name: { ar: 'حديد الأهلية', en: 'National Steel (Ahlia)', fr: 'Acier National', zh: '国家钢铁' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_stl_ittefaq', name: { ar: 'حديد الاتفاق', en: 'Al-Ittefaq Steel', fr: 'Acier Al-Ittefaq', zh: 'Al-Ittefaq钢铁' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_stl_yamamasteel', name: { ar: 'حديد اليمامة', en: 'Yamama Steel', fr: 'Acier Yamama', zh: 'Yamama钢铁' }, tier: 'standard', priceMultiplier: 0.98, origin: 'Saudi' },
    { id: 'sup_stl_tuwairqi', name: { ar: 'حديد التويرقي', en: 'Al-Tuwairqi Steel', fr: 'Acier Al-Tuwairqi', zh: 'Al-Tuwairqi钢铁' }, tier: 'budget', priceMultiplier: 0.92, origin: 'Saudi' },
    { id: 'sup_stl_zamil', name: { ar: 'الزامل للحديد', en: 'Zamil Steel', fr: 'Acier Zamil', zh: 'Zamil钢铁' }, tier: 'premium', priceMultiplier: 1.2, origin: 'Saudi' },
];

// ====================== الكهرباء ======================
export const SUPPLIERS_ELECTRICAL: SupplierOption[] = [
    { id: 'sup_elc_alfanar', name: { ar: 'الفنار', en: 'Al-Fanar Electric', fr: 'Al-Fanar Électrique', zh: 'Al-Fanar电气' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_elc_schneider', name: { ar: 'شنايدر إلكتريك', en: 'Schneider Electric', fr: 'Schneider Electric', zh: '施耐德电气' }, tier: 'premium', priceMultiplier: 1.3, origin: 'France' },
    { id: 'sup_elc_abb', name: { ar: 'ABB السعودية', en: 'ABB Saudi', fr: 'ABB Arabie', zh: 'ABB沙特' }, tier: 'premium', priceMultiplier: 1.25, origin: 'Sweden' },
    { id: 'sup_elc_legrand', name: { ar: 'لوجراند', en: 'Legrand', fr: 'Legrand', zh: '罗格朗' }, tier: 'premium', priceMultiplier: 1.2, origin: 'France' },
    { id: 'sup_elc_riyadh_cables', name: { ar: 'كابلات الرياض', en: 'Riyadh Cables', fr: 'Câbles Riyadh', zh: '利雅得电缆' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_elc_jeddah_cables', name: { ar: 'كابلات جدة', en: 'Jeddah Cables', fr: 'Câbles Jeddah', zh: '吉达电缆' }, tier: 'standard', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_elc_eaton', name: { ar: 'إيتون', en: 'Eaton', fr: 'Eaton', zh: '伊顿' }, tier: 'standard', priceMultiplier: 1.1, origin: 'USA' },
    { id: 'sup_elc_hager', name: { ar: 'هاجر', en: 'Hager', fr: 'Hager', zh: 'Hager' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Germany' },
];

// ====================== المفاتيح والأفياش ======================
export const SUPPLIERS_SWITCHES: SupplierOption[] = [
    { id: 'sup_sw_schneider', name: { ar: 'شنايدر (Vivace)', en: 'Schneider Vivace', fr: 'Schneider Vivace', zh: '施耐德Vivace' }, tier: 'premium', priceMultiplier: 1.4, origin: 'France' },
    { id: 'sup_sw_legrand', name: { ar: 'لوجراند (Arteor)', en: 'Legrand Arteor', fr: 'Legrand Arteor', zh: '罗格朗Arteor' }, tier: 'premium', priceMultiplier: 1.35, origin: 'France' },
    { id: 'sup_sw_abb', name: { ar: 'ABB Millenium', en: 'ABB Millenium', fr: 'ABB Millenium', zh: 'ABB千禧' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Sweden' },
    { id: 'sup_sw_alfanar', name: { ar: 'الفنار', en: 'Al-Fanar Switches', fr: 'Interrupteurs Al-Fanar', zh: 'Al-Fanar开关' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_sw_mk', name: { ar: 'MK', en: 'MK Electric', fr: 'MK Electric', zh: 'MK电气' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UK' },
    { id: 'sup_sw_siemens', name: { ar: 'سيمنز', en: 'Siemens', fr: 'Siemens', zh: '西门子' }, tier: 'premium', priceMultiplier: 1.25, origin: 'Germany' },
];

// ====================== السباكة ======================
export const SUPPLIERS_PLUMBING: SupplierOption[] = [
    { id: 'sup_plb_zamil', name: { ar: 'الزامل للبلاستيك', en: 'Zamil Plastics', fr: 'Plastiques Zamil', zh: 'Zamil塑料' }, tier: 'premium', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_plb_rabiah', name: { ar: 'مواسير الربيعة', en: 'Rabiah Pipes', fr: 'Tuyaux Rabiah', zh: 'Rabiah管材' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_plb_amiantit', name: { ar: 'أميانتيت', en: 'Amiantit', fr: 'Amiantit', zh: '阿曼提特' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_plb_wavin', name: { ar: 'وافن', en: 'Wavin', fr: 'Wavin', zh: 'Wavin' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Europe' },
    { id: 'sup_plb_grohe', name: { ar: 'جروهي', en: 'Grohe', fr: 'Grohe', zh: '高仪' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_plb_hansgrohe', name: { ar: 'هانز جروهي', en: 'Hansgrohe', fr: 'Hansgrohe', zh: '汉斯格雅' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Germany' },
    { id: 'sup_plb_ideal', name: { ar: 'إيديال ستاندرد', en: 'Ideal Standard', fr: 'Ideal Standard', zh: '理想标准' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UK' },
];

// ====================== الأدوات الصحية ======================
export const SUPPLIERS_SANITARY: SupplierOption[] = [
    { id: 'sup_san_khazaf', name: { ar: 'الخزف السعودي', en: 'Saudi Ceramics', fr: 'Céramiques Saoudiennes', zh: '沙特陶瓷' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_san_rak', name: { ar: 'راك', en: 'RAK Ceramics', fr: 'RAK Céramiques', zh: 'RAK陶瓷' }, tier: 'standard', priceMultiplier: 1.05, origin: 'UAE' },
    { id: 'sup_san_toto', name: { ar: 'توتو', en: 'TOTO', fr: 'TOTO', zh: 'TOTO' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Japan' },
    { id: 'sup_san_kohler', name: { ar: 'كولر', en: 'Kohler', fr: 'Kohler', zh: '科勒' }, tier: 'premium', priceMultiplier: 1.6, origin: 'USA' },
    { id: 'sup_san_duravit', name: { ar: 'ديورافيت', en: 'Duravit', fr: 'Duravit', zh: '杜拉维特' }, tier: 'premium', priceMultiplier: 1.7, origin: 'Germany' },
    { id: 'sup_san_roca', name: { ar: 'روكا', en: 'Roca', fr: 'Roca', zh: 'Roca' }, tier: 'standard', priceMultiplier: 1.15, origin: 'Spain' },
    { id: 'sup_san_cotto', name: { ar: 'كوتو', en: 'Cotto', fr: 'Cotto', zh: 'Cotto' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Thailand' },
];

// ====================== البلاط والسيراميك ======================
export const SUPPLIERS_TILES: SupplierOption[] = [
    { id: 'sup_tile_khazaf', name: { ar: 'الخزف السعودي', en: 'Saudi Ceramics', fr: 'Céramiques Saoudiennes', zh: '沙特陶瓷' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_tile_rak', name: { ar: 'راك', en: 'RAK Ceramics', fr: 'RAK Céramiques', zh: 'RAK陶瓷' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UAE' },
    { id: 'sup_tile_porcelanosa', name: { ar: 'بورسيلانوزا', en: 'Porcelanosa', fr: 'Porcelanosa', zh: '宝路莎' }, tier: 'premium', priceMultiplier: 1.8, origin: 'Spain' },
    { id: 'sup_tile_versace', name: { ar: 'فيرساتشي', en: 'Versace Tiles', fr: 'Versace Carreaux', zh: '范思哲瓷砖' }, tier: 'premium', priceMultiplier: 2.5, origin: 'Italy' },
    { id: 'sup_tile_kajaria', name: { ar: 'كاجاريا', en: 'Kajaria', fr: 'Kajaria', zh: 'Kajaria' }, tier: 'budget', priceMultiplier: 0.8, origin: 'India' },
    { id: 'sup_tile_alJazeera', name: { ar: 'بلاط الجزيرة', en: 'Al-Jazeera Tiles', fr: 'Carreaux Al-Jazeera', zh: '半岛瓷砖' }, tier: 'standard', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_tile_ceramic_national', name: { ar: 'السيراميك الوطني', en: 'National Ceramic', fr: 'Céramique Nationale', zh: '国家陶瓷' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Saudi' },
];

// ====================== الدهانات ======================
export const SUPPLIERS_PAINT: SupplierOption[] = [
    { id: 'sup_pnt_jotun', name: { ar: 'جوتن', en: 'Jotun', fr: 'Jotun', zh: '佐敦' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Norway' },
    { id: 'sup_pnt_jazeera', name: { ar: 'دهانات الجزيرة', en: 'Jazeera Paints', fr: 'Peintures Jazeera', zh: '半岛涂料' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_pnt_national', name: { ar: 'الدهانات الوطنية', en: 'National Paints', fr: 'Peintures Nationales', zh: '国家涂料' }, tier: 'standard', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_pnt_hempel', name: { ar: 'هيمبل', en: 'Hempel', fr: 'Hempel', zh: '海虹老人' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Denmark' },
    { id: 'sup_pnt_sigma', name: { ar: 'سيجما', en: 'Sigma Paints', fr: 'Peintures Sigma', zh: 'Sigma涂料' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'sup_pnt_dulux', name: { ar: 'دولكس', en: 'Dulux', fr: 'Dulux', zh: '多乐士' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UK' },
];

// ====================== العزل ======================
export const SUPPLIERS_INSULATION: SupplierOption[] = [
    { id: 'sup_ins_bitumat', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'premium', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_ins_sika', name: { ar: 'سيكا', en: 'Sika', fr: 'Sika', zh: 'Sika' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Switzerland' },
    { id: 'sup_ins_fosroc', name: { ar: 'فوسروك', en: 'Fosroc', fr: 'Fosroc', zh: 'Fosroc' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UK' },
    { id: 'sup_ins_basf', name: { ar: 'باسف', en: 'BASF', fr: 'BASF', zh: 'BASF' }, tier: 'premium', priceMultiplier: 1.25, origin: 'Germany' },
    { id: 'sup_ins_azmeel', name: { ar: 'عزميل', en: 'Azmeel', fr: 'Azmeel', zh: 'Azmeel' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_ins_dow', name: { ar: 'داو كيميكال', en: 'Dow Chemical', fr: 'Dow Chemical', zh: '陶氏化学' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_ins_mapei', name: { ar: 'مابي', en: 'Mapei', fr: 'Mapei', zh: 'Mapei' }, tier: 'standard', priceMultiplier: 1.15, origin: 'Italy' },
];

// ====================== الألمنيوم والواجهات ======================
export const SUPPLIERS_FACADES: SupplierOption[] = [
    { id: 'sup_fac_technal', name: { ar: 'تكنال', en: 'Technal', fr: 'Technal', zh: 'Technal' }, tier: 'premium', priceMultiplier: 1.6, origin: 'France' },
    { id: 'sup_fac_schuco', name: { ar: 'شوكو', en: 'Schüco', fr: 'Schüco', zh: 'Schüco' }, tier: 'premium', priceMultiplier: 1.7, origin: 'Germany' },
    { id: 'sup_fac_zamil_alum', name: { ar: 'الزامل للألمنيوم', en: 'Zamil Aluminum', fr: 'Zamil Aluminium', zh: 'Zamil铝业' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_fac_alupco', name: { ar: 'ألوبكو', en: 'Alupco', fr: 'Alupco', zh: 'Alupco' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_fac_reynaers', name: { ar: 'رينيرز', en: 'Reynaers', fr: 'Reynaers', zh: 'Reynaers' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Belgium' },
    { id: 'sup_fac_saudiglass', name: { ar: 'الزجاج السعودي', en: 'Saudi Glass', fr: 'Verre Saoudien', zh: '沙特玻璃' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_fac_guardian', name: { ar: 'جارديان', en: 'Guardian Glass', fr: 'Guardian Verre', zh: 'Guardian玻璃' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_fac_riyadh_stone', name: { ar: 'حجر الرياض', en: 'Riyadh Stone', fr: 'Pierre de Riyadh', zh: '利雅得石材' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
];

// ====================== التكييف والتبريد ======================
export const SUPPLIERS_HVAC: SupplierOption[] = [
    { id: 'sup_hvac_carrier', name: { ar: 'كاريير', en: 'Carrier', fr: 'Carrier', zh: '开利' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_hvac_trane', name: { ar: 'ترين', en: 'Trane', fr: 'Trane', zh: '特灵' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'sup_hvac_daikin', name: { ar: 'دايكن', en: 'Daikin', fr: 'Daikin', zh: '大金' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Japan' },
    { id: 'sup_hvac_lg', name: { ar: 'إل جي', en: 'LG HVAC', fr: 'LG HVAC', zh: 'LG暖通' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Korea' },
    { id: 'sup_hvac_samsung', name: { ar: 'سامسونج', en: 'Samsung HVAC', fr: 'Samsung HVAC', zh: '三星暖通' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Korea' },
    { id: 'sup_hvac_midea', name: { ar: 'ميديا', en: 'Midea', fr: 'Midea', zh: '美的' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China' },
    { id: 'sup_hvac_gree', name: { ar: 'قري', en: 'Gree', fr: 'Gree', zh: '格力' }, tier: 'budget', priceMultiplier: 0.8, origin: 'China' },
    { id: 'sup_hvac_zamil_ac', name: { ar: 'الزامل للتكييف', en: 'Zamil AC', fr: 'Zamil AC', zh: 'Zamil空调' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_hvac_york', name: { ar: 'يورك', en: 'York', fr: 'York', zh: '约克' }, tier: 'standard', priceMultiplier: 1.15, origin: 'USA' },
];

// ====================== المصاعد ======================
export const SUPPLIERS_ELEVATORS: SupplierOption[] = [
    { id: 'sup_elev_otis', name: { ar: 'أوتيس', en: 'Otis', fr: 'Otis', zh: '奥的斯' }, tier: 'premium', priceMultiplier: 1.4, origin: 'USA' },
    { id: 'sup_elev_schindler', name: { ar: 'شيندلر', en: 'Schindler', fr: 'Schindler', zh: '迅达' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Switzerland' },
    { id: 'sup_elev_kone', name: { ar: 'كوني', en: 'KONE', fr: 'KONE', zh: '通力' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Finland' },
    { id: 'sup_elev_thyssenkrupp', name: { ar: 'تيسنكراب', en: 'ThyssenKrupp', fr: 'ThyssenKrupp', zh: '蒂森克虏伯' }, tier: 'standard', priceMultiplier: 1.2, origin: 'Germany' },
    { id: 'sup_elev_mitsubishi', name: { ar: 'ميتسوبيشي', en: 'Mitsubishi', fr: 'Mitsubishi', zh: '三菱' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Japan' },
    { id: 'sup_elev_sigma', name: { ar: 'سيجما', en: 'Sigma', fr: 'Sigma', zh: 'Sigma' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Turkey' },
    { id: 'sup_elev_fujitec', name: { ar: 'فوجيتك', en: 'Fujitec', fr: 'Fujitec', zh: '富士达' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Japan' },
];

// ====================== أنظمة الحريق والسلامة ======================
export const SUPPLIERS_FIRE_SAFETY: SupplierOption[] = [
    { id: 'sup_fire_naffco', name: { ar: 'نافكو', en: 'NAFFCO', fr: 'NAFFCO', zh: 'NAFFCO' }, tier: 'premium', priceMultiplier: 1.2, origin: 'UAE' },
    { id: 'sup_fire_kidde', name: { ar: 'كيدي', en: 'Kidde', fr: 'Kidde', zh: 'Kidde' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'sup_fire_viking', name: { ar: 'فايكنج', en: 'Viking', fr: 'Viking', zh: 'Viking' }, tier: 'standard', priceMultiplier: 1.1, origin: 'USA' },
    { id: 'sup_fire_tyco', name: { ar: 'تايكو', en: 'Tyco', fr: 'Tyco', zh: 'Tyco' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Ireland' },
    { id: 'sup_fire_honeywell', name: { ar: 'هانيويل', en: 'Honeywell', fr: 'Honeywell', zh: '霍尼韦尔' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_fire_bosch', name: { ar: 'بوش', en: 'Bosch Fire', fr: 'Bosch Incendie', zh: '博世消防' }, tier: 'standard', priceMultiplier: 1.15, origin: 'Germany' },
];

// ====================== الطوب والبلك ======================
export const SUPPLIERS_BLOCKS: SupplierOption[] = [
    { id: 'sup_blk_saudi_bricks', name: { ar: 'السعودية للطوب', en: 'Saudi Bricks', fr: 'Briques Saoudiennes', zh: '沙特砖' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_blk_riyadh_blk', name: { ar: 'بلك الرياض', en: 'Riyadh Blocks', fr: 'Blocs Riyadh', zh: '利雅得砌块' }, tier: 'standard', priceMultiplier: 0.95, origin: 'Saudi' },
    { id: 'sup_blk_green', name: { ar: 'البلك الأخضر المعزول', en: 'Green Insulated Block', fr: 'Bloc Vert Isolé', zh: '绿色保温砌块' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Saudi' },
    { id: 'sup_blk_siporex', name: { ar: 'سيبوركس', en: 'Siporex', fr: 'Siporex', zh: 'Siporex' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Saudi' },
    { id: 'sup_blk_ytong', name: { ar: 'يتونج', en: 'Ytong', fr: 'Ytong', zh: 'Ytong' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Germany' },
];

// ====================== الأبواب ======================
export const SUPPLIERS_DOORS: SupplierOption[] = [
    { id: 'sup_door_alnaqaa', name: { ar: 'أبواب النقاء', en: 'Al-Naqaa Doors', fr: 'Portes Al-Naqaa', zh: 'Al-Naqaa门业' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_door_wpc_factory', name: { ar: 'مصنع WPC', en: 'WPC Factory', fr: 'Usine WPC', zh: 'WPC工厂' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'sup_door_hafele', name: { ar: 'هيفلي', en: 'Häfele', fr: 'Häfele', zh: '海福乐' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Germany' },
    { id: 'sup_door_dorma', name: { ar: 'دورما', en: 'Dormakaba', fr: 'Dormakaba', zh: 'dormakaba' }, tier: 'premium', priceMultiplier: 1.6, origin: 'Germany' },
    { id: 'sup_door_steel_ws', name: { ar: 'ورشة الحداد', en: 'Steel Workshop', fr: 'Atelier Acier', zh: '钢铁车间' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Local' },
];

// ====================== الحفر والمعدات الثقيلة ======================
export const SUPPLIERS_HEAVY_EQUIPMENT: SupplierOption[] = [
    { id: 'sup_heq_caterpillar', name: { ar: 'كاتربيلر (الزاهد)', en: 'Caterpillar (Zahid)', fr: 'Caterpillar (Zahid)', zh: '卡特彼勒(扎希德)' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_heq_komatsu', name: { ar: 'كوماتسو', en: 'Komatsu', fr: 'Komatsu', zh: '小松' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Japan' },
    { id: 'sup_heq_volvo', name: { ar: 'فولفو', en: 'Volvo CE', fr: 'Volvo CE', zh: '沃尔沃' }, tier: 'standard', priceMultiplier: 1.15, origin: 'Sweden' },
    { id: 'sup_heq_local', name: { ar: 'مقاولين حفر محليين', en: 'Local Excavation', fr: 'Excavation Locale', zh: '当地挖掘' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Local' },
];

// ====================== خزانات المياه ======================
export const SUPPLIERS_TANKS: SupplierOption[] = [
    { id: 'sup_tank_muhaidib', name: { ar: 'المهيدب', en: 'Al-Muhaidib Tanks', fr: 'Réservoirs Al-Muhaidib', zh: 'Al-Muhaidib水箱' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_tank_bafco', name: { ar: 'بافكو', en: 'BAFCO', fr: 'BAFCO', zh: 'BAFCO' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'sup_tank_almattar', name: { ar: 'المتر', en: 'Al-Mattar', fr: 'Al-Mattar', zh: 'Al-Mattar' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Saudi' },
    { id: 'sup_tank_penguin', name: { ar: 'بينجوين', en: 'Penguin Tanks', fr: 'Réservoirs Penguin', zh: '企鹅水箱' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Saudi' },
];

// ====================== المطابخ والخزائن ======================
export const SUPPLIERS_KITCHENS: SupplierOption[] = [
    { id: 'sup_kit_ikea', name: { ar: 'ايكيا', en: 'IKEA', fr: 'IKEA', zh: '宜家' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Sweden' },
    { id: 'sup_kit_alhabib', name: { ar: 'الحبيب للمطابخ', en: 'Al-Habib Kitchens', fr: 'Cuisines Al-Habib', zh: 'Al-Habib厨房' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_kit_scavolini', name: { ar: 'سكافوليني', en: 'Scavolini', fr: 'Scavolini', zh: 'Scavolini' }, tier: 'premium', priceMultiplier: 2.0, origin: 'Italy' },
    { id: 'sup_kit_porcelanosa_kit', name: { ar: 'بورسيلانوزا', en: 'Porcelanosa Kitchens', fr: 'Cuisines Porcelanosa', zh: '宝路莎厨房' }, tier: 'premium', priceMultiplier: 1.8, origin: 'Spain' },
    { id: 'sup_kit_local', name: { ar: 'ورشة محلية', en: 'Local Workshop', fr: 'Atelier Local', zh: '本地车间' }, tier: 'budget', priceMultiplier: 0.7, origin: 'Local' },
];

// ====================== الطاقة الشمسية ======================
export const SUPPLIERS_SOLAR: SupplierOption[] = [
    { id: 'sup_sol_desert', name: { ar: 'ديزرت تكنولوجيز', en: 'Desert Technologies', fr: 'Desert Technologies', zh: '沙漠技术' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_sol_jinko', name: { ar: 'جينكو سولار', en: 'Jinko Solar', fr: 'Jinko Solar', zh: '晶科能源' }, tier: 'standard', priceMultiplier: 1.0, origin: 'China' },
    { id: 'sup_sol_longi', name: { ar: 'لونجي', en: 'LONGi', fr: 'LONGi', zh: '隆基' }, tier: 'standard', priceMultiplier: 1.05, origin: 'China' },
    { id: 'sup_sol_canadian', name: { ar: 'كندي سولار', en: 'Canadian Solar', fr: 'Canadian Solar', zh: '阿特斯' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Canada' },
    { id: 'sup_sol_trina', name: { ar: 'ترينا سولار', en: 'Trina Solar', fr: 'Trina Solar', zh: '天合光能' }, tier: 'budget', priceMultiplier: 0.9, origin: 'China' },
];

// ====================== الأنظمة الذكية والأمنية ======================
export const SUPPLIERS_SMART_SECURITY: SupplierOption[] = [
    { id: 'sup_sec_hikvision', name: { ar: 'هيك فيجن', en: 'Hikvision', fr: 'Hikvision', zh: '海康威视' }, tier: 'standard', priceMultiplier: 1.0, origin: 'China' },
    { id: 'sup_sec_dahua', name: { ar: 'داهوا', en: 'Dahua', fr: 'Dahua', zh: '大华' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China' },
    { id: 'sup_sec_honeywell_sec', name: { ar: 'هانيويل سيكيورتي', en: 'Honeywell Security', fr: 'Honeywell Sécurité', zh: '霍尼韦尔安防' }, tier: 'premium', priceMultiplier: 1.4, origin: 'USA' },
    { id: 'sup_sec_bosch_sec', name: { ar: 'بوش سيكيورتي', en: 'Bosch Security', fr: 'Bosch Sécurité', zh: '博世安防' }, tier: 'premium', priceMultiplier: 1.35, origin: 'Germany' },
    { id: 'sup_smart_crestron', name: { ar: 'كريسترون', en: 'Crestron', fr: 'Crestron', zh: '快思聪' }, tier: 'premium', priceMultiplier: 2.0, origin: 'USA' },
    { id: 'sup_smart_control4', name: { ar: 'كنترول 4', en: 'Control4', fr: 'Control4', zh: 'Control4' }, tier: 'premium', priceMultiplier: 1.7, origin: 'USA' },
    { id: 'sup_smart_savant', name: { ar: 'سافانت', en: 'Savant', fr: 'Savant', zh: 'Savant' }, tier: 'premium', priceMultiplier: 2.2, origin: 'USA' },
];

// ====================== تنسيق المواقع والحدائق ======================
export const SUPPLIERS_LANDSCAPING: SupplierOption[] = [
    { id: 'sup_land_nadec_green', name: { ar: 'نادك للتشجير', en: 'NADEC Green', fr: 'NADEC Vert', zh: 'NADEC绿化' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_land_riyadh_green', name: { ar: 'خضراء الرياض', en: 'Riyadh Green', fr: 'Riyadh Vert', zh: '利雅得绿化' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'sup_land_interlock_riyadh', name: { ar: 'إنترلوك الرياض', en: 'Riyadh Interlock', fr: 'Interlock Riyadh', zh: '利雅得连锁砖' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_land_shithry', name: { ar: 'مشاتل الشثري', en: 'Al-Shithry Nurseries', fr: 'Pépinières Al-Shithry', zh: 'Al-Shithry苗圃' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'sup_land_green_arabia', name: { ar: 'خضراء الجزيرة', en: 'Green Arabia', fr: 'Green Arabie', zh: '绿色阿拉伯' }, tier: 'premium', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_land_saudi_turf', name: { ar: 'العشب السعودي', en: 'Saudi Turf', fr: 'Gazon Saoudien', zh: '沙特草坪' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
];

// ====================== الأيدي العاملة ======================
export const SUPPLIERS_MANPOWER: SupplierOption[] = [
    { id: 'sup_mp_inhouse', name: { ar: 'كادر الشركة', en: 'In-House Staff', fr: 'Personnel Interne', zh: '内部员工' }, tier: 'premium', priceMultiplier: 1.0, origin: 'Internal' },
    { id: 'sup_mp_outsourced', name: { ar: 'تعاقد خارجي', en: 'Outsourced', fr: 'Externalisé', zh: '外包' }, tier: 'standard', priceMultiplier: 1.2, origin: 'External' },
    { id: 'sup_mp_recruitment', name: { ar: 'مكتب استقدام', en: 'Recruitment Agency', fr: 'Agence de Recrutement', zh: '招聘代理' }, tier: 'standard', priceMultiplier: 1.1, origin: 'External' },
    { id: 'sup_mp_seasonal', name: { ar: 'عمالة موسمية', en: 'Seasonal Labor', fr: 'Travail Saisonnier', zh: '季节性劳工' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Mixed' },
];

// ====================== المسابح ومعداتها ======================
export const SUPPLIERS_SWIMMING_POOLS: SupplierOption[] = [
    { id: 'sup_pool_pentair', name: { ar: 'بنتير للمسابح', en: 'Pentair Pool', fr: 'Pentair Piscines', zh: 'Pentair泳池' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_pool_hayward', name: { ar: 'هيوارد', en: 'Hayward', fr: 'Hayward', zh: 'Hayward' }, tier: 'premium', priceMultiplier: 1.2, origin: 'USA' },
    { id: 'sup_pool_fluidra', name: { ar: 'فلويدرا', en: 'Fluidra', fr: 'Fluidra', zh: 'Fluidra' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Spain' },
    { id: 'sup_pool_astral', name: { ar: 'أسترال بول', en: 'AstralPool', fr: 'AstralPool', zh: 'AstralPool' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Spain' },
    { id: 'sup_pool_local', name: { ar: 'مسابح محلية', en: 'Local Pool Mfg', fr: 'Fabricant Local', zh: '本地泳池厂' }, tier: 'budget', priceMultiplier: 0.8, origin: 'Saudi' },
];

// ====================== الأثاث الثابت والمتحرك ======================
export const SUPPLIERS_FURNITURE: SupplierOption[] = [
    { id: 'sup_furn_ikea', name: { ar: 'إيكيا', en: 'IKEA', fr: 'IKEA', zh: '宜家' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Sweden' },
    { id: 'sup_furn_home', name: { ar: 'هوم سنتر', en: 'Home Centre', fr: 'Home Centre', zh: '家居中心' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UAE' },
    { id: 'sup_furn_boconcept', name: { ar: 'بو كونسبت', en: 'BoConcept', fr: 'BoConcept', zh: 'BoConcept' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Denmark' },
    { id: 'sup_furn_rh', name: { ar: 'ريستوريشن هاردوير', en: 'Restoration Hardware', fr: 'Restoration Hardware', zh: 'RH' }, tier: 'premium', priceMultiplier: 1.8, origin: 'USA' },
    { id: 'sup_furn_local', name: { ar: 'مصنع أثاث محلي', en: 'Local Furniture Factory', fr: 'Usine Locale', zh: '本地家具厂' }, tier: 'budget', priceMultiplier: 0.75, origin: 'Saudi' },
];

// ====================== الأجهزة والمعدات الطبية ======================
export const SUPPLIERS_MEDICAL_EQUIPMENT: SupplierOption[] = [
    { id: 'sup_med_siemens', name: { ar: 'سيمنز هيلثينيرز', en: 'Siemens Healthineers', fr: 'Siemens Healthineers', zh: '西门子医疗' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_med_ge', name: { ar: 'جي إي هيلثكير', en: 'GE Healthcare', fr: 'GE Healthcare', zh: 'GE医疗' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_med_philips', name: { ar: 'فيليبس ميديكال', en: 'Philips Medical', fr: 'Philips Medical', zh: '飞利浦医疗' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Netherlands' },
    { id: 'sup_med_mindray', name: { ar: 'ميندراي', en: 'Mindray', fr: 'Mindray', zh: '迈瑞' }, tier: 'standard', priceMultiplier: 0.9, origin: 'China' },
    { id: 'sup_med_local', name: { ar: 'موردين طبيين محليين', en: 'Local Medical Supplier', fr: 'Fournisseur Local', zh: '本地医疗供应商' }, tier: 'budget', priceMultiplier: 0.8, origin: 'Saudi' },
];

// ====================== المطابخ التجارية ======================
export const SUPPLIERS_COMMERCIAL_KITCHEN: SupplierOption[] = [
    { id: 'sup_ckitchen_rational', name: { ar: 'راشنال', en: 'Rational', fr: 'Rational', zh: 'Rational' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_ckitchen_electrolux', name: { ar: 'إلكترولوكس بروفيشنال', en: 'Electrolux Professional', fr: 'Electrolux Pro', zh: '伊莱克斯专业' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Sweden' },
    { id: 'sup_ckitchen_henny', name: { ar: 'هيني بيني', en: 'Henny Penny', fr: 'Henny Penny', zh: 'Henny Penny' }, tier: 'standard', priceMultiplier: 1.1, origin: 'USA' },
    { id: 'sup_ckitchen_true', name: { ar: 'ترو ريفريجيريشن', en: 'True Refrigeration', fr: 'True Réfrigération', zh: 'True制冷' }, tier: 'standard', priceMultiplier: 1.0, origin: 'USA' },
    { id: 'sup_ckitchen_local', name: { ar: 'مصنع ستانلس محلي', en: 'Local SS Manufacturer', fr: 'Fabricant Local Inox', zh: '本地不锈钢厂' }, tier: 'budget', priceMultiplier: 0.7, origin: 'Saudi' },
];

// ====================== أرضيات رياضية ======================
export const SUPPLIERS_SPORTS_SURFACES: SupplierOption[] = [
    { id: 'sup_sport_mondo', name: { ar: 'موندو', en: 'Mondo', fr: 'Mondo', zh: 'Mondo' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Italy' },
    { id: 'sup_sport_polytan', name: { ar: 'بولي تان', en: 'Polytan', fr: 'Polytan', zh: 'Polytan' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_sport_tarkett', name: { ar: 'تاركيت سبورتس', en: 'Tarkett Sports', fr: 'Tarkett Sports', zh: 'Tarkett体育' }, tier: 'standard', priceMultiplier: 1.1, origin: 'France' },
    { id: 'sup_sport_greenfields', name: { ar: 'جرين فيلدز', en: 'GreenFields', fr: 'GreenFields', zh: 'GreenFields' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Netherlands' },
    { id: 'sup_sport_local', name: { ar: 'أرضيات رياضية محلية', en: 'Local Sports Flooring', fr: 'Sol Sport Local', zh: '本地运动地板' }, tier: 'budget', priceMultiplier: 0.7, origin: 'China' },
];

// ====================== مولدات كهربائية ======================
export const SUPPLIERS_GENERATORS: SupplierOption[] = [
    { id: 'sup_gen_cat', name: { ar: 'كاتربيلر', en: 'Caterpillar', fr: 'Caterpillar', zh: '卡特彼勒' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_gen_cummins', name: { ar: 'كومنز', en: 'Cummins', fr: 'Cummins', zh: '康明斯' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'sup_gen_perkins', name: { ar: 'بيركنز', en: 'Perkins', fr: 'Perkins', zh: '珀金斯' }, tier: 'standard', priceMultiplier: 1.0, origin: 'UK' },
    { id: 'sup_gen_fgwilson', name: { ar: 'إف جي ويلسون', en: 'FG Wilson', fr: 'FG Wilson', zh: 'FG Wilson' }, tier: 'standard', priceMultiplier: 1.05, origin: 'UK' },
    { id: 'sup_gen_sdmo', name: { ar: 'إس دي إم أو', en: 'SDMO/Kohler', fr: 'SDMO/Kohler', zh: 'SDMO/Kohler' }, tier: 'standard', priceMultiplier: 1.1, origin: 'France' },
    { id: 'sup_gen_local', name: { ar: 'مولدات صينية', en: 'Chinese Generator', fr: 'Générateur Chinois', zh: '中国发电机' }, tier: 'budget', priceMultiplier: 0.65, origin: 'China' },
];

// ====================== شحن سيارات كهربائية ======================
export const SUPPLIERS_EV_CHARGING: SupplierOption[] = [
    { id: 'sup_ev_abb', name: { ar: 'ABB شحن كهربائي', en: 'ABB E-Mobility', fr: 'ABB E-Mobilité', zh: 'ABB电动出行' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Sweden' },
    { id: 'sup_ev_schneider', name: { ar: 'شنايدر EVlink', en: 'Schneider EVlink', fr: 'Schneider EVlink', zh: '施耐德EVlink' }, tier: 'premium', priceMultiplier: 1.25, origin: 'France' },
    { id: 'sup_ev_electromin', name: { ar: 'إلكترومين', en: 'Electromin', fr: 'Electromin', zh: 'Electromin' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sup_ev_chargepoint', name: { ar: 'تشارج بوينت', en: 'ChargePoint', fr: 'ChargePoint', zh: 'ChargePoint' }, tier: 'standard', priceMultiplier: 1.1, origin: 'USA' },
];

// ====================== لوحات سلامة وإرشاد ======================
export const SUPPLIERS_SAFETY_SIGNS: SupplierOption[] = [
    { id: 'sup_sign_brady', name: { ar: 'برادي', en: 'Brady', fr: 'Brady', zh: 'Brady' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_sign_3m', name: { ar: '3M سيفتي', en: '3M Safety', fr: '3M Sécurité', zh: '3M安全' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'sup_sign_local', name: { ar: 'مصنع لوحات محلي', en: 'Local Sign Factory', fr: 'Usine Panneaux Locale', zh: '本地标识厂' }, tier: 'budget', priceMultiplier: 0.6, origin: 'Saudi' },
];

// ====================== أنظمة إدارة المبنى والتيار الخفيف (BMS/ELV) ======================
// ملاحظة: سيمنز أقوى للمستشفيات (معايير طبية)، جونسون كنترولز للمولات والفنادق، شنايدر للأبراج التجارية
export const SUPPLIERS_BMS_ELV: SupplierOption[] = [
    { id: 'sup_bms_siemens', name: { ar: 'سيمنز BT', en: 'Siemens Building Technologies', fr: 'Siemens BT', zh: '西门子楼宇科技' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_bms_honeywell', name: { ar: 'هانيويل BA', en: 'Honeywell Building Automation', fr: 'Honeywell BA', zh: '霍尼韦尔楼宇自动化' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_bms_jci', name: { ar: 'جونسون كنترولز', en: 'Johnson Controls', fr: 'Johnson Controls', zh: '江森自控' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_bms_schneider', name: { ar: 'شنايدر EcoStruxure', en: 'Schneider EcoStruxure', fr: 'Schneider EcoStruxure', zh: '施耐德EcoStruxure' }, tier: 'premium', priceMultiplier: 1.25, origin: 'France' },
    { id: 'sup_bms_delta', name: { ar: 'دلتا كنترولز', en: 'Delta Controls', fr: 'Delta Controls', zh: 'Delta控制' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Canada' },
];

// ====================== شبكات البيانات والاتصالات ======================
// ملاحظة: CommScope+Aruba للمستشفيات (معايير طبية)، Cisco Meraki للفنادق، Ruckus للمولات والمدارس
export const SUPPLIERS_NETWORKING: SupplierOption[] = [
    { id: 'sup_net_commscope', name: { ar: 'كومسكوب', en: 'CommScope', fr: 'CommScope', zh: 'CommScope' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_net_panduit', name: { ar: 'بانديوت', en: 'Panduit', fr: 'Panduit', zh: 'Panduit' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'sup_net_nexans', name: { ar: 'نيكسانز', en: 'Nexans', fr: 'Nexans', zh: 'Nexans' }, tier: 'standard', priceMultiplier: 1.1, origin: 'France' },
    { id: 'sup_net_rm', name: { ar: 'آر أند إم', en: 'R&M', fr: 'R&M', zh: 'R&M' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Switzerland' },
    { id: 'sup_net_cisco', name: { ar: 'سيسكو ميراكي', en: 'Cisco Meraki', fr: 'Cisco Meraki', zh: 'Cisco Meraki' }, tier: 'premium', priceMultiplier: 1.5, origin: 'USA' },
    { id: 'sup_net_ruckus', name: { ar: 'روكوس', en: 'Ruckus/CommScope', fr: 'Ruckus', zh: 'Ruckus' }, tier: 'standard', priceMultiplier: 1.2, origin: 'USA' },
    { id: 'sup_net_aruba', name: { ar: 'أروبا HPE', en: 'Aruba (HPE)', fr: 'Aruba (HPE)', zh: 'Aruba(HPE)' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
];

// ====================== الغازات الطبية (مستشفيات فقط) ======================
// تحذير: هذه الموردين متخصصة بالمستشفيات والمنشآت الطبية فقط ولا تصلح لأي مشروع آخر
export const SUPPLIERS_MEDICAL_GAS: SupplierOption[] = [
    { id: 'sup_mgas_beacon', name: { ar: 'بيكون ميداس (أطلس كوبكو)', en: 'BeaconMedaes (Atlas Copco)', fr: 'BeaconMedaes', zh: 'BeaconMedaes' }, tier: 'premium', priceMultiplier: 1.4, origin: 'USA' },
    { id: 'sup_mgas_amico', name: { ar: 'أميكو', en: 'Amico Medical', fr: 'Amico Médical', zh: 'Amico医疗' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Canada' },
    { id: 'sup_mgas_mim', name: { ar: 'MIM ميديكال', en: 'MIM Medical', fr: 'MIM Médical', zh: 'MIM医疗' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Saudi' },
    { id: 'sup_mgas_drager', name: { ar: 'دراجر', en: 'Dräger', fr: 'Dräger', zh: 'Dräger' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Germany' },
];

// ====================== أنظمة الوقود (محطات وقود فقط) ======================
// تحذير: هذه الموردين متخصصة بمحطات الوقود فقط
export const SUPPLIERS_FUEL_SYSTEMS: SupplierOption[] = [
    { id: 'sup_fuel_wayne', name: { ar: 'واين/دوفر', en: 'Wayne/Dover', fr: 'Wayne/Dover', zh: 'Wayne/Dover' }, tier: 'premium', priceMultiplier: 1.3, origin: 'USA' },
    { id: 'sup_fuel_gilbarco', name: { ar: 'جلباركو فيدر روت', en: 'Gilbarco Veeder-Root', fr: 'Gilbarco', zh: 'Gilbarco' }, tier: 'premium', priceMultiplier: 1.35, origin: 'USA' },
    { id: 'sup_fuel_tokheim', name: { ar: 'توكهايم', en: 'Tokheim', fr: 'Tokheim', zh: 'Tokheim' }, tier: 'standard', priceMultiplier: 1.1, origin: 'France' },
    { id: 'sup_fuel_franklin', name: { ar: 'فرانكلين فيولنج', en: 'Franklin Fueling', fr: 'Franklin Fueling', zh: 'Franklin' }, tier: 'standard', priceMultiplier: 1.05, origin: 'USA' },
];

// ====================== معدات مغاسل السيارات (مغسلة فقط) ======================
// تحذير: هذه الموردين متخصصة بمغاسل السيارات فقط
export const SUPPLIERS_CAR_WASH: SupplierOption[] = [
    { id: 'sup_cw_washtec', name: { ar: 'واش تك', en: 'WashTec', fr: 'WashTec', zh: 'WashTec' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Germany' },
    { id: 'sup_cw_istobal', name: { ar: 'إستوبال', en: 'Istobal', fr: 'Istobal', zh: 'Istobal' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Spain' },
    { id: 'sup_cw_christ', name: { ar: 'كريست', en: 'CHRIST', fr: 'CHRIST', zh: 'CHRIST' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Germany' },
    { id: 'sup_cw_local', name: { ar: 'مصنع محلي', en: 'Local Manufacturer', fr: 'Fabricant Local', zh: '本地制造商' }, tier: 'budget', priceMultiplier: 0.7, origin: 'China' },
];

