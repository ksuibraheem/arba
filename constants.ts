import { BaseItem, SupplierOption, ProjectType, SoilType, RoomConfig, FacadeConfig, TeamMember, BlueprintConfig, Language, MaterialDef, SectionDef, DeliveryScope } from './types';
import { ALL_PROJECT_SPECIFIC_ITEMS } from './items';


// =================== ARBA Hybrid Section Definitions ===================
export const SECTION_DEFINITIONS: SectionDef[] = [
  { code: '00', nameAr: 'الرسوم والإشراف', nameEn: 'Fees & Supervision', icon: '📋', color: '#9333ea', group: 'A', groupNameAr: 'البنية التحتية', groupNameEn: 'Substructure' },
  { code: '01', nameAr: 'أعمال الحفر', nameEn: 'Excavation', icon: '⛏️', color: '#dc2626', group: 'A', groupNameAr: 'البنية التحتية', groupNameEn: 'Substructure' },
  { code: '02', nameAr: 'الردم والإحلال', nameEn: 'Backfill', icon: '🏜️', color: '#ea580c', group: 'A', groupNameAr: 'البنية التحتية', groupNameEn: 'Substructure' },
  { code: '03', nameAr: 'أعمال التأسيس', nameEn: 'Foundation', icon: '🏗️', color: '#0284c7', group: 'A', groupNameAr: 'البنية التحتية', groupNameEn: 'Substructure' },
  { code: '04', nameAr: 'البدروم والأرضي', nameEn: 'Basement', icon: '🏠', color: '#0369a1', group: 'B', groupNameAr: 'الغلاف الإنشائي', groupNameEn: 'Shell' },
  { code: '05', nameAr: 'الهيكل العلوي', nameEn: 'Superstructure', icon: '🧱', color: '#1d4ed8', group: 'B', groupNameAr: 'الغلاف الإنشائي', groupNameEn: 'Shell' },
  { code: '06', nameAr: 'أعمال العزل', nameEn: 'Insulation', icon: '🛡️', color: '#7c3aed', group: 'B', groupNameAr: 'الغلاف الإنشائي', groupNameEn: 'Shell' },
  { code: '07', nameAr: 'أعمال اللياسة', nameEn: 'Plastering', icon: '🖌️', color: '#c026d3', group: 'C', groupNameAr: 'التشطيبات', groupNameEn: 'Interiors' },
  { code: '08', nameAr: 'أعمال السباكة', nameEn: 'Plumbing', icon: '🚿', color: '#0891b2', group: 'D', groupNameAr: 'الخدمات MEP', groupNameEn: 'Services' },
  { code: '09', nameAr: 'أعمال الكهرباء', nameEn: 'Electrical', icon: '⚡', color: '#eab308', group: 'D', groupNameAr: 'الخدمات MEP', groupNameEn: 'Services' },
  { code: '10', nameAr: 'أعمال التكييف', nameEn: 'HVAC', icon: '❄️', color: '#06b6d4', group: 'D', groupNameAr: 'الخدمات MEP', groupNameEn: 'Services' },
  { code: '11', nameAr: 'التشطيبات الداخلية', nameEn: 'Finishes', icon: '🎨', color: '#ec4899', group: 'C', groupNameAr: 'التشطيبات', groupNameEn: 'Interiors' },
  { code: '12', nameAr: 'الأبواب والنوافذ', nameEn: 'Doors & Windows', icon: '🚪', color: '#f97316', group: 'C', groupNameAr: 'التشطيبات', groupNameEn: 'Interiors' },
  { code: '13', nameAr: 'أعمال الواجهات', nameEn: 'Facades', icon: '🏛️', color: '#14b8a6', group: 'E', groupNameAr: 'الواجهات', groupNameEn: 'Exterior' },
  { code: '14', nameAr: 'الأعمال الخارجية', nameEn: 'External Works', icon: '🌳', color: '#22c55e', group: 'E', groupNameAr: 'الواجهات', groupNameEn: 'Exterior' },
  { code: '15', nameAr: 'السلامة والحماية', nameEn: 'Safety & Fire', icon: '🔥', color: '#ef4444', group: 'D', groupNameAr: 'الخدمات MEP', groupNameEn: 'Services' },
  { code: '16', nameAr: 'الأيدي العاملة', nameEn: 'Manpower', icon: '👷', color: '#64748b', group: 'G', groupNameAr: 'الموارد البشرية', groupNameEn: 'Manpower' },
  { code: '17', nameAr: 'تجهيزات ومصاعد', nameEn: 'Equipment', icon: '🛗', color: '#8b5cf6', group: 'F', groupNameAr: 'المعدات', groupNameEn: 'Equipment' },
  { code: '18', nameAr: 'التيار الخفيف والأنظمة الذكية', nameEn: 'ELV & Smart Systems', icon: '📡', color: '#0ea5e9', group: 'D', groupNameAr: 'الخدمات MEP', groupNameEn: 'Services' },
];

export const DELIVERY_SCOPE_SECTIONS: Record<DeliveryScope, string[]> = {
  'excavation_only': ['00', '01'],
  'foundation': ['00', '01', '02', '03'],
  'shell': ['00', '01', '02', '03', '04', '05', '06'],
  'shell_mep': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '15', '18'],
  'finishing_only': ['00', '07', '08', '09', '10', '11', '12', '13', '14'],
  'turnkey': ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'],
  'custom': [],
};

