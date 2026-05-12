// Company Data - Arba Developer
// شركة أربا المطور - نظام أربا للتسعير

export const COMPANY_INFO = {
    // اسم الشركة الأم
    companyName: {
        ar: 'آربا المطور',
        en: 'ARBA Developer',
        fr: 'ARBA Développeur',
        zh: 'ARBA 开发者'
    },
    // اسم النظام/المنتج
    name: {
        ar: 'آربا للتسعير',
        en: 'ARBA Pricing',
        fr: 'ARBA Tarification',
        zh: 'ARBA 定价'
    },
    // اسم النظام المختصر
    systemName: {
        ar: 'آربا للتسعير',
        en: 'ARBA Pricing',
        fr: 'ARBA Tarification',
        zh: 'ARBA 定价'
    },
    tagline: {
        ar: 'شريكك الموثوق في تسعير المشاريع',
        en: 'Your Trusted Partner in Project Pricing',
        fr: 'Votre Partenaire de Confiance en Tarification de Projets',
        zh: '您值得信赖的项目定价合作伙伴'
    },
    email: 'info@arba-sys.com',
    phone: '+966591529339',
    location: {
        ar: 'الرياض، المملكة العربية السعودية',
        en: 'Riyadh, Saudi Arabia',
        fr: 'Riyad, Arabie Saoudite',
        zh: '利雅得，沙特阿拉伯'
    },
    workingHours: {
        ar: '9 صباحاً - 5 مساءً',
        en: '9 AM - 5 PM',
        fr: '9h - 17h',
        zh: '上午9点 - 下午5点'
    },
    website: 'https://arba-sys.com',

    about: {
        ar: 'شركة آربا المطور هي شركة وطنية رائدة في مجال التقنية والحلول البرمجية. نظام آربا للتسعير هو أحد منتجاتنا المتخصصة في تسعير المشاريع الإنشائية.',
        en: 'ARBA Developer is a leading national company in technology and software solutions. ARBA Pricing is one of our specialized products for construction project pricing.',
        fr: 'ARBA Développeur est une entreprise nationale leader dans le domaine de la technologie et des solutions logicielles. ARBA Tarification est l\'un de nos produits spécialisés dans la tarification des projets de construction.',
        zh: 'ARBA 开发者是一家在技术和软件解决方案领域领先的国家级企业。ARBA 定价是我们专注于建筑项目定价的专业产品之一。'
    },

    vision: {
        ar: 'نهدف إلى إعادة تعريف معايير صناعة التسعير من خلال تقديم خدمات احترافية تعكس التزامنا بالدقة والشفافية، ودعم رؤية 2030 في بناء بيئة استثمارية متميزة.',
        en: 'We aim to redefine pricing industry standards by providing professional services that reflect our commitment to accuracy and transparency, supporting Vision 2030 in building a distinguished investment environment.',
        fr: 'Nous visons à redéfinir les normes de l\'industrie de la tarification en fournissant des services professionnels reflétant notre engagement envers la précision et la transparence, soutenant la Vision 2030.',
        zh: '我们致力于通过提供专业服务来重新定义定价行业标准，体现我们对准确性和透明度的承诺，支持2030愿景建设卓越投资环境。'
    },

    mission: {
        ar: 'تمكين المقاولين والمطورين من اتخاذ قرارات مالية سليمة من خلال توفير تسعير دقيق وشامل لجميع بنود المشاريع الإنشائية.',
        en: 'Empowering contractors and developers to make sound financial decisions by providing accurate and comprehensive pricing for all construction project items.',
        fr: 'Permettre aux entrepreneurs et développeurs de prendre des décisions financières éclairées grâce à une tarification précise et complète de tous les postes de projets de construction.',
        zh: '通过为所有建筑项目条目提供准确全面的定价，帮助承包商和开发商做出合理的财务决策。'
    }
};

export const SERVICES = [
    {
        id: 'project-pricing',
        icon: 'Calculator',
        title: {
            ar: 'تسعير المشاريع الإنشائية',
            en: 'Construction Project Pricing',
            fr: 'Tarification des Projets de Construction',
            zh: '建筑项目定价'
        },
        description: {
            ar: 'تسعير شامل ودقيق لجميع بنود المشاريع الإنشائية بأسعار السوق الحالية',
            en: 'Comprehensive and accurate pricing for all construction project items at current market prices',
            fr: 'Tarification complète et précise de tous les postes de projets de construction aux prix actuels du marché',
            zh: '以当前市场价格为所有建筑项目条目提供全面准确的定价'
        }
    },
    {
        id: 'boq',
        icon: 'FileSpreadsheet',
        title: {
            ar: 'إعداد جداول الكميات',
            en: 'BOQ Preparation',
            fr: 'Préparation des Devis Quantitatifs',
            zh: '工程量清单编制'
        },
        description: {
            ar: 'حصر كميات مفصل ودقيق لجميع أعمال المشروع وفق المواصفات القياسية',
            en: 'Detailed and accurate quantity surveying for all project works according to standard specifications',
            fr: 'Métré détaillé et précis de tous les travaux du projet selon les spécifications standards',
            zh: '根据标准规范对所有项目工作进行详细准确的工程量清单'
        }
    },
    {
        id: 'feasibility',
        icon: 'TrendingUp',
        title: {
            ar: 'دراسات الجدوى التسعيرية',
            en: 'Pricing Feasibility Studies',
            fr: 'Études de Faisabilité Tarifaire',
            zh: '定价可行性研究'
        },
        description: {
            ar: 'تحليل شامل للتكاليف والعوائد المتوقعة لضمان جدوى المشروع',
            en: 'Comprehensive analysis of costs and expected returns to ensure project feasibility',
            fr: 'Analyse complète des coûts et des rendements attendus pour garantir la faisabilité du projet',
            zh: '全面分析成本和预期回报以确保项目可行性'
        }
    },
    {
        id: 'consultation',
        icon: 'MessageSquare',
        title: {
            ar: 'استشارات التسعير',
            en: 'Pricing Consultation',
            fr: 'Consultation en Tarification',
            zh: '定价咨询'
        },
        description: {
            ar: 'مراجعة وتدقيق عروض الأسعار وتقديم التوصيات لتحسين التنافسية',
            en: 'Review and audit of price quotes and providing recommendations to improve competitiveness',
            fr: 'Révision et audit des devis et recommandations pour améliorer la compétitivité',
            zh: '审查和审计报价并提供提高竞争力的建议'
        }
    }
];

export const FEATURES = [
    {
        icon: 'Shield',
        title: {
            ar: 'دقة عالية',
            en: 'High Accuracy',
            fr: 'Haute Précision',
            zh: '高精度'
        },
        description: {
            ar: 'أسعار محدثة ودقيقة من السوق السعودي',
            en: 'Updated and accurate prices from the Saudi market',
            fr: 'Prix actualisés et précis du marché saoudien',
            zh: '来自沙特市场的最新准确价格'
        }
    },
    {
        icon: 'Zap',
        title: {
            ar: 'سرعة في الإنجاز',
            en: 'Fast Delivery',
            fr: 'Livraison Rapide',
            zh: '快速交付'
        },
        description: {
            ar: 'إنجاز التسعير في وقت قياسي',
            en: 'Pricing completed in record time',
            fr: 'Tarification réalisée en un temps record',
            zh: '在破纪录的时间内完成定价'
        }
    },
    {
        icon: 'Users',
        title: {
            ar: 'فريق متخصص',
            en: 'Specialized Team',
            fr: 'Équipe Spécialisée',
            zh: '专业团队'
        },
        description: {
            ar: 'خبراء في حصر الكميات والتسعير',
            en: 'Experts in quantity surveying and pricing',
            fr: 'Experts en métré et tarification',
            zh: '工程量清单和定价方面的专家'
        }
    },
    {
        icon: 'Award',
        title: {
            ar: 'خبرة واسعة',
            en: 'Extensive Experience',
            fr: 'Vaste Expérience',
            zh: '丰富经验'
        },
        description: {
            ar: 'سنوات من الخبرة في السوق السعودي',
            en: 'Years of experience in the Saudi market',
            fr: 'Des années d\'expérience sur le marché saoudien',
            zh: '在沙特市场拥有多年经验'
        }
    }
];

