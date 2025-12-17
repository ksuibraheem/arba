import { BaseItem, SupplierOption, ProjectType, SoilType, RoomConfig, FacadeConfig, TeamMember, BlueprintConfig, Language, MaterialDef } from './types';

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
    'profit_margin': { ar: 'نسبة هامش الربح (%)', en: 'Profit Margin (%)', fr: 'Marge Bénéficiaire (%)', zh: '利润率 (%)' },
    'invested_capital': { ar: 'رأس المال المستثمر', en: 'Invested Capital', fr: 'Capital Investi', zh: '投资资本' },
    'target_roi': { ar: 'العائد المستهدف (%)', en: 'Target ROI (%)', fr: 'ROI Cible (%)', zh: '目标回报率 (%)' },
    'global_adjustment': { ar: 'تعديل السعر الشامل', en: 'Global Price Adj.', fr: 'Ajustement Global', zh: '全局价格调整' },
    'discount_hint': { ar: 'استخدم قيما سالبة للخصم', en: 'Use negative values for discount', fr: 'Valeurs négatives pour remise', zh: '使用负值进行折扣' },
    'location': { ar: 'الموقع', en: 'Location', fr: 'Emplacement', zh: '位置' },
    'loc_riyadh': { ar: 'الرياض', en: 'Riyadh', fr: 'Riyad', zh: '利雅得' },
    'loc_jeddah': { ar: 'جدة', en: 'Jeddah', fr: 'Djeddah', zh: '吉达' },
    'land_area': { ar: 'مساحة الأرض (م2)', en: 'Land Area (m²)', fr: 'Surface Terrain (m²)', zh: '土地面积 (m²)' },
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
                    zones: [
                        { id: 'z_r1', name: 'غرفة متعددة', area: 40, type: 'room', isAvailable: true },
                        { id: 'z_r2', name: 'غرفة خدمة', area: 20, type: 'service', isOccupied: true },
                        { id: 'z_r3', name: 'حمام', area: 6, type: 'service', isOccupied: true },
                        { id: 'z_r4', name: 'سطح مفتوح', area: 54, type: 'open', isAvailable: true }
                    ]
                },
            ]
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
    }
};