export const DELIVERY_SCOPE_OPTIONS: { id: DeliveryScope; icon: string; nameAr: string; nameEn: string }[] = [
  { id: 'excavation_only', icon: '⛏️', nameAr: 'حفر فقط', nameEn: 'Excavation Only' },
  { id: 'foundation', icon: '🏗️', nameAr: 'تسليم أساس', nameEn: 'Foundation' },
  { id: 'shell', icon: '🧱', nameAr: 'عظم', nameEn: 'Shell & Core' },
  { id: 'shell_mep', icon: '⚡', nameAr: 'عظم + تمديدات', nameEn: 'Shell + MEP' },
  { id: 'finishing_only', icon: '🎨', nameAr: 'تشطيب فقط', nameEn: 'Finishing Only' },
  { id: 'turnkey', icon: '🔑', nameAr: 'تسليم مفتاح', nameEn: 'Turnkey' },
  { id: 'custom', icon: '⚙️', nameAr: 'مخصص', nameEn: 'Custom' },
];
// --- TRANSLATIONS ---
export const TRANSLATIONS: Record<string, Record<Language, string>> = {
    // Navigation & Common
    'pricing': { ar: 'التسعير', en: 'Pricing', fr: 'Tarification', zh: '定价' },
    'blueprint': { ar: 'المخطط', en: 'Blueprint', fr: 'Plan', zh: '蓝图' },
    'materials': { ar: 'المواد الداخلية', en: 'Interior Materials', fr: 'Matériaux Intérieurs', zh: '内部材料' },
    'settings': { ar: 'إعدادات', en: 'Settings', fr: 'Paramètres', zh: '设置' },
    'projectType': { ar: 'نوع المشروع', en: 'Project Type', fr: 'Type de Projet', zh: '项目类型' },
    'room': { ar: 'غرفة', en: 'Room', fr: 'Chambre', zh: '房间' },
    'currency': { ar: 'ر.س', en: 'SAR', fr: 'SAR', zh: 'SAR' },
    'export': { ar: 'تصدير', en: 'Export', fr: 'Exporter', zh: '出口' },

    // Sidebar & Settings
    'client_info': { ar: 'بيانات العميل', en: 'Client Info', fr: 'Infos Client', zh: '客户信息' },
    'client_name': { ar: 'اسم العميل', en: 'Client Name', fr: 'Nom du Client', zh: '客户名称' },
    'tender_number': { ar: 'رقم المناقصة', en: 'Tender Number', fr: 'Numéro d\'Appel d\'Offres', zh: '招标编号' },
    'bidder_info': { ar: 'مقدم العرض', en: 'Bidder Info', fr: 'Infos Soumissionnaire', zh: '投标人信息' },
    'company_name': { ar: 'اسم الشركة', en: 'Company Name', fr: 'Nom de la Société', zh: '公司名称' },
    'execution_method': { ar: 'طريقة التنفيذ', en: 'Execution Method', fr: 'Méthode d\'Exécution', zh: '执行方式' },
    'exec_in_house': { ar: 'تنفيذ ذاتي', en: 'In-House', fr: 'Interne', zh: '内部执行' },
    'exec_sub': { ar: 'مقاول من الباطن', en: 'Subcontractor', fr: 'Sous-traitant', zh: '分包商' },
    'exec_turnkey': { ar: 'تسليم مفتاح', en: 'Turnkey', fr: 'Clé en main', zh: '交钥匙' },
    'pricing_strategy': { ar: 'استراتيجية التسعير', en: 'Pricing Strategy', fr: 'Stratégie de Prix', zh: '定价策略' },
    'strat_fixed': { ar: 'هامش ربح ثابت', en: 'Fixed Margin', fr: 'Marge Fixe', zh: '固定利润率' },
    'strat_roi': { ar: 'العائد على الاستثمار', en: 'Target ROI', fr: 'ROI Cible', zh: '目标投资回报率' },
    'strat_arba': { ar: 'آربا القياسي (75%)', en: 'ARBA Standard (75%)', fr: 'ARBA Standard (75%)', zh: 'ARBA标准 (75%)' },
    'profit_margin': { ar: 'نسبة هامش الربح (%)', en: 'Profit Margin (%)', fr: 'Marge Bénéficiaire (%)', zh: '利润率 (%)' },
    'invested_capital': { ar: 'رأس المال المستثمر', en: 'Invested Capital', fr: 'Capital Investi', zh: '投资资本' },
    'target_roi': { ar: 'العائد المستهدف (%)', en: 'Target ROI (%)', fr: 'ROI Cible (%)', zh: '目标回报率 (%)' },
    'global_adjustment': { ar: 'تعديل السعر الشامل', en: 'Global Price Adj.', fr: 'Ajustement Global', zh: '全局价格调整' },
    'discount_hint': { ar: 'استخدم قيما سالبة للخصم', en: 'Use negative values for discount', fr: 'Valeurs négatives pour remise', zh: '使用负值进行折扣' },
    'location': { ar: 'الموقع', en: 'Location', fr: 'Emplacement', zh: '位置' },
    'loc_riyadh': { ar: 'الرياض', en: 'Riyadh', fr: 'Riyad', zh: '利雅得' },
    'loc_jeddah': { ar: 'جدة', en: 'Jeddah', fr: 'Djeddah', zh: '吉达' },
    'loc_dammam': { ar: 'الدمام / الشرقية', en: 'Dammam / Eastern', fr: 'Dammam / Est', zh: '达曼 / 东部' },
    'loc_makkah': { ar: 'مكة المكرمة', en: 'Makkah', fr: 'La Mecque', zh: '麦加' },
    'loc_madinah': { ar: 'المدينة المنورة', en: 'Madinah', fr: 'Médine', zh: '麦地那' },
    'loc_abha': { ar: 'أبها / عسير', en: 'Abha / Asir', fr: 'Abha / Assir', zh: '艾卜哈 / 阿西尔' },
    'loc_tabuk': { ar: 'تبوك', en: 'Tabuk', fr: 'Tabuk', zh: '塔布克' },
    'loc_qassim': { ar: 'القصيم (بريدة)', en: 'Qassim (Buraidah)', fr: 'Qassim (Buraydah)', zh: '盖西姆 (布赖代)' },
    'loc_hail': { ar: 'حائل', en: 'Hail', fr: 'Haïl', zh: '哈伊勒' },
    'land_area': { ar: 'مساحة الأرض (م2)', en: 'Land Area (m²)', fr: 'Surface Terrain (m²)', zh: '土地面积 (m²)' },
    'build_area_label': { ar: 'مسطح البناء (م2)', en: 'Build Area (m²)', fr: 'Surface Construite (m²)', zh: '建筑面积 (m²)' },
    'floors_count': { ar: 'عدد الأدوار', en: 'Number of Floors', fr: "Nombre d'Étages", zh: '楼层数' },
    'soil_type': { ar: 'نوع التربة', en: 'Soil Type', fr: 'Type de Sol', zh: '土壤类型' },
    'soil_normal': { ar: 'عادية / متماسكة', en: 'Normal / Cohesive', fr: 'Normale / Cohésive', zh: '正常/粘性' },
    'soil_sandy': { ar: 'رملية', en: 'Sandy', fr: 'Sablonneuse', zh: '沙质' },
    'soil_clay': { ar: 'طينية', en: 'Clay', fr: 'Argileuse', zh: '粘土' },
    'soil_rocky_soft': { ar: 'صخرية ناعمة', en: 'Soft Rock', fr: 'Roche Tendre', zh: '软岩' },
    'soil_rocky_hard': { ar: 'صخرية صلبة', en: 'Hard Rock', fr: 'Roche Dure', zh: '硬岩' },
    'soil_marshy': { ar: 'مستنقعية / رطبة', en: 'Marshy / Wet', fr: 'Marécageuse', zh: '沼泽' },
    'fixed_overhead': { ar: 'المصاريف الثابتة (ر.س)', en: 'Fixed Overhead (SAR)', fr: 'Frais Fixes (SAR)', zh: '固定管理费 (SAR)' },
    'project_duration': { ar: 'مدة المشروع (شهر)', en: 'Project Duration (Mo)', fr: 'Durée du Projet (Mois)', zh: '项目工期 (月)' },
    'reset_defaults': { ar: 'إعادة تعيين الافتراضيات', en: 'Reset Defaults', fr: 'Rétablir Défauts', zh: '重置默认值' },
    'confirm_reset': { ar: 'هل أنت متأكد؟', en: 'Are you sure?', fr: 'Êtes-vous sûr?', zh: '你确定吗？' },
    'tab_team': { ar: 'فريق العمل', en: 'Team', fr: 'Équipe', zh: '团队' },
    'tab_zones': { ar: 'المناطق', en: 'Zones', fr: 'Zones', zh: '区域' },
    'tab_facades': { ar: 'الواجهات', en: 'Facades', fr: 'Façades', zh: '外墙' },
    'tab_data': { ar: 'بيانات', en: 'Data', fr: 'Données', zh: '数据' },

    // Room Types
    'room_majlis': { ar: 'مجلس', en: 'Majlis', fr: 'Salon de Réception', zh: '会客室' },
    'room_bedroom': { ar: 'غرفة نوم', en: 'Bedroom', fr: 'Chambre', zh: '卧室' },
    'room_kitchen': { ar: 'مطبخ', en: 'Kitchen', fr: 'Cuisine', zh: '厨房' },
    'room_living': { ar: 'صالة معيشة', en: 'Living Room', fr: 'Salon', zh: '客厅' },
    'room_bathroom': { ar: 'دورة مياه', en: 'Bathroom', fr: 'Salle de Bain', zh: '浴室' },
    'room_office': { ar: 'مكتب', en: 'Office', fr: 'Bureau', zh: '办公室' },
    'room_shop': { ar: 'محل تجاري', en: 'Shop', fr: 'Magasin', zh: '商店' },
    'room_corridor': { ar: 'ممر', en: 'Corridor', fr: 'Couloir', zh: '走廊' },
    'room_service': { ar: 'غرفة خدمات', en: 'Service Room', fr: 'Salle de Service', zh: '服务室' },
    'room_general': { ar: 'منطقة عامة', en: 'General Area', fr: 'Zone Générale', zh: '公共区域' },

    // Facade Materials
    'mat_paint': { ar: 'دهان', en: 'Paint', fr: 'Peinture', zh: '油漆' },
    'mat_stone': { ar: 'حجر', en: 'Stone', fr: 'Pierre', zh: '石材' },
    'mat_glass': { ar: 'زجاج', en: 'Glass', fr: 'Verre', zh: '玻璃' },
    'mat_cladding': { ar: 'كلادينج', en: 'Cladding', fr: 'Bardage', zh: '覆层' },
    'mat_grc': { ar: 'جي آر سي', en: 'GRC', fr: 'GRC', zh: 'GRC' },

    // Labels for Sidebar Actions
    'add_room': { ar: 'إضافة غرفة', en: 'Add Room', fr: 'Ajouter Chambre', zh: '添加房间' },
    'add_facade': { ar: 'إضافة واجهة', en: 'Add Facade', fr: 'Ajouter Façade', zh: '添加外墙' },
    'add_member': { ar: 'إضافة عضو', en: 'Add Member', fr: 'Ajouter Membre', zh: '添加成员' },
    'new_room_name': { ar: 'منطقة جديدة', en: 'New Area', fr: 'Nouvelle Zone', zh: '新区域' },
    'new_member_role': { ar: 'عضو جديد', en: 'New Member', fr: 'Nouveau Membre', zh: '新成员' },
    'count': { ar: 'العدد', en: 'Count', fr: 'Nombre', zh: '数量' },
    'area_m2': { ar: 'المساحة (م2)', en: 'Area (m²)', fr: 'Surface (m²)', zh: '面积 (m²)' },
    'sockets': { ar: 'أفياش', en: 'Sockets', fr: 'Prises', zh: '插座' },
    'switches': { ar: 'مفاتيح', en: 'Switches', fr: 'Interrupteurs', zh: '开关' },
    'ac_points': { ar: 'تكييف', en: 'AC Points', fr: 'Points AC', zh: '空调点' },
    'direction': { ar: 'الجهة', en: 'Direction', fr: 'Direction', zh: '方向' },
    'material': { ar: 'المادة', en: 'Material', fr: 'Matériau', zh: '材料' },
    'role': { ar: 'الدور / الوظيفة', en: 'Role', fr: 'Rôle', zh: '角色' },
    'salary': { ar: 'الراتب الشهري', en: 'Monthly Salary', fr: 'Salaire Mensuel', zh: '月薪' },
    'duration_mo': { ar: 'المدة (شهر)', en: 'Duration (Mo)', fr: 'Durée (Mois)', zh: '持续时间 (月)' },

    // Project Types Dropdown
    'proj_villa': { ar: 'فيلا سكنية', en: 'Residential Villa', fr: 'Villa Résidentielle', zh: '住宅别墅' },
    'proj_tower': { ar: 'برج / مركز تجاري', en: 'Tower / Commercial', fr: 'Tour / Commercial', zh: '塔楼 / 商业' },
    'proj_rest': { ar: 'استراحة / شاليه', en: 'Rest House / Chalet', fr: 'Maison de Repos', zh: '度假屋' },
    'proj_factory': { ar: 'مصنع / مستودع', en: 'Factory / Warehouse', fr: 'Usine / Entrepôt', zh: '工厂 / 仓库' },
    'proj_school': { ar: 'مدرسة / معهد', en: 'School / Institute', fr: 'École / Institut', zh: '学校 / 学院' },
    'proj_hospital': { ar: 'مستشفى / مركز طبي', en: 'Hospital / Medical Center', fr: 'Hôpital / Centre Médical', zh: '医院 / 医疗中心' },
    'proj_mosque': { ar: 'مسجد / جامع', en: 'Mosque', fr: 'Mosquée', zh: '清真寺' },
    'proj_hotel': { ar: 'فندق / نُزُل', en: 'Hotel / Inn', fr: 'Hôtel / Auberge', zh: '酒店 / 旅馆' },
    'proj_residential': { ar: 'عمارة سكنية', en: 'Residential Building', fr: 'Immeuble Résidentiel', zh: '住宅楼' },
    'proj_sports': { ar: 'مجمع رياضي / ملعب', en: 'Sports Complex', fr: 'Complexe Sportif', zh: '体育场馆' },
    'proj_farm': { ar: 'مزرعة / منشأة زراعية', en: 'Farm / Agricultural', fr: 'Ferme / Agricole', zh: '农场' },

    // App Header
    'official_offer': { ar: 'عرض سعر رسمي', en: 'Official Quotation', fr: 'Devis Officiel', zh: '正式报价' },
    'prepared_by': { ar: 'إعداد', en: 'Prepared by', fr: 'Préparé par', zh: '编制人' },
    'boq_title': { ar: 'جدول الكميات والمواصفات', en: 'Bill of Quantities', fr: 'Devis Quantitatif', zh: '工程量清单' },
    'preparing_export': { ar: 'جاري تجهيز الملف...', en: 'Preparing file...', fr: 'Préparation du fichier...', zh: '正在准备文件...' },

    // Interior Editor
    'floor': { ar: 'الأرضية', en: 'Floor', fr: 'Sol', zh: '地板' },
    'ceiling': { ar: 'السقف', en: 'Ceiling', fr: 'Plafond', zh: '天花板' },
    'wall_n': { ar: 'جدار شمالي', en: 'North Wall', fr: 'Mur Nord', zh: '北墙' },
    'wall_s': { ar: 'جدار جنوبي', en: 'South Wall', fr: 'Mur Sud', zh: '南墙' },
    'wall_e': { ar: 'جدار شرقي', en: 'East Wall', fr: 'Mur Est', zh: '东墙' },
    'wall_w': { ar: 'جدار غربي', en: 'West Wall', fr: 'Mur Ouest', zh: '西墙' },
    'select_material': { ar: 'اختر المادة', en: 'Select Material', fr: 'Choisir le Matériau', zh: '选择材料' },
    'interior_desc': { ar: 'تحديد مواد التشطيب للجدران، الأرضيات، والأسقف لكل غرفة.', en: 'Define finishing materials for walls, floors, and ceilings for each room.', fr: 'Définissez les matériaux de finition pour les murs, les sols et les plafonds.', zh: '定义每个房间的墙壁、地板和天花板的装修材料。' },
    'select_surface_inst': { ar: 'اختر المادة المناسبة لهذا السطح', en: 'Select the appropriate material for this surface', fr: 'Sélectionnez le matériau approprié pour cette surface', zh: '为此表面选择合适的材料' },
    'click_wall_inst': { ar: 'اضغط على أي جدار لتغيير مادته', en: 'Click on any wall to change its material', fr: 'Cliquez sur n\'importe quel mur pour changer son matériau', zh: '点击任何墙壁以更改其材料' },
    'select_room_first': { ar: 'الرجاء تحديد غرفة للبدء', en: 'Please select a room to begin', fr: 'Veuillez sélectionner une chambre pour commencer', zh: '请选择一个房间开始' },
    'select_surface_first': { ar: 'الرجاء تحديد سطح من المخطط', en: 'Please select a surface from the layout', fr: 'Veuillez sélectionner une surface sur le plan', zh: '请从布局中选择一个表面' },

    // Blueprint Editor
    'blueprint_title': { ar: 'مخطط البناء والإنشاءات', en: 'Construction Blueprint', fr: 'Plan de Construction', zh: '施工蓝图' },
    'blueprint_desc': { ar: 'حدد أبعاد الأرض، ثم قم بتقسيم مساحات كل طابق لضمان دقة حساب الكميات.', en: 'Define plot dimensions, then zone each floor for accurate quantity calculations.', fr: 'Définissez les dimensions du terrain, puis zonifiez chaque étage.', zh: '定义地块尺寸，然后划分每个楼层以进行精确的数量计算。' },
    'plot_dims': { ar: 'أبعاد الأرض', en: 'Plot Dimensions', fr: 'Dimensions du Terrain', zh: '地块尺寸' },
    'length': { ar: 'الطول', en: 'Length', fr: 'Longueur', zh: '长度' },
    'width': { ar: 'العرض', en: 'Width', fr: 'Largeur', zh: '宽度' },
    'depth': { ar: 'العمق', en: 'Depth', fr: 'Profondeur', zh: '深度' },
    'setback_f': { ar: 'ارتداد أمامي', en: 'Front Setback', fr: 'Recul Avant', zh: '前退缩' },
    'setback_s': { ar: 'ارتداد جانبي', en: 'Side Setback', fr: 'Recul Latéral', zh: '侧退缩' },
    'plot_area': { ar: 'مساحة الأرض', en: 'Plot Area', fr: 'Superficie du Terrain', zh: '地块面积' },
    'floors_details': { ar: 'تفاصيل الطوابق والأسقف', en: 'Floors & Slabs Details', fr: 'Détails des Étages et Dalles', zh: '楼层和板坯详情' },
    'add_floor': { ar: 'إضافة طابق', en: 'Add Floor', fr: 'Ajouter un Étage', zh: '添加楼层' },
    'floor_area': { ar: 'مسطح البناء', en: 'Build Area', fr: 'Surface Construite', zh: '建筑面积' },
    'slab_type': { ar: 'نظام السقف', en: 'Slab System', fr: 'Système de Dalle', zh: '板坯系统' },
    'columns_count': { ar: 'عدد الأعمدة', en: 'Column Count', fr: 'Nombre de Colonnes', zh: '柱数' },
    'floor_height': { ar: 'الارتفاع', en: 'Height', fr: 'Hauteur', zh: '高度' },
    'total_build_area': { ar: 'إجمالي مسطحات البناء', en: 'Total Built-up Area', fr: 'Surface Totale Construite', zh: '总建筑面积' },
    'total_floors': { ar: 'إجمالي عدد الطوابق', en: 'Total Floors', fr: 'Nombre Total d\'Étages', zh: '总楼层数' },
    'area_distribution': { ar: 'تقسيمات المساحة', en: 'Area Distribution', fr: 'Distribution de Surface', zh: '区域分布' },
    'used': { ar: 'المستغل', en: 'Used', fr: 'Utilisé', zh: '已用' },
    'remaining': { ar: 'المتبقي', en: 'Remaining', fr: 'Restant', zh: '剩余' },
    'area_full': { ar: 'المساحة ممتلئة!', en: 'Area Full!', fr: 'Espace Plein!', zh: '面积已满!' },
    'add_zone': { ar: 'إضافة تقسيم جديد', en: 'Add New Zone', fr: 'Ajouter une Zone', zh: '添加新区域' },
    'no_zones': { ar: 'لم يتم إضافة تقسيمات بعد', en: 'No zones added yet', fr: 'Aucune zone ajoutée', zh: '尚未添加区域' },
    'preview': { ar: 'المعاينة', en: 'Preview', fr: 'Aperçu', zh: '预览' },
    'zone_name': { ar: 'اسم المنطقة', en: 'Zone Name', fr: 'Nom de Zone', zh: '区域名称' },

    // Blueprint Options
    'slab_solid': { ar: 'بلاطة مصمتة', en: 'Solid Slab', fr: 'Dalle Pleine', zh: '实心板' },
    'slab_hordi': { ar: 'هوردي', en: 'Hordi', fr: 'Hordi', zh: '空心砖' },
    'slab_flat': { ar: 'بلاطة فلات', en: 'Flat Slab', fr: 'Dalle Plate', zh: '平板' },
    'slab_waffle': { ar: 'وافل', en: 'Waffle Slab', fr: 'Dalle Gauffrée', zh: '密肋板' },
    'zone_room': { ar: 'غرفة', en: 'Room', fr: 'Chambre', zh: '房间' },
    'zone_service': { ar: 'خدمات', en: 'Service', fr: 'Service', zh: '服务' },
    'zone_corridor': { ar: 'ممر', en: 'Corridor', fr: 'Couloir', zh: '走廊' },
    'zone_open': { ar: 'مساحة مفتوحة', en: 'Open Area', fr: 'Espace Ouvert', zh: '开放区域' },

    // Stats Grid
    'total_direct_cost': { ar: 'إجمالي التكلفة المباشرة', en: 'Total Direct Cost', fr: 'Coût Direct Total', zh: '总直接成本' },
    'overhead_distributed': { ar: 'المصاريف الثابتة الموزعة', en: 'Distributed Overhead', fr: 'Frais Généraux Distribués', zh: '分配的间接费用' },
    'net_profit': { ar: 'صافي الربح المتوقع', en: 'Net Profit', fr: 'Bénéfice Net', zh: '净利润' },
    'final_offer_price': { ar: 'سعر العرض النهائي', en: 'Final Offer Price', fr: 'Prix de l\'Offre Finale', zh: '最终报价' },
    'total_concrete': { ar: 'إجمالي الخرسانة', en: 'Total Concrete', fr: 'Béton Total', zh: '混凝土总量' },
    'total_labor': { ar: 'تكلفة الأيدي العاملة', en: 'Labor Cost', fr: 'Coût de Main-d\'œuvre', zh: '人工成本' },
    'total_material': { ar: 'تكلفة المواد الخام', en: 'Material Cost', fr: 'Coût des Matériaux', zh: '材料成本' },

    // Item Table
    'item_desc': { ar: 'البند / الوصف', en: 'Item / Description', fr: 'Article / Description', zh: '项目 / 描述' },
    'qty': { ar: 'الكمية', en: 'Qty', fr: 'Qté', zh: '数量' },
    'supplier': { ar: 'المورد المعتمد', en: 'Supplier', fr: 'Fournisseur', zh: '供应商' },
    'sbc_code': { ar: 'كود SBC', en: 'SBC Code', fr: 'Code SBC', zh: 'SBC代码' },
    'unit_price': { ar: 'السعر المفرد', en: 'Unit Price', fr: 'Prix Unitaire', zh: '单价' },
    'total': { ar: 'الإجمالي', en: 'Total', fr: 'Total', zh: '总计' },
    'no_items': { ar: 'لا توجد بنود مطابقة للفلاتر الحالية', en: 'No matching items', fr: 'Aucun article correspondant', zh: '无匹配项目' },
    'manual_edit': { ar: 'تعديل السعر يدوياً', en: 'Manual Price Edit', fr: 'Modification Manuelle', zh: '手动价格编辑' },
    'ai_check': { ar: 'مراجعة السعر مع AI', en: 'Check with AI', fr: 'Vérifier avec IA', zh: 'AI检查' },
    'selected_supplier': { ar: 'المورد المختار', en: 'Selected Supplier', fr: 'Fournisseur Sélectionné', zh: '选定供应商' },
    'mat_waste': { ar: 'المواد + الهدر', en: 'Mat + Waste', fr: 'Mat + Déchets', zh: '材料 + 损耗' },
    'labor_manu': { ar: 'أجور وتصنيع', en: 'Labor & Manu.', fr: 'Main-d\'œuvre', zh: '人工与制造' },
    'profit_val': { ar: 'قيمة الربح', en: 'Profit Value', fr: 'Valeur du Profit', zh: '利润值' },

    // Item Detail Keys
    'origin_class': { ar: 'المنشأ / التصنيف', en: 'Origin / Class', fr: 'Origine / Classe', zh: '产地 / 等级' },
    'options_avail': { ar: 'خيارات متاحة', en: 'options available', fr: 'options disponibles', zh: '可用选项' },
    'tech_specs': { ar: 'المواصفات الفنية', en: 'Technical Specs', fr: 'Spéc. Techniques', zh: '技术规格' },
    'depth_m': { ar: 'العمق (م)', en: 'Depth (m)', fr: 'Profondeur (m)', zh: '深度 (m)' },
    'thickness_cm': { ar: 'السماكة (سم)', en: 'Thickness (cm)', fr: 'Épaisseur (cm)', zh: '厚度 (cm)' },
    'cement_bags': { ar: 'أسمنت (أكياس)', en: 'Cement (bags)', fr: 'Ciment (sacs)', zh: '水泥 (袋)' },
    'tank_type': { ar: 'نوع الخزان', en: 'Tank Type', fr: 'Type de Réservoir', zh: '水箱类型' },
    'elasticity': { ar: 'المرونة', en: 'Elasticity', fr: 'Élasticité', zh: '弹性' },
    'high_risk': { ar: 'مخاطر عالية', en: 'High Risk', fr: 'Haut Risque', zh: '高风险' },
    'supp_premium': { ar: 'متميز', en: 'Premium', fr: 'Premium', zh: '高级' },
    'supp_standard': { ar: 'قياسي', en: 'Standard', fr: 'Standard', zh: '标准' },
    'supp_budget': { ar: 'اقتصادي', en: 'Budget', fr: 'Éco', zh: '经济' },
    'type_gov': { ar: 'حكومي', en: 'Gov', fr: 'Gouv', zh: '政府' },
    'type_prod': { ar: 'إنتاج', en: 'Production', fr: 'Prod', zh: '生产' },
    'type_gen': { ar: 'عام', en: 'General', fr: 'Général', zh: '一般' },
    'edit': { ar: 'تعديل', en: 'Edited', fr: 'Modifié', zh: '已编辑' },
    'optimal': { ar: 'أمثل', en: 'Optimal', fr: 'Optimal', zh: '最佳' },
};

// ... Interior Materials remain same ...
export const INTERIOR_MATERIALS: MaterialDef[] = [
    { id: 'paint_white', name: { ar: 'دهان أبيض (Off-white)', en: 'Off-white Paint', fr: 'Peinture blanc cassé', zh: '米白色油漆' }, type: 'paint', color: '#f8f9fa', pricePerSqm: 25 },
    { id: 'paint_beige', name: { ar: 'دهان بيج', en: 'Beige Paint', fr: 'Peinture beige', zh: '米色油漆' }, type: 'paint', color: '#f5f5dc', pricePerSqm: 25 },
    { id: 'paint_gray', name: { ar: 'دهان رمادي فاتح', en: 'Light Gray Paint', fr: 'Peinture gris clair', zh: '浅灰色油漆' }, type: 'paint', color: '#e2e8f0', pricePerSqm: 28 },
    { id: 'paint_accent', name: { ar: 'دهان ديكوري (Accent)', en: 'Accent Paint', fr: 'Peinture décorative', zh: '装饰漆' }, type: 'paint', color: '#3b82f6', pricePerSqm: 45 },

    { id: 'wall_floral', name: { ar: 'ورق جدران مشجر', en: 'Floral Wallpaper', fr: 'Papier peint floral', zh: '碎花壁纸' }, type: 'wallpaper', color: '#fff0f5', textureUrl: 'radial-gradient(circle, #fbcfe8 10%, transparent 10%)', pricePerSqm: 60 },
    { id: 'wall_damask', name: { ar: 'ورق جدران كلاسيك', en: 'Damask Wallpaper', fr: 'Papier peint damassé', zh: '锦缎壁纸' }, type: 'wallpaper', color: '#e5e7eb', textureUrl: 'repeating-linear-gradient(45deg, #d1d5db 0, #d1d5db 1px, transparent 0, transparent 50%)', pricePerSqm: 85 },

    { id: 'wood_panel', name: { ar: 'تكسيات خشبية', en: 'Wood Paneling', fr: 'Lambris bois', zh: '木镶板' }, type: 'wood', color: '#a8713a', textureUrl: 'linear-gradient(90deg, #92400e 5%, transparent 5%)', pricePerSqm: 250 },
    { id: 'marble_st', name: { ar: 'رخام ستواريو', en: 'Statuario Marble', fr: 'Marbre Statuario', zh: '大理石' }, type: 'marble', color: '#ffffff', textureUrl: 'linear-gradient(135deg, #e5e7eb 25%, transparent 25%)', pricePerSqm: 450 },
    { id: 'ceramic_std', name: { ar: 'سيراميك 60x60', en: 'Ceramic 60x60', fr: 'Céramique', zh: '陶瓷' }, type: 'ceramic', color: '#f3f4f6', textureUrl: 'repeating-linear-gradient(0deg, #d1d5db, #d1d5db 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #d1d5db, #d1d5db 1px, transparent 1px, transparent 20px)', pricePerSqm: 55 },

    { id: 'floor_parquet', name: { ar: 'باركيه خشبي', en: 'Parquet', fr: 'Parquet', zh: '镶木地板' }, type: 'wood', color: '#d97706', textureUrl: 'repeating-linear-gradient(45deg, #b45309 0, #b45309 10px, #d97706 10px, #d97706 20px)', pricePerSqm: 120 },
];

