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

// ═══════════════════════════════════════════════════════════════
// Subscription Plans — 5-Tier System (V2)
// مجانية → أساسية → احترافية → أعمال → منشآت
// ═══════════════════════════════════════════════════════════════

export type CommodityAccessLevel = 'none' | 'prices_only' | 'full' | 'full_alerts';
export type BrainLevel = 'colors_only' | 'basic' | 'full' | 'full_plus';
export type SupportLevel = 'email_72h' | 'email_48h' | 'email_24h_whatsapp' | 'email_12h_phone' | 'sla_4h_dedicated';

export interface SubscriptionPlan {
    id: string;
    name: Record<string, string>;
    price: number;
    period: Record<string, string>;

    // ── المشاريع والتخزين ──
    projectsIncluded: number;          // -1 = unlimited
    extraProjectPrice: number;         // ريال لكل مشروع إضافي (0 = لا يمكن)
    storageMB: number;                 // التخزين بالميجا
    extraStoragePrice: number;         // ريال لكل GB إضافي
    maxRetentionDays: number;          // مدة حفظ المشاريع بالأيام (-1 = ∞)

    // ── الذكاء الاصطناعي ──
    aiBudgetItems: number;             // حد AI بنود/شهر (-1 = ∞, 0 = ❌)
    extraAIPrice: number;              // ريال لكل بند إضافي

    // ── جداول الكميات BOQ ──
    boqUploads: number;                // حد BOQ uploads/شهر (-1 = ∞, 0 = ❌)
    extraBOQPrice: number;             // ريال لكل BOQ إضافي

    // ── الفريق والموظفين ──
    employeesIncluded: number;         // عدد الموظفين (0 = مستخدم واحد فقط)
    extraEmployeePrice: number;        // ريال لكل موظف إضافي/شهر

    // ── بورصة المواد ──
    commodityAccess: CommodityAccessLevel;

    // ── الدماغ الذكي ──
    brainLevel: BrainLevel;

    // ── التكاملات والـ API ──
    apiAccess: boolean;
    apiCallsIncluded: number;          // -1 = ∞, 0 = ❌
    extraAPICallPrice: number;         // ريال لكل call إضافي

    // ── التقارير ──
    tenderReports: number;             // تقارير مناقصات/شهر (-1 = ∞, 0 = ❌)
    extraTenderPrice: number;          // ريال لكل تقرير إضافي
    customReports: boolean;
    whiteLabel: boolean;

    // ── الدعم ──
    supportLevel: SupportLevel;
    dedicatedManager: boolean;
    teamTraining: boolean;
    onboardingHours: number;           // ساعات onboarding (0 = بدون)

    // ── أنواع المشاريع ──
    projectTypes: number;              // عدد أنواع المشاريع المتاحة (-1 = كل + مخصص)

    // ── التسعير السنوي ──
    annualDiscount: number;            // نسبة خصم السنوي (0.20 = 20%)

    // ── واجهة المستخدم ──
    color: string;                     // لون الباقة (hex)
    icon: string;                      // اسم أيقونة lucide
    badge?: Record<string, string>;    // شارة (الأكثر شعبية / أفضل قيمة)

    // ── الميزات المعروضة ──
    features: Record<string, string[]>;