// Subscription Plans with detailed features
export interface SubscriptionPlan {
    id: string;
    name: Record<string, string>;
    price: number;
    period: Record<string, string>;
    projectsIncluded: number; // -1 = unlimited
    extraProjectPrice: number; // Price per extra project
    storageMB: number; // Storage in MB
    features: Record<string, string[]>;
    restrictions: {
        encryptedSuppliers: boolean; // أسماء الموردين مشفرة
        limitedUsage: boolean; // محدودية الاستخدام
        limitedSupport: boolean; // دعم محدود
        noAIPricing: boolean; // لا يوجد تسعير بالذكاء الاصطناعي
        noDownload: boolean; // لا يمكن التنزيل
        noCompanyLogo: boolean; // لا يمكن وضع شعار الشركة
    };
    popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: {
            ar: 'المجانية',
            en: 'Free',
            fr: 'Gratuit',
            zh: '免费版'
        },
        price: 0,
        period: {
            ar: 'مجاني',
            en: 'Free',
            fr: 'Gratuit',
            zh: '免费'
        },
        projectsIncluded: 2, // مشروعين فقط
        extraProjectPrice: 0, // لا يمكن إضافة مشاريع
        storageMB: 50, // 50 ميجا فقط
        features: {
            ar: [
                'تسعير مشروعين شهرياً',
                'الوصول لقاعدة البيانات الأساسية',
                'دعم بالبريد الإلكتروني فقط',
                'مساحة تخزين 50 ميجا'
            ],
            en: [
                '2 projects per month',
                'Access to basic database',
                'Email support only',
                '50 MB storage'
            ],
            fr: [
                '2 projets par mois',
                'Accès à la base de données de base',
                'Assistance par e-mail uniquement',
                'Stockage de 50 Mo'
            ],
            zh: [
                '每月2个项目',
                '访问基础数据库',
                '仅电子邮件支持',
                '50 MB 存储空间'
            ]
        },
        restrictions: {
            encryptedSuppliers: true, // أسماء الموردين مشفرة ✓
            limitedUsage: true, // استخدام محدود ✓
            limitedSupport: true, // دعم محدود ✓
            noAIPricing: true, // لا يوجد تسعير ذكي ✓
            noDownload: true, // لا يمكن التنزيل ✓
            noCompanyLogo: true // لا يوجد شعار شركة ✓
        }
    },
    {
        id: 'professional',
        name: {
            ar: 'الاحترافية',
            en: 'Professional',
            fr: 'Professionnel',
            zh: '专业版'
        },
        price: 499,
        period: {
            ar: 'شهرياً',
            en: 'Monthly',
            fr: 'Mensuel',
            zh: '每月'
        },
        projectsIncluded: 10, // 10 مشاريع شهرياً
        extraProjectPrice: 49, // 49 ريال لكل مشروع إضافي
        storageMB: 1024, // 1 جيجا
        features: {
            ar: [
                '10 مشاريع شهرياً',
                'قاعدة بيانات محدثة للموردين',
                'تصدير PDF و Excel',
                'دعم فني متميز',
                'تسعير ذكي بالـ AI',
                'شعار شركتك على التقارير',
                'مساحة تخزين 1 جيجا',
                '49 ريال لكل مشروع إضافي'
            ],
            en: [
                '10 projects per month',
                'Updated suppliers database',
                'PDF & Excel export',
                'Premium support',
                'AI-powered pricing',
                'Your company logo on reports',
                '1 GB storage',
                '49 SAR per extra project'
            ],
            fr: [
                '10 projets par mois',
                'Base de données fournisseurs mise à jour',
                'Export PDF et Excel',
                'Assistance premium',
                'Tarification intelligente par IA',
                'Logo de votre entreprise sur les rapports',
                'Stockage de 1 Go',
                '49 SAR par projet supplémentaire'
            ],
            zh: [
                '每月10个项目',
                '更新的供应商数据库',
                'PDF和Excel导出',
                '高级支持',
                'AI智能定价',
                '报告上显示公司标志',
                '1 GB 存储空间',
                '每个额外项目 49 SAR'
            ]
        },
        restrictions: {
            encryptedSuppliers: false,
            limitedUsage: false,
            limitedSupport: false,
            noAIPricing: false,
            noDownload: false,
            noCompanyLogo: false
        },
        popular: true
    },
    {
        id: 'enterprise',
        name: {
            ar: 'المنشآت',
            en: 'Enterprise',
            fr: 'Entreprise',
            zh: '企业版'
        },
        price: 1499,
        period: {
            ar: 'شهرياً',
            en: 'Monthly',
            fr: 'Mensuel',
            zh: '每月'
        },
        projectsIncluded: -1, // غير محدود
        extraProjectPrice: 0, // لا حاجة، غير محدود
        storageMB: 10240, // 10 جيجا
        features: {
            ar: [
                'مشاريع غير محدودة',
                'كل مميزات الاحترافية',
                'API للربط مع أنظمتكم',
                'تخصيص حسب الطلب',
                'مدير حساب مخصص',
                'أولوية في الدعم الفني',
                'مساحة تخزين 10 جيجا',
                'تدريب الفريق'
            ],
            en: [
                'Unlimited projects',
                'All Professional features',
                'API integration',
                'Custom solutions',
                'Dedicated account manager',
                'Priority support',
                '10 GB storage',
                'Team training'
            ],
            fr: [
                'Projets illimités',
                'Toutes les fonctionnalités Professionnel',
                'Intégration API',
                'Solutions personnalisées',
                'Gestionnaire de compte dédié',
                'Assistance prioritaire',
                'Stockage de 10 Go',
                'Formation de l\'équipe'
            ],
            zh: [
                '无限项目',
                '所有专业版功能',
                'API集成',
                '定制解决方案',
                '专属客户经理',
                '优先支持',
                '10 GB 存储空间',
                '团队培训'
            ]
        },
        restrictions: {
            encryptedSuppliers: false,
            limitedUsage: false,
            limitedSupport: false,
            noAIPricing: false,
            noDownload: false,
            noCompanyLogo: false
        }
    }
];

// Helper function to check if a feature is available for a plan
export const isPlanFeatureAvailable = (planId: string, feature: keyof SubscriptionPlan['restrictions']): boolean => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return false;
    return !plan.restrictions[feature];
};

// Helper function to encrypt supplier name for free plan
export const encryptSupplierName = (name: string, planId: string): string => {
    if (planId === 'free') {
        if (name.length <= 2) return '***';
        return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    }
    return name;
};

// Helper function to get remaining projects
export const getRemainingProjects = (planId: string, usedProjects: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (plan.projectsIncluded === -1) return -1; // Unlimited
    return Math.max(0, plan.projectsIncluded - usedProjects);
};

// Helper function to get storage info
export const getStorageInfo = (planId: string, usedMB: number): { total: number; used: number; remaining: number; percentage: number } => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return { total: 0, used: 0, remaining: 0, percentage: 0 };
    return {
        total: plan.storageMB,
        used: usedMB,
        remaining: Math.max(0, plan.storageMB - usedMB),
        percentage: Math.min(100, (usedMB / plan.storageMB) * 100)
    };
};