export const INITIAL_OVERHEAD = 50000;
export const REF_LAND_AREA = 300;
export const REF_BUILD_AREA = 450;

export const SOIL_MULTIPLIERS: Record<SoilType, number> = {
    'normal': 0.9,
    'sandy': 1.0,
    'clay': 1.2,
    'rocky_soft': 1.5,
    'rocky_hard': 3.0,
    'marshy': 2.5,
};

export const EST_COST_PER_SQM: Record<ProjectType, number> = {
    'villa': 1800,
    'tower': 3500,
    'factory': 1200,
    'rest_house': 1600,
    'school': 2200,
    'hospital': 4500,
    'mosque': 2800,
    'hotel': 3800,
    'residential_building': 2000,
    'sports_complex': 2500,
    'farm': 800,
    'gas_station': 2500,
    'mall': 4000,
    'restaurant': 3000,
    'car_wash': 1500,
    'warehouse': 900,
    'government': 2800,
    'clinic': 3500,
};

export const PROJECT_TITLES: Record<ProjectType, string> = {
    'villa': 'نظام تسعير الفلل السكنية',
    'tower': 'نظام تسعير الأبراج والمراكز التجارية',
    'factory': 'نظام تسعير المصانع والمستودعات',
    'rest_house': 'نظام تسعير الاستراحات والشاليهات',
    'school': 'نظام تسعير المدارس والمعاهد',
    'hospital': 'نظام تسعير المستشفيات والمراكز الطبية',
    'mosque': 'نظام تسعير المساجد والجوامع',
    'hotel': 'نظام تسعير الفنادق والنُزُل',
    'residential_building': 'نظام تسعير العمارات السكنية',
    'sports_complex': 'نظام تسعير المجمعات الرياضية',
    'farm': 'نظام تسعير المزارع والمنشآت الزراعية',
    'gas_station': 'نظام تسعير محطات الوقود',
    'mall': 'نظام تسعير مراكز التسوق والمولات',
    'restaurant': 'نظام تسعير المطاعم والكافيهات',
    'car_wash': 'نظام تسعير مغاسل السيارات',
    'warehouse': 'نظام تسعير المستودعات',
    'government': 'نظام تسعير المباني الحكومية',
    'clinic': 'نظام تسعير العيادات والمراكز الطبية',
};