    // ── القيود ──
    restrictions: {
        encryptedSuppliers: boolean;
        limitedUsage: boolean;
        limitedSupport: boolean;
        noAIPricing: boolean;
        noDownload: boolean;
        noCompanyLogo: boolean;
    };
    popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    // ═══════════════════════════════════════
    // 🆓 المجانية — "جرّب وشوف"
    // ═══════════════════════════════════════
    {
        id: 'free',
        name: { ar: 'المجانية', en: 'Free', fr: 'Gratuit', zh: '免费版' },
        price: 0,
        period: { ar: 'مجاني', en: 'Free', fr: 'Gratuit', zh: '免费' },

        projectsIncluded: 1,
        extraProjectPrice: 0,
        storageMB: 25,
        extraStoragePrice: 0,
        maxRetentionDays: 30,

        aiBudgetItems: 0,
        extraAIPrice: 0,

        boqUploads: 0,
        extraBOQPrice: 0,

        employeesIncluded: 0,
        extraEmployeePrice: 0,

        commodityAccess: 'none',
        brainLevel: 'colors_only',

        apiAccess: false,
        apiCallsIncluded: 0,
        extraAPICallPrice: 0,

        tenderReports: 0,
        extraTenderPrice: 0,
        customReports: false,
        whiteLabel: false,

        supportLevel: 'email_72h',
        dedicatedManager: false,
        teamTraining: false,
        onboardingHours: 0,

        projectTypes: 1,
        annualDiscount: 0,

        color: '#64748b',
        icon: 'Zap',

        features: {
            ar: [
                'مشروع واحد شهرياً',
                'تسعير أساسي (فيلا فقط)',
                'دعم بريد إلكتروني (72 ساعة)',
                'مساحة تخزين 25 ميجا'
            ],
            en: [
                '1 project per month',
                'Basic pricing (villa only)',
                'Email support (72h)',
                '25 MB storage'
            ],
            fr: [
                '1 projet par mois',
                'Tarification de base (villa uniquement)',
                'Assistance e-mail (72h)',
                'Stockage de 25 Mo'
            ],
            zh: [
                '每月1个项目',
                '基础定价（仅别墅）',
                '电子邮件支持（72小时）',
                '25 MB 存储空间'
            ]
        },
        restrictions: {
            encryptedSuppliers: true,
            limitedUsage: true,
            limitedSupport: true,
            noAIPricing: true,
            noDownload: true,
            noCompanyLogo: true
        }
    },

    // ═══════════════════════════════════════
    // 🟢 الأساسية — "المقاول الذكي" (149 ر.س)
    // ═══════════════════════════════════════
    {
        id: 'starter',
        name: { ar: 'الأساسية', en: 'Starter', fr: 'Essentiel', zh: '入门版' },
        price: 149,
        period: { ar: 'شهرياً', en: 'Monthly', fr: 'Mensuel', zh: '每月' },

        projectsIncluded: 5,
        extraProjectPrice: 39,
        storageMB: 200,
        extraStoragePrice: 15,
        maxRetentionDays: 180,

        aiBudgetItems: 100,
        extraAIPrice: 0.15,

        boqUploads: 3,
        extraBOQPrice: 19,

        employeesIncluded: 0,
        extraEmployeePrice: 0,

        commodityAccess: 'prices_only',
        brainLevel: 'basic',

        apiAccess: false,
        apiCallsIncluded: 0,
        extraAPICallPrice: 0,

        tenderReports: 0,
        extraTenderPrice: 0,
        customReports: false,
        whiteLabel: false,

        supportLevel: 'email_48h',
        dedicatedManager: false,
        teamTraining: false,
        onboardingHours: 0,

        projectTypes: 3,
        annualDiscount: 0.20,

        color: '#22c55e',
        icon: 'Rocket',

        features: {
            ar: [
                '5 مشاريع شهرياً',
                'تصنيف ذكي بالـ AI (100 بند)',
                'رفع 3 BOQ شهرياً',
                'تصدير PDF و Excel',
                'أسعار بورصة المواد',
                'تقارير الدماغ الأساسية',
                'مساحة تخزين 200 ميجا',
                '39 ر.س لكل مشروع إضافي'
            ],
            en: [
                '5 projects per month',
                'AI classification (100 items)',
                '3 BOQ uploads per month',
                'PDF & Excel export',
                'Commodity prices',
                'Basic brain reports',
                '200 MB storage',
                '39 SAR per extra project'
            ],
            fr: [
                '5 projets par mois',
                'Classification IA (100 éléments)',
                '3 téléversements BOQ par mois',
                'Export PDF et Excel',
                'Prix des matières premières',
                'Rapports intelligence de base',
                'Stockage de 200 Mo',
                '39 SAR par projet supplémentaire'
            ],
            zh: [
                '每月5个项目',
                'AI分类（100个项目）',
                '每月3次BOQ上传',
                'PDF和Excel导出',
                '商品价格',
                '基础智能报告',
                '200 MB 存储空间',
                '每个额外项目 39 SAR'
            ]
        },
        restrictions: {
            encryptedSuppliers: false,
            limitedUsage: false,
            limitedSupport: false,
            noAIPricing: false,
            noDownload: false,
            noCompanyLogo: true
        }
    },