export const PAGE_TRANSLATIONS: Record<string, Record<string, string>> = {
    // Navigation
    nav_home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', zh: '首页' },
    nav_services: { ar: 'خدماتنا', en: 'Services', fr: 'Services', zh: '服务' },
    nav_about: { ar: 'عن الشركة', en: 'About', fr: 'À Propos', zh: '关于我们' },
    nav_pricing: { ar: 'الأسعار', en: 'Pricing', fr: 'Tarifs', zh: '价格' },
    nav_contact: { ar: 'تواصل معنا', en: 'Contact', fr: 'Contact', zh: '联系我们' },
    nav_login: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', zh: '登录' },
    nav_register: { ar: 'إنشاء حساب', en: 'Register', fr: 'Inscription', zh: '注册' },
    nav_dashboard: { ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de Bord', zh: '控制面板' },
    nav_logout: { ar: 'تسجيل الخروج', en: 'Logout', fr: 'Déconnexion', zh: '退出登录' },
    nav_why_us: { ar: 'لماذا نحن', en: 'Why Us', fr: 'Pourquoi Nous', zh: '为什么选择我们' },
    nav_staff: { ar: 'الموظفين', en: 'Staff', fr: 'Personnel', zh: '员工' },
    nav_support: { ar: 'الدعم', en: 'Support', fr: 'Assistance', zh: '支持' },

    // Company & System Names
    company_name: { ar: 'آربا المطور', en: 'ARBA Developer', fr: 'ARBA Développeur', zh: 'ARBA 开发者' },
    system_name: { ar: 'آربا للتسعير', en: 'ARBA Pricing', fr: 'ARBA Tarification', zh: 'ARBA 定价' },
    powered_by: { ar: 'منتج من شركة', en: 'A Product of', fr: 'Un Produit de', zh: '产品来自' },

    // Admin Dashboard - Browse
    admin_browse: { ar: 'الاستعراض', en: 'Browse', fr: 'Parcourir', zh: '浏览' },
    admin_access: { ar: 'الصلاحيات', en: 'Access Control', fr: 'Contrôle d\'Accès', zh: '权限控制' },
    admin_finance: { ar: 'المالية', en: 'Finance', fr: 'Finance', zh: '财务' },
    admin_operations: { ar: 'العمليات', en: 'Operations', fr: 'Opérations', zh: '运营' },
    admin_support: { ar: 'الدعم', en: 'Support', fr: 'Assistance', zh: '支持' },
    admin_audit: { ar: 'التدقيق', en: 'Audit', fr: 'Audit', zh: '审计' },
    admin_requests: { ar: 'الطلبات', en: 'Requests', fr: 'Demandes', zh: '请求' },
    admin_employees: { ar: 'الموظفين', en: 'Employees', fr: 'Employés', zh: '员工' },

    // Hero Section
    hero_title: { ar: 'منصة التسعير الذكية للمشاريع الإنشائية', en: 'Smart Pricing Platform for Construction Projects', fr: 'Plateforme Intelligente de Tarification pour Projets de Construction', zh: '建筑项目智能定价平台' },
    hero_subtitle: { ar: 'أسعار دقيقة ومحدثة • حصر كميات احترافي • تقارير تفصيلية', en: 'Accurate & Updated Prices • Professional BOQ • Detailed Reports', fr: 'Prix Précis et Actualisés • Devis Quantitatif Professionnel • Rapports Détaillés', zh: '准确更新的价格 • 专业工程量清单 • 详细报告' },
    hero_cta: { ar: 'ابدأ الآن مجاناً', en: 'Start Free Now', fr: 'Commencez Gratuitement', zh: '立即免费开始' },
    hero_cta_secondary: { ar: 'تعرف على المزيد', en: 'Learn More', fr: 'En Savoir Plus', zh: '了解更多' },
    hero_demo: { ar: 'استعرض البرنامج', en: 'View Demo', fr: 'Voir la Démo', zh: '查看演示' },

    // Sections
    section_services: { ar: 'خدماتنا', en: 'Our Services', fr: 'Nos Services', zh: '我们的服务' },
    section_services_subtitle: { ar: 'حلول متكاملة لتسعير مشاريعكم', en: 'Complete solutions for your project pricing', fr: 'Solutions complètes pour la tarification de vos projets', zh: '为您的项目定价提供完整解决方案' },
    section_why_us: { ar: 'لماذا تختارنا؟', en: 'Why Choose Us?', fr: 'Pourquoi Nous Choisir ?', zh: '为什么选择我们？' },
    section_plans: { ar: 'خطط الاشتراك', en: 'Subscription Plans', fr: 'Plans d\'Abonnement', zh: '订阅计划' },
    section_contact: { ar: 'تواصل معنا', en: 'Contact Us', fr: 'Contactez-Nous', zh: '联系我们' },

    // Login Page
    login_title: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', zh: '登录' },
    login_email: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'E-mail', zh: '电子邮箱' },
    login_password: { ar: 'كلمة المرور', en: 'Password', fr: 'Mot de Passe', zh: '密码' },
    login_remember: { ar: 'تذكرني', en: 'Remember me', fr: 'Se souvenir de moi', zh: '记住我' },
    login_forgot: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?', fr: 'Mot de passe oublié ?', zh: '忘记密码？' },
    login_submit: { ar: 'دخول', en: 'Login', fr: 'Se Connecter', zh: '登录' },
    login_no_account: { ar: 'ليس لديك حساب؟', en: "Don't have an account?", fr: "Vous n'avez pas de compte ?", zh: '没有账户？' },
    login_create_account: { ar: 'إنشاء حساب جديد', en: 'Create new account', fr: 'Créer un nouveau compte', zh: '创建新账户' },

    // Register Page
    register_title: { ar: 'إنشاء حساب جديد', en: 'Create New Account', fr: 'Créer un Nouveau Compte', zh: '创建新账户' },
    register_name: { ar: 'الاسم الكامل', en: 'Full Name', fr: 'Nom Complet', zh: '全名' },
    register_email: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'E-mail', zh: '电子邮箱' },
    register_phone: { ar: 'رقم الجوال', en: 'Phone Number', fr: 'Numéro de Téléphone', zh: '手机号码' },
    register_company: { ar: 'اسم الشركة', en: 'Company Name', fr: 'Nom de la Société', zh: '公司名称' },
    register_password: { ar: 'كلمة المرور', en: 'Password', fr: 'Mot de Passe', zh: '密码' },
    register_confirm_password: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password', fr: 'Confirmer le Mot de Passe', zh: '确认密码' },
    register_plan: { ar: 'اختر خطة الاشتراك', en: 'Choose Subscription Plan', fr: 'Choisir un Plan d\'Abonnement', zh: '选择订阅计划' },
    register_terms: { ar: 'أوافق على الشروط والأحكام', en: 'I agree to the Terms and Conditions', fr: 'J\'accepte les Conditions Générales', zh: '我同意条款和条件' },
    register_submit: { ar: 'إنشاء الحساب', en: 'Create Account', fr: 'Créer le Compte', zh: '创建账户' },
    register_have_account: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', zh: '已有账户？' },
    register_login: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Se Connecter', zh: '登录' },

    // About Page
    about_title: { ar: 'عن أربا للتسعير', en: 'About Arba Pricing', fr: 'À Propos d\'Arba Tarification', zh: '关于 ARBA 定价' },
    about_vision: { ar: 'رؤيتنا', en: 'Our Vision', fr: 'Notre Vision', zh: '我们的愿景' },
    about_mission: { ar: 'مهمتنا', en: 'Our Mission', fr: 'Notre Mission', zh: '我们的使命' },

    // Footer
    footer_rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved', fr: 'Tous droits réservés', zh: '版权所有' },
    footer_privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de Confidentialité', zh: '隐私政策' },
    footer_terms: { ar: 'الشروط والأحكام', en: 'Terms & Conditions', fr: 'Conditions Générales', zh: '条款和条件' },

    // Common
    get_started: { ar: 'ابدأ الآن', en: 'Get Started', fr: 'Commencer', zh: '开始使用' },
    learn_more: { ar: 'اعرف المزيد', en: 'Learn More', fr: 'En Savoir Plus', zh: '了解更多' },
    choose_plan: { ar: 'اختر الخطة', en: 'Choose Plan', fr: 'Choisir le Plan', zh: '选择计划' },
    popular: { ar: 'الأكثر شعبية', en: 'Most Popular', fr: 'Le Plus Populaire', zh: '最受欢迎' },
    sar: { ar: 'ريال', en: 'SAR', fr: 'SAR', zh: 'SAR' },
    back_to_home: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: 'Retour à l\'Accueil', zh: '返回首页' },
    save: { ar: 'حفظ', en: 'Save', fr: 'Enregistrer', zh: '保存' },
    cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler', zh: '取消' },
    confirm: { ar: 'تأكيد', en: 'Confirm', fr: 'Confirmer', zh: '确认' },
    delete: { ar: 'حذف', en: 'Delete', fr: 'Supprimer', zh: '删除' },
    edit: { ar: 'تعديل', en: 'Edit', fr: 'Modifier', zh: '编辑' },
    search: { ar: 'بحث...', en: 'Search...', fr: 'Rechercher...', zh: '搜索...' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...', zh: '加载中...' },
    error: { ar: 'خطأ', en: 'Error', fr: 'Erreur', zh: '错误' },
    success: { ar: 'نجاح', en: 'Success', fr: 'Succès', zh: '成功' },
    warning: { ar: 'تحذير', en: 'Warning', fr: 'Avertissement', zh: '警告' },
    yes: { ar: 'نعم', en: 'Yes', fr: 'Oui', zh: '是' },
    no: { ar: 'لا', en: 'No', fr: 'Non', zh: '否' },
    close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer', zh: '关闭' },
    next: { ar: 'التالي', en: 'Next', fr: 'Suivant', zh: '下一步' },
    previous: { ar: 'السابق', en: 'Previous', fr: 'Précédent', zh: '上一步' },
    submit: { ar: 'إرسال', en: 'Submit', fr: 'Soumettre', zh: '提交' },

    // Subscription Features
    encrypted_suppliers: { ar: 'أسماء الموردين مشفرة', en: 'Encrypted supplier names', fr: 'Noms de fournisseurs cryptés', zh: '供应商名称已加密' },
    limited_usage: { ar: 'استخدام محدود', en: 'Limited usage', fr: 'Utilisation limitée', zh: '限制使用' },
    limited_support: { ar: 'دعم محدود', en: 'Limited support', fr: 'Assistance limitée', zh: '有限支持' },
    no_ai_pricing: { ar: 'بدون تسعير ذكي', en: 'No AI pricing', fr: 'Sans tarification IA', zh: '无AI定价' },
    no_download: { ar: 'التنزيل غير متاح', en: 'Download not available', fr: 'Téléchargement non disponible', zh: '无法下载' },
    upgrade_to_unlock: { ar: 'قم بالترقية لفتح هذه الميزة', en: 'Upgrade to unlock this feature', fr: 'Passez à la version supérieure pour débloquer', zh: '升级以解锁此功能' },
    projects_remaining: { ar: 'المشاريع المتبقية', en: 'Projects remaining', fr: 'Projets restants', zh: '剩余项目' },
    storage_used: { ar: 'المساحة المستخدمة', en: 'Storage used', fr: 'Stockage utilisé', zh: '已用存储' },
    extra_project_cost: { ar: 'تكلفة المشروع الإضافي', en: 'Extra project cost', fr: 'Coût du projet supplémentaire', zh: '额外项目费用' },
    unlimited: { ar: 'غير محدود', en: 'Unlimited', fr: 'Illimité', zh: '无限制' },
    per_project: { ar: 'لكل مشروع', en: 'per project', fr: 'par projet', zh: '每个项目' },

    // Payment Page
    payment_title: { ar: 'اختر باقتك', en: 'Choose Your Plan', fr: 'Choisissez Votre Plan', zh: '选择您的计划' },
    payment_subtitle: { ar: 'ابدأ مجاناً أو اختر الباقة المناسبة لاحتياجاتك', en: 'Start free or choose the plan that fits your needs', fr: 'Commencez gratuitement ou choisissez le plan adapté à vos besoins', zh: '免费开始或选择适合您需求的计划' },
    payment_current_plan: { ar: 'باقتك الحالية', en: 'Current Plan', fr: 'Plan Actuel', zh: '当前计划' },
    payment_select_plan: { ar: 'اختيار الباقة', en: 'Select Plan', fr: 'Sélectionner le Plan', zh: '选择计划' },
    payment_upgrade_now: { ar: 'ترقية الآن', en: 'Upgrade Now', fr: 'Mettre à Niveau', zh: '立即升级' },
    payment_monthly_price: { ar: 'شهرياً', en: '/month', fr: '/mois', zh: '/月' },
    payment_yearly_price: { ar: 'سنوياً', en: '/year', fr: '/an', zh: '/年' },
    payment_features: { ar: 'المميزات:', en: 'Features:', fr: 'Fonctionnalités :', zh: '功能：' },
    payment_method: { ar: 'طريقة الدفع', en: 'Payment Method', fr: 'Mode de Paiement', zh: '付款方式' },
    payment_credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card', fr: 'Carte de Crédit', zh: '信用卡' },
    payment_bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer', fr: 'Virement Bancaire', zh: '银行转账' },
    payment_mada: { ar: 'مدى', en: 'Mada', fr: 'Mada', zh: 'Mada' },
    payment_confirm: { ar: 'تأكيد الدفع', en: 'Confirm Payment', fr: 'Confirmer le Paiement', zh: '确认付款' },
    payment_processing: { ar: 'جاري المعالجة...', en: 'Processing...', fr: 'Traitement en cours...', zh: '处理中...' },
    payment_back_to_home: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: 'Retour à l\'Accueil', zh: '返回首页' },
    payment_projects: { ar: 'مشروع', en: 'Projects', fr: 'Projets', zh: '项目' },
    payment_storage: { ar: 'تخزين', en: 'Storage', fr: 'Stockage', zh: '存储' },

    // Company Page
    company_back_to_home: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: 'Retour à l\'Accueil', zh: '返回首页' },
    company_about: { ar: 'عن الشركة', en: 'About Company', fr: 'À Propos de la Société', zh: '关于公司' },
    company_our_services: { ar: 'خدماتنا', en: 'Our Services', fr: 'Nos Services', zh: '我们的服务' },
    company_contact_us: { ar: 'تواصل معنا', en: 'Contact Us', fr: 'Contactez-Nous', zh: '联系我们' },
    company_employees: { ar: 'موظف', en: 'Employees', fr: 'Employés', zh: '员工' },
    company_projects_completed: { ar: 'مشروع منجز', en: 'Projects Completed', fr: 'Projets Terminés', zh: '已完成项目' },
    company_years_experience: { ar: 'سنوات خبرة', en: 'Years Experience', fr: 'Années d\'Expérience', zh: '年经验' },
    company_start_now: { ar: 'ابدأ الآن', en: 'Start Now', fr: 'Commencez Maintenant', zh: '立即开始' },

    // Verification Page
    verification_title: { ar: 'التحقق من الحساب', en: 'Account Verification', fr: 'Vérification du Compte', zh: '账户验证' },
    verification_email_title: { ar: 'التحقق من البريد الإلكتروني', en: 'Email Verification', fr: 'Vérification de l\'E-mail', zh: '邮箱验证' },
    verification_phone_title: { ar: 'التحقق من رقم الجوال', en: 'Phone Verification', fr: 'Vérification du Téléphone', zh: '手机验证' },
    verification_enter_code: { ar: 'اضغط على رابط التحقق المرسل إلى', en: 'Click the verification link sent to', fr: 'Cliquez sur le lien de vérification envoyé à', zh: '点击发送到的验证链接' },
    verification_verify: { ar: 'تحقق', en: 'Verify', fr: 'Vérifier', zh: '验证' },
    verification_resend: { ar: 'إعادة إرسال', en: 'Resend', fr: 'Renvoyer', zh: '重新发送' },
    verification_resend_in: { ar: 'إعادة الإرسال خلال', en: 'Resend in', fr: 'Renvoyer dans', zh: '重新发送倒计时' },
    verification_seconds: { ar: 'ثانية', en: 'seconds', fr: 'secondes', zh: '秒' },
    verification_verifying: { ar: 'جاري التحقق...', en: 'Verifying...', fr: 'Vérification en cours...', zh: '验证中...' },
    verification_invalid_code: { ar: 'لم يتم التحقق بعد', en: 'Not verified yet', fr: 'Pas encore vérifié', zh: '尚未验证' },
    verification_complete: { ar: 'اكتمل التحقق!', en: 'Verification Complete!', fr: 'Vérification Terminée !', zh: '验证完成！' },
    verification_complete_message: { ar: 'تم التحقق من حسابك بنجاح. يمكنك الآن استخدام جميع ميزات المنصة.', en: 'Your account has been verified successfully. You can now use all platform features.', fr: 'Votre compte a été vérifié avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités.', zh: '您的账户已成功验证。您现在可以使用平台所有功能。' },
    verification_go_to_dashboard: { ar: 'الذهاب للوحة التحكم', en: 'Go to Dashboard', fr: 'Aller au Tableau de Bord', zh: '前往控制面板' },
    verification_skip: { ar: 'تخطي', en: 'Skip', fr: 'Passer', zh: '跳过' },
    verification_back_to_home: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: 'Retour à l\'Accueil', zh: '返回首页' },

    // Admin Dashboard
    admin_panel: { ar: 'لوحة التحكم', en: 'Admin Panel', fr: 'Panneau d\'Administration', zh: '管理面板' },
    admin_overview: { ar: 'نظرة عامة', en: 'Overview', fr: 'Vue d\'Ensemble', zh: '概览' },
    admin_users: { ar: 'المستخدمين', en: 'Users', fr: 'Utilisateurs', zh: '用户' },
    admin_companies: { ar: 'الشركات', en: 'Companies', fr: 'Sociétés', zh: '公司' },
    admin_data: { ar: 'البيانات', en: 'Data', fr: 'Données', zh: '数据' },
    admin_settings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres', zh: '设置' },
    admin_logout: { ar: 'خروج', en: 'Logout', fr: 'Déconnexion', zh: '退出' },
    admin_total_users: { ar: 'إجمالي المستخدمين', en: 'Total Users', fr: 'Total Utilisateurs', zh: '用户总数' },
    admin_active_companies: { ar: 'الشركات النشطة', en: 'Active Companies', fr: 'Sociétés Actives', zh: '活跃公司' },
    admin_total_projects: { ar: 'المشاريع', en: 'Projects', fr: 'Projets', zh: '项目' },
    admin_monthly_revenue: { ar: 'الإيرادات الشهرية', en: 'Monthly Revenue', fr: 'Revenus Mensuels', zh: '月收入' },
    admin_recent_activity: { ar: 'النشاط الأخير', en: 'Recent Activity', fr: 'Activité Récente', zh: '最近活动' },
    admin_quick_actions: { ar: 'إجراءات سريعة', en: 'Quick Actions', fr: 'Actions Rapides', zh: '快速操作' },
    admin_view_all: { ar: 'عرض الكل', en: 'View All', fr: 'Voir Tout', zh: '查看全部' },
    admin_search: { ar: 'بحث...', en: 'Search...', fr: 'Rechercher...', zh: '搜索...' },
    admin_new_user: { ar: 'مستخدم جديد', en: 'New User', fr: 'Nouvel Utilisateur', zh: '新用户' },
    admin_new_company: { ar: 'شركة جديدة', en: 'New Company', fr: 'Nouvelle Société', zh: '新公司' },
    admin_export_data: { ar: 'تصدير البيانات', en: 'Export Data', fr: 'Exporter les Données', zh: '导出数据' },
    admin_notifications: { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications', zh: '通知' },

    // Owner Dashboard
    owner_dashboard: { ar: 'لوحة تحكم المدير', en: 'Owner Dashboard', fr: 'Tableau de Bord Propriétaire', zh: '业主控制面板' },
    owner_overview: { ar: 'نظرة عامة', en: 'Overview', fr: 'Vue d\'Ensemble', zh: '概览' },
    owner_customers: { ar: 'العملاء', en: 'Customers', fr: 'Clients', zh: '客户' },
    owner_quotes: { ar: 'عروض الأسعار', en: 'Quotes', fr: 'Devis', zh: '报价' },
    owner_website: { ar: 'إدارة الموقع', en: 'Website', fr: 'Site Web', zh: '网站' },
    owner_analytics: { ar: 'التحليلات', en: 'Analytics', fr: 'Analytique', zh: '分析' },
    owner_settings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres', zh: '设置' },
    owner_logout: { ar: 'تسجيل الخروج', en: 'Logout', fr: 'Déconnexion', zh: '退出登录' },
    owner_total_visits: { ar: 'إجمالي الزيارات', en: 'Total Visits', fr: 'Visites Totales', zh: '总访问量' },
    owner_total_customers: { ar: 'إجمالي العملاء', en: 'Total Customers', fr: 'Total Clients', zh: '客户总数' },
    owner_total_quotes: { ar: 'عروض الأسعار', en: 'Total Quotes', fr: 'Total Devis', zh: '报价总数' },
    owner_total_revenue: { ar: 'الإيرادات', en: 'Revenue', fr: 'Revenus', zh: '收入' },
    owner_today: { ar: 'اليوم', en: 'Today', fr: 'Aujourd\'hui', zh: '今天' },
    owner_week: { ar: 'الأسبوع', en: 'Week', fr: 'Semaine', zh: '本周' },
    owner_month: { ar: 'الشهر', en: 'Month', fr: 'Mois', zh: '本月' },
    owner_year: { ar: 'السنة', en: 'Year', fr: 'Année', zh: '本年' },
    owner_active: { ar: 'نشط', en: 'Active', fr: 'Actif', zh: '活跃' },
    owner_inactive: { ar: 'غير نشط', en: 'Inactive', fr: 'Inactif', zh: '非活跃' },
    owner_pending: { ar: 'معلق', en: 'Pending', fr: 'En Attente', zh: '待处理' },
    owner_accepted: { ar: 'مقبول', en: 'Accepted', fr: 'Accepté', zh: '已接受' },
    owner_rejected: { ar: 'مرفوض', en: 'Rejected', fr: 'Refusé', zh: '已拒绝' },
    owner_sent: { ar: 'مُرسل', en: 'Sent', fr: 'Envoyé', zh: '已发送' },
    owner_save: { ar: 'حفظ', en: 'Save', fr: 'Enregistrer', zh: '保存' },
    owner_cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler', zh: '取消' },
    owner_daily_visits: { ar: 'الزيارات اليومية', en: 'Daily Visits', fr: 'Visites Quotidiennes', zh: '每日访问' },
    owner_quick_stats: { ar: 'إحصائيات سريعة', en: 'Quick Stats', fr: 'Statistiques Rapides', zh: '快速统计' },
    owner_active_users: { ar: 'المستخدمين النشطين', en: 'Active Users', fr: 'Utilisateurs Actifs', zh: '活跃用户' },
    owner_conversion_rate: { ar: 'معدل التحويل', en: 'Conversion Rate', fr: 'Taux de Conversion', zh: '转化率' },
    owner_avg_quote_value: { ar: 'متوسط قيمة العرض', en: 'Avg. Quote Value', fr: 'Valeur Moyenne du Devis', zh: '平均报价金额' },
    owner_pending_quotes: { ar: 'عروض معلقة', en: 'Pending Quotes', fr: 'Devis en Attente', zh: '待处理报价' },
    owner_recent_quotes: { ar: 'آخر عروض الأسعار', en: 'Recent Quotes', fr: 'Devis Récents', zh: '最近报价' },
    owner_view_all: { ar: 'عرض الكل', en: 'View All', fr: 'Voir Tout', zh: '查看全部' },
    owner_customer: { ar: 'العميل', en: 'Customer', fr: 'Client', zh: '客户' },
    owner_date: { ar: 'التاريخ', en: 'Date', fr: 'Date', zh: '日期' },
    owner_items: { ar: 'البنود', en: 'Items', fr: 'Articles', zh: '项目' },
    owner_status: { ar: 'الحالة', en: 'Status', fr: 'Statut', zh: '状态' },
    owner_total: { ar: 'الإجمالي', en: 'Total', fr: 'Total', zh: '总计' },
    owner_customer_management: { ar: 'إدارة العملاء', en: 'Customer Management', fr: 'Gestion des Clients', zh: '客户管理' },
    owner_add_customer: { ar: 'إضافة عميل', en: 'Add Customer', fr: 'Ajouter un Client', zh: '添加客户' },
    owner_email: { ar: 'البريد', en: 'Email', fr: 'E-mail', zh: '邮箱' },
    owner_phone: { ar: 'الجوال', en: 'Phone', fr: 'Téléphone', zh: '电话' },
    owner_total_spent: { ar: 'إجمالي الإنفاق', en: 'Total Spent', fr: 'Total Dépensé', zh: '总支出' },
    owner_actions: { ar: 'إجراءات', en: 'Actions', fr: 'Actions', zh: '操作' },
    owner_last_visit: { ar: 'آخر زيارة:', en: 'Last visit:', fr: 'Dernière visite :', zh: '最后访问：' },
    owner_price_quotes: { ar: 'عروض الأسعار', en: 'Price Quotes', fr: 'Devis de Prix', zh: '价格报价' },
    owner_export: { ar: 'تصدير', en: 'Export', fr: 'Exporter', zh: '导出' },
    owner_total_quotes_count: { ar: 'إجمالي العروض', en: 'Total Quotes', fr: 'Total des Devis', zh: '报价总数' },
    owner_view: { ar: 'عرض', en: 'View', fr: 'Voir', zh: '查看' },
    owner_website_management: { ar: 'إدارة الموقع', en: 'Website Management', fr: 'Gestion du Site Web', zh: '网站管理' },
    owner_general_settings: { ar: 'الإعدادات العامة', en: 'General Settings', fr: 'Paramètres Généraux', zh: '常规设置' },
    owner_site_name: { ar: 'اسم الموقع', en: 'Site Name', fr: 'Nom du Site', zh: '网站名称' },
    owner_tagline: { ar: 'الشعار', en: 'Tagline', fr: 'Slogan', zh: '标语' },
    owner_contact_info: { ar: 'معلومات التواصل', en: 'Contact Info', fr: 'Informations de Contact', zh: '联系信息' },
    owner_email_address: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'E-mail', zh: '电子邮箱' },
    owner_phone_number: { ar: 'رقم الجوال', en: 'Phone', fr: 'Téléphone', zh: '电话' },
    owner_colors: { ar: 'الألوان', en: 'Colors', fr: 'Couleurs', zh: '颜色' },
    owner_primary_color: { ar: 'اللون الأساسي', en: 'Primary Color', fr: 'Couleur Principale', zh: '主色调' },
    owner_secondary_color: { ar: 'اللون الثانوي', en: 'Secondary Color', fr: 'Couleur Secondaire', zh: '辅色调' },
    owner_address: { ar: 'العنوان', en: 'Address', fr: 'Adresse', zh: '地址' },
    owner_company_address: { ar: 'عنوان الشركة', en: 'Company Address', fr: 'Adresse de la Société', zh: '公司地址' },
    owner_analytics_stats: { ar: 'التحليلات والإحصائيات', en: 'Analytics & Statistics', fr: 'Analytique et Statistiques', zh: '分析与统计' },
    owner_traffic_sources: { ar: 'مصادر الزيارات', en: 'Traffic Sources', fr: 'Sources de Trafic', zh: '流量来源' },
    owner_google_search: { ar: 'بحث جوجل', en: 'Google Search', fr: 'Recherche Google', zh: '谷歌搜索' },
    owner_direct: { ar: 'مباشر', en: 'Direct', fr: 'Direct', zh: '直接访问' },
    owner_social_media: { ar: 'السوشيال ميديا', en: 'Social Media', fr: 'Réseaux Sociaux', zh: '社交媒体' },
    owner_referrals: { ar: 'إحالات', en: 'Referrals', fr: 'Références', zh: '推荐' },
    owner_devices: { ar: 'الأجهزة', en: 'Devices', fr: 'Appareils', zh: '设备' },
    owner_mobile: { ar: 'الجوال', en: 'Mobile', fr: 'Mobile', zh: '手机' },
    owner_desktop: { ar: 'الكمبيوتر', en: 'Desktop', fr: 'Ordinateur', zh: '电脑' },
    owner_tablet: { ar: 'التابلت', en: 'Tablet', fr: 'Tablette', zh: '平板' },
    owner_top_pages: { ar: 'أهم الصفحات', en: 'Top Pages', fr: 'Pages Principales', zh: '热门页面' },
    owner_home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', zh: '首页' },
    owner_pricing: { ar: 'التسعير', en: 'Pricing', fr: 'Tarification', zh: '定价' },
    owner_register: { ar: 'التسجيل', en: 'Register', fr: 'Inscription', zh: '注册' },
    owner_about: { ar: 'عن الشركة', en: 'About', fr: 'À Propos', zh: '关于' },
    owner_account_settings: { ar: 'إعدادات الحساب', en: 'Account Settings', fr: 'Paramètres du Compte', zh: '账户设置' },
    owner_username: { ar: 'اسم المستخدم', en: 'Username', fr: 'Nom d\'Utilisateur', zh: '用户名' },

    // Employee & Team
    employee_login: { ar: 'دخول الموظفين', en: 'Employee Login', fr: 'Connexion Employé', zh: '员工登录' },
    employee_id: { ar: 'الرقم الوظيفي', en: 'Employee ID', fr: 'Identifiant Employé', zh: '员工编号' },
    employee_password: { ar: 'كلمة المرور', en: 'Password', fr: 'Mot de Passe', zh: '密码' },
    team_login: { ar: 'دخول فريق العمل', en: 'Team Login', fr: 'Connexion Équipe', zh: '团队登录' },
    team_dashboard: { ar: 'لوحة تحكم الفريق', en: 'Team Dashboard', fr: 'Tableau de Bord Équipe', zh: '团队控制面板' },

    // Support Center
    support_title: { ar: 'مركز الدعم', en: 'Support Center', fr: 'Centre d\'Assistance', zh: '支持中心' },
    support_faq: { ar: 'الأسئلة الشائعة', en: 'FAQ', fr: 'FAQ', zh: '常见问题' },
    support_ticket: { ar: 'تذكرة دعم', en: 'Support Ticket', fr: 'Ticket d\'Assistance', zh: '支持工单' },
    support_chat: { ar: 'المحادثة', en: 'Chat', fr: 'Discussion', zh: '聊天' },

    // Password Reset
    password_reset_title: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password', fr: 'Réinitialiser le Mot de Passe', zh: '重置密码' },
    password_reset_email: { ar: 'أدخل بريدك الإلكتروني', en: 'Enter your email', fr: 'Entrez votre e-mail', zh: '输入您的邮箱' },
    password_reset_send: { ar: 'إرسال رابط إعادة التعيين', en: 'Send Reset Link', fr: 'Envoyer le Lien de Réinitialisation', zh: '发送重置链接' },
    password_reset_success: { ar: 'تم إرسال رابط إعادة التعيين بنجاح', en: 'Reset link sent successfully', fr: 'Lien de réinitialisation envoyé avec succès', zh: '重置链接已成功发送' },

    // Cloud Sync
    cloud_sync_title: { ar: 'المزامنة السحابية', en: 'Cloud Sync', fr: 'Synchronisation Cloud', zh: '云端同步' },
    cloud_sync_export: { ar: 'تصدير البيانات', en: 'Export Data', fr: 'Exporter les Données', zh: '导出数据' },
    cloud_sync_import: { ar: 'استيراد البيانات', en: 'Import Data', fr: 'Importer les Données', zh: '导入数据' },

    // Misc
    free_plan: { ar: 'الباقة المجانية', en: 'Free Plan', fr: 'Plan Gratuit', zh: '免费计划' },
    professional_plan: { ar: 'الباقة الاحترافية', en: 'Professional Plan', fr: 'Plan Professionnel', zh: '专业计划' },
    enterprise_plan: { ar: 'باقة المنشآت', en: 'Enterprise Plan', fr: 'Plan Entreprise', zh: '企业计划' },
    monthly: { ar: 'شهرياً', en: 'Monthly', fr: 'Mensuel', zh: '每月' },
    free: { ar: 'مجاني', en: 'Free', fr: 'Gratuit', zh: '免费' },
    individuals: { ar: 'أفراد', en: 'Individuals', fr: 'Particuliers', zh: '个人' },
    companies: { ar: 'شركات', en: 'Companies', fr: 'Sociétés', zh: '公司' },
    suppliers: { ar: 'موردين', en: 'Suppliers', fr: 'Fournisseurs', zh: '供应商' },
    project_team: { ar: 'فريق المشروع', en: 'Project Team', fr: 'Équipe de Projet', zh: '项目团队' },

    // Landing page stats
    stat_support: { ar: 'دعم متواصل', en: '24/7 Support', fr: 'Assistance 24/7', zh: '全天候支持' },
    stat_accuracy: { ar: 'دقة التسعير', en: 'Pricing Accuracy', fr: 'Précision de Tarification', zh: '定价精度' },
    stat_clients: { ar: 'عميل حالي', en: 'Active Clients', fr: 'Clients Actifs', zh: '活跃客户' },
    stat_items: { ar: 'منتج وتسعيرة', en: 'Products & Prices', fr: 'Produits et Prix', zh: '产品和价格' },

    // Contact section
    contact_phone: { ar: 'الهاتف', en: 'Phone', fr: 'Téléphone', zh: '电话' },
    contact_email: { ar: 'البريد', en: 'Email', fr: 'E-mail', zh: '邮箱' },
    contact_location: { ar: 'الموقع', en: 'Location', fr: 'Localisation', zh: '位置' },
    contact_hours: { ar: 'ساعات العمل', en: 'Working Hours', fr: 'Heures de Travail', zh: '工作时间' },

    // Login page additional
    login_enter_phone: { ar: 'يرجى إدخال رقم الجوال', en: 'Please enter phone number', fr: 'Veuillez entrer le numéro de téléphone', zh: '请输入电话号码' },
    login_enter_password: { ar: 'أدخل كلمة المرور', en: 'Enter your password', fr: 'Entrez votre mot de passe', zh: '请输入密码' },
    login_enter_email: { ar: 'يرجى إدخال البريد وكلمة المرور', en: 'Please enter email and password', fr: 'Veuillez entrer e-mail et mot de passe', zh: '请输入邮箱和密码' },
    login_enter_employee_id: { ar: 'يرجى إدخال رقم الموظف وكلمة المرور', en: 'Please enter employee ID and password', fr: 'Veuillez entrer ID et mot de passe', zh: '请输入员工编号和密码' },
    login_invalid_credentials: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid credentials', fr: 'Identifiants invalides', zh: '凭据无效' },
    login_error_retry: { ar: 'حدث خطأ، حاول مرة أخرى', en: 'An error occurred, try again', fr: 'Erreur survenue, réessayez', zh: '发生错误，请重试' },
    login_loading: { ar: 'جاري الدخول...', en: 'Logging in...', fr: 'Connexion...', zh: '登录中...' },
    login_supplier_prompt: { ar: 'تريد أن تصبح مورداً؟', en: 'Want to become a supplier?', fr: 'Devenir fournisseur ?', zh: '想成为供应商？' },
    login_supplier_register: { ar: 'سجل كمورد', en: 'Register as Supplier', fr: 'Inscription Fournisseur', zh: '注册为供应商' },
    login_employee_help: { ar: 'للمساعدة تواصل مع قسم الموارد البشرية', en: 'For help, contact HR department', fr: 'Contactez les RH pour aide', zh: '如需帮助，请联系人力资源部' },
    login_team_help: { ar: 'اطلب الرقم السري من مدير المشروع', en: 'Request password from the project manager', fr: 'Demandez au chef de projet', zh: '向项目经理索取密码' },
    nav_back_home: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: 'Retour Accueil', zh: '返回首页' },
    about_values: { ar: 'قيمنا', en: 'Our Values', fr: 'Nos Valeurs', zh: '价值观' },
    register_subtitle: { ar: 'أنشئ حسابك وابدأ التسعير', en: 'Create your account and start pricing', fr: 'Créez votre compte', zh: '创建账户并开始定价' },
    register_company_name: { ar: 'اسم الشركة', en: 'Company Name', fr: 'Nom Entreprise', zh: '公司名称' },
    under_review_title: { ar: 'قيد المراجعة', en: 'Under Review', fr: 'En Révision', zh: '审核中' },
    under_review_message: { ar: 'حسابك قيد المراجعة', en: 'Your account is under review', fr: 'Votre compte est en révision', zh: '您的账户正在审核中' },
    password_reset_subtitle: { ar: 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور', en: 'Enter your email to recover password', fr: 'Entrez votre e-mail', zh: '输入邮箱以恢复密码' },
    password_reset_submit: { ar: 'إرسال رابط الاستعادة', en: 'Send Recovery Link', fr: 'Envoyer le Lien', zh: '发送恢复链接' },
    company_title: { ar: 'عن الشركة', en: 'About Company', fr: 'Entreprise', zh: '公司介绍' },
    company_founded: { ar: 'تأسست', en: 'Founded', fr: 'Fondée en', zh: '成立于' },
    protected_access: { ar: 'الوصول المحمي', en: 'Protected Access', fr: 'Accès Protégé', zh: '受保护的访问' },
    enter_access_key: { ar: 'أدخل مفتاح الوصول للمتابعة', en: 'Enter access key to continue', fr: 'Entrez la clé d\'accès', zh: '输入访问密钥继续' },
    access_key_placeholder: { ar: 'مفتاح الوصول السري', en: 'Secret Access Key', fr: 'Clé d\'Accès Secrète', zh: '密钥' },
    invalid_access_key: { ar: 'مفتاح الوصول غير صحيح', en: 'Invalid access key', fr: 'Clé d\'accès invalide', zh: '访问密钥无效' },
    back: { ar: 'العودة', en: 'Back', fr: 'Retour', zh: '返回' },
    unauthorized: { ar: 'غير مصرح', en: 'Unauthorized', fr: 'Non Autorisé', zh: '未授权' },
    no_permission: { ar: 'ليس لديك صلاحية الوصول لهذه الصفحة', en: 'You do not have permission to access this page', fr: 'Accès non autorisé', zh: '您没有权限访问此页面' },
    hr_management: { ar: 'إدارة الموارد البشرية', en: 'Human Resources Management', fr: 'Gestion des Ressources Humaines', zh: '人力资源管理' },
    employee_management_system: { ar: 'نظام إدارة شؤون الموظفين', en: 'Employee Management System', fr: 'Système de Gestion du Personnel', zh: '员工管理系统' },

    // App.tsx specific
    demo_visitor: { ar: 'زائر تجريبي', en: 'Demo Visitor', fr: 'Visiteur Démo', zh: '演示访客' },
    demo_company: { ar: 'شركة تجريبية', en: 'Demo Company', fr: 'Entreprise Démo', zh: '演示公司' },
    accounting_system: { ar: 'نظام المحاسبة', en: 'Accounting System', fr: 'Système Comptable', zh: '会计系统' },
    accounting_subtitle: { ar: 'الفواتير والمدفوعات والقيود', en: 'Invoices, Payments & Ledger', fr: 'Factures, Paiements et Grand Livre', zh: '发票, 付款和分类账' },
    tech_support: { ar: 'الدعم الفني', en: 'Technical Support', fr: 'Support Technique', zh: '技术支持' },
    support_ticket_mgmt: { ar: 'إدارة تذاكر الدعم', en: 'Support Ticket Management', fr: 'Gestion des Tickets', zh: '工单管理' },
    test_mode_active: { ar: 'وضع الاختبار نشط', en: 'Test Mode Active', fr: 'Mode Test Actif', zh: '测试模式已激活' },
    end_test: { ar: 'إنهاء الاختبار والعودة', en: 'End Test & Return', fr: 'Terminer le Test', zh: '结束测试并返回' },
    end: { ar: 'إنهاء', en: 'End', fr: 'Fin', zh: '结束' },
    dismiss: { ar: 'إخفاء الشريط', en: 'Dismiss Banner', fr: 'Masquer la Bannière', zh: '关闭横幅' },
    demo_mode: { ar: 'وضع العرض التجريبي', en: 'Demo Preview Mode', fr: 'Mode Aperçu Démo', zh: '演示预览模式' },
    exit_demo: { ar: 'خروج من العرض', en: 'Exit Demo', fr: 'Quitter la Démo', zh: '退出演示' },
    premium_feature: { ar: 'ميزة مميزة', en: 'Premium Feature', fr: 'Fonctionnalité Premium', zh: '高级功能' },
    later: { ar: 'لاحقاً', en: 'Later', fr: 'Plus Tard', zh: '稍后' },
    upgrade_now: { ar: 'ترقية الآن', en: 'Upgrade Now', fr: 'Mettre à Niveau', zh: '立即升级' },
    back_to_dashboard: { ar: 'العودة للوحة التحكم', en: 'Back to Dashboard', fr: 'Retour au Tableau de Bord', zh: '返回仪表板' },
    supplier_catalog: { ar: 'كتالوج الموردين', en: 'Supplier Catalog', fr: 'Catalogue Fournisseurs', zh: '供应商目录' },
    using_free_plan: { ar: 'أنت تستخدم الباقة المجانية', en: 'You are on the Free Plan', fr: 'Vous êtes sur le Plan Gratuit', zh: '您正在使用免费计划' },
    upgrade: { ar: 'ترقية', en: 'Upgrade', fr: 'Mettre à Niveau', zh: '升级' },
    smart_import: { ar: 'استيراد ذكي', en: 'Smart Import', fr: 'Importation Intelligente', zh: '智能导入' },
    remaining_projects: { ar: 'المشاريع المتبقية', en: 'Remaining Projects', fr: 'Projets Restants', zh: '剩余项目' },
    storage: { ar: 'التخزين', en: 'Storage', fr: 'Stockage', zh: '存储' },
    company_logo: { ar: 'شعار الشركة', en: 'Company Logo', fr: 'Logo Entreprise', zh: '公司标志' },
    arba_parser: { ar: 'محلل Arba الذكي', en: 'Arba Intelligence Parser', fr: 'Analyseur ARBA Intelligent', zh: 'ARBA智能解析器' },
    not_available_free: { ar: 'غير متاح في الباقة المجانية', en: 'Not available in free plan', fr: 'Non disponible en plan gratuit', zh: '免费计划不可用' },
};