// ... Common Suppliers Data Generators ...
const suppliersConcrete: SupplierOption[] = [
    { id: 'conc_1', name: { ar: 'خرسانة الكفاح', en: 'Al-Kifah Concrete', fr: 'Béton Al-Kifah', zh: 'Al-Kifah 混凝土' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Local' },
    { id: 'conc_2', name: { ar: 'خرسانة البراك', en: 'Al-Barrak Concrete', fr: 'Béton Al-Barrak', zh: 'Al-Barrak 混凝土' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'conc_3', name: { ar: 'مصانع محلية', en: 'Local Factories', fr: 'Usines Locales', zh: '当地工厂' }, tier: 'budget', priceMultiplier: 0.92, origin: 'Local' },
    { id: 'conc_4', name: { ar: 'السعودية للخرسانة', en: 'Saudi Readymix', fr: 'Saudi Readymix', zh: '沙特预拌混凝土' }, tier: 'premium', priceMultiplier: 1.2, origin: 'Local' },
    { id: 'conc_5', name: { ar: 'الخرسانة الجاهزة', en: 'Ready Mix Co.', fr: 'Ready Mix Co.', zh: '预拌混凝土公司' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Local' }
];

const suppliersSteel: SupplierOption[] = [
    { id: 'steel_1', name: { ar: 'حديد سابك', en: 'Sabic Steel', fr: 'Acier Sabic', zh: 'Sabic 钢铁' }, tier: 'premium', priceMultiplier: 1.05, origin: 'Saudi' },
    { id: 'steel_2', name: { ar: 'حديد الراجحي', en: 'Rajhi Steel', fr: 'Acier Rajhi', zh: 'Rajhi 钢铁' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'steel_3', name: { ar: 'حديد مستورد', en: 'Imported Steel', fr: 'Acier Importé', zh: '进口钢铁' }, tier: 'budget', priceMultiplier: 0.95, origin: 'China/UAE' },
    { id: 'steel_4', name: { ar: 'حديد اليمامة', en: 'Yamamah Steel', fr: 'Acier Yamamah', zh: 'Yamamah 钢铁' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'steel_5', name: { ar: 'حديد الاتفاق', en: 'Al-Ittefaq Steel', fr: 'Acier Al-Ittefaq', zh: 'Al-Ittefaq 钢铁' }, tier: 'standard', priceMultiplier: 1.02, origin: 'Saudi' }
];

const suppliersFinish: SupplierOption[] = [
    { id: 'fin_1', name: { ar: 'النخبة للتشطيبات', en: 'Elite Finishes', fr: 'Finitions Elite', zh: '精英装修' }, tier: 'premium', priceMultiplier: 1.4, origin: 'Spain/Italy' },
    { id: 'fin_2', name: { ar: 'الخزف السعودي', en: 'Saudi Ceramics', fr: 'Céramique Saoudienne', zh: '沙特陶瓷' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'fin_3', name: { ar: 'منتجات تجارية', en: 'Commercial Products', fr: 'Produits Commerciaux', zh: '商业产品' }, tier: 'budget', priceMultiplier: 0.7, origin: 'China/India' },
    { id: 'fin_4', name: { ar: 'سيراميك رأس الخيمة', en: 'RAK Ceramics', fr: 'Céramique RAK', zh: 'RAK 陶瓷' }, tier: 'standard', priceMultiplier: 1.1, origin: 'UAE' },
    { id: 'fin_5', name: { ar: 'فيليروي آند بوش', en: 'Villeroy & Boch', fr: 'Villeroy & Boch', zh: '唯宝' }, tier: 'premium', priceMultiplier: 1.8, origin: 'Germany' },
    { id: 'fin_6', name: { ar: 'رخام محلي (نجران)', en: 'Local Marble (Najran)', fr: 'Marbre Local', zh: '当地大理石' }, tier: 'budget', priceMultiplier: 0.8, origin: 'Local' }
];

const suppliersPlumb: SupplierOption[] = [
    { id: 'plumb_1', name: { ar: 'الأنابيب الخضراء', en: 'Green Pipe', fr: 'Tuyau Vert', zh: '绿色管道' }, tier: 'premium', priceMultiplier: 1.2, origin: 'Germany/Local' },
    { id: 'plumb_2', name: { ar: 'نيبرو', en: 'Nipro', fr: 'Nipro', zh: 'Nipro' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'plumb_3', name: { ar: 'تجاري', en: 'Commercial', fr: 'Commercial', zh: '商业' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China' },
    { id: 'plumb_4', name: { ar: 'أبلكو', en: 'Aplaco', fr: 'Aplaco', zh: 'Aplaco' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Local' },
    { id: 'plumb_5', name: { ar: 'المنى', en: 'Al-Muna', fr: 'Al-Muna', zh: 'Al-Muna' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Local' }
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

    // ================= 01. أعمال الموقع والحفر (Site Work) =================
    { id: "01.01", category: "site", type: "all", name: { ar: "حفر الموقع (حتى منسوب التأسيس)", en: "Site Excavation", fr: "Excavation", zh: "挖掘" }, unit: "م3", qty: 600, baseMaterial: 0, baseLabor: 15, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }, { id: 'exc_2', name: { ar: 'مقاولين حفر', en: 'Excavation Cont.', fr: 'Entrepreneurs Exc.', zh: '挖掘承包商' }, tier: 'budget', priceMultiplier: 0.85 }], sbc: "SBC 303", soilFactor: true, dependency: 'land_area', defaultParams: { excavationDepth: 2.5, subsidenceRatio: 0.05 } },
    { id: "01.02", category: "site", type: "all", name: { ar: "إحلال تربة (ردم هندسي)", en: "Soil Replacement (Backfill)", fr: "Remplacement du Sol", zh: "回填" }, unit: "م3", qty: 450, baseMaterial: 22, baseLabor: 10, waste: 0.10, suppliers: [{ id: 'soil_1', name: { ar: 'نقليات الرمال', en: 'Sand Trans', fr: 'Trans Sable', zh: '沙运' }, tier: 'standard', priceMultiplier: 1 }, { id: 'soil_2', name: { ar: 'رمال الخرج', en: 'Al-Kharj Sand', fr: 'Sable Al-Kharj', zh: 'Al-Kharj沙' }, tier: 'premium', priceMultiplier: 1.15 }], sbc: "SBC 303-2", soilFactor: false, dependency: 'land_area', defaultParams: { backfillDensity: 1800, compactionLayers: 3, subsidenceRatio: 0.10 } },
    { id: "01.02b", category: "site", type: "all", name: { ar: "دمك التربة (طبقات)", en: "Soil Compaction (Layers)", fr: "Compactage du Sol", zh: "土壤压实" }, unit: "م2", qty: 300, baseMaterial: 0, baseLabor: 8, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Cmp", soilFactor: true, dependency: 'land_area', defaultParams: { compactionLayers: 3 } },
    { id: "01.03", category: "site", type: "all", name: { ar: "رش مبيد حشري (نمل أبيض)", en: "Anti-Termite Treatment", fr: "Traitement Anti-Termites", zh: "防白蚁处理" }, unit: "م2", qty: 300, baseMaterial: 8, baseLabor: 3, waste: 0, suppliers: [{ id: 'pest_1', name: { ar: 'مكافحة الحشرات', en: 'Pest Control', fr: 'Lutte Antiparasitaire', zh: '害虫防治' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Pest", soilFactor: false, dependency: 'land_area' },
    { id: "01.04", category: "site", type: "all", name: { ar: "فرش نايلون (بولي إيثيلين)", en: "Polyethylene Sheets", fr: "Feuilles Polyéthylène", zh: "聚乙烯板" }, unit: "م2", qty: 300, baseMaterial: 4, baseLabor: 2, waste: 0.1, suppliers: [{ id: 'poly_1', name: { ar: 'مواد بناء', en: 'Building Mat', fr: 'Mat Construction', zh: '建筑材料' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Poly", soilFactor: false, dependency: 'land_area' },

    // ================= 02. الهيكل الإنشائي (Structure) =================
    { id: "02.01", category: "structure", type: "all", name: { ar: "خرسانة نظافة C20", en: "Plain Concrete C20", fr: "Béton C20", zh: "素混凝土 C20" }, unit: "م3", qty: 35, baseMaterial: 200, baseLabor: 90, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304", soilFactor: false, dependency: 'land_area', defaultParams: { thickness: 10 } },
    { id: "02.02", category: "structure", type: "all", name: { ar: "خرسانة مسلحة (قواعد وميد) C35", en: "Reinforced Concrete C35", fr: "Béton Armé C35", zh: "钢筋混凝土 C35" }, unit: "م3", qty: 120, baseMaterial: 260, baseLabor: 120, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-4", soilFactor: false, dependency: 'build_area', defaultParams: { cementContent: 7 } },
    { id: "02.03", category: "structure", type: "all", name: { ar: "خرسانة أعمدة وجدران قص C40", en: "Columns/Walls Concrete C40", fr: "Béton Colonnes C40", zh: "柱墙混凝土 C40" }, unit: "م3", qty: 80, baseMaterial: 280, baseLabor: 150, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-Col", soilFactor: false, dependency: 'build_area' },
    { id: "02.04", category: "structure", type: "all", name: { ar: "حديد تسليح (توريد وتركيب)", en: "Reinforcement Steel", fr: "Acier d'Armature", zh: "钢筋" }, unit: "طن", qty: 45, baseMaterial: 2750, baseLabor: 450, waste: 0.03, suppliers: suppliersSteel, sbc: "SBC 304-5", soilFactor: false, dependency: 'build_area' },
    { id: "02.05", category: "structure", type: "all", name: { ar: "بلك خارجي معزول (20سم)", en: "Ext. Insulated Blocks (20cm)", fr: "Blocs Isolés Ext.", zh: "外墙绝缘砌块" }, unit: "م2", qty: 400, baseMaterial: 55, baseLabor: 25, waste: 0.05, suppliers: [{ id: 'block_s', name: { ar: 'السعودية للطوب', en: 'Saudi Bricks', fr: 'Briques Saoudiennes', zh: '沙特砖' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Blk", soilFactor: false, dependency: 'build_area' },
    { id: "02.06", category: "structure", type: "all", name: { ar: "بلك داخلي اسمنتي (15سم)", en: "Int. Cement Blocks (15cm)", fr: "Blocs Ciment Int.", zh: "内墙水泥砌块" }, unit: "م2", qty: 600, baseMaterial: 35, baseLabor: 22, waste: 0.05, suppliers: [{ id: 'block_c', name: { ar: 'مصانع محلية', en: 'Local Block', fr: 'Bloc Local', zh: '当地砌块' }, tier: 'budget', priceMultiplier: 0.9 }], sbc: "SBC 304-Blk-In", soilFactor: false, dependency: 'build_area' },
    { id: "02.07", category: "structure", type: "all", name: { ar: "أعتاب خرسانية", en: "Concrete Lintels", fr: "Linteaux Béton", zh: "混凝土过梁" }, unit: "م.ط", qty: 100, baseMaterial: 25, baseLabor: 15, waste: 0.02, suppliers: suppliersConcrete, sbc: "SBC 304-Lin", soilFactor: false, dependency: 'build_area' },

    // ================= 03. العزل (Insulation) =================
    { id: "03.01", category: "insulation", type: "all", name: { ar: "عزل قواعد (بيتومين حار/بارد)", en: "Foundation Waterproofing", fr: "Étanchéité Fondations", zh: "地基防水" }, unit: "م2", qty: 400, baseMaterial: 18, baseLabor: 12, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101", soilFactor: false, dependency: 'land_area' },
    { id: "03.02", category: "insulation", type: "all", name: { ar: "عزل حراري للأسطح (فوم)", en: "Roof Thermal Insulation (Foam)", fr: "Isolation Thermique Toit", zh: "屋顶隔热 (泡沫)" }, unit: "م2", qty: 300, baseMaterial: 45, baseLabor: 20, waste: 0.05, suppliers: [{ id: 'ins_foam', name: { ar: 'عزل حراري', en: 'Thermal Ins', fr: 'Isol Thermique', zh: '隔热' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1102", soilFactor: false, dependency: 'build_area' },
    { id: "03.03", category: "insulation", type: "all", name: { ar: "خرسانة ميول (Screed)", en: "Roof Screed", fr: "Chape Toit", zh: "屋顶找平层" }, unit: "م2", qty: 300, baseMaterial: 25, baseLabor: 15, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 1103", soilFactor: false, dependency: 'build_area' },

    // ================= 04. التشطيبات المعمارية (Finishes) =================
    // Walls & Ceilings
    { id: "04.01", category: "architecture", type: "all", name: { ar: "لياسة داخلية (أسمنتية)", en: "Internal Plaster", fr: "Enduit Intérieur", zh: "内墙抹灰" }, unit: "م2", qty: 2500, baseMaterial: 14, baseLabor: 20, waste: 0.08, suppliers: [{ id: 'plast', name: { ar: 'اسمنت اليمامة', en: 'Yamama Cement', fr: 'Ciment Yamama', zh: 'Yamama 水泥' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Pl", soilFactor: false, dependency: 'rooms_area' },
    { id: "04.02", category: "architecture", type: "all", name: { ar: "أسقف مستعارة (جبس بورد)", en: "False Ceiling (Gypsum)", fr: "Faux Plafond", zh: "石膏吊顶" }, unit: "م2", qty: 450, baseMaterial: 45, baseLabor: 35, waste: 0.1, suppliers: [{ id: 'gyp', name: { ar: 'جبس الأهلية', en: 'National Gypsum', fr: 'Gypse National', zh: '国家石膏' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Ceil", soilFactor: false, dependency: 'build_area' },
    { id: "04.03", category: "architecture", type: "all", name: { ar: "دهانات داخلية (جوتن/الجزيرة)", en: "Internal Paint", fr: "Peinture Intérieure", zh: "内墙涂料" }, unit: "م2", qty: 1500, baseMaterial: 18, baseLabor: 12, waste: 0.05, suppliers: [{ id: 'jotun', name: { ar: 'جوتن', en: 'Jotun', fr: 'Jotun', zh: '佐敦' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 201-Pnt", soilFactor: false, dependency: 'rooms_area' },

    // Floors & Stairs
    { id: "04.04", category: "architecture", type: "all", name: { ar: "بورسلان أرضيات (استقبال/مجالس)", en: "Porcelain Flooring", fr: "Sol Porcelaine", zh: "瓷砖地板" }, unit: "م2", qty: 150, baseMaterial: 85, baseLabor: 40, waste: 0.08, suppliers: suppliersFinish, sbc: "SBC 201-Flr", soilFactor: false, dependency: 'rooms_area' },
    { id: "04.05", category: "architecture", type: "all", name: { ar: "سيراميك أرضيات (غرف/خدمات)", en: "Ceramic Flooring", fr: "Sol Céramique", zh: "陶瓷地板" }, unit: "م2", qty: 250, baseMaterial: 45, baseLabor: 35, waste: 0.08, suppliers: suppliersFinish, sbc: "SBC 201-Cer", soilFactor: false, dependency: 'rooms_area' },
    { id: "04.06", category: "architecture", type: "all", name: { ar: "سيراميك جدران (حمامات/مطابخ)", en: "Wall Ceramic (Wet Areas)", fr: "Mur Céramique", zh: "墙面陶瓷" }, unit: "م2", qty: 300, baseMaterial: 50, baseLabor: 40, waste: 0.1, suppliers: suppliersFinish, sbc: "SBC 201-WC", soilFactor: false, dependency: 'rooms_area' },
    { id: "04.07", category: "architecture", type: "all", name: { ar: "نعلات (Skirting)", en: "Skirting", fr: "Plinthes", zh: "踢脚线" }, unit: "م.ط", qty: 300, baseMaterial: 15, baseLabor: 10, waste: 0.05, suppliers: suppliersFinish, sbc: "SBC 201-Sk", soilFactor: false, dependency: 'build_area' },
    { id: "04.08", category: "architecture", type: "all", name: { ar: "درج رخام (توريد وتركيب)", en: "Marble Staircase", fr: "Escalier Marbre", zh: "大理石楼梯" }, unit: "م.ط", qty: 50, baseMaterial: 250, baseLabor: 100, waste: 0.05, suppliers: suppliersFinish, sbc: "SBC 201-Str", soilFactor: false, dependency: 'fixed' },

    // Doors & Windows
    { id: "04.09", category: "architecture", type: "all", name: { ar: "أبواب خشبية داخلية (WPC)", en: "Internal Wooden Doors", fr: "Portes Bois Int.", zh: "内木门" }, unit: "عدد", qty: 15, baseMaterial: 850, baseLabor: 200, waste: 0, suppliers: [{ id: 'door_wpc', name: { ar: 'مصنع الأبواب', en: 'Door Factory', fr: 'Usine Portes', zh: '门厂' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Dr", soilFactor: false, dependency: 'build_area' },
    { id: "04.10", category: "architecture", type: "all", name: { ar: "أبواب حديد (مداخل/سطح)", en: "Steel Doors", fr: "Portes Acier", zh: "钢门" }, unit: "عدد", qty: 4, baseMaterial: 1500, baseLabor: 300, waste: 0, suppliers: [{ id: 'door_stl', name: { ar: 'ورشة حدادة', en: 'Steel Workshop', fr: 'Atelier Acier', zh: '钢铁车间' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Stl", soilFactor: false, dependency: 'fixed' },
    { id: "04.11", category: "architecture", type: "all", name: { ar: "نوافذ ألمنيوم دبل جلاس", en: "Aluminum Windows", fr: "Fenêtres Alu", zh: "铝窗" }, unit: "م2", qty: 60, baseMaterial: 550, baseLabor: 100, waste: 0, suppliers: suppliersFacades, sbc: "SBC 201-Win", soilFactor: false, dependency: 'build_area' },
    { id: "04.12", category: "architecture", type: "all", name: { ar: "درابزين (حديد/زجاج)", en: "Handrails", fr: "Rampes", zh: "扶手" }, unit: "م.ط", qty: 30, baseMaterial: 300, baseLabor: 100, waste: 0, suppliers: [{ id: 'rail', name: { ar: 'أعمال معدنية', en: 'Metal Works', fr: 'Travaux Métal', zh: '金属工程' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-Rl", soilFactor: false, dependency: 'fixed' },

    // ================= 05. السباكة (Plumbing) =================
    { id: "05.01", category: "mep_plumb", type: "all", name: { ar: "تأسيس تغذية مياه (PPR)", en: "Water Supply Pipes", fr: "Tuyaux Eau", zh: "供水管" }, unit: "نقطة", qty: 40, baseMaterial: 150, baseLabor: 100, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Sup", soilFactor: false, dependency: 'rooms_area' },
    { id: "05.02", category: "mep_plumb", type: "all", name: { ar: "تأسيس صرف صحي (PVC)", en: "Drainage Pipes", fr: "Tuyaux Drainage", zh: "排水管" }, unit: "نقطة", qty: 40, baseMaterial: 120, baseLabor: 100, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Drn", soilFactor: false, dependency: 'rooms_area' },
    { id: "05.03", category: "mep_plumb", type: "all", name: { ar: "خزان مياه علوي (3000 لتر)", en: "Water Tank (3000L)", fr: "Réservoir Eau", zh: "水箱" }, unit: "عدد", qty: 1, baseMaterial: 2000, baseLabor: 500, waste: 0, suppliers: [{ id: 'tank', name: { ar: 'المهيدب', en: 'Al-Muhaidib', fr: 'Al-Muhaidib', zh: 'Al-Muhaidib' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 701-Tnk", soilFactor: false, dependency: 'fixed' },
    { id: "05.04", category: "mep_plumb", type: "all", name: { ar: "مضخة مياه غاطسة", en: "Submersible Pump", fr: "Pompe Submersible", zh: "潜水泵" }, unit: "عدد", qty: 1, baseMaterial: 1200, baseLabor: 200, waste: 0, suppliers: suppliersPlumb, sbc: "SBC 701-Pmp", soilFactor: false, dependency: 'fixed' },
    { id: "05.05", category: "mep_plumb", type: "all", name: { ar: "مضخة ضغط (Booster)", en: "Booster Pump", fr: "Surpresseur", zh: "增压泵" }, unit: "عدد", qty: 1, baseMaterial: 1500, baseLabor: 250, waste: 0, suppliers: suppliersPlumb, sbc: "SBC 701-Bst", soilFactor: false, dependency: 'fixed' },
    { id: "05.06", category: "mep_plumb", type: "all", name: { ar: "سخانات مياه (80 لتر)", en: "Water Heaters (80L)", fr: "Chauffe-eau", zh: "热水器" }, unit: "عدد", qty: 5, baseMaterial: 450, baseLabor: 100, waste: 0, suppliers: [{ id: 'heat', name: { ar: 'الخزف', en: 'Ceramics Co', fr: 'Ceramics Co', zh: '陶瓷公司' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 701-Htr", soilFactor: false, dependency: 'fixed' },
    { id: "05.07", category: "mep_plumb", type: "all", name: { ar: "أطقم حمامات (كرسي/مغسلة/خلاط)", en: "Sanitary Ware Sets", fr: "Ensembles Sanitaires", zh: "卫浴套装" }, unit: "طقم", qty: 5, baseMaterial: 1500, baseLabor: 300, waste: 0, suppliers: suppliersFinish, sbc: "SBC 701-Set", soilFactor: false, dependency: 'fixed' },
    { id: "05.08", category: "mep_plumb", type: "all", name: { ar: "غرف تفتيش (Manholes)", en: "Manholes", fr: "Regards", zh: "人孔" }, unit: "عدد", qty: 6, baseMaterial: 400, baseLabor: 200, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 701-Man", soilFactor: false, dependency: 'fixed' },

    // ================= 06. الكهرباء (Electrical) =================
    { id: "06.01", category: "mep_elec", type: "all", name: { ar: "نظام تأريض (Grounding)", en: "Grounding System", fr: "Mise à la Terre", zh: "接地系统" }, unit: "مجموعة", qty: 1, baseMaterial: 2500, baseLabor: 1000, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Grd", soilFactor: false, dependency: 'fixed' },
    { id: "06.02", category: "mep_elec", type: "all", name: { ar: "لوحات توزيع كهرباء (MDB/DB)", en: "Dist. Boards (MDB/DB)", fr: "Tableaux Distribution", zh: "配电板" }, unit: "مجموعة", qty: 1, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-DB", soilFactor: false, dependency: 'fixed' },
    { id: "06.03", category: "mep_elec", type: "all", name: { ar: "كابلات رئيسية", en: "Main Cables", fr: "Câbles Principaux", zh: "主电缆" }, unit: "م.ط", qty: 50, baseMaterial: 150, baseLabor: 50, waste: 0.05, suppliers: suppliersElec, sbc: "SBC 401-Cab", soilFactor: false, dependency: 'fixed' },
    { id: "06.04", category: "mep_elec", type: "all", name: { ar: "تأسيس نقاط كهرباء (علب/مواسير)", en: "Conduit & Boxes", fr: "Conduits et Boîtes", zh: "导管和盒子" }, unit: "نقطة", qty: 150, baseMaterial: 15, baseLabor: 20, waste: 0.1, suppliers: suppliersElec, sbc: "SBC 401-Cnd", soilFactor: false, dependency: 'sockets_count' },
    { id: "06.05", category: "mep_elec", type: "all", name: { ar: "سحب أسلاك (Wiring)", en: "Wiring", fr: "Câblage", zh: "布线" }, unit: "لفة", qty: 40, baseMaterial: 180, baseLabor: 100, waste: 0.05, suppliers: suppliersElec, sbc: "SBC 401-Wir", soilFactor: false, dependency: 'wire_length' },
    { id: "06.06", category: "mep_elec", type: "all", name: { ar: "تركيب أفياش ومفاتيح", en: "Sockets & Switches Inst.", fr: "Inst. Prises et Interrupteurs", zh: "插座和开关安装" }, unit: "عدد", qty: 150, baseMaterial: 25, baseLabor: 10, waste: 0, suppliers: suppliersSwitches, sbc: "SBC 401-Acc", soilFactor: false, dependency: 'sockets_count' },
    { id: "06.07", category: "mep_elec", type: "all", name: { ar: "وحدات إنارة (Spotlights)", en: "Lighting Fixtures", fr: "Luminaires", zh: "照明设备" }, unit: "عدد", qty: 100, baseMaterial: 35, baseLabor: 15, waste: 0.02, suppliers: suppliersElec, sbc: "SBC 401-Lit", soilFactor: false, dependency: 'build_area' },
    { id: "06.08", category: "mep_elec", type: "all", name: { ar: "نقاط تيار خفيف (Data/TV)", en: "Low Current Points", fr: "Courant Faible", zh: "弱电点" }, unit: "نقطة", qty: 20, baseMaterial: 40, baseLabor: 25, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Low", soilFactor: false, dependency: 'fixed' },

    // ================= 07. التكييف (HVAC) =================
    { id: "07.01", category: "mep_hvac", type: "all", name: { ar: "تأسيس تكييف سبليت (نحاس)", en: "Split AC Piping", fr: "Tuyauterie AC Split", zh: "分体空调管道" }, unit: "م.ط", qty: 120, baseMaterial: 90, baseLabor: 40, waste: 0.05, suppliers: [{ id: 'hvac_pip', name: { ar: 'مولر', en: 'Mueller', fr: 'Mueller', zh: 'Mueller' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 501-Pip", soilFactor: false, dependency: 'build_area' },
    { id: "07.02", category: "mep_hvac", type: "all", name: { ar: "تركيب وحدات تكييف (أجور)", en: "AC Units Installation", fr: "Inst. Unités AC", zh: "空调安装" }, unit: "عدد", qty: 12, baseMaterial: 0, baseLabor: 300, waste: 0, suppliers: [{ id: 'hvac_tech', name: { ar: 'فني تكييف', en: 'AC Tech', fr: 'Tech AC', zh: '空调技师' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 501-Inst", soilFactor: false, dependency: 'fixed' },
    { id: "07.03", category: "mep_hvac", type: "all", name: { ar: "مراوح شفط (حمامات/مطابخ)", en: "Exhaust Fans", fr: "Ventilateurs d'Extraction", zh: "排气扇" }, unit: "عدد", qty: 6, baseMaterial: 150, baseLabor: 50, waste: 0, suppliers: [{ id: 'fan_kdk', name: { ar: 'KDK', en: 'KDK', fr: 'KDK', zh: 'KDK' }, tier: 'premium', priceMultiplier: 1.1 }], sbc: "SBC 501-Exh", soilFactor: false, dependency: 'fixed' },

    // ================= 08. الأعمال الخارجية (External Works) =================
    { id: "08.01", category: "architecture", type: "all", name: { ar: "سور خارجي (خرسانة/بلك)", en: "Boundary Wall", fr: "Mur d'Enceinte", zh: "围墙" }, unit: "م.ط", qty: 60, baseMaterial: 300, baseLabor: 150, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Wall", soilFactor: false, dependency: 'land_area' },
    { id: "08.02", category: "architecture", type: "all", name: { ar: "بوابة خارجية رئيسية", en: "Main Gate", fr: "Portail Principal", zh: "大门" }, unit: "عدد", qty: 1, baseMaterial: 3000, baseLabor: 800, waste: 0, suppliers: suppliersFacades, sbc: "SBC 201-Gate", soilFactor: false, dependency: 'fixed' },
    { id: "08.03", category: "architecture", type: "all", name: { ar: "بلاط أحواش (Interlock)", en: "Interlock Paving", fr: "Pavé Autobloquant", zh: "连锁铺路" }, unit: "م2", qty: 100, baseMaterial: 40, baseLabor: 25, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 201-Pav", soilFactor: false, dependency: 'land_area' },
    { id: "08.04", category: "architecture", type: "all", name: { ar: "تنسيق حدائق وزراعة", en: "Landscaping", fr: "Aménagement Paysager", zh: "景观美化" }, unit: "م2", qty: 50, baseMaterial: 60, baseLabor: 40, waste: 0.1, suppliers: [{ id: 'land_1', name: { ar: 'شركة تنسيق', en: 'Landscaping Co', fr: 'Paysagiste', zh: '景观公司' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC-Land", soilFactor: false, dependency: 'land_area' },
    { id: "08.05", category: "architecture", type: "all", name: { ar: "إنارة خارجية (أعمدة)", en: "External Lighting", fr: "Éclairage Extérieur", zh: "室外照明" }, unit: "عدد", qty: 8, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Ext", soilFactor: false, dependency: 'land_area' },
    { id: "08.06", category: "architecture", type: "all", name: { ar: "خزان صرف صحي (سيبتك)", en: "Septic Tank", fr: "Fosse Septique", zh: "化粪池" }, unit: "عدد", qty: 1, baseMaterial: 4500, baseLabor: 1500, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 701-Sep", soilFactor: false, dependency: 'fixed' },
    { id: "08.07", category: "architecture", type: "all", name: { ar: "مظلات سيارات (حديد/شد)", en: "Car Parking Shade", fr: "Abri Voiture", zh: "停车棚" }, unit: "م2", qty: 30, baseMaterial: 180, baseLabor: 80, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC-Shade", soilFactor: false, dependency: 'fixed' },

    // ================= 09. أعمال السلامة والحماية (Safety & Protection) =================
    { id: "09.01", category: "safety", type: "all", name: { ar: "نظام إنذار الحريق", en: "Fire Alarm System", fr: "Système d'Alarme Incendie", zh: "火灾报警系统" }, unit: "مجموعة", qty: 1, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901", soilFactor: false, dependency: 'build_area' },
    { id: "09.02", category: "safety", type: "all", name: { ar: "كواشف دخان", en: "Smoke Detectors", fr: "Détecteurs de Fumée", zh: "烟雾探测器" }, unit: "عدد", qty: 15, baseMaterial: 120, baseLabor: 40, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Smk", soilFactor: false, dependency: 'build_area' },
    { id: "09.03", category: "safety", type: "all", name: { ar: "طفايات حريق يدوية", en: "Fire Extinguishers", fr: "Extincteurs", zh: "灭火器" }, unit: "عدد", qty: 6, baseMaterial: 250, baseLabor: 30, waste: 0, suppliers: [{ id: 'fire_2', name: { ar: 'معدات سلامة', en: 'Safety Equip', fr: 'Équip Sécurité', zh: '安全设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Ext", soilFactor: false, dependency: 'fixed' },
    { id: "09.04", category: "safety", type: "all", name: { ar: "خراطيم حريق (Hose Reel)", en: "Fire Hose Reels", fr: "Dévidoirs", zh: "消防水带" }, unit: "عدد", qty: 3, baseMaterial: 1200, baseLabor: 300, waste: 0, suppliers: [{ id: 'fire_1', name: { ar: 'أنظمة الحماية', en: 'Protection Sys', fr: 'Syst Protection', zh: '保护系统' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Hose", soilFactor: false, dependency: 'build_area' },
    { id: "09.05", category: "safety", type: "all", name: { ar: "لوحات إرشادية ومخارج طوارئ", en: "Emergency Signs", fr: "Signalisation d'Urgence", zh: "紧急标志" }, unit: "عدد", qty: 10, baseMaterial: 80, baseLabor: 20, waste: 0, suppliers: [{ id: 'sign_1', name: { ar: 'لوحات', en: 'Signs Co', fr: 'Signalétique', zh: '标牌' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 901-Sign", soilFactor: false, dependency: 'build_area' },

    // ================= 10. أعمال التطوير والتأهيل (Development & Rehabilitation) =================
    { id: "10.01", category: "site", type: "all", name: { ar: "تسوية وتمهيد الموقع", en: "Site Leveling", fr: "Nivellement du Site", zh: "场地平整" }, unit: "م2", qty: 300, baseMaterial: 0, baseLabor: 8, waste: 0, suppliers: [{ id: 'exc_1', name: { ar: 'معدات ثقيلة', en: 'Heavy Equip', fr: 'Équip Lourd', zh: '重型设备' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 303-Lvl", soilFactor: true, dependency: 'land_area' },
    { id: "10.02", category: "site", type: "all", name: { ar: "هدم مباني قائمة", en: "Demolition Works", fr: "Travaux de Démolition", zh: "拆除工程" }, unit: "م3", qty: 0, baseMaterial: 0, baseLabor: 45, waste: 0, suppliers: [{ id: 'demo_1', name: { ar: 'مقاول هدم', en: 'Demolition Cont', fr: 'Entrepreneur Démol', zh: '拆除承包商' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 302", soilFactor: false, dependency: 'fixed' },
    { id: "10.03", category: "site", type: "all", name: { ar: "إزالة أنقاض ومخلفات", en: "Debris Removal", fr: "Évacuation des Débris", zh: "清除碎片" }, unit: "م3", qty: 100, baseMaterial: 0, baseLabor: 25, waste: 0, suppliers: [{ id: 'trans_1', name: { ar: 'نقليات', en: 'Transport Co', fr: 'Transport', zh: '运输' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 302-Rem", soilFactor: false, dependency: 'land_area' },
    { id: "10.04", category: "structure", type: "all", name: { ar: "ترميم خرساني", en: "Concrete Repair", fr: "Réparation Béton", zh: "混凝土修复" }, unit: "م2", qty: 0, baseMaterial: 85, baseLabor: 65, waste: 0.1, suppliers: suppliersConcrete, sbc: "SBC 304-Rep", soilFactor: false, dependency: 'fixed' },
    { id: "10.05", category: "structure", type: "all", name: { ar: "تدعيم إنشائي (FRP/Steel)", en: "Structural Strengthening", fr: "Renforcement Structurel", zh: "结构加固" }, unit: "م2", qty: 0, baseMaterial: 350, baseLabor: 200, waste: 0.05, suppliers: suppliersSteel, sbc: "SBC 304-Str", soilFactor: false, dependency: 'fixed' },

    // ================= 11. أعمال إضافية للهيكل (Additional Structure) =================
    { id: "11.01", category: "structure", type: "all", name: { ar: "خرسانة أسقف (بلاطات)", en: "Slab Concrete", fr: "Béton Dalles", zh: "楼板混凝土" }, unit: "م3", qty: 90, baseMaterial: 270, baseLabor: 130, waste: 0.03, suppliers: suppliersConcrete, sbc: "SBC 304-Slb", soilFactor: false, dependency: 'build_area' },
    { id: "11.02", category: "structure", type: "all", name: { ar: "شدات خشبية (فورم ورك)", en: "Formwork", fr: "Coffrage", zh: "模板" }, unit: "م2", qty: 800, baseMaterial: 35, baseLabor: 45, waste: 0.15, suppliers: [{ id: 'form_1', name: { ar: 'شدات معدنية', en: 'Steel Forms', fr: 'Coffrages Métal', zh: '钢模板' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Frm", soilFactor: false, dependency: 'build_area' },
    { id: "11.03", category: "structure", type: "all", name: { ar: "سلالم خرسانية", en: "Concrete Stairs", fr: "Escaliers Béton", zh: "混凝土楼梯" }, unit: "م3", qty: 8, baseMaterial: 290, baseLabor: 180, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Strs", soilFactor: false, dependency: 'fixed' },
    { id: "11.04", category: "structure", type: "all", name: { ar: "جدران استنادية", en: "Retaining Walls", fr: "Murs de Soutènement", zh: "挡土墙" }, unit: "م3", qty: 20, baseMaterial: 280, baseLabor: 150, waste: 0.05, suppliers: suppliersConcrete, sbc: "SBC 304-Ret", soilFactor: true, dependency: 'land_area' },
    { id: "11.05", category: "structure", type: "all", name: { ar: "بلاطة هوردي (توريد بلوك)", en: "Hordi Blocks", fr: "Blocs Hordi", zh: "空心砖块" }, unit: "م2", qty: 280, baseMaterial: 25, baseLabor: 15, waste: 0.08, suppliers: [{ id: 'block_h', name: { ar: 'بلك هوردي', en: 'Hordi Block', fr: 'Bloc Hordi', zh: '空心砖' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 304-Hrd", soilFactor: false, dependency: 'build_area' },

    // ================= 12. تشطيبات إضافية (Additional Finishes) =================
    { id: "12.01", category: "architecture", type: "all", name: { ar: "لياسة خارجية (شلختا)", en: "External Plaster", fr: "Enduit Extérieur", zh: "外墙抹灰" }, unit: "م2", qty: 400, baseMaterial: 18, baseLabor: 25, waste: 0.1, suppliers: [{ id: 'plast', name: { ar: 'اسمنت اليمامة', en: 'Yamama Cement', fr: 'Ciment Yamama', zh: 'Yamama 水泥' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 201-PlEx", soilFactor: false, dependency: 'build_area' },
    { id: "12.02", category: "architecture", type: "all", name: { ar: "دهانات خارجية (جوتن)", en: "External Paint", fr: "Peinture Extérieure", zh: "外墙涂料" }, unit: "م2", qty: 400, baseMaterial: 22, baseLabor: 15, waste: 0.08, suppliers: [{ id: 'jotun', name: { ar: 'جوتن', en: 'Jotun', fr: 'Jotun', zh: '佐敦' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC 201-PntEx", soilFactor: false, dependency: 'build_area' },
    { id: "12.03", category: "architecture", type: "all", name: { ar: "تكسيات حجر طبيعي", en: "Natural Stone Cladding", fr: "Revêtement Pierre", zh: "天然石材" }, unit: "م2", qty: 80, baseMaterial: 280, baseLabor: 120, waste: 0.08, suppliers: suppliersFacades, sbc: "SBC 201-Stn", soilFactor: false, dependency: 'facade_stone' },
    { id: "12.04", category: "architecture", type: "all", name: { ar: "كلادينج ألمنيوم", en: "Aluminum Cladding", fr: "Bardage Aluminium", zh: "铝塑板" }, unit: "م2", qty: 0, baseMaterial: 320, baseLabor: 100, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC 201-Cld", soilFactor: false, dependency: 'facade_cladding' },
    { id: "12.05", category: "architecture", type: "all", name: { ar: "واجهات زجاجية", en: "Glass Facades", fr: "Façades Vitrées", zh: "玻璃幕墙" }, unit: "م2", qty: 0, baseMaterial: 650, baseLabor: 180, waste: 0.03, suppliers: suppliersFacades, sbc: "SBC 201-Gls", soilFactor: false, dependency: 'facade_glass' },
    { id: "12.06", category: "architecture", type: "all", name: { ar: "جي آر سي (GRC)", en: "GRC Elements", fr: "Éléments GRC", zh: "GRC构件" }, unit: "م2", qty: 0, baseMaterial: 380, baseLabor: 150, waste: 0.05, suppliers: suppliersFacades, sbc: "SBC 201-GRC", soilFactor: false, dependency: 'build_area' },

    // ================= 13. أعمال سباكة إضافية (Additional Plumbing) =================
    { id: "13.01", category: "mep_plumb", type: "all", name: { ar: "شبكة مياه الحريق", en: "Fire Water Network", fr: "Réseau Eau Incendie", zh: "消防水网" }, unit: "م.ط", qty: 50, baseMaterial: 120, baseLabor: 80, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Fire", soilFactor: false, dependency: 'build_area' },
    { id: "13.02", category: "mep_plumb", type: "all", name: { ar: "خزان مياه أرضي", en: "Underground Water Tank", fr: "Réservoir Souterrain", zh: "地下水箱" }, unit: "عدد", qty: 1, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: suppliersConcrete, sbc: "SBC 701-UTnk", soilFactor: false, dependency: 'fixed' },
    { id: "13.03", category: "mep_plumb", type: "all", name: { ar: "فلتر مياه مركزي", en: "Central Water Filter", fr: "Filtre Central", zh: "中央净水器" }, unit: "عدد", qty: 1, baseMaterial: 1500, baseLabor: 300, waste: 0, suppliers: suppliersPlumb, sbc: "SBC 701-Flt", soilFactor: false, dependency: 'fixed' },
    { id: "13.04", category: "mep_plumb", type: "all", name: { ar: "تمديدات غاز مركزي", en: "Central Gas Piping", fr: "Tuyauterie Gaz", zh: "中央燃气管道" }, unit: "نقطة", qty: 4, baseMaterial: 200, baseLabor: 150, waste: 0.05, suppliers: suppliersPlumb, sbc: "SBC 701-Gas", soilFactor: false, dependency: 'fixed' },

    // ================= 14. كهرباء وتيار خفيف إضافي (Additional Electrical) =================
    { id: "14.01", category: "mep_elec", type: "all", name: { ar: "نظام طاقة شمسية", en: "Solar Power System", fr: "Système Solaire", zh: "太阳能系统" }, unit: "kW", qty: 0, baseMaterial: 3500, baseLabor: 1000, waste: 0, suppliers: [{ id: 'solar_1', name: { ar: 'طاقة شمسية', en: 'Solar Co', fr: 'Solaire SA', zh: '太阳能公司' }, tier: 'premium', priceMultiplier: 1.1 }], sbc: "SBC 401-Sol", soilFactor: false, dependency: 'fixed' },
    { id: "14.02", category: "mep_elec", type: "all", name: { ar: "نظام كاميرات مراقبة (CCTV)", en: "CCTV System", fr: "Système CCTV", zh: "监控系统" }, unit: "مجموعة", qty: 1, baseMaterial: 5000, baseLabor: 1500, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-CCTV", soilFactor: false, dependency: 'fixed' },
    { id: "14.03", category: "mep_elec", type: "all", name: { ar: "نظام إنتركم وصوت", en: "Intercom System", fr: "Interphone", zh: "对讲系统" }, unit: "مجموعة", qty: 1, baseMaterial: 2500, baseLabor: 800, waste: 0, suppliers: suppliersElec, sbc: "SBC 401-Int", soilFactor: false, dependency: 'fixed' },
    { id: "14.04", category: "mep_elec", type: "all", name: { ar: "نظام سمارت هوم", en: "Smart Home System", fr: "Maison Intelligente", zh: "智能家居" }, unit: "مجموعة", qty: 0, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: [{ id: 'smart_1', name: { ar: 'تقنيات ذكية', en: 'Smart Tech', fr: 'Tech Intelligente', zh: '智能科技' }, tier: 'premium', priceMultiplier: 1.3 }], sbc: "SBC 401-Smrt", soilFactor: false, dependency: 'fixed' },
    { id: "14.05", category: "mep_elec", type: "all", name: { ar: "مولد كهرباء احتياطي", en: "Backup Generator", fr: "Générateur de Secours", zh: "备用发电机" }, unit: "عدد", qty: 0, baseMaterial: 25000, baseLabor: 3000, waste: 0, suppliers: [{ id: 'gen_1', name: { ar: 'مولدات', en: 'Generators Co', fr: 'Générateurs', zh: '发电机' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 401-Gen", soilFactor: false, dependency: 'fixed' },

    // ================= 15. أعمال عزل إضافية (Additional Insulation) =================
    { id: "15.01", category: "insulation", type: "all", name: { ar: "عزل مائي للحمامات", en: "Bathroom Waterproofing", fr: "Étanchéité Salles de Bain", zh: "浴室防水" }, unit: "م2", qty: 40, baseMaterial: 35, baseLabor: 25, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101-WC", soilFactor: false, dependency: 'rooms_area' },
    { id: "15.02", category: "insulation", type: "all", name: { ar: "عزل صوتي للجدران", en: "Wall Sound Insulation", fr: "Isolation Acoustique", zh: "墙体隔音" }, unit: "م2", qty: 0, baseMaterial: 55, baseLabor: 30, waste: 0.08, suppliers: [{ id: 'ins_sound', name: { ar: 'عزل صوتي', en: 'Sound Ins', fr: 'Isol Acoustique', zh: '隔音' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1104", soilFactor: false, dependency: 'rooms_area' },
    { id: "15.03", category: "insulation", type: "all", name: { ar: "عزل خزانات مياه", en: "Tank Waterproofing", fr: "Étanchéité Réservoirs", zh: "水箱防水" }, unit: "م2", qty: 30, baseMaterial: 45, baseLabor: 35, waste: 0.1, suppliers: [{ id: 'ins_bit', name: { ar: 'بيتومات', en: 'Bitumat', fr: 'Bitumat', zh: 'Bitumat' }, tier: 'standard', priceMultiplier: 1 }], sbc: "SBC 1101-Tnk", soilFactor: false, dependency: 'fixed' },

    // ================= 16. الأيدي العاملة (Manpower) =================
    { id: "16.01", category: "manpower", type: "all", name: { ar: "مهندس موقع", en: "Site Engineer", fr: "Ingénieur de Site", zh: "现场工程师" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 6000, waste: 0, suppliers: suppliersManpower, sbc: "HR-Eng", soilFactor: false, dependency: 'duration_months', excludeProfit: true },
    { id: "16.02", category: "manpower", type: "all", name: { ar: "مراقب أعمال", en: "Works Supervisor", fr: "Superviseur", zh: "工程监督" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 4000, waste: 0, suppliers: suppliersManpower, sbc: "HR-Sup", soilFactor: false, dependency: 'duration_months', excludeProfit: true },
    { id: "16.03", category: "manpower", type: "all", name: { ar: "حارس موقع", en: "Site Guard", fr: "Gardien", zh: "保安" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 1500, waste: 0, suppliers: suppliersManpower, sbc: "HR-Grd", soilFactor: false, dependency: 'duration_months', excludeProfit: true },
    { id: "16.04", category: "manpower", type: "all", name: { ar: "عمال عامين", en: "General Labor", fr: "Main-d'œuvre Générale", zh: "普通工人" }, unit: "شهر", qty: 12, baseMaterial: 0, baseLabor: 8000, waste: 0, suppliers: suppliersManpower, sbc: "HR-Lab", soilFactor: false, dependency: 'duration_months', excludeProfit: true },

    // ================= 17. تجهيزات ومعدات (Equipment & Fixtures) =================
    { id: "17.01", category: "architecture", type: "villa", name: { ar: "خزائن مطبخ (ألمنيوم)", en: "Kitchen Cabinets", fr: "Meubles de Cuisine", zh: "厨房橱柜" }, unit: "م.ط", qty: 8, baseMaterial: 800, baseLabor: 200, waste: 0, suppliers: suppliersFinish, sbc: "SBC-Kit", soilFactor: false, dependency: 'fixed' },
    { id: "17.02", category: "architecture", type: "villa", name: { ar: "خزائن ملابس مدمجة", en: "Built-in Wardrobes", fr: "Placards Intégrés", zh: "内置衣柜" }, unit: "م.ط", qty: 10, baseMaterial: 600, baseLabor: 150, waste: 0, suppliers: suppliersFinish, sbc: "SBC-Ward", soilFactor: false, dependency: 'fixed' },
    { id: "17.03", category: "mep_elec", type: "all", name: { ar: "مصعد كهربائي", en: "Elevator", fr: "Ascenseur", zh: "电梯" }, unit: "عدد", qty: 0, baseMaterial: 80000, baseLabor: 15000, waste: 0, suppliers: [{ id: 'elev_1', name: { ar: 'أوتيس', en: 'Otis', fr: 'Otis', zh: '奥的斯' }, tier: 'premium', priceMultiplier: 1.2 }], sbc: "SBC-Elev", soilFactor: false, dependency: 'fixed' },
];