    // ═══════════════════════════════════════
    // 🔵 الاحترافية — "الفريق المحترف" (399 ر.س) ⭐
    // ═══════════════════════════════════════
    {
        id: 'professional',
        name: { ar: 'الاحترافية', en: 'Professional', fr: 'Professionnel', zh: '专业版' },
        price: 399,
        period: { ar: 'شهرياً', en: 'Monthly', fr: 'Mensuel', zh: '每月' },

        projectsIncluded: 15,
        extraProjectPrice: 29,
        storageMB: 2048,
        extraStoragePrice: 12,
        maxRetentionDays: 365,

        aiBudgetItems: 500,
        extraAIPrice: 0.12,

        boqUploads: 10,
        extraBOQPrice: 15,

        employeesIncluded: 3,
        extraEmployeePrice: 49,

        commodityAccess: 'full',
        brainLevel: 'full',

        apiAccess: false,
        apiCallsIncluded: 0,
        extraAPICallPrice: 0,

        tenderReports: 2,
        extraTenderPrice: 59,
        customReports: false,
        whiteLabel: false,

        supportLevel: 'email_24h_whatsapp',
        dedicatedManager: false,
        teamTraining: false,
        onboardingHours: 0,

        projectTypes: 8,
        annualDiscount: 0.20,

        color: '#3b82f6',
        icon: 'Crown',
        badge: { ar: 'الأكثر شعبية', en: 'Most Popular', fr: 'Le Plus Populaire', zh: '最受欢迎' },

        features: {
            ar: [
                '15 مشروع شهرياً',
                'تصنيف AI متقدم (500 بند)',
                'رفع 10 BOQ شهرياً',
                'تصدير PDF + شعار شركتك',
                'بورصة مواد كاملة + تنبؤ 30 يوم',
                'دماغ ذكي كامل + Deviation Alerts',
                '3 موظفين + لوحة تحكم الفريق',
                'تقريرا مناقصة شهرياً',
                'مساحة تخزين 2 جيجا',
                'دعم واتساب (24 ساعة)'
            ],
            en: [
                '15 projects per month',
                'Advanced AI classification (500 items)',
                '10 BOQ uploads per month',
                'PDF export + your company logo',
                'Full commodity exchange + 30-day forecast',
                'Full brain engine + Deviation Alerts',
                '3 employees + team dashboard',
                '2 tender reports per month',
                '2 GB storage',
                'WhatsApp support (24h)'
            ],
            fr: [
                '15 projets par mois',
                'Classification IA avancée (500 éléments)',
                '10 téléversements BOQ par mois',
                'Export PDF + logo entreprise',
                'Bourse complète + prévision 30 jours',
                'Intelligence complète + alertes de déviation',
                '3 employés + tableau de bord équipe',
                '2 rapports d\'appel d\'offres par mois',
                'Stockage de 2 Go',
                'Assistance WhatsApp (24h)'
            ],
            zh: [
                '每月15个项目',
                '高级AI分类（500个项目）',
                '每月10次BOQ上传',
                'PDF导出 + 公司标志',
                '完整商品交易所 + 30天预测',
                '完整智能引擎 + 偏差警报',
                '3名员工 + 团队仪表板',
                '每月2份招标报告',
                '2 GB 存储空间',
                'WhatsApp支持（24小时）'
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

    // ═══════════════════════════════════════
    // 🟠 الأعمال — "شركة المقاولات" (999 ر.س)
    // ═══════════════════════════════════════
    {
        id: 'business',
        name: { ar: 'الأعمال', en: 'Business', fr: 'Affaires', zh: '商务版' },
        price: 999,
        period: { ar: 'شهرياً', en: 'Monthly', fr: 'Mensuel', zh: '每月' },

        projectsIncluded: 50,
        extraProjectPrice: 19,
        storageMB: 10240,
        extraStoragePrice: 10,
        maxRetentionDays: 730,

        aiBudgetItems: 2000,
        extraAIPrice: 0.10,

        boqUploads: -1,
        extraBOQPrice: 0,

        employeesIncluded: 10,
        extraEmployeePrice: 39,

        commodityAccess: 'full_alerts',
        brainLevel: 'full_plus',

        apiAccess: true,
        apiCallsIncluded: 1000,
        extraAPICallPrice: 0.05,

        tenderReports: 10,
        extraTenderPrice: 39,
        customReports: false,
        whiteLabel: false,

        supportLevel: 'email_12h_phone',
        dedicatedManager: false,
        teamTraining: false,
        onboardingHours: 1,

        projectTypes: -1,
        annualDiscount: 0.20,

        color: '#f59e0b',
        icon: 'Building2',
        badge: { ar: 'أفضل قيمة', en: 'Best Value', fr: 'Meilleur Rapport', zh: '最佳价值' },

        features: {
            ar: [
                '50 مشروع شهرياً',
                'تصنيف AI متقدم+ (2,000 بند)',
                'رفع BOQ غير محدود',
                'بورصة كاملة + تنبيهات ذكية',
                'دماغ ذكي كامل+ (Contextual Baselines)',
                '10 موظفين + صلاحيات متقدمة',
                'API Access (1,000 call/شهر)',
                '10 تقارير مناقصة شهرياً',
                'مساحة تخزين 10 جيجا',
                'دعم هاتفي (12 ساعة) + Onboarding'
            ],
            en: [
                '50 projects per month',
                'Advanced AI+ (2,000 items)',
                'Unlimited BOQ uploads',
                'Full commodity + smart alerts',
                'Full brain+ (Contextual Baselines)',
                '10 employees + advanced roles',
                'API Access (1,000 calls/month)',
                '10 tender reports per month',
                '10 GB storage',
                'Phone support (12h) + Onboarding'
            ],
            fr: [
                '50 projets par mois',
                'IA avancée+ (2 000 éléments)',
                'Téléversements BOQ illimités',
                'Bourse complète + alertes intelligentes',
                'Intelligence complète+ (référentiels contextuels)',
                '10 employés + rôles avancés',
                'Accès API (1 000 appels/mois)',
                '10 rapports d\'appel d\'offres par mois',
                'Stockage de 10 Go',
                'Assistance téléphonique (12h) + intégration'
            ],
            zh: [
                '每月50个项目',
                '高级AI+（2,000个项目）',
                '无限BOQ上传',
                '完整商品 + 智能警报',
                '完整智能+（上下文基准）',
                '10名员工 + 高级角色',
                'API访问（每月1,000次调用）',
                '每月10份招标报告',
                '10 GB 存储空间',
                '电话支持（12小时）+ 入门培训'
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
    },

    // ═══════════════════════════════════════
    // 🔴 المنشآت — "المؤسسة الكبرى" (1,999 ر.س)
    // ═══════════════════════════════════════
    {
        id: 'enterprise',
        name: { ar: 'المنشآت', en: 'Enterprise', fr: 'Entreprise', zh: '企业版' },
        price: 1999,
        period: { ar: 'شهرياً', en: 'Monthly', fr: 'Mensuel', zh: '每月' },

        projectsIncluded: -1,
        extraProjectPrice: 0,
        storageMB: 51200,
        extraStoragePrice: 8,
        maxRetentionDays: -1,

        aiBudgetItems: -1,
        extraAIPrice: 0,

        boqUploads: -1,
        extraBOQPrice: 0,

        employeesIncluded: 25,
        extraEmployeePrice: 29,

        commodityAccess: 'full_alerts',
        brainLevel: 'full_plus',

        apiAccess: true,
        apiCallsIncluded: -1,
        extraAPICallPrice: 0,

        tenderReports: -1,
        extraTenderPrice: 0,
        customReports: true,
        whiteLabel: true,

        supportLevel: 'sla_4h_dedicated',
        dedicatedManager: true,
        teamTraining: true,
        onboardingHours: 3,

        projectTypes: -1,
        annualDiscount: 0.20,

        color: '#8b5cf6',
        icon: 'Shield',

        features: {
            ar: [
                'مشاريع غير محدودة',
                'تصنيف AI غير محدود',
                'رفع BOQ غير محدود',
                'بورصة كاملة + تنبيهات + تقارير',
                'دماغ ذكي كامل+ (Collective Brain)',
                '25 موظف + صلاحيات مخصصة',
                'API غير محدود + Webhook + ERP',
                'تقارير مناقصة غير محدودة + مخصصة',
                'مساحة تخزين 50 جيجا',
                'مدير حساب مخصص + SLA 4 ساعات',
                'تدريب الفريق + White-label',
                'Onboarding مخصص (3 ساعات)'
            ],
            en: [
                'Unlimited projects',
                'Unlimited AI classification',
                'Unlimited BOQ uploads',
                'Full commodity + alerts + reports',
                'Full brain+ (Collective Brain)',
                '25 employees + custom roles',
                'Unlimited API + Webhook + ERP',
                'Unlimited tender reports + custom',
                '50 GB storage',
                'Dedicated account manager + 4h SLA',
                'Team training + White-label',
                'Custom onboarding (3 hours)'
            ],
            fr: [
                'Projets illimités',
                'Classification IA illimitée',
                'Téléversements BOQ illimités',
                'Bourse complète + alertes + rapports',
                'Intelligence complète+ (cerveau collectif)',
                '25 employés + rôles personnalisés',
                'API illimité + Webhook + ERP',
                'Rapports d\'appel d\'offres illimités + personnalisés',
                'Stockage de 50 Go',
                'Gestionnaire de compte dédié + SLA 4h',
                'Formation d\'équipe + marque blanche',
                'Intégration personnalisée (3 heures)'
            ],
            zh: [
                '无限项目',
                '无限AI分类',
                '无限BOQ上传',
                '完整商品 + 警报 + 报告',
                '完整智能+（集体大脑）',
                '25名员工 + 自定义角色',
                '无限API + Webhook + ERP',
                '无限招标报告 + 自定义',
                '50 GB 存储空间',
                '专属客户经理 + 4小时SLA',
                '团队培训 + 白标',
                '定制入门培训（3小时）'
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

// ═══════════════════════════════════════════════════════════════
// V2 Helper Functions — 5-Tier System
// ═══════════════════════════════════════════════════════════════

/** Get remaining AI budget items for the month */
export const getAIBudgetRemaining = (planId: string, usedItems: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (plan.aiBudgetItems === -1) return -1; // Unlimited
    if (plan.aiBudgetItems === 0) return 0;   // Not available
    return Math.max(0, plan.aiBudgetItems - usedItems);
};

/** Get remaining BOQ uploads for the month */
export const getBOQUploadsRemaining = (planId: string, usedUploads: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (plan.boqUploads === -1) return -1;
    if (plan.boqUploads === 0) return 0;
    return Math.max(0, plan.boqUploads - usedUploads);
};

/** Get remaining employee slots */
export const getEmployeeSlotsRemaining = (planId: string, usedSlots: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (plan.employeesIncluded === 0) return 0;
    return Math.max(0, plan.employeesIncluded - usedSlots);
};

/** Get remaining API calls for the month */
export const getAPICallsRemaining = (planId: string, usedCalls: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (!plan.apiAccess) return 0;
    if (plan.apiCallsIncluded === -1) return -1;
    return Math.max(0, plan.apiCallsIncluded - usedCalls);
};

/** Get remaining tender reports for the month */
export const getTenderReportsRemaining = (planId: string, usedReports: number): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    if (plan.tenderReports === -1) return -1;
    if (plan.tenderReports === 0) return 0;
    return Math.max(0, plan.tenderReports - usedReports);
};

/** Calculate annual price with discount */
export const getPlanAnnualPrice = (planId: string): { monthly: number; annual: number; saved: number; discount: number } => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return { monthly: 0, annual: 0, saved: 0, discount: 0 };
    const monthlyTotal = plan.price * 12;
    const annual = Math.round(monthlyTotal * (1 - plan.annualDiscount));
    return {
        monthly: plan.price,
        annual,
        saved: monthlyTotal - annual,
        discount: plan.annualDiscount
    };
};

/** Plan tier ordering (for upgrade/downgrade comparison) */
export const PLAN_TIER_ORDER: Record<string, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    business: 3,
    enterprise: 4
};

/** Check if plan A is higher tier than plan B */
export const isPlanHigherTier = (planA: string, planB: string): boolean => {
    return (PLAN_TIER_ORDER[planA] || 0) > (PLAN_TIER_ORDER[planB] || 0);
};

/** Get the next upgrade plan */
export const getNextUpgradePlan = (currentPlanId: string): SubscriptionPlan | null => {
    const currentTier = PLAN_TIER_ORDER[currentPlanId] ?? -1;
    return SUBSCRIPTION_PLANS.find(p => (PLAN_TIER_ORDER[p.id] ?? -1) === currentTier + 1) || null;
};

/** Universal feature access checker with soft nudge support */
export const canAccessFeature = (planId: string, feature: string, used?: number): {
    allowed: boolean;
    remaining?: number;
    limit?: number;
    nudge?: string;
    nudgeAr?: string;
    upgradeTarget?: string;
} => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return { allowed: false };

    const nextPlan = getNextUpgradePlan(planId);
    const nudgeTarget = nextPlan?.id;

    switch (feature) {
        case 'ai': {
            if (plan.aiBudgetItems === 0) return { allowed: false, upgradeTarget: nudgeTarget, nudge: 'Upgrade to unlock AI classification', nudgeAr: 'ترقّ لفتح التصنيف الذكي' };
            if (plan.aiBudgetItems === -1) return { allowed: true, remaining: -1 };
            const remaining = plan.aiBudgetItems - (used || 0);
            const atLimit = remaining <= Math.ceil(plan.aiBudgetItems * 0.2);
            return { allowed: remaining > 0, remaining, limit: plan.aiBudgetItems, nudge: atLimit ? `${remaining} AI items left — upgrade for more` : undefined, nudgeAr: atLimit ? `متبقي ${remaining} بند AI — ترقّ للمزيد` : undefined, upgradeTarget: atLimit ? nudgeTarget : undefined };
        }
        case 'boq': {
            if (plan.boqUploads === 0) return { allowed: false, upgradeTarget: nudgeTarget, nudge: 'Upgrade to upload BOQ files', nudgeAr: 'ترقّ لرفع ملفات BOQ' };
            if (plan.boqUploads === -1) return { allowed: true, remaining: -1 };
            const remaining = plan.boqUploads - (used || 0);
            return { allowed: remaining > 0, remaining, limit: plan.boqUploads, upgradeTarget: remaining <= 1 ? nudgeTarget : undefined, nudge: remaining <= 1 ? `${remaining} BOQ upload left` : undefined, nudgeAr: remaining <= 1 ? `متبقي ${remaining} رفع BOQ` : undefined };
        }
        case 'projects': {
            if (plan.projectsIncluded === -1) return { allowed: true, remaining: -1 };
            const remaining = plan.projectsIncluded - (used || 0);
            const atLimit = remaining <= 1;
            return { allowed: remaining > 0, remaining, limit: plan.projectsIncluded, nudge: atLimit ? `${remaining} project left — upgrade for more` : undefined, nudgeAr: atLimit ? `متبقي ${remaining} مشروع — ترقّ للمزيد` : undefined, upgradeTarget: atLimit ? nudgeTarget : undefined };
        }
        case 'employees': {
            if (plan.employeesIncluded === 0) return { allowed: false, upgradeTarget: nudgeTarget, nudge: 'Upgrade to add team members', nudgeAr: 'ترقّ لإضافة أعضاء الفريق' };
            const remaining = plan.employeesIncluded - (used || 0);
            return { allowed: remaining > 0, remaining, limit: plan.employeesIncluded, upgradeTarget: remaining <= 1 ? nudgeTarget : undefined };
        }
        case 'api': {
            if (!plan.apiAccess) return { allowed: false, upgradeTarget: nudgeTarget, nudge: 'Upgrade to access API', nudgeAr: 'ترقّ للوصول لـ API' };
            if (plan.apiCallsIncluded === -1) return { allowed: true, remaining: -1 };
            const remaining = plan.apiCallsIncluded - (used || 0);
            return { allowed: remaining > 0, remaining, limit: plan.apiCallsIncluded };
        }
        case 'commodity': {
            if (plan.commodityAccess === 'none') return { allowed: false, upgradeTarget: nudgeTarget, nudge: 'Upgrade to access commodity exchange', nudgeAr: 'ترقّ للوصول لبورصة المواد' };
            return { allowed: true };
        }
        case 'tender_reports': {
            if (plan.tenderReports === 0) return { allowed: false, upgradeTarget: nudgeTarget };
            if (plan.tenderReports === -1) return { allowed: true, remaining: -1 };
            const remaining = plan.tenderReports - (used || 0);
            return { allowed: remaining > 0, remaining, limit: plan.tenderReports };
        }
        default:
            return { allowed: true };
    }
};

/** Free Plan restrictions constant (backward compat) */
export const FREE_PLAN_RESTRICTIONS = {
    maxProjects: 1,
    maxStorageMB: 25,
    encryptedSuppliers: true,
    noDownload: true,
    noAIPricing: true,
    noCompanyLogo: true,
    maxRetentionDays: 30,
    projectTypes: 1
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

    // V2 Plan Names
    starter_plan: { ar: 'الباقة الأساسية', en: 'Starter Plan', fr: 'Plan Essentiel', zh: '入门计划' },
    business_plan: { ar: 'باقة الأعمال', en: 'Business Plan', fr: 'Plan Affaires', zh: '商务计划' },

    // Billing Toggle
    billing_monthly: { ar: 'شهري', en: 'Monthly', fr: 'Mensuel', zh: '月付' },
    billing_annual: { ar: 'سنوي', en: 'Annual', fr: 'Annuel', zh: '年付' },
    billing_save: { ar: 'وفّر', en: 'Save', fr: 'Économisez', zh: '节省' },
    billing_per_month: { ar: '/شهر', en: '/mo', fr: '/mois', zh: '/月' },
    billing_per_year: { ar: '/سنة', en: '/yr', fr: '/an', zh: '/年' },
    billing_billed_annually: { ar: 'يُدفع سنوياً', en: 'Billed annually', fr: 'Facturé annuellement', zh: '按年计费' },

    // Feature Categories
    feat_ai_items: { ar: 'تصنيف AI بنود', en: 'AI item classification', fr: 'Classification IA', zh: 'AI项目分类' },
    feat_boq_uploads: { ar: 'رفع BOQ', en: 'BOQ uploads', fr: 'Téléversements BOQ', zh: 'BOQ上传' },
    feat_commodity: { ar: 'بورصة المواد', en: 'Commodity Exchange', fr: 'Bourse des Matières', zh: '商品交易所' },
    feat_brain: { ar: 'الدماغ الذكي', en: 'Brain Engine', fr: 'Intelligence', zh: '智能引擎' },
    feat_employees: { ar: 'الموظفين', en: 'Employees', fr: 'Employés', zh: '员工' },
    feat_api: { ar: 'وصول API', en: 'API Access', fr: 'Accès API', zh: 'API访问' },
    feat_tender: { ar: 'تقارير المناقصات', en: 'Tender Reports', fr: "Rapports d'Appels d'Offres", zh: '招标报告' },
    feat_support: { ar: 'الدعم الفني', en: 'Support', fr: 'Assistance', zh: '技术支持' },
    feat_onboarding: { ar: 'تدريب البدء', en: 'Onboarding', fr: 'Intégration', zh: '入门培训' },
    feat_whitelabel: { ar: 'تخصيص العلامة', en: 'White-label', fr: 'Marque blanche', zh: '白标' },
    feat_custom_reports: { ar: 'تقارير مخصصة', en: 'Custom Reports', fr: 'Rapports Personnalisés', zh: '自定义报告' },

    // Micro-transactions
    extra_ai_item: { ar: 'بند AI إضافي', en: 'Extra AI item', fr: 'Élément IA supplémentaire', zh: '额外AI项目' },
    extra_boq: { ar: 'BOQ إضافي', en: 'Extra BOQ upload', fr: 'Téléversement BOQ supplémentaire', zh: '额外BOQ上传' },
    extra_employee: { ar: 'موظف إضافي', en: 'Extra employee', fr: 'Employé supplémentaire', zh: '额外员工' },
    extra_storage: { ar: 'تخزين إضافي', en: 'Extra storage', fr: 'Stockage supplémentaire', zh: '额外存储' },
    extra_api_call: { ar: 'API call إضافي', en: 'Extra API call', fr: 'Appel API supplémentaire', zh: '额外API调用' },
    extra_tender: { ar: 'تقرير مناقصة إضافي', en: 'Extra tender report', fr: "Rapport d'appel d'offres supplémentaire", zh: '额外招标报告' },

    // Pricing Page
    pricing_title: { ar: 'خطط التسعير', en: 'Pricing Plans', fr: 'Plans Tarifaires', zh: '定价方案' },
    pricing_subtitle: { ar: 'اختر الباقة المناسبة لحجم أعمالك', en: 'Choose the plan that fits your business', fr: 'Choisissez le plan adapté à votre entreprise', zh: '选择适合您业务的方案' },
    pricing_compare: { ar: 'قارن الباقات', en: 'Compare Plans', fr: 'Comparer les Plans', zh: '比较方案' },
    pricing_faq: { ar: 'أسئلة شائعة', en: 'FAQ', fr: 'Questions Fréquentes', zh: '常见问题' },
    pricing_addons: { ar: 'الإضافات', en: 'Add-ons', fr: 'Suppléments', zh: '附加功能' },
    pricing_contact_sales: { ar: 'تكلم مع المبيعات', en: 'Contact Sales', fr: 'Contacter les Ventes', zh: '联系销售' },
    pricing_start_free: { ar: 'ابدأ مجاناً', en: 'Start Free', fr: 'Commencer Gratuitement', zh: '免费开始' },
    pricing_best_value: { ar: 'أفضل قيمة', en: 'Best Value', fr: 'Meilleur Rapport', zh: '最佳价值' },
    pricing_view_all: { ar: 'شاهد كل الباقات', en: 'View all plans', fr: 'Voir tous les plans', zh: '查看所有方案' },

    // Soft Nudge Messages
    nudge_projects_low: { ar: 'أوشكت على حد المشاريع', en: 'Running low on projects', fr: 'Projets presque épuisés', zh: '项目即将用完' },
    nudge_ai_low: { ar: 'أوشكت على حد الـ AI', en: 'Running low on AI items', fr: 'Éléments IA presque épuisés', zh: 'AI项目即将用完' },
    nudge_boq_low: { ar: 'أوشكت على حد الـ BOQ', en: 'Running low on BOQ uploads', fr: 'Téléversements BOQ presque épuisés', zh: 'BOQ上传即将用完' },
    nudge_upgrade_cta: { ar: 'ترقّ الآن', en: 'Upgrade Now', fr: 'Mettre à Niveau', zh: '立即升级' },

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

// Free plan restrictions warning messages (for display in UI)
export const FREE_PLAN_WARNING_MESSAGES: Record<string, string[]> = {
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