// Free plan restrictions messages
export const FREE_PLAN_RESTRICTIONS: Record<string, string[]> = {
    ar: [
        '⚠️ أسماء الموردين مشفرة - قم بالترقية لعرضها',
        '⚠️ تسعير محدود - مشروعين فقط شهرياً',
        '⚠️ الدعم الفني محدود - بريد إلكتروني فقط',
        '⚠️ التسعير الذكي بالـ AI غير متاح',
        '⚠️ تنزيل التقارير غير متاح',
        '⚠️ لا يمكن إضافة شعار شركتك'
    ],
    en: [
        '⚠️ Supplier names are encrypted - Upgrade to view',
        '⚠️ Limited pricing - 2 projects only per month',
        '⚠️ Limited support - Email only',
        '⚠️ AI pricing not available',
        '⚠️ Report download not available',
        '⚠️ Cannot add your company logo'
    ],
    fr: [
        '⚠️ Noms de fournisseurs cryptés - Passez à la version supérieure',
        '⚠️ Tarification limitée - 2 projets par mois uniquement',
        '⚠️ Assistance limitée - E-mail uniquement',
        '⚠️ Tarification IA non disponible',
        '⚠️ Téléchargement de rapports non disponible',
        '⚠️ Impossible d\'ajouter le logo de votre entreprise'
    ],
    zh: [
        '⚠️ 供应商名称已加密 - 升级以查看',
        '⚠️ 有限定价 - 每月仅2个项目',
        '⚠️ 有限支持 - 仅电子邮件',
        '⚠️ AI定价不可用',
        '⚠️ 无法下载报告',
        '⚠️ 无法添加公司标志'
    ]
};

// Helper: create a translation function for PAGE_TRANSLATIONS
// Usage: const t = getPageT(language); t('nav_home') => 'الرئيسية' or 'Home' etc.
export const getPageT = (language: string) => (key: string): string => {
    const entry = PAGE_TRANSLATIONS[key];
    if (!entry) return key;
    return entry[language] || entry['en'] || entry['ar'] || key;
};

// Helper: get text from a multilingual object { ar: '...', en: '...', fr: '...', zh: '...' }
export const getLocalizedText = (obj: Record<string, string> | undefined, language: string): string => {
    if (!obj) return '';
    return obj[language] || obj['en'] || obj['ar'] || '';
};

// Helper: get array from a multilingual arrays object
export const getLocalizedArray = (obj: Record<string, string[]> | undefined, language: string): string[] => {
    if (!obj) return [];
    return obj[language] || obj['en'] || obj['ar'] || [];
};