// ... Project Defaults remain same ...
export const PROJECT_DEFAULTS: Record<ProjectType, { rooms: RoomConfig[], facades: FacadeConfig[], team: TeamMember[], blueprint: BlueprintConfig }> = {
    villa: {
        rooms: [
            { id: 'v1', type: 'majlis', name: 'مجلس رجال', count: 1, area: 40, sockets: 6, switches: 3, acPoints: 2 },
            { id: 'v2', type: 'living', name: 'صالة عائلية', count: 1, area: 35, sockets: 5, switches: 3, acPoints: 2 },
            { id: 'v3', type: 'bedroom', name: 'غرفة نوم ماستر', count: 1, area: 30, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'v4', type: 'bedroom', name: 'غرف نوم أطفال', count: 3, area: 20, sockets: 4, switches: 2, acPoints: 1 },
            { id: 'v5', type: 'kitchen', name: 'مطبخ رئيسي', count: 1, area: 25, sockets: 10, switches: 2, acPoints: 1 },
            { id: 'v6', type: 'bathroom', name: 'دورات مياه', count: 5, area: 5, sockets: 2, switches: 2, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'stone', area: 80 },
            { id: 'f2', direction: 'south', material: 'paint', area: 100 },
        ],
        team: [
            { id: 'tm1', role: 'مهندس موقع (Site Eng)', count: 1, monthlyCost: 6000, durationMonths: 12 },
            { id: 'tm2', role: 'حارس (Watchman)', count: 1, monthlyCost: 1500, durationMonths: 12 },
            { id: 'tm3', role: 'معقب / إداري', count: 0.5, monthlyCost: 4000, durationMonths: 6 },
        ],
        blueprint: {
            plotLength: 30,
            plotWidth: 20,
            setbackFront: 3,
            setbackSide: 2,
            setbackRear: 2,
            floors: [
                {
                    id: 'fl_g',
                    name: 'الدور الأرضي',
                    area: 300,
                    height: 3.5,
                    slabType: 'flat',
                    columnsCount: 16,
                    roomsCount: 4,
                    annexesCount: 1,
                    perimeterWallLength: 68,
                    internalWallLength: 45,
                    zones: [
                        { id: 'z_g1', name: 'صالة استقبال', area: 60, type: 'room', isOccupied: true },
                        { id: 'z_g2', name: 'مجلس رجال', area: 40, type: 'room', isOccupied: true },
                        { id: 'z_g3', name: 'غرفة طعام', area: 35, type: 'room', isOccupied: true },
                        { id: 'z_g4', name: 'مطبخ', area: 30, type: 'service', isOccupied: true },
                        { id: 'z_g5', name: 'ممر', area: 25, type: 'corridor' },
                        { id: 'z_g6', name: 'حمام ضيوف', area: 8, type: 'service', isOccupied: true },
                        { id: 'z_g7', name: 'مخزن', area: 10, type: 'closed' },
                        { id: 'z_g8', name: 'ملحق خارجي', area: 40, type: 'annex', isAvailable: true },
                        { id: 'z_g9', name: 'فناء مفتوح', area: 52, type: 'open' }
                    ]
                },
                {
                    id: 'fl_1',
                    name: 'الدور الأول',
                    area: 280,
                    height: 3.2,
                    slabType: 'hordi',
                    columnsCount: 16,
                    roomsCount: 5,
                    annexesCount: 0,
                    perimeterWallLength: 64,
                    internalWallLength: 50,
                    zones: [
                        { id: 'z_11', name: 'غرفة نوم رئيسية', area: 45, type: 'room', isOccupied: true },
                        { id: 'z_12', name: 'غرفة نوم 2', area: 30, type: 'room', isOccupied: true },
                        { id: 'z_13', name: 'غرفة نوم 3', area: 30, type: 'room', isOccupied: true },
                        { id: 'z_14', name: 'غرفة نوم 4', area: 25, type: 'room', isOccupied: true },
                        { id: 'z_15', name: 'صالة عائلية', area: 50, type: 'common', isOccupied: true },
                        { id: 'z_16', name: 'حمام رئيسي', area: 12, type: 'service', isOccupied: true },
                        { id: 'z_17', name: 'حمام مشترك', area: 8, type: 'service', isOccupied: true },
                        { id: 'z_18', name: 'ممر', area: 20, type: 'corridor' },
                        { id: 'z_19', name: 'مخزن ملابس', area: 10, type: 'closed' },
                        { id: 'z_1a', name: 'بلكونة', area: 50, type: 'open', isAvailable: true }
                    ]
                },
                {
                    id: 'fl_r',
                    name: 'الملحق العلوي',
                    area: 120,
                    height: 3.0,
                    slabType: 'solid',
                    columnsCount: 8,
                    roomsCount: 2,
                    annexesCount: 1,
                    perimeterWallLength: 44,
                    internalWallLength: 20,
                    zones: [
                        { id: 'z_r1', name: 'غرفة متعددة', area: 40, type: 'room', isAvailable: true },
                        { id: 'z_r2', name: 'غرفة خدمة', area: 20, type: 'service', isOccupied: true },
                        { id: 'z_r3', name: 'حمام', area: 6, type: 'service', isOccupied: true },
                        { id: 'z_r4', name: 'سطح مفتوح', area: 54, type: 'open', isAvailable: true }
                    ]
                },
            ],
            // === v6.0 Engineering Data ===
            excavation: {
                excavationDepth: 1.5,
                soilReplacementNeeded: false,
                soilReplacementThickness: 0,
                zeroLevel: 0.30,
            },
            foundation: {
                type: 'isolated_footings',
                neckColumnHeight: 0.50,
                tieBeamDepth: 0.60,
                tieBeamWidth: 0.30,
                footingDepth: 0.50,
                footingWidth: 1.20,
                raftThickness: 0,
            },
            roomFinishes: [
                { id: 'rf1', roomName: 'مجلس رجال', roomType: 'majlis', length: 8, width: 5, height: 3.5, floorFinish: 'porcelain_120x60', wallFinish: 'paint_plastic', ceilingFinish: 'gypsum_board', windowDoorRatio: 0.15, floorId: 'fl_g' },
                { id: 'rf2', roomName: 'صالة استقبال', roomType: 'living', length: 10, width: 6, height: 3.5, floorFinish: 'porcelain_120x60', wallFinish: 'paint_plastic', ceilingFinish: 'gypsum_board', windowDoorRatio: 0.15, floorId: 'fl_g' },
                { id: 'rf3', roomName: 'مطبخ رئيسي', roomType: 'kitchen', length: 6, width: 5, height: 3.5, floorFinish: 'ceramic_60x60', wallFinish: 'ceramic_30x60', ceilingFinish: 'paint_plastic', wetAreaWallHeight: 2.4, windowDoorRatio: 0.10, floorId: 'fl_g' },
                { id: 'rf4', roomName: 'حمام ضيوف', roomType: 'bathroom', length: 3, width: 2.5, height: 3.5, floorFinish: 'ceramic_60x60', wallFinish: 'ceramic_30x60', ceilingFinish: 'paint_plastic', wetAreaWallHeight: 2.4, windowDoorRatio: 0.05, floorId: 'fl_g' },
                { id: 'rf5', roomName: 'غرفة نوم ماستر', roomType: 'bedroom', length: 6, width: 5, height: 3.2, floorFinish: 'porcelain_120x60', wallFinish: 'paint_velvet', ceilingFinish: 'gypsum_board', windowDoorRatio: 0.12, floorId: 'fl_1' },
                { id: 'rf6', roomName: 'غرفة نوم 2', roomType: 'bedroom', length: 5, width: 4, height: 3.2, floorFinish: 'ceramic_60x60', wallFinish: 'paint_plastic', ceilingFinish: 'paint_plastic', windowDoorRatio: 0.12, floorId: 'fl_1' },
                { id: 'rf7', roomName: 'غرفة نوم 3', roomType: 'bedroom', length: 5, width: 4, height: 3.2, floorFinish: 'ceramic_60x60', wallFinish: 'paint_plastic', ceilingFinish: 'paint_plastic', windowDoorRatio: 0.12, floorId: 'fl_1' },
                { id: 'rf8', roomName: 'حمام رئيسي', roomType: 'bathroom', length: 4, width: 3, height: 3.2, floorFinish: 'ceramic_60x60', wallFinish: 'ceramic_30x60', ceilingFinish: 'paint_plastic', wetAreaWallHeight: 2.4, windowDoorRatio: 0.05, floorId: 'fl_1' },
            ],
            facadeSchedules: [
                { id: 'fs1', direction: 'north', width: 20, totalHeight: 9.7, finishType: 'stone_mechanical', windowDoorRatio: 0.20 },
                { id: 'fs2', direction: 'south', width: 20, totalHeight: 9.7, finishType: 'plaster_paint', windowDoorRatio: 0.15 },
                { id: 'fs3', direction: 'east', width: 30, totalHeight: 9.7, finishType: 'plaster_paint', windowDoorRatio: 0.12 },
                { id: 'fs4', direction: 'west', width: 30, totalHeight: 9.7, finishType: 'plaster_paint', windowDoorRatio: 0.12 },
            ],
        }
    },
    tower: {
        rooms: [
            { id: 't1', type: 'office', name: 'مكاتب إدارية', count: 10, area: 50, sockets: 8, switches: 4, acPoints: 2 },
            { id: 't2', type: 'shop', name: 'معارض تجارية', count: 4, area: 100, sockets: 12, switches: 6, acPoints: 4 },
            { id: 't3', type: 'corridor', name: 'ممرات وحركة', count: 1, area: 200, sockets: 10, switches: 10, acPoints: 0 },
            { id: 't4', type: 'service', name: 'غرف خدمات', count: 5, area: 10, sockets: 2, switches: 1, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'glass', area: 500 },
            { id: 'f2', direction: 'south', material: 'cladding', area: 500 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع (PM)', count: 1, monthlyCost: 15000, durationMonths: 18 },
            { id: 'tm2', role: 'مهندس مدني', count: 1, monthlyCost: 8000, durationMonths: 18 },
            { id: 'tm3', role: 'مهندس معماري', count: 1, monthlyCost: 8000, durationMonths: 12 },
            { id: 'tm4', role: 'مشرف سلامة', count: 1, monthlyCost: 4500, durationMonths: 18 },
        ],
        blueprint: {
            plotLength: 50,
            plotWidth: 40,
            setbackFront: 6,
            setbackSide: 4,
            floors: [
                { id: 'fl_b', name: 'القبو (مواقف)', area: 2000, height: 4.0, slabType: 'flat', columnsCount: 40, zones: [] },
                { id: 'fl_g', name: 'الأرضي (معارض)', area: 1500, height: 5.0, slabType: 'waffle', columnsCount: 30, zones: [] },
                { id: 'fl_1', name: 'مكاتب 1', area: 1500, height: 3.5, slabType: 'waffle', columnsCount: 30, zones: [] },
                { id: 'fl_2', name: 'مكاتب 2', area: 1500, height: 3.5, slabType: 'waffle', columnsCount: 30, zones: [] },
            ]
        }
    },
    rest_house: {
        rooms: [
            { id: 'r1', type: 'majlis', name: 'مجلس ضيافة', count: 1, area: 60, sockets: 8, switches: 4, acPoints: 3 },
            { id: 'r2', type: 'living', name: 'جلسة خارجية', count: 1, area: 40, sockets: 4, switches: 2, acPoints: 0 },
            { id: 'r3', type: 'kitchen', name: 'مطبخ (بوفيه)', count: 1, area: 15, sockets: 6, switches: 2, acPoints: 1 },
            { id: 'r4', type: 'bathroom', name: 'دورة مياه', count: 2, area: 4, sockets: 1, switches: 1, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'paint', area: 150 },
        ],
        team: [
            { id: 'tm1', role: 'مشرف عام', count: 1, monthlyCost: 4000, durationMonths: 6 },
            { id: 'tm2', role: 'حارس', count: 1, monthlyCost: 1500, durationMonths: 6 },
        ],
        blueprint: {
            plotLength: 25,
            plotWidth: 20,
            setbackFront: 2,
            setbackSide: 2,
            floors: [
                { id: 'fl_g', name: 'الدور الأرضي', area: 180, height: 3.5, slabType: 'solid', columnsCount: 12, zones: [] },
            ]
        }
    },
    factory: {
        rooms: [
            { id: 'fac1', type: 'office', name: 'مكاتب إدارة', count: 2, area: 20, sockets: 6, switches: 2, acPoints: 1 },
            { id: 'fac2', type: 'service', name: 'صالة إنتاج', count: 1, area: 1000, sockets: 50, switches: 20, acPoints: 10 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'paint', area: 800 },
        ],
        team: [
            { id: 'tm1', role: 'مدير موقع', count: 1, monthlyCost: 10000, durationMonths: 10 },
            { id: 'tm2', role: 'مساح', count: 1, monthlyCost: 5000, durationMonths: 4 },
        ],
        blueprint: {
            plotLength: 60,
            plotWidth: 30,
            setbackFront: 10,
            setbackSide: 5,
            floors: [
                { id: 'fl_g', name: 'هنجر المصنع', area: 1200, height: 8.0, slabType: 'solid', columnsCount: 20, zones: [] },
                { id: 'fl_m', name: 'ميزانين مكاتب', area: 200, height: 3.0, slabType: 'hordi', columnsCount: 8, zones: [] },
            ]
        }
    },
    school: {
        rooms: [
            { id: 'sch1', type: 'office', name: 'فصول دراسية', count: 12, area: 50, sockets: 6, switches: 4, acPoints: 2 },
            { id: 'sch2', type: 'office', name: 'معامل علوم/حاسب', count: 4, area: 60, sockets: 20, switches: 6, acPoints: 2 },
            { id: 'sch3', type: 'office', name: 'مكاتب إدارية', count: 6, area: 25, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'sch4', type: 'corridor', name: 'ممرات وسلالم', count: 1, area: 300, sockets: 10, switches: 15, acPoints: 0 },
            { id: 'sch5', type: 'bathroom', name: 'دورات مياه', count: 10, area: 8, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'sch6', type: 'service', name: 'مقصف/كافتيريا', count: 1, area: 80, sockets: 15, switches: 6, acPoints: 3 },
            { id: 'sch7', type: 'service', name: 'مكتبة', count: 1, area: 100, sockets: 10, switches: 4, acPoints: 2 },
            { id: 'sch8', type: 'service', name: 'قاعة متعددة الأغراض', count: 1, area: 200, sockets: 12, switches: 8, acPoints: 4 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'paint', area: 400 },
            { id: 'f2', direction: 'south', material: 'stone', area: 300 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 12000, durationMonths: 14 },
            { id: 'tm2', role: 'مهندس موقع', count: 2, monthlyCost: 7000, durationMonths: 14 },
            { id: 'tm3', role: 'مراقب سلامة', count: 1, monthlyCost: 4500, durationMonths: 14 },
        ],
        blueprint: {
            plotLength: 60, plotWidth: 40, setbackFront: 6, setbackSide: 4,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 1500, height: 4.0, slabType: 'flat', columnsCount: 35, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 1500, height: 3.5, slabType: 'flat', columnsCount: 35, zones: [] },
            ]
        }
    },
    hospital: {
        rooms: [
            { id: 'hos1', type: 'bedroom', name: 'غرف مرضى', count: 30, area: 20, sockets: 8, switches: 4, acPoints: 1 },
            { id: 'hos2', type: 'service', name: 'غرف عمليات', count: 4, area: 40, sockets: 20, switches: 8, acPoints: 3 },
            { id: 'hos3', type: 'service', name: 'غرف طوارئ', count: 6, area: 25, sockets: 12, switches: 6, acPoints: 2 },
            { id: 'hos4', type: 'service', name: 'عيادات خارجية', count: 10, area: 20, sockets: 8, switches: 4, acPoints: 1 },
            { id: 'hos5', type: 'office', name: 'مكاتب إدارية', count: 8, area: 20, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'hos6', type: 'service', name: 'صيدلية', count: 1, area: 50, sockets: 10, switches: 4, acPoints: 2 },
            { id: 'hos7', type: 'service', name: 'مختبرات', count: 3, area: 35, sockets: 15, switches: 6, acPoints: 2 },
            { id: 'hos8', type: 'bathroom', name: 'دورات مياه', count: 20, area: 6, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'hos9', type: 'corridor', name: 'ممرات', count: 1, area: 400, sockets: 15, switches: 20, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'glass', area: 600 },
            { id: 'f2', direction: 'south', material: 'cladding', area: 500 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 18000, durationMonths: 24 },
            { id: 'tm2', role: 'مهندس مدني', count: 2, monthlyCost: 9000, durationMonths: 24 },
            { id: 'tm3', role: 'مهندس MEP', count: 2, monthlyCost: 10000, durationMonths: 20 },
            { id: 'tm4', role: 'مراقب جودة', count: 1, monthlyCost: 6000, durationMonths: 24 },
        ],
        blueprint: {
            plotLength: 80, plotWidth: 60, setbackFront: 8, setbackSide: 6,
            floors: [
                { id: 'fl_b', name: 'القبو', area: 3000, height: 4.0, slabType: 'flat', columnsCount: 50, zones: [] },
                { id: 'fl_g', name: 'الأرضي', area: 3000, height: 4.5, slabType: 'flat', columnsCount: 50, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 3000, height: 4.0, slabType: 'flat', columnsCount: 50, zones: [] },
                { id: 'fl_2', name: 'الثاني', area: 3000, height: 4.0, slabType: 'flat', columnsCount: 50, zones: [] },
            ]
        }
    },
    mosque: {
        rooms: [
            { id: 'msq1', type: 'majlis', name: 'قاعة الصلاة رجال', count: 1, area: 400, sockets: 20, switches: 10, acPoints: 8 },
            { id: 'msq2', type: 'majlis', name: 'مصلى نساء', count: 1, area: 150, sockets: 10, switches: 6, acPoints: 4 },
            { id: 'msq3', type: 'bathroom', name: 'دورات مياه رجال', count: 8, area: 6, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'msq4', type: 'bathroom', name: 'دورات مياه نساء', count: 4, area: 6, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'msq5', type: 'service', name: 'مواضئ رجال', count: 1, area: 40, sockets: 4, switches: 4, acPoints: 0 },
            { id: 'msq6', type: 'service', name: 'مواضئ نساء', count: 1, area: 20, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'msq7', type: 'office', name: 'مكتب الإمام', count: 1, area: 15, sockets: 4, switches: 2, acPoints: 1 },
            { id: 'msq8', type: 'service', name: 'غرفة مؤذن', count: 1, area: 10, sockets: 4, switches: 2, acPoints: 1 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'stone', area: 200 },
            { id: 'f2', direction: 'south', material: 'stone', area: 200 },
            { id: 'f3', direction: 'east', material: 'grc', area: 100 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 10000, durationMonths: 12 },
            { id: 'tm2', role: 'مهندس موقع', count: 1, monthlyCost: 7000, durationMonths: 12 },
        ],
        blueprint: {
            plotLength: 35, plotWidth: 30, setbackFront: 4, setbackSide: 3,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 700, height: 6.0, slabType: 'waffle', columnsCount: 16, zones: [] },
                { id: 'fl_m', name: 'الميزانين (نساء)', area: 200, height: 3.5, slabType: 'hordi', columnsCount: 8, zones: [] },
            ]
        }
    },
    hotel: {
        rooms: [
            { id: 'htl1', type: 'bedroom', name: 'غرف فندقية', count: 50, area: 30, sockets: 8, switches: 4, acPoints: 1 },
            { id: 'htl2', type: 'bedroom', name: 'أجنحة VIP', count: 10, area: 60, sockets: 12, switches: 6, acPoints: 2 },
            { id: 'htl3', type: 'majlis', name: 'لوبي الاستقبال', count: 1, area: 200, sockets: 15, switches: 10, acPoints: 4 },
            { id: 'htl4', type: 'kitchen', name: 'مطعم رئيسي', count: 1, area: 150, sockets: 30, switches: 10, acPoints: 6 },
            { id: 'htl5', type: 'office', name: 'مكاتب إدارية', count: 5, area: 25, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'htl6', type: 'service', name: 'صالة رياضية', count: 1, area: 100, sockets: 15, switches: 6, acPoints: 3 },
            { id: 'htl7', type: 'service', name: 'مسبح/سبا', count: 1, area: 150, sockets: 10, switches: 6, acPoints: 4 },
            { id: 'htl8', type: 'bathroom', name: 'دورات مياه عامة', count: 8, area: 8, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'htl9', type: 'corridor', name: 'ممرات ومصاعد', count: 1, area: 400, sockets: 20, switches: 30, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'glass', area: 800 },
            { id: 'f2', direction: 'south', material: 'cladding', area: 600 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 20000, durationMonths: 24 },
            { id: 'tm2', role: 'مهندس مدني', count: 2, monthlyCost: 9000, durationMonths: 24 },
            { id: 'tm3', role: 'مهندس تشطيبات', count: 1, monthlyCost: 8000, durationMonths: 18 },
            { id: 'tm4', role: 'مهندس MEP', count: 2, monthlyCost: 10000, durationMonths: 20 },
        ],
        blueprint: {
            plotLength: 70, plotWidth: 50, setbackFront: 8, setbackSide: 5,
            floors: [
                { id: 'fl_b', name: 'القبو (مواقف)', area: 2500, height: 4.0, slabType: 'flat', columnsCount: 45, zones: [] },
                { id: 'fl_g', name: 'الأرضي (استقبال)', area: 2500, height: 5.0, slabType: 'waffle', columnsCount: 45, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 2500, height: 3.5, slabType: 'flat', columnsCount: 45, zones: [] },
                { id: 'fl_2', name: 'الثاني', area: 2500, height: 3.5, slabType: 'flat', columnsCount: 45, zones: [] },
                { id: 'fl_3', name: 'الثالث', area: 2500, height: 3.5, slabType: 'flat', columnsCount: 45, zones: [] },
            ]
        }
    },
    residential_building: {
        rooms: [
            { id: 'res1', type: 'living', name: 'شقق سكنية', count: 20, area: 120, sockets: 25, switches: 12, acPoints: 4 },
            { id: 'res2', type: 'corridor', name: 'سلالم ومداخل', count: 1, area: 150, sockets: 10, switches: 15, acPoints: 0 },
            { id: 'res3', type: 'service', name: 'غرف خدمات', count: 4, area: 10, sockets: 4, switches: 2, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'paint', area: 500 },
            { id: 'f2', direction: 'south', material: 'stone', area: 300 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 12000, durationMonths: 18 },
            { id: 'tm2', role: 'مهندس موقع', count: 1, monthlyCost: 7000, durationMonths: 18 },
            { id: 'tm3', role: 'مراقب', count: 2, monthlyCost: 4000, durationMonths: 18 },
        ],
        blueprint: {
            plotLength: 30, plotWidth: 25, setbackFront: 4, setbackSide: 3,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 500, height: 4.0, slabType: 'flat', columnsCount: 20, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 500, height: 3.2, slabType: 'hordi', columnsCount: 20, zones: [] },
                { id: 'fl_2', name: 'الثاني', area: 500, height: 3.2, slabType: 'hordi', columnsCount: 20, zones: [] },
                { id: 'fl_3', name: 'الثالث', area: 500, height: 3.2, slabType: 'hordi', columnsCount: 20, zones: [] },
                { id: 'fl_4', name: 'الرابع', area: 500, height: 3.2, slabType: 'hordi', columnsCount: 20, zones: [] },
            ]
        }
    },
    sports_complex: {
        rooms: [
            { id: 'spt1', type: 'service', name: 'ملعب رئيسي', count: 1, area: 5000, sockets: 50, switches: 30, acPoints: 0 },
            { id: 'spt2', type: 'service', name: 'صالة رياضية مغطاة', count: 1, area: 1500, sockets: 30, switches: 15, acPoints: 8 },
            { id: 'spt3', type: 'service', name: 'غرف ملابس', count: 4, area: 40, sockets: 10, switches: 4, acPoints: 2 },
            { id: 'spt4', type: 'bathroom', name: 'دورات مياه', count: 12, area: 10, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'spt5', type: 'office', name: 'مكاتب إدارية', count: 4, area: 25, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'spt6', type: 'shop', name: 'متاجر/كافتيريا', count: 4, area: 30, sockets: 8, switches: 4, acPoints: 2 },
            { id: 'spt7', type: 'service', name: 'مدرجات', count: 1, area: 800, sockets: 20, switches: 15, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'cladding', area: 1000 },
            { id: 'f2', direction: 'south', material: 'glass', area: 500 },
        ],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 18000, durationMonths: 20 },
            { id: 'tm2', role: 'مهندس مدني', count: 2, monthlyCost: 9000, durationMonths: 20 },
            { id: 'tm3', role: 'مهندس معماري', count: 1, monthlyCost: 9000, durationMonths: 16 },
        ],
        blueprint: {
            plotLength: 150, plotWidth: 100, setbackFront: 15, setbackSide: 10,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 10000, height: 5.0, slabType: 'waffle', columnsCount: 80, zones: [] },
                { id: 'fl_m', name: 'الميزانين', area: 2000, height: 4.0, slabType: 'flat', columnsCount: 30, zones: [] },
            ]
        }
    },
    farm: {
        rooms: [
            { id: 'frm1', type: 'office', name: 'مكتب إدارة المزرعة', count: 1, area: 30, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'frm2', type: 'service', name: 'مخزن أعلاف ومعدات', count: 1, area: 100, sockets: 4, switches: 2, acPoints: 0 },
            { id: 'frm3', type: 'service', name: 'صوبة زراعية', count: 2, area: 300, sockets: 10, switches: 4, acPoints: 0 },
            { id: 'frm4', type: 'service', name: 'حظائر حيوانات', count: 1, area: 200, sockets: 6, switches: 3, acPoints: 0 },
            { id: 'frm5', type: 'bathroom', name: 'دورات مياه', count: 2, area: 4, sockets: 1, switches: 1, acPoints: 0 },
        ],
        facades: [
            { id: 'f1', direction: 'north', material: 'paint', area: 200 },
        ],
        team: [
            { id: 'tm1', role: 'مشرف مزرعة', count: 1, monthlyCost: 5000, durationMonths: 12 },
            { id: 'tm2', role: 'عمال زراعة', count: 3, monthlyCost: 2000, durationMonths: 12 },
        ],
        blueprint: {
            plotLength: 200, plotWidth: 100, setbackFront: 5, setbackSide: 5,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 500, height: 4.0, slabType: 'solid', columnsCount: 12, zones: [] },
            ]
        }
    },
    gas_station: {
        rooms: [
            { id: 'gs1', type: 'shop', name: 'متجر (Mini Market)', count: 1, area: 80, sockets: 15, switches: 6, acPoints: 2 },
            { id: 'gs2', type: 'office', name: 'مكتب إداري', count: 1, area: 15, sockets: 4, switches: 2, acPoints: 1 },
            { id: 'gs3', type: 'bathroom', name: 'دورات مياه', count: 4, area: 6, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'gs4', type: 'prayer', name: 'مصلى', count: 2, area: 15, sockets: 2, switches: 2, acPoints: 1 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'cladding', area: 120 }],
        team: [
            { id: 'tm1', role: 'مشرف موقع', count: 1, monthlyCost: 5000, durationMonths: 8 },
        ],
        blueprint: {
            plotLength: 60, plotWidth: 40, setbackFront: 10, setbackSide: 5,
            floors: [{ id: 'fl_g', name: 'الأرضي', area: 200, height: 4.0, slabType: 'solid', columnsCount: 8, zones: [] }]
        }
    },
    mall: {
        rooms: [
            { id: 'ml1', type: 'shop', name: 'محلات تجارية', count: 50, area: 50, sockets: 8, switches: 4, acPoints: 2 },
            { id: 'ml2', type: 'restaurant', name: 'صالة طعام (Food Court)', count: 1, area: 500, sockets: 40, switches: 20, acPoints: 10 },
            { id: 'ml3', type: 'corridor', name: 'ممرات', count: 1, area: 2000, sockets: 30, switches: 40, acPoints: 0 },
            { id: 'ml4', type: 'bathroom', name: 'دورات مياه', count: 20, area: 8, sockets: 2, switches: 2, acPoints: 0 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'glass', area: 1500 }],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 25000, durationMonths: 30 },
            { id: 'tm2', role: 'مهندس مدني', count: 2, monthlyCost: 10000, durationMonths: 30 },
        ],
        blueprint: {
            plotLength: 150, plotWidth: 100, setbackFront: 15, setbackSide: 10,
            floors: [
                { id: 'fl_b', name: 'القبو (مواقف)', area: 10000, height: 4.0, slabType: 'flat', columnsCount: 100, zones: [] },
                { id: 'fl_g', name: 'الأرضي', area: 10000, height: 5.0, slabType: 'waffle', columnsCount: 100, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 10000, height: 4.5, slabType: 'flat', columnsCount: 100, zones: [] },
            ]
        }
    },
    restaurant: {
        rooms: [
            { id: 'rs1', type: 'restaurant', name: 'صالة طعام', count: 1, area: 120, sockets: 20, switches: 8, acPoints: 4 },
            { id: 'rs2', type: 'kitchen', name: 'مطبخ تجاري', count: 1, area: 60, sockets: 20, switches: 6, acPoints: 2 },
            { id: 'rs3', type: 'bathroom', name: 'دورات مياه', count: 2, area: 6, sockets: 2, switches: 2, acPoints: 0 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'glass', area: 40 }],
        team: [{ id: 'tm1', role: 'مشرف موقع', count: 1, monthlyCost: 5000, durationMonths: 6 }],
        blueprint: {
            plotLength: 20, plotWidth: 15, setbackFront: 3, setbackSide: 2,
            floors: [{ id: 'fl_g', name: 'الأرضي', area: 200, height: 4.0, slabType: 'solid', columnsCount: 6, zones: [] }]
        }
    },
    car_wash: {
        rooms: [
            { id: 'cw1', type: 'service', name: 'منطقة غسيل', count: 4, area: 30, sockets: 6, switches: 3, acPoints: 0 },
            { id: 'cw2', type: 'reception', name: 'استقبال/كاشير', count: 1, area: 15, sockets: 4, switches: 2, acPoints: 1 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'cladding', area: 80 }],
        team: [{ id: 'tm1', role: 'مشرف', count: 1, monthlyCost: 4000, durationMonths: 4 }],
        blueprint: {
            plotLength: 40, plotWidth: 25, setbackFront: 5, setbackSide: 3,
            floors: [{ id: 'fl_g', name: 'الأرضي', area: 300, height: 5.0, slabType: 'solid', columnsCount: 8, zones: [] }]
        }
    },
    warehouse: {
        rooms: [
            { id: 'wh1', type: 'storage', name: 'منطقة تخزين', count: 1, area: 2000, sockets: 20, switches: 10, acPoints: 0 },
            { id: 'wh2', type: 'office', name: 'مكاتب إدارية', count: 1, area: 100, sockets: 15, switches: 6, acPoints: 2 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'cladding', area: 300 }],
        team: [{ id: 'tm1', role: 'مشرف موقع', count: 1, monthlyCost: 5000, durationMonths: 6 }],
        blueprint: {
            plotLength: 60, plotWidth: 40, setbackFront: 8, setbackSide: 5,
            floors: [{ id: 'fl_g', name: 'الأرضي', area: 2000, height: 8.0, slabType: 'solid', columnsCount: 20, zones: [] }]
        }
    },
    government: {
        rooms: [
            { id: 'gv1', type: 'reception', name: 'صالة استقبال', count: 1, area: 200, sockets: 20, switches: 10, acPoints: 4 },
            { id: 'gv2', type: 'office', name: 'مكاتب', count: 20, area: 25, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'gv3', type: 'bathroom', name: 'دورات مياه', count: 10, area: 6, sockets: 2, switches: 2, acPoints: 0 },
            { id: 'gv4', type: 'prayer', name: 'مصلى', count: 2, area: 25, sockets: 2, switches: 2, acPoints: 1 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'stone', area: 500 }],
        team: [
            { id: 'tm1', role: 'مدير مشروع', count: 1, monthlyCost: 15000, durationMonths: 18 },
            { id: 'tm2', role: 'مهندس موقع', count: 1, monthlyCost: 8000, durationMonths: 18 },
        ],
        blueprint: {
            plotLength: 50, plotWidth: 40, setbackFront: 6, setbackSide: 4,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 1200, height: 4.5, slabType: 'flat', columnsCount: 25, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 1200, height: 3.5, slabType: 'flat', columnsCount: 25, zones: [] },
            ]
        }
    },
    clinic: {
        rooms: [
            { id: 'cl1', type: 'clinic', name: 'عيادات كشف', count: 8, area: 15, sockets: 6, switches: 3, acPoints: 1 },
            { id: 'cl2', type: 'reception', name: 'استقبال وانتظار', count: 1, area: 60, sockets: 10, switches: 5, acPoints: 2 },
            { id: 'cl3', type: 'lab', name: 'مختبر', count: 1, area: 25, sockets: 10, switches: 4, acPoints: 1 },
            { id: 'cl4', type: 'bathroom', name: 'دورات مياه', count: 4, area: 5, sockets: 2, switches: 2, acPoints: 0 },
        ],
        facades: [{ id: 'f1', direction: 'north', material: 'glass', area: 100 }],
        team: [{ id: 'tm1', role: 'مشرف موقع', count: 1, monthlyCost: 6000, durationMonths: 10 }],
        blueprint: {
            plotLength: 25, plotWidth: 20, setbackFront: 4, setbackSide: 2,
            floors: [
                { id: 'fl_g', name: 'الأرضي', area: 300, height: 3.5, slabType: 'flat', columnsCount: 10, zones: [] },
                { id: 'fl_1', name: 'الأول', area: 300, height: 3.5, slabType: 'flat', columnsCount: 10, zones: [] },
                { id: 'fl_1', name: '\u0627\u0644\u0623\u0648\u0644', area: 300, height: 3.5, slabType: 'flat', columnsCount: 10, zones: [] },
                { id: 'fl_1', name: '\u0627\u0644\u0623\u0648\u0644', area: 300, height: 3.5, slabType: 'flat', columnsCount: 10, zones: [] },
            ]
        }
    }
};

// ... Common Suppliers Data Generators ...
const suppliersConcrete: SupplierOption[] = [
    { id: 'conc_1', name: { ar: '\u062e\u0631\u0633\u0627\u0646\u0629 \u0627\u0644\u0643\u0641\u0627\u062d', en: 'Al-Kifah Concrete', fr: 'B\u00e9ton Al-Kifah', zh: 'Al-Kifah \u6df7\u51dd\u571f' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Local' },
    { id: 'conc_2', name: { ar: '\u062e\u0631\u0633\u0627\u0646\u0629 \u0627\u0644\u0628\u0631\u0627\u0643', en: 'Al-Barrak Concrete', fr: 'B\u00e9ton Al-Barrak', zh: 'Al-Barrak \u6df7\u51dd\u571f' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'conc_3', name: { ar: '\u0645\u0635\u0627\u0646\u0639 \u0645\u062d\u0644\u064a\u0629', en: 'Local Factories', fr: 'Usines Locales', zh: '\u5f53\u5730\u5de5\u5382' }, tier: 'budget', priceMultiplier: 0.92, origin: 'Local' },
    { id: 'conc_4', name: { ar: '\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0644\u0644\u062e\u0631\u0633\u0627\u0646\u0629', en: 'Saudi Readymix', fr: 'Saudi Readymix', zh: '\u6c99\u7279\u9884\u62cc\u6df7\u51dd\u571f' }, tier: 'premium', priceMultiplier: 1.2, origin: 'Local' },
    { id: 'conc_5', name: { ar: '\u0627\u0644\u062e\u0631\u0633\u0627\u0646\u0629 \u0627\u0644\u062c\u0627\u0647\u0632\u0629', en: 'Ready Mix Co.', fr: 'Ready Mix Co.', zh: '\u9884\u62cc\u6df7\u51dd\u571f\u516c\u53f8' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Local' }
];

const suppliersSteel: SupplierOption[] = [
    { id: 'steel_1', name: { ar: '\u062d\u062f\u064a\u062f \u0633\u0627\u0628\u0643', en: 'Sabic Steel', fr: 'Acier Sabic', zh: 'Sabic \u94a2\u94c1' }, tier: 'premium', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'steel_2', name: { ar: '\u062d\u062f\u064a\u062f \u0627\u0644\u0631\u0627\u062c\u062d\u064a', en: 'Rajhi Steel', fr: 'Acier Rajhi', zh: 'Rajhi \u94a2\u94c1' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'steel_3', name: { ar: '\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0631\u062f', en: 'Imported Steel', fr: 'Acier Import\u00e9', zh: '\u8fdb\u53e3\u94a2\u94c1' }, tier: 'budget', priceMultiplier: 0.95, origin: 'China/UAE' },
    { id: 'steel_4', name: { ar: '\u062d\u062f\u064a\u062f \u0627\u0644\u064a\u0645\u0627\u0645\u0629', en: 'Yamamah Steel', fr: 'Acier Yamamah', zh: 'Yamamah \u94a2\u94c1' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'steel_5', name: { ar: '\u062d\u062f\u064a\u062f \u0627\u0644\u0627\u062a\u0641\u0627\u0642', en: 'Al-Ittefaq Steel', fr: 'Acier Al-Ittefaq', zh: 'Al-Ittefaq \u94a2\u94c1' }, tier: 'standard', priceMultiplier: 1.02, origin: 'Saudi' }
];

const suppliersFinish: SupplierOption[] = [
    { id: 'fin_1', name: { ar: '\u0627\u0644\u0646\u062e\u0628\u0629 \u0644\u0644\u062a\u0634\u0637\u064a\u0628\u0627\u062a', en: 'Elite Finishes', fr: 'Finitions Elite', zh: '\u7cbe\u82f1\u88c5\u4fee' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Spain/Italy' },
    { id: 'fin_2', name: { ar: '\u0627\u0644\u062e\u0632\u0641 \u0627\u0644\u0633\u0639\u0648\u062f\u064a', en: 'Saudi Ceramics', fr: 'C\u00e9ramique Saoudienne', zh: '\u6c99\u7279\u9676\u74f7' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'fin_3', name: { ar: '\u0645\u0646\u062a\u062c\u0627\u062a \u062a\u062c\u0627\u0631\u064a\u0629', en: 'Commercial Products', fr: 'Produits Commerciaux', zh: '\u5546\u4e1a\u4ea7\u54c1' }, tier: 'budget', priceMultiplier: 0.7, origin: 'China/India' },
    { id: 'fin_4', name: { ar: '\u0633\u064a\u0631\u0627\u0645\u064a\u0643 RAK', en: 'RAK Ceramics', fr: 'C\u00e9ramique RAK', zh: 'RAK \u9676\u74f7' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UAE' },
    { id: 'fin_5', name: { ar: 'Villeroy & Boch', en: 'Villeroy & Boch', fr: 'Villeroy & Boch', zh: '\u552f\u5b9d' }, tier: 'premium', priceMultiplier: 1.8, origin: 'Germany' },
    { id: 'fin_6', name: { ar: '\u0631\u062e\u0627\u0645 \u0645\u062d\u0644\u064a', en: 'Local Marble (Najran)', fr: 'Marbre Local', zh: '\u5927\u7406\u77f3' }, tier: 'budget', priceMultiplier: 0.8, origin: 'Local' }
];

const suppliersPlumb: SupplierOption[] = [
    { id: 'plumb_1', name: { ar: '\u0627\u0644\u0623\u0646\u0627\u0628\u064a\u0628 \u0627\u0644\u062e\u0636\u0631\u0627\u0621', en: 'Green Pipe', fr: 'Tuyau Vert', zh: '\u7eff\u8272\u7ba1\u9053' }, tier: 'premium', priceMultiplier: 1.2, origin: 'Germany/Local' },
    { id: 'plumb_2', name: { ar: '\u0646\u064a\u0628\u0631\u0648', en: 'Nipro', fr: 'Nipro', zh: 'Nipro' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'plumb_3', name: { ar: '\u062a\u062c\u0627\u0631\u064a', en: 'Commercial', fr: 'Commercial', zh: '\u5546\u4e1a' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China' },
    { id: 'plumb_4', name: { ar: '\u0623\u0628\u0644\u0643\u0648', en: 'Aplaco', fr: 'Aplaco', zh: 'Aplaco' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Local' },
    { id: 'plumb_5', name: { ar: '\u0627\u0644\u0645\u0646\u0649', en: 'Al-Muna', fr: 'Al-Muna', zh: 'Al-Muna' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Local' }
];

// ===== v8.2 Fire Safety Suppliers =====
const suppliersFireSafety: SupplierOption[] = [
    { id: 'fire_naffco', name: { ar: 'NAFFCO', en: 'NAFFCO', fr: 'NAFFCO', zh: 'NAFFCO' }, tier: 'premium', priceMultiplier: 1.20, origin: 'UAE' },
    { id: 'fire_kidde', name: { ar: 'Kidde', en: 'Kidde', fr: 'Kidde', zh: 'Kidde' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'fire_viking', name: { ar: 'Viking', en: 'Viking', fr: 'Viking', zh: 'Viking' }, tier: 'standard', priceMultiplier: 1.10, origin: 'USA' },
    { id: 'fire_bosch', name: { ar: 'Bosch', en: 'Bosch', fr: 'Bosch', zh: 'Bosch' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Germany' },
    { id: 'fire_local', name: { ar: 'Local', en: 'Local Contractors', fr: 'Local', zh: 'Local' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Local' },
];

// ===== v8.2 Elevator Suppliers =====
const suppliersElevators: SupplierOption[] = [
    { id: 'elev_otis', name: { ar: 'Otis', en: 'Otis', fr: 'Otis', zh: 'Otis' }, tier: 'premium', priceMultiplier: 1.40, origin: 'USA' },
    { id: 'elev_thyssen', name: { ar: 'ThyssenKrupp', en: 'ThyssenKrupp', fr: 'ThyssenKrupp', zh: 'ThyssenKrupp' }, tier: 'premium', priceMultiplier: 1.20, origin: 'Germany' },
    { id: 'elev_kone', name: { ar: 'KONE', en: 'KONE', fr: 'KONE', zh: 'KONE' }, tier: 'standard', priceMultiplier: 1.10, origin: 'Finland' },
    { id: 'elev_mitsubishi', name: { ar: 'Mitsubishi', en: 'Mitsubishi', fr: 'Mitsubishi', zh: 'Mitsubishi' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Japan' },
    { id: 'elev_sigma', name: { ar: 'Sigma', en: 'Sigma', fr: 'Sigma', zh: 'Sigma' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China/Local' },
];

// ===== v8.2 Central HVAC Suppliers =====
const suppliersCentralHVAC: SupplierOption[] = [
    { id: 'hvac_trane', name: { ar: 'Trane', en: 'Trane', fr: 'Trane', zh: 'Trane' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'hvac_carrier', name: { ar: 'Carrier', en: 'Carrier', fr: 'Carrier', zh: 'Carrier' }, tier: 'premium', priceMultiplier: 1.20, origin: 'USA' },
    { id: 'hvac_york', name: { ar: 'York', en: 'York', fr: 'York', zh: 'York' }, tier: 'standard', priceMultiplier: 1.0, origin: 'USA' },
    { id: 'hvac_daikin', name: { ar: 'Daikin', en: 'Daikin', fr: 'Daikin', zh: 'Daikin' }, tier: 'standard', priceMultiplier: 1.10, origin: 'Japan' },
    { id: 'hvac_midea', name: { ar: 'Midea', en: 'Midea', fr: 'Midea', zh: 'Midea' }, tier: 'budget', priceMultiplier: 0.80, origin: 'China' },
];

const suppliersElec: SupplierOption[] = [
    { id: 'elec_1', name: { ar: 'ألفنار', en: 'Al-Fanar', fr: 'Al-Fanar', zh: 'Al-Fanar' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'elec_2', name: { ar: 'الرياض للكابلات', en: 'Riyadh Cables', fr: 'Câbles de Riyad', zh: '利雅得电缆' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'elec_3', name: { ar: 'مستورد', en: 'Imported', fr: 'Importé', zh: '进口' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Various' },
    { id: 'elec_4', name: { ar: 'كابلات بحرة', en: 'Bahra Cables', fr: 'Câbles Bahra', zh: 'Bahra 电缆' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'elec_5', name: { ar: 'شنايدر إليكتريك', en: 'Schneider Electric', fr: 'Schneider Electric', zh: '施耐德电气' }, tier: 'premium', priceMultiplier: 1.3, origin: 'France' }
];

const suppliersSwitches: SupplierOption[] = [
    { id: 'sw_1', name: { ar: 'باناسونيك', en: 'Panasonic', fr: 'Panasonic', zh: '松下' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Japan/Thai' },
    { id: 'sw_2', name: { ar: 'ألفنار', en: 'Al-Fanar', fr: 'Al-Fanar', zh: 'Al-Fanar' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'sw_3', name: { ar: 'صيني درجة أولى', en: 'Chinese Grade A', fr: 'Chinois Classe A', zh: '中国A级' }, tier: 'budget', priceMultiplier: 0.75, origin: 'China' },
    { id: 'sw_4', name: { ar: 'ليجراند', en: 'Legrand', fr: 'Legrand', zh: '罗格朗' }, tier: 'premium', priceMultiplier: 1.4, origin: 'France' },
    { id: 'sw_5', name: { ar: 'إم كيه', en: 'MK Electric', fr: 'MK Electric', zh: 'MK 电气' }, tier: 'premium', priceMultiplier: 1.35, origin: 'UK' },
    { id: 'sw_6', name: { ar: 'بيركر', en: 'Berker', fr: 'Berker', zh: 'Berker' }, tier: 'premium', priceMultiplier: 1.5, origin: 'Germany' }
];

const suppliersManpower: SupplierOption[] = [
    { id: 'hr_1', name: { ar: 'كادر الشركة', en: 'In-House Staff', fr: 'Personnel Interne', zh: '内部员工' }, tier: 'premium', priceMultiplier: 1.0, origin: 'Internal' },
    { id: 'hr_2', name: { ar: 'تعاقد خارجي', en: 'Outsourced', fr: 'Externalisé', zh: '外包' }, tier: 'standard', priceMultiplier: 1.2, origin: 'External' },
    { id: 'hr_3', name: { ar: 'مكتب استقدام', en: 'Recruitment Agency', fr: 'Agence de Recrutement', zh: '招聘代理' }, tier: 'standard', priceMultiplier: 1.1, origin: 'External' },
    { id: 'hr_4', name: { ar: 'عمالة موسمية', en: 'Seasonal Labor', fr: 'Travail Saisonnier', zh: '季节性劳工' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Mixed' }
];

const suppliersFacades: SupplierOption[] = [
    { id: 'fac_1', name: { ar: 'مؤسسة حجر الرياض', en: 'Riyadh Stone Est.', fr: 'Pierre de Riyad Est.', zh: '利雅得石材公司' }, tier: 'premium', priceMultiplier: 1.3, origin: 'Local' },
    { id: 'fac_2', name: { ar: 'تكسيات الخليج', en: 'Gulf Cladding', fr: 'Revêtement du Golfe', zh: '海湾覆层' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'fac_3', name: { ar: 'عمالة تركيب مباشر', en: 'Direct Labor', fr: 'Main-d\'œuvre Directe', zh: '直接人工' }, tier: 'budget', priceMultiplier: 0.8, origin: 'Mixed' },
    { id: 'fac_4', name: { ar: 'تكنال للألمنيوم', en: 'Technal', fr: 'Technal', zh: 'Technal' }, tier: 'premium', priceMultiplier: 1.6, origin: 'France' },
    { id: 'fac_5', name: { ar: 'دهانات سيجما', en: 'Sigma Paints', fr: 'Peintures Sigma', zh: 'Sigma 油漆' }, tier: 'standard', priceMultiplier: 1.1, origin: 'Local' },
    { id: 'fac_6', name: { ar: 'مصنع الزجاج المعماري', en: 'Arch Glass Factory', fr: 'Usine de Verre Arch', zh: '建筑玻璃厂' }, tier: 'standard', priceMultiplier: 1.2, origin: 'Local' }
];

export const ITEMS_DATABASE: BaseItem[] = [
    // ================= 00. معلومات وتكاليف إدارية =================
    { id: "00.01", category: "gov_fees", type: "all", name: { ar: "إصدار رخصة بناء (رسوم بلدية)", en: "Building Permit", fr: "Permis de Construire", zh: "建筑许可证" }, unit: "م2", qty: 450, baseMaterial: 4, baseLabor: 0, waste: 0, suppliers: [{ id: 'balady', name: { ar: 'بلدي', en: 'Balady', fr: 'Balady', zh: 'Balady' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC-Admin", soilFactor: false, dependency: 'build_area', excludeProfit: true },
    { id: "00.02", category: "gov_fees", type: "all", name: { ar: "تأمين ملاذ (عيوب خفية)", en: "Latent Defects Insurance", fr: "Assurance Vices Cachés", zh: "潜在缺陷保险" }, unit: "بوليصة", qty: 1, baseMaterial: 12000, baseLabor: 0, waste: 0, suppliers: [{ id: 'malath', name: { ar: 'ملاذ', en: 'Malath', fr: 'Malath', zh: 'Malath' }, tier: 'standard', priceMultiplier: 1 }], sbc: "LIDI-Reg", soilFactor: false, dependency: 'build_area', excludeProfit: true },
    { id: "00.03", category: "gov_fees", type: "all", name: { ar: "إشراف هندسي معتمد", en: "Engineering Supervision", fr: "Supervision", zh: "工程监理" }, unit: "زيارة", qty: 12, baseMaterial: 0, baseLabor: 400, waste: 0, suppliers: [{ id: 'eng_off', name: { ar: 'مكتب هندسي', en: 'Eng Office', fr: 'Bureau d\'Ing', zh: '工程办公室' }, tier: 'standard', priceMultiplier: 1 }], sbc: "Eng-Sup", soilFactor: false, dependency: 'fixed', excludeProfit: true },

    // ================= 01. أعمال الحفر (Excavation) =================
    { id: "01.01", category: "site", type: "all", name: { ar: "تنظيف الموقع وقشط السطح", en: "Site Clearance & Topsoil Stripping", fr: "Nettoyage du Site", zh: "场地清理" }, unit: "م2", qty: 600, baseMaterial: 0, baseLabor: 5, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-1", soilFactor: false, dependency: 'land_area', defaultParams: { topsoilStrippingDepth: 0.2 } },
    { id: "01.02", category: "site", type: "all", name: { ar: "حفر ميكانيكي (تربة عادية)", en: "Mechanical Excavation (Normal Soil)", fr: "Excavation Mécanique", zh: "机械挖掘" }, unit: "م3", qty: 600, baseMaterial: 0, baseLabor: 15, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }, { id: 'exc_2', name: { ar: 'مقاولين حفر', en: 'Excavation Cont.', fr: 'Entrepreneurs Exc.', zh: '挖掘承包商' }, tier: 'budget', priceMultiplier: 0.85 }], sbc: "SBC 303-2", soilFactor: true, dependency: 'land_area', defaultParams: { excavationDepth: 2.5 } },
    { id: "01.03", category: "site", type: "all", name: { ar: "حفر صخري (نقار/تفجير)", en: "Rock Excavation", fr: "Excavation Rocheuse", zh: "岩石挖掘" }, unit: "م3", qty: 0, baseMaterial: 0, baseLabor: 45, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-3", soilFactor: true, dependency: 'land_area', defaultParams: { excavationDepth: 2.5 } },
    { id: "01.04", category: "site", type: "all", name: { ar: "سند جوانب الحفر (Shoring)", en: "Excavation Shoring", fr: "Étayage d\'Excavation", zh: "挖掘支撑" }, unit: "م2", qty: 0, baseMaterial: 150, baseLabor: 80, waste: 0, suppliers: [{ id: 'shore_1', name: { ar: 'مقاول سند', en: 'Shoring Cont.', fr: 'Étayage Cont.', zh: '支撑承包商' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-4", soilFactor: false, dependency: 'land_area', defaultParams: { shoringType: 'none', shoringDepth: 2.5 } },
    { id: "01.05", category: "site", type: "all", name: { ar: "نزح المياه الجوفية (Dewatering)", en: "Dewatering", fr: "Épuisement des Eaux", zh: "排水" }, unit: "مقطوعية", qty: 0, baseMaterial: 5000, baseLabor: 3000, waste: 0, suppliers: [{ id: 'pump_1', name: { ar: 'نظام ضخ', en: 'Pumping Sys.', fr: 'Syst. Pompage', zh: '泵送系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-5", soilFactor: false, dependency: 'fixed', defaultParams: { dewateringType: 'none', waterTableDepth: 1.5 } },
    { id: "01.06", category: "site", type: "all", name: { ar: "ترحيل ناتج الحفر (للمقالب)", en: "Debris Removal", fr: "Évacuation des Débris", zh: "渣土清运" }, unit: "م3", qty: 600, baseMaterial: 0, baseLabor: 12, waste: 0, suppliers: [{ id: 'trans_1', name: { ar: 'نقليات', en: 'Transport Co.', fr: 'Transport', zh: '运输公司' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 302-Rem", soilFactor: false, dependency: 'land_area' },

    // ================= 02. أعمال الردم والإحلال (Backfill & Compaction) =================
    { id: "02.01", category: "site", type: "all", name: { ar: "إحلال تربة (ردم هندسي)", en: "Soil Replacement (Backfill)", fr: "Remplacement du Sol", zh: "回填" }, unit: "م3", qty: 450, baseMaterial: 22, baseLabor: 10, waste: 0.10, suppliers: [{ id: 'soil_1', name: { ar: 'نقليات الرمال', en: 'Sand Trans', fr: 'Trans Sable', zh: '沙运' }, tier: 'standard', priceMultiplier: 1 }, { id: 'soil_2', name: { ar: 'رمال الخرج', en: 'Al-Kharj Sand', fr: 'Sable Al-Kharj', zh: 'Al-Kharj沙' }, tier: 'premium', priceMultiplier: 1.15 }], sbc: "SBC 303-Fill", soilFactor: false, dependency: 'land_area', defaultParams: { backfillDensity: 1800, subsidenceRatio: 0.10 } },
    { id: "02.02", category: "site", type: "all", name: { ar: "ردم بتربة الموقع", en: "Backfill (Site Soil)", fr: "Remblai (Sol du Site)", zh: "场地土回填" }, unit: "م3", qty: 0, baseMaterial: 0, baseLabor: 8, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-SiteFill", soilFactor: false, dependency: 'land_area' },
    { id: "02.03", category: "site", type: "all", name: { ar: "ردم مستورد (صبّيز)", en: "Imported Fill", fr: "Remblai d\'Apport", zh: "进口回填土" }, unit: "م3", qty: 0, baseMaterial: 25, baseLabor: 12, waste: 0.05, suppliers: [{ id: 'soil_1', name: { ar: 'نقليات الرمال', en: 'Sand Trans', fr: 'Trans Sable', zh: '沙运' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-ImpFill", soilFactor: false, dependency: 'land_area' },
    { id: "02.04", category: "site", type: "all", name: { ar: "دمك التربة (على طبقات)", en: "Soil Compaction (Layers)", fr: "Compactage du Sol", zh: "土壤压实" }, unit: "م2", qty: 300, baseMaterial: 0, baseLabor: 8, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Cmp", soilFactor: true, dependency: 'land_area', defaultParams: { compactionLayers: 3 } },
    { id: "02.05", category: "site", type: "all", name: { ar: "رش مبيد حشري (نمل أبيض)", en: "Anti-Termite Treatment", fr: "Traitement Anti-Termites", zh: "防白蚁处理" }, unit: "م2", qty: 300, baseMaterial: 8, baseLabor: 3, waste: 0, suppliers: [{ id: 'pest_1', name: { ar: 'مكافحة الحشرات', en: 'Pest Control', fr: 'Lutte Antiparasitaire', zh: '害虫防治' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Pest", soilFactor: false, dependency: 'land_area' },
    { id: "02.06", category: "site", type: "all", name: { ar: "فرش نايلون (بولي إيثيلين)", en: "Polyethylene Sheets", fr: "Feuilles Polyéthylène", zh: "聚乙烯板" }, unit: "م2", qty: 300, baseMaterial: 4, baseLabor: 2, waste: 0.1, suppliers: [{ id: 'poly_1', name: { ar: 'مواد بناء', en: 'Building Mat', fr: 'Mat Construction', zh: '建筑材料' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Poly", soilFactor: false, dependency: 'land_area' },

    // ================= 03. أعمال التأسيس (Foundation) =================
    { id: "03.01", category: "structure", type: "all", name: { ar: "خرسانة نظافة C20", en: "Plain Concrete C20", fr: "Béton C20", zh: "素混凝土 C20" }, unit: "م3", qty: 35, baseMaterial: 200, baseLabor: 90, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304", soilFactor: false, dependency: 'land_area', defaultParams: { thickness: 10 } },
    { id: "03.02", category: "structure", type: "all", name: { ar: "خرسانة قواعد C35", en: "Reinforced Concrete Footings C35", fr: "Béton Armé Semelles C35", zh: "钢筋混凝土地基 C35" }, unit: "م3", qty: 90, baseMaterial: 260, baseLabor: 120, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-4", soilFactor: false, dependency: 'build_area', defaultParams: { cementContent: 7 } },
    { id: "03.03", category: "structure", type: "all", name: { ar: "خرسانة ميد أرضية C35", en: "Reinforced Concrete Tie Beams C35", fr: "Longrines Béton Armé C35", zh: "钢筋混凝土系梁 C35" }, unit: "م3", qty: 30, baseMaterial: 260, baseLabor: 120, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-TB", soilFactor: false, dependency: 'build_area' },
    { id: "03.04", category: "structure", type: "all", name: { ar: "خرسانة رقاب أعمدة C40", en: "Neck Columns Concrete C40", fr: "Béton Fûts C40", zh: "颈柱混凝土 C40" }, unit: "م3", qty: 15, baseMaterial: 280, baseLabor: 150, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-NC", soilFactor: false, dependency: 'build_area' },
    { id: "03.05", category: "structure", type: "all", name: { ar: "حديد تسليح أساسات (G60)", en: "Foundation Reinforcement Steel", fr: "Acier d\'Armature Fondations", zh: "地基钢筋" }, unit: "طن", qty: 15, baseMaterial: 2750, baseLabor: 450, waste: 0.03, suppliers: suppliersSteel, sbc: "SBC 304-5", soilFactor: false, dependency: 'build_area' },
    { id: "03.06", category: "structure", type: "all", name: { ar: "شدات خشبية للأساسات", en: "Foundation Formwork", fr: "Coffrage Fondations", zh: "地基模板" }, unit: "م2", qty: 250, baseMaterial: 35, baseLabor: 45, waste: 0.15, suppliers: [{ id: 'form_1', name: { ar: 'شدات خشبية', en: 'Timber Forms', fr: 'Coffrages Bois', zh: '木质模板' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Frm", soilFactor: false, dependency: 'build_area' },

    // ================= 04. تأسيس البدروم والدور الأرضي (Basement & Ground Floor) =================
    { id: "04.01", category: "structure", type: "all", name: { ar: "أعمدة البدروم/الأرضي C40", en: "Basement/Ground Columns C40", fr: "Colonnes Sous-sol/RDC C40", zh: "地下室/一楼柱 C40" }, unit: "م3", qty: 25, baseMaterial: 280, baseLabor: 150, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-Col", soilFactor: false, dependency: 'build_area' },
    { id: "04.02", category: "structure", type: "all", name: { ar: "الجدران الاستنادية (بدروم)", en: "Retaining Walls", fr: "Murs de Soutènement", zh: "挡土墙" }, unit: "م3", qty: 20, baseMaterial: 280, baseLabor: 150, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Ret", soilFactor: true, dependency: 'land_area' },
    { id: "04.03", category: "structure", type: "all", name: { ar: "خرسانة سقف الدور الأرضي", en: "Ground Floor Slab Concrete", fr: "Béton Dalle RDC", zh: "一楼楼板混凝土" }, unit: "م3", qty: 45, baseMaterial: 270, baseLabor: 130, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-Slb1", soilFactor: false, dependency: 'build_area' },
    { id: "04.04", category: "structure", type: "all", name: { ar: "سلالم خرسانية", en: "Concrete Stairs", fr: "Escaliers Béton", zh: "混凝土楼梯" }, unit: "م3", qty: 8, baseMaterial: 290, baseLabor: 180, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Strs", soilFactor: false, dependency: 'fixed' },

    // ================= 05. الهيكل الإنشائي (Superstructure - أدوار متكررة) =================
    { id: "05.01", category: "structure", type: "all", name: { ar: "أعمدة وجدران قص (متكررة)", en: "Upper Columns/Walls Concrete C40", fr: "Béton Colonnes Sup C40", zh: "上层柱墙混凝土 C40" }, unit: "م3", qty: 40, baseMaterial: 280, baseLabor: 150, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-ColUp", soilFactor: false, dependency: 'build_area' },
    { id: "05.02", category: "structure", type: "all", name: { ar: "خرسانة أسقف متكررة", en: "Upper Slabs Concrete", fr: "Béton Dalles Sup", zh: "上层楼板混凝土" }, unit: "م3", qty: 45, baseMaterial: 270, baseLabor: 130, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-SlbUp", soilFactor: false, dependency: 'build_area' },
    { id: "05.03", category: "structure", type: "all", name: { ar: "حديد تسليح الهيكل العلوي", en: "Superstructure Reinforcement Steel", fr: "Acier d\'Armature Sup", zh: "上部结构钢筋" }, unit: "طن", qty: 30, baseMaterial: 2750, baseLabor: 450, waste: 0.03, suppliers: suppliersSteel, sbc: "SBC 304-5UP", soilFactor: false, dependency: 'build_area' },
    { id: "05.04", category: "structure", type: "all", name: { ar: "بلك خارجي معزول (20سم)", en: "Ext. Insulated Blocks (20cm)", fr: "Blocs Isolés Ext.", zh: "外墙绝缘砌块" }, unit: "م2", qty: 400, baseMaterial: 55, baseLabor: 25, waste: 0.05, suppliers: [{ id: 'block_s', name: { ar: 'السعودية للطوب', en: 'Saudi Bricks', fr: 'Briques Saoudiennes', zh: '沙特砖' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Blk", soilFactor: false, dependency: 'build_area' },
    { id: "05.05", category: "structure", type: "all", name: { ar: "بلك داخلي اسمنتي (15سم)", en: "Int. Cement Blocks (15cm)", fr: "Blocs Ciment Int.", zh: "内墙水泥砌块" }, unit: "م2", qty: 600, baseMaterial: 35, baseLabor: 22, waste: 0.05, suppliers: [{ id: 'block_c', name: { ar: 'مصانع محلية', en: 'Local Block', fr: 'Bloc Local', zh: '当地砌块' }, tier: 'budget', priceMultiplier: 0.9 }], sbc: "SBC 304-Blk-In", soilFactor: false, dependency: 'build_area' },
    { id: "05.06", category: "structure", type: "all", name: { ar: "بلاطة هوردي (بلك)", en: "Hordi Blocks", fr: "Blocs Hordi", zh: "空心砖" }, unit: "م2", qty: 280, baseMaterial: 25, baseLabor: 15, waste: 0.08, suppliers: [{ id: 'block_h', name: { ar: 'بلك هوردي', en: 'Hordi Block', fr: 'Bloc Hordi', zh: '空心砖' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Hrd", soilFactor: false, dependency: 'build_area' },
    { id: "05.07", category: "structure", type: "all", name: { ar: "أعتاب خرسانية", en: "Concrete Lintels", fr: "Linteaux Béton", zh: "混凝土过梁" }, unit: "م.ط", qty: 100, baseMaterial: 25, baseLabor: 15, waste: 0.02, suppliers: suppliersConcrete, sbc: "SBC 304-Lin", soilFactor: false, dependency: 'build_area' },

    // ================= 06. أعمال العزل (Insulation) =================
    { id: "06.01", category: "insulation", type: "all", name: { ar: "عزل قواعد وميدات (بيتومين)", en: "Foundation Waterproofing", fr: "Étanchéité Fondations", zh: "地基防水" }, unit: "م2", qty: 400, baseMaterial: 18, baseLabor: 12, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101", soilFactor: false, dependency: 'land_area' },
    { id: "06.02", category: "insulation", type: "all", name: { ar: "خرسانة ميول الأسطح (Screed)", en: "Roof Screed", fr: "Chape Toit", zh: "屋顶找平层" }, unit: "م2", qty: 300, baseMaterial: 25, baseLabor: 15, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 1103", soilFactor: false, dependency: 'build_area' },
    { id: "06.03", category: "insulation", type: "all", name: { ar: "عزل مائي وحراري للأسطح (فوم)", en: "Roof Thermal/Water Insulation", fr: "Isolation Thermique/Eau Toit", zh: "屋顶防水隔热" }, unit: "م2", qty: 300, baseMaterial: 45, baseLabor: 20, waste: 0.05, suppliers: [{ id: 'ins_foam', name: { ar: 'عزل حراري', en: 'Thermal Ins', fr: 'Isol Thermique', zh: '隔热' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1102", soilFactor: false, dependency: 'build_area' },
    { id: "06.04", category: "insulation", type: "all", name: { ar: "عزل مائي للحمامات والمطابخ", en: "Wet Areas Waterproofing", fr: "Étanchéité Salles d\'Eau", zh: "湿区防水" }, unit: "م2", qty: 40, baseMaterial: 35, baseLabor: 25, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101-WC", soilFactor: false, dependency: 'rooms_area' },
    { id: "06.05", category: "insulation", type: "all", name: { ar: "عزل خزانات مياه أرضية", en: "Underground Tank Waterproofing", fr: "Étanchéité Réservoirs Souterrains", zh: "地下水箱防水" }, unit: "م2", qty: 30, baseMaterial: 45, baseLabor: 35, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101-Tnk", soilFactor: false, dependency: 'fixed' },

    // ================= 07. أعمال اللياسة (Plastering) =================
    { id: "07.01", category: "architecture", type: "all", name: { ar: "لياسة داخلية (أسمنتية)", en: "Internal Plaster", fr: "Enduit Intérieur", zh: "内墙抹灰" }, unit: "م2", qty: 2500, baseMaterial: 14, baseLabor: 20, waste: 0.08, suppliers: [{ id: 'plast', name: { ar: 'اسمنت اليمامة', en: 'Yamama Cement', fr: 'Ciment Yamama', zh: 'Yamama 水泥' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Pl", soilFactor: false, dependency: 'rooms_area' },
    { id: "07.02", category: "architecture", type: "all", name: { ar: "لياسة خارجية (واجهات وأسوار)", en: "External Plaster", fr: "Enduit Extérieur", zh: "外墙抹灰" }, unit: "م2", qty: 400, baseMaterial: 18, baseLabor: 25, waste: 0.1, suppliers: [{ id: 'plast', name: { ar: 'اسمنت اليمامة', en: 'Yamama Cement', fr: 'Ciment Yamama', zh: 'Yamama 水泥' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-PlEx", soilFactor: false, dependency: 'build_area' },

    // ================= 08. أعمال السباكة (Plumbing) =================
    { id: "08.01", category: "mep_plumb", type: "all", name: { ar: "تأسيس تغذية مياه (PPR)", en: "Water Supply Pipes", fr: "Tuyaux Eau", zh: "供水管" }, unit: "نقطة", qty: 40, baseMaterial: 150, baseLabor: 100, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Sup", soilFactor: false, dependency: 'rooms_area' },
    { id: "08.02", category: "mep_plumb", type: "all", name: { ar: "تأسيس صرف صحي (مواسير ضغط)", en: "Drainage Pipes", fr: "Tuyaux Drainage", zh: "排水管" }, unit: "نقطة", qty: 40, baseMaterial: 120, baseLabor: 100, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Drn", soilFactor: false, dependency: 'rooms_area' },
    { id: "08.03", category: "mep_plumb", type: "all", name: { ar: "خزان مياه علوي (فيبرجلاس)", en: "Roof Water Tank", fr: "Réservoir Toit", zh: "屋顶水箱" }, unit: "عدد", qty: 1, baseMaterial: 2000, baseLabor: 500, waste: 0, suppliers: [{ id: 'tank', name: { ar: 'المهيدب', en: 'Al-Muhaidib', fr: 'Al-Muhaidib', zh: 'Al-Muhaidib' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 701-Tnk", soilFactor: false, dependency: 'fixed' },
    { id: "08.04", category: "mep_plumb", type: "all", name: { ar: "مضخة مياه رفع رئيسية", en: "Submersible/Lift Pump", fr: "Pompe Relevage", zh: "提升泵" }, unit: "عدد", qty: 1, baseMaterial: 1200, baseLabor: 200, waste: 0, suppliers: suppliersPlumb, sbc: "SBC 701-Pmp", soilFactor: false, dependency: 'fixed' },
    { id: "08.05", category: "mep_plumb", type: "all", name: { ar: "مضخة ضغط علوية", en: "Booster Pump", fr: "Surpresseur", zh: "增压泵" }, unit: "عدد", qty: 1, baseMaterial: 1500, baseLabor: 250, waste: 0, suppliers: suppliersPlumb, sbc: "SBC 701-Bst", soilFactor: false, dependency: 'fixed' },
    { id: "08.06", category: "mep_plumb", type: "all", name: { ar: "سخانات مياه (تركيب)", en: "Water Heaters", fr: "Chauffe-eau", zh: "热水器" }, unit: "عدد", qty: 5, baseMaterial: 450, baseLabor: 100, waste: 0, suppliers: [{ id: 'heat', name: { ar: 'الخزف', en: 'Ceramics Co', fr: 'Ceramics Co', zh: '陶瓷公司' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 701-Htr", soilFactor: false, dependency: 'fixed' },
    { id: "08.07", category: "mep_plumb", type: "all", name: { ar: "تركيب أطقم صحيات وخلاطات", en: "Sanitary Ware Sets", fr: "Ensembles Sanitaires", zh: "卫浴套装" }, unit: "طقم", qty: 5, baseMaterial: 1500, baseLabor: 300, waste: 0, suppliers: suppliersFinish, sbc: "SBC 701-Set", soilFactor: false, dependency: 'fixed' },
    { id: "08.08", category: "mep_plumb", type: "all", name: { ar: "غرف تفتيش خارجية (Manholes)", en: "Manholes", fr: "Regards", zh: "人孔" }, unit: "عدد", qty: 6, baseMaterial: 400, baseLabor: 200, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 701-Man", soilFactor: false, dependency: 'fixed' },

    // ================= 09. أعمال الكهرباء (Electrical) =================
    { id: "09.01", category: "mep_elec", type: "all", name: { ar: "نظام تأريض (Grounding)", en: "Grounding System", fr: "Mise à la Terre", zh: "接地系统" }, unit: "مجموعة", qty: 1, baseMaterial: 2500, baseLabor: 1000, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Grd", soilFactor: false, dependency: 'fixed' },
    { id: "09.02", category: "mep_elec", type: "all", name: { ar: "لوحات توزيع طبالين (MDB/DB)", en: "Dist. Boards (MDB/DB)", fr: "Tableaux Distribution", zh: "配电板" }, unit: "مجموعة", qty: 1, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-DB", soilFactor: false, dependency: 'fixed' },
    { id: "09.03", category: "mep_elec", type: "all", name: { ar: "كابلات رئيسية", en: "Main Cables", fr: "Câbles Principaux", zh: "主电缆" }, unit: "م.ط", qty: 50, baseMaterial: 150, baseLabor: 50, waste: 0.05, suppliers: suppliersElec, sbc: "SBC 401-Cab", soilFactor: false, dependency: 'fixed' },
    { id: "09.04", category: "mep_elec", type: "all", name: { ar: "تأسيس مواسير وعلب", en: "Conduit & Boxes", fr: "Conduits et Boîtes", zh: "导管和盒子" }, unit: "نقطة", qty: 150, baseMaterial: 15, baseLabor: 20, waste: 0.1, suppliers: suppliersElec, sbc: "SBC 401-Cnd", soilFactor: false, dependency: 'sockets_count' },
    { id: "09.05", category: "mep_elec", type: "all", name: { ar: "سحب أسلاك (Wiring)", en: "Wiring", fr: "Câblage", zh: "布线" }, unit: "لفة", qty: 40, baseMaterial: 180, baseLabor: 100, waste: 0.05, suppliers: suppliersElec, sbc: "SBC 401-Wir", soilFactor: false, dependency: 'wire_length' },
    { id: "09.06", category: "mep_elec", type: "all", name: { ar: "تركيب أفياش ومفاتيح", en: "Sockets & Switches Inst.", fr: "Inst. Prises et Interrupteurs", zh: "插座和开关安装" }, unit: "عدد", qty: 150, baseMaterial: 25, baseLabor: 10, waste: 0, suppliers: suppliersSwitches, sbc: "SBC 401-Acc", soilFactor: false, dependency: 'sockets_count' },
    { id: "09.07", category: "mep_elec", type: "all", name: { ar: "ليد وإنارة (Spotlights)", en: "Lighting Fixtures", fr: "Luminaires", zh: "照明设备" }, unit: "عدد", qty: 100, baseMaterial: 35, baseLabor: 15, waste: 0.02, suppliers: suppliersElec, sbc: "SBC 401-Lit", soilFactor: false, dependency: 'build_area' },
    { id: "09.08", category: "mep_elec", type: "all", name: { ar: "نقاط تيار خفيف (داتا/ستالايت)", en: "Low Current Points", fr: "Courant Faible", zh: "弱电点" }, unit: "نقطة", qty: 20, baseMaterial: 40, baseLabor: 25, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Low", soilFactor: false, dependency: 'fixed' },

    // ================= 10. أعمال التكييف (HVAC) =================
    { id: "10.01", category: "mep_hvac", type: "all", name: { ar: "تأسيس تكييف سبليت (نحاس)", en: "Split AC Piping", fr: "Tuyauterie AC Split", zh: "分体空调管道" }, unit: "م.ط", qty: 120, baseMaterial: 90, baseLabor: 40, waste: 0.05, suppliers: [{ id: 'hvac_pip', name: { ar: 'مولر', en: 'Mueller', fr: 'Mueller', zh: 'Mueller' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 501-Pip", soilFactor: false, dependency: 'build_area' },
    { id: "10.02", category: "mep_hvac", type: "all", name: { ar: "تركيب وحدات تكييف", en: "AC Units Installation", fr: "Inst. Unités AC", zh: "空调安装" }, unit: "عدد", qty: 12, baseMaterial: 0, baseLabor: 300, waste: 0, suppliers: [{ id: 'hvac_tech', name: { ar: 'فني تكييف', en: 'AC Tech', fr: 'Tech AC', zh: '空调技师' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 501-Inst", soilFactor: false, dependency: 'fixed' },
    { id: "10.03", category: "mep_hvac", type: "all", name: { ar: "مراوح شفط جدارية وسقفية", en: "Exhaust Fans", fr: "Ventilateurs d\'Extraction", zh: "排气扇" }, unit: "عدد", qty: 6, baseMaterial: 150, baseLabor: 50, waste: 0, suppliers: [{ id: 'fan_kdk', name: { ar: 'KDK', en: 'KDK', fr: 'KDK', zh: 'KDK' }, tier: 'premium', priceMultiplier: 1.1 }], sbc: "SBC 501-Exh", soilFactor: false, dependency: 'fixed' },

    // ================= 11. التشطيبات الداخلية (Interior Finishes) =================
    { id: "11.01", category: "architecture", type: "all", name: { ar: "أسقف مستعارة (جبس بورد)", en: "False Ceiling (Gypsum)", fr: "Faux Plafond", zh: "石膏吊顶" }, unit: "م2", qty: 450, baseMaterial: 45, baseLabor: 35, waste: 0.1, suppliers: [{ id: 'gyp', name: { ar: 'جبس الأهلية', en: 'National Gypsum', fr: 'Gypse National', zh: '国家石膏' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Ceil", soilFactor: false, dependency: 'build_area' },
    { id: "11.02", category: "architecture", type: "all", name: { ar: "دهانات داخلية (جوتن/الجزيرة)", en: "Internal Paint", fr: "Peinture Intérieure", zh: "内墙涂料" }, unit: "م2", qty: 1500, baseMaterial: 18, baseLabor: 12, waste: 0.05, suppliers: [{ id: 'jotun', name: { ar: 'جوتن', en: 'Jotun', fr: 'Jotun', zh: '佐敦' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 201-Pnt", soilFactor: false, dependency: 'rooms_area' },
    { id: "11.03", category: "architecture", type: "all", name: { ar: "بورسلان أرضيات (استقبال/مجالس)", en: "Porcelain Flooring", fr: "Sol Porcelaine", zh: "瓷砖地板" }, unit: "م2", qty: 150, baseMaterial: 85, baseLabor: 40, waste: 0.08, suppliers: suppliersFinish, sbc: "SBC 201-Flr", soilFactor: false, dependency: 'rooms_area' },
    { id: "11.04", category: "architecture", type: "all", name: { ar: "سيراميك أرضيات (غرف/خدمات)", en: "Ceramic Flooring", fr: "Sol Céramique", zh: "陶瓷地板" }, unit: "م2", qty: 250, baseMaterial: 45, baseLabor: 35, waste: 0.08, suppliers: suppliersFinish, sbc: "SBC 201-Cer", soilFactor: false, dependency: 'rooms_area' },
    { id: "11.05", category: "architecture", type: "all", name: { ar: "سيراميك جدران (حمامات/مطابخ)", en: "Wall Ceramic (Wet Areas)", fr: "Mur Céramique", zh: "墙面陶瓷" }, unit: "م2", qty: 300, baseMaterial: 50, baseLabor: 40, waste: 0.1, suppliers: suppliersFinish, sbc: "SBC 201-WC", soilFactor: false, dependency: 'rooms_area' },
    { id: "11.06", category: "architecture", type: "all", name: { ar: "نعلات بورسلان (Skirting)", en: "Skirting", fr: "Plinthes", zh: "踢脚线" }, unit: "م.ط", qty: 300, baseMaterial: 15, baseLabor: 10, waste: 0.05, suppliers: suppliersFinish, sbc: "SBC 201-Sk", soilFactor: false, dependency: 'build_area' },
    { id: "11.07", category: "architecture", type: "all", name: { ar: "درج رخام (توريد وتركيب)", en: "Marble Staircase", fr: "Escalier Marbre", zh: "大理石楼梯" }, unit: "م.ط", qty: 50, baseMaterial: 250, baseLabor: 100, waste: 0.05, suppliers: suppliersFinish, sbc: "SBC 201-Str", soilFactor: false, dependency: 'fixed' },

    // ================= 12. الأبواب والنوافذ (Doors & Windows) =================
    { id: "12.01", category: "architecture", type: "all", name: { ar: "أبواب خشبية داخلية (WPC)", en: "Internal Wooden Doors", fr: "Portes Bois Int.", zh: "内木门" }, unit: "عدد", qty: 15, baseMaterial: 850, baseLabor: 200, waste: 0, suppliers: [{ id: 'door_wpc', name: { ar: 'مصنع الأبواب', en: 'Door Factory', fr: 'Usine Portes', zh: '门厂' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Dr", soilFactor: false, dependency: 'build_area' },
    { id: "12.02", category: "architecture", type: "all", name: { ar: "أبواب حديد ومداخل", en: "Steel Doors", fr: "Portes Acier", zh: "钢门" }, unit: "عدد", qty: 4, baseMaterial: 1500, baseLabor: 300, waste: 0, suppliers: [{ id: 'door_stl', name: { ar: 'ورشة حدادة', en: 'Steel Workshop', fr: 'Atelier Acier', zh: '钢铁车间' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Stl", soilFactor: false, dependency: 'fixed' },
    { id: "12.03", category: "architecture", type: "all", name: { ar: "نوافذ ألمنيوم دبل جلاس", en: "Aluminum Windows", fr: "Fenêtres Alu", zh: "铝窗" }, unit: "م2", qty: 60, baseMaterial: 550, baseLabor: 100, waste: 0, suppliers: suppliersFacades, sbc: "SBC 201-Win", soilFactor: false, dependency: 'build_area' },
    { id: "12.04", category: "architecture", type: "all", name: { ar: "درابزين سلم", en: "Handrails", fr: "Rampes", zh: "扶手" }, unit: "م.ط", qty: 30, baseMaterial: 300, baseLabor: 100, waste: 0, suppliers: [{ id: 'rail', name: { ar: 'أعمال معدنية', en: 'Metal Works', fr: 'Travaux Métal', zh: '金属工程' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Rl", soilFactor: false, dependency: 'fixed' },

    // ================= 13. أعمال الواجهات (Facades) =================
    { id: "13.01", category: "architecture", type: "all", name: { ar: "دهانات واجهات بروفايل", en: "External Paint", fr: "Peinture Extérieure", zh: "外墙涂料" }, unit: "م2", qty: 400, baseMaterial: 22, baseLabor: 15, waste: 0.08, suppliers: [{ id: 'jotun', name: { ar: 'جوتن', en: 'Jotun', fr: 'Jotun', zh: '佐敦' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 201-PntEx", soilFactor: false, dependency: 'build_area' },
    { id: "13.02", category: "architecture", type: "all", name: { ar: "تكسيات حجر أو رخام", en: "Natural Stone Cladding", fr: "Revêtement Pierre", zh: "天然石材" }, unit: "م2", qty: 80, baseMaterial: 280, baseLabor: 120, waste: 0.08, suppliers: suppliersFacades, sbc: "SBC 201-Stn", soilFactor: false, dependency: 'facade_stone' },
    { id: "13.03", category: "architecture", type: "all", name: { ar: "كلادينج ألمنيوم", en: "Aluminum Cladding", fr: "Bardage Aluminium", zh: "铝塑板" }, unit: "م2", qty: 0, baseMaterial: 320, baseLabor: 100, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC 201-Cld", soilFactor: false, dependency: 'facade_cladding' },
    { id: "13.04", category: "architecture", type: "all", name: { ar: "واجهات زجاجية (ستركشر)", en: "Glass Facades", fr: "Façades Vitrées", zh: "玻璃幕墙" }, unit: "م2", qty: 0, baseMaterial: 650, baseLabor: 180, waste: 0.03, suppliers: suppliersFacades, sbc: "SBC 201-Gls", soilFactor: false, dependency: 'facade_glass' },
    { id: "13.05", category: "architecture", type: "all", name: { ar: "عناصر تأكيدية جي آر سي", en: "GRC Elements", fr: "Éléments GRC", zh: "GRC构件" }, unit: "م2", qty: 0, baseMaterial: 380, baseLabor: 150, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC 201-GRC", soilFactor: false, dependency: 'build_area' },

    // ================= 14. الأعمال الخارجية (External Works) =================
    { id: "14.01", category: "external_works", type: "all", name: { ar: "بناء سور خارجي", en: "Boundary Wall", fr: "Mur d\'Enceinte", zh: "围墙" }, unit: "م.ط", qty: 60, baseMaterial: 300, baseLabor: 150, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Wall", soilFactor: false, dependency: 'land_area' },
    { id: "14.02", category: "external_works", type: "all", name: { ar: "بوابة خارجية رئيسية", en: "Main Gate", fr: "Portail Principal", zh: "大门" }, unit: "عدد", qty: 1, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: suppliersFacades, sbc: "SBC 201-Gate", soilFactor: false, dependency: 'fixed' },
    { id: "14.03", category: "external_works", type: "all", name: { ar: "بلاط أحواش متداخل (انترلوك)", en: "Interlock Paving", fr: "Pavé Autobloquant", zh: "连锁铺路" }, unit: "م2", qty: 100, baseMaterial: 40, baseLabor: 25, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 201-Pav", soilFactor: false, dependency: 'land_area' },
    { id: "14.04", category: "external_works", type: "all", name: { ar: "تنسيق حدائق (زراعة)", en: "Landscaping", fr: "Aménagement Paysager", zh: "景观美化" }, unit: "مقطوعية", qty: 1, baseMaterial: 6000, baseLabor: 4000, waste: 0, suppliers: [{ id: 'land_1', name: { ar: 'شركة تنسيق', en: 'Landscaping Co', fr: 'Paysagiste', zh: '景观公司' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC-Land", soilFactor: false, dependency: 'fixed' },
    { id: "14.05", category: "external_works", type: "all", name: { ar: "إنارة ليلية خارجية", en: "External Lighting", fr: "Éclairage Extérieur", zh: "室外照明" }, unit: "عدد", qty: 8, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Ext", soilFactor: false, dependency: 'land_area' },
    { id: "14.06", category: "external_works", type: "all", name: { ar: "بيارة (خزان الصرف الصحى)", en: "Septic Tank", fr: "Fosse Septique", zh: "化粪池" }, unit: "عدد", qty: 1, baseMaterial: 4500, baseLabor: 1500, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 701-Sep", soilFactor: false, dependency: 'fixed' },
    { id: "14.07", category: "external_works", type: "all", name: { ar: "مظلات كراج سيارات", en: "Car Parking Shade", fr: "Abri Voiture", zh: "停车棚" }, unit: "م2", qty: 30, baseMaterial: 180, baseLabor: 80, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC-Shade", soilFactor: false, dependency: 'fixed' },

    // ================= 15. السلامة والحماية (Safety & Protection) =================
    { id: "15.01", category: "safety", type: "all", name: { ar: "نظام إنذار ومكافحة الحريق", en: "Fire System", fr: "Système Incendie", zh: "火灾报警系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901", soilFactor: false, dependency: 'build_area' },
    { id: "15.02", category: "safety", type: "all", name: { ar: "كواشف دخان", en: "Smoke Detectors", fr: "Détecteurs de Fumée", zh: "烟雾探测器" }, unit: "عدد", qty: 15, baseMaterial: 120, baseLabor: 40, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Smk", soilFactor: false, dependency: 'build_area' },
    { id: "15.03", category: "safety", type: "all", name: { ar: "طفايات حريق", en: "Fire Extinguishers", fr: "Extincteurs", zh: "灭火器" }, unit: "عدد", qty: 6, baseMaterial: 250, baseLabor: 30, waste: 0, suppliers: [{ id: 'fire_2', name: { ar: 'معدات سلامة', en: 'Safety Equip', fr: 'Équip Sécurité', zh: '安全设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Ext", soilFactor: false, dependency: 'fixed' },
    { id: "15.04", category: "safety", type: "all", name: { ar: "صناديق وخراطيم حريق", en: "Fire Hose Reels", fr: "Dévidoirs", zh: "消防水带" }, unit: "عدد", qty: 3, baseMaterial: 1200, baseLabor: 300, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Hose", soilFactor: false, dependency: 'build_area' },

    // ================= 16. الأيدي العاملة (Manpower) =================
    { id: "16.01", category: "manpower", type: "all", name: { ar: "مهندس موقع", en: "Site Engineer", fr: "Ingénieur de Site", zh: "现场工程师" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 6000, waste: 0, suppliers: suppliersManpower, sbc: "HR-Eng", soilFactor: false, dependency: 'duration_months', excludeProfit: true },
    { id: "16.02", category: "manpower", type: "all", name: { ar: "مراقب أعمال", en: "Works Supervisor", fr: "Superviseur", zh: "工程监督" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 4000, waste: 0, suppliers: suppliersManpower, sbc: "HR-Sup", soilFactor: false, dependency: 'duration_months', excludeProfit: true },
    { id: "16.03", category: "manpower", type: "all", name: { ar: "حارس موقع", en: "Site Guard", fr: "Gardien", zh: "保安" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 1500, waste: 0, suppliers: suppliersManpower, sbc: "HR-Grd", soilFactor: false, dependency: 'duration_months', excludeProfit: true },

    // ================= 17. تجهيزات ومعدات (Equipment & Fixtures) =================
    { id: "17.01", category: "furniture", type: "villa", name: { ar: "خزائن مطبخ", en: "Kitchen Cabinets", fr: "Meubles de Cuisine", zh: "厨房橱柜" }, unit: "م.ط", qty: 8, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: suppliersFinish, sbc: "SBC-Kit", soilFactor: false, dependency: 'fixed' },
    { id: "17.02", category: "furniture", type: "villa", name: { ar: "خزائن ملابس مدمجة", en: "Built-in Wardrobes", fr: "Placards Intégrés", zh: "内置衣柜" }, unit: "م.ط", qty: 10, baseMaterial: 600, baseLabor: 150, waste: 0, suppliers: suppliersFinish, sbc: "SBC-Ward", soilFactor: false, dependency: 'fixed' },
    { id: "17.03", category: "elevator", type: "all", name: { ar: "مصعد كهربائي", en: "Elevator", fr: "Ascenseur", zh: "电梯" }, unit: "عدد", qty: 0, baseMaterial: 105000, baseLabor: 20000, waste: 0, suppliers: suppliersElevators, sbc: "SBC-Elev", soilFactor: false, dependency: 'fixed' },

    // ================= 18. أنظمة الحريق المتقدمة (Advanced Fire Systems) — v8.2 =================
    { id: "18.01", category: "fire_advanced", type: "commercial", name: { ar: "مضخة حريق ديزل 500GPM", en: "Diesel Fire Pump 500GPM", fr: "Pompe Incendie Diesel", zh: "柴油消防泵500GPM" }, unit: "مجموعة", qty: 1, baseMaterial: 45000, baseLabor: 8000, waste: 0, suppliers: suppliersFireSafety, sbc: "SBC 903-FP", soilFactor: false, dependency: 'fixed' },
    { id: "18.02", category: "fire_advanced", type: "commercial", name: { ar: "مضخة حريق كهربائية 500GPM", en: "Electric Fire Pump 500GPM", fr: "Pompe Incendie Electrique", zh: "电动消防泵500GPM" }, unit: "مجموعة", qty: 1, baseMaterial: 35000, baseLabor: 6000, waste: 0, suppliers: suppliersFireSafety, sbc: "SBC 903-EP", soilFactor: false, dependency: 'fixed' },
    { id: "18.03", category: "fire_advanced", type: "commercial", name: { ar: "مضخة جوكي (Jockey Pump)", en: "Jockey Pump", fr: "Pompe Jockey", zh: "稳压泵" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: suppliersFireSafety, sbc: "SBC 903-JP", soilFactor: false, dependency: 'fixed' },
    { id: "18.04", category: "fire_advanced", type: "commercial", name: { ar: "شبكة رشاشات حريق (Sprinklers)", en: "Sprinkler Network", fr: "Réseau Sprinklers", zh: "喷淋网络" }, unit: "م2", qty: 0, baseMaterial: 35, baseLabor: 15, waste: 0.05, suppliers: suppliersFireSafety, sbc: "SBC 903-SP", soilFactor: false, dependency: 'build_area' },
    { id: "18.05", category: "fire_advanced", type: "commercial", name: { ar: "خزان مياه حريق 200م3", en: "Fire Water Tank 200m3", fr: "Réservoir Eau Incendie", zh: "消防水箱200m3" }, unit: "عدد", qty: 1, baseMaterial: 55000, baseLabor: 12000, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 903-TK", soilFactor: false, dependency: 'fixed' },
    { id: "18.06", category: "fire_advanced", type: "commercial", name: { ar: "شبكة مواسير حريق (Wet Riser)", en: "Wet Riser Piping Network", fr: "Réseau Colonnes Humides", zh: "湿式立管系统" }, unit: "م.ط", qty: 0, baseMaterial: 85, baseLabor: 35, waste: 0.08, suppliers: suppliersFireSafety, sbc: "SBC 903-WR", soilFactor: false, dependency: 'build_area' },

    // ================= 19. لوحات كهربائية متقدمة (Advanced Electrical) — v8.2 =================
    { id: "19.01", category: "elec_advanced", type: "commercial", name: { ar: "لوحة توزيع رئيسية MDB 400-800A", en: "Main Distribution Board 400-800A", fr: "Tableau Principal 400-800A", zh: "主配电板400-800A" }, unit: "عدد", qty: 1, baseMaterial: 45000, baseLabor: 8000, waste: 0, suppliers: suppliersElec, sbc: "SBC 801-MDB", soilFactor: false, dependency: 'fixed' },
    { id: "19.02", category: "elec_advanced", type: "commercial", name: { ar: "نظام تحويل تلقائي ATS", en: "Automatic Transfer Switch", fr: "Inverseur Automatique", zh: "自动转换开关" }, unit: "عدد", qty: 1, baseMaterial: 18000, baseLabor: 4000, waste: 0, suppliers: suppliersElec, sbc: "SBC 801-ATS", soilFactor: false, dependency: 'fixed' },
    { id: "19.03", category: "elec_advanced", type: "commercial", name: { ar: "محول كهربائي 500-1000KVA", en: "Electrical Transformer 500-1000KVA", fr: "Transformateur Electrique", zh: "变压器500-1000KVA" }, unit: "عدد", qty: 1, baseMaterial: 65000, baseLabor: 12000, waste: 0, suppliers: suppliersElec, sbc: "SBC 801-TR", soilFactor: false, dependency: 'fixed' },
    { id: "19.04", category: "elec_advanced", type: "commercial", name: { ar: "مولد كهربائي احتياطي 250-500KVA", en: "Standby Generator 250-500KVA", fr: "Groupe Electrogène", zh: "备用发电机250-500KVA" }, unit: "عدد", qty: 1, baseMaterial: 85000, baseLabor: 10000, waste: 0, suppliers: suppliersElec, sbc: "SBC 801-GN", soilFactor: false, dependency: 'fixed' },

    // ================= 20. تكييف مركزي (Central HVAC) — v8.2 =================
    { id: "20.01", category: "hvac_central", type: "commercial", name: { ar: "وحدة تبريد مركزية (Chiller) 200TR", en: "Central Chiller 200TR", fr: "Groupe Froid Central", zh: "中央冷水机组200TR" }, unit: "عدد", qty: 1, baseMaterial: 180000, baseLabor: 25000, waste: 0, suppliers: suppliersCentralHVAC, sbc: "SBC 1101-CH", soilFactor: false, dependency: 'fixed' },
    { id: "20.02", category: "hvac_central", type: "commercial", name: { ar: "وحدة مناولة هواء AHU", en: "Air Handling Unit", fr: "Centrale de Traitement d'Air", zh: "空气处理机组" }, unit: "عدد", qty: 0, baseMaterial: 22000, baseLabor: 5000, waste: 0, suppliers: suppliersCentralHVAC, sbc: "SBC 1101-AH", soilFactor: false, dependency: 'build_area' },
    { id: "20.03", category: "hvac_central", type: "commercial", name: { ar: "وحدات FCU (Fan Coil Units)", en: "Fan Coil Units", fr: "Ventilo-Convecteurs", zh: "风机盘管" }, unit: "عدد", qty: 0, baseMaterial: 2800, baseLabor: 800, waste: 0, suppliers: suppliersCentralHVAC, sbc: "SBC 1101-FC", soilFactor: false, dependency: 'build_area' },
    { id: "20.04", category: "hvac_central", type: "commercial", name: { ar: "شبكة دكت تكييف (مجاري هواء)", en: "HVAC Ductwork", fr: "Réseau de Gaines", zh: "暖通风管" }, unit: "م.ط", qty: 0, baseMaterial: 120, baseLabor: 55, waste: 0.08, suppliers: suppliersCentralHVAC, sbc: "SBC 1101-DK", soilFactor: false, dependency: 'build_area' },

    // ================= 21. أنظمة ذكية (Smart Building Systems) — v8.2 =================
    { id: "21.01", category: "smart_systems", type: "commercial", name: { ar: "نظام إدارة المبنى BMS", en: "Building Management System", fr: "Système de Gestion du Bâtiment", zh: "楼宇管理系统" }, unit: "مجموعة", qty: 1, baseMaterial: 45000, baseLabor: 15000, waste: 0, suppliers: suppliersElec, sbc: "SBC-BMS", soilFactor: false, dependency: 'build_area' },
    { id: "21.02", category: "smart_systems", type: "commercial", name: { ar: "نظام صوت وإنذار PA/VA", en: "Public Address / Voice Alarm", fr: "Sonorisation / Alarme Vocale", zh: "公共广播/语音报警" }, unit: "مجموعة", qty: 1, baseMaterial: 18000, baseLabor: 5000, waste: 0, suppliers: suppliersElec, sbc: "SBC-PA", soilFactor: false, dependency: 'build_area' },
    { id: "21.03", category: "smart_systems", type: "commercial", name: { ar: "نظام كاميرات مراقبة CCTV", en: "CCTV Surveillance System", fr: "Système de Vidéosurveillance", zh: "闭路电视监控系统" }, unit: "مجموعة", qty: 1, baseMaterial: 15000, baseLabor: 4000, waste: 0, suppliers: suppliersElec, sbc: "SBC-CCTV", soilFactor: false, dependency: 'build_area' },
    { id: "21.04", category: "smart_systems", type: "commercial", name: { ar: "نظام تحكم بالدخول Access Control", en: "Access Control System", fr: "Contrôle d'Accès", zh: "门禁系统" }, unit: "مجموعة", qty: 1, baseMaterial: 12000, baseLabor: 3500, waste: 0, suppliers: suppliersElec, sbc: "SBC-AC", soilFactor: false, dependency: 'build_area' },
];

/**
 * قاعدة بيانات شاملة — البنود العامة + البنود الخاصة بكل نوع مشروع
 * Full Items Database — Base items (type:'all') + Project-specific items
 * Total: ~420 items
 */
export const FULL_ITEMS_DATABASE: BaseItem[] = [
    ...ITEMS_DATABASE,
    ...ALL_PROJECT_SPECIFIC_ITEMS,
];
