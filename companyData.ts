// Company Data - Arba Pricing
// شركة أربا للتسعير

export const COMPANY_INFO = {
    name: {
        ar: 'أربا للتسعير',
        en: 'Arba Pricing'
    },
    tagline: {
        ar: 'شريكك الموثوق في تسعير المشاريع',
        en: 'Your Trusted Partner in Project Pricing'
    },
    email: 'info@arba-sys.com',
    phone: '+966591529339',
    location: {
        ar: 'الرياض، المملكة العربية السعودية',
        en: 'Riyadh, Saudi Arabia'
    },
    workingHours: {
        ar: '9 صباحاً - 5 مساءً',
        en: '9 AM - 5 PM'
    },
    website: 'https://arba-sys.com',

    about: {
        ar: 'شركة وطنية رائدة في مجال تسعير المشاريع الإنشائية. نجمع بين الخبرة العميقة والتقنيات الحديثة لتقديم خدمات تسعير دقيقة وموثوقة تدعم نجاح مشاريعكم.',
        en: 'A leading national company in construction project pricing. We combine deep expertise with modern technologies to provide accurate and reliable pricing services that support the success of your projects.'
    },

    vision: {
        ar: 'نهدف إلى إعادة تعريف معايير صناعة التسعير من خلال تقديم خدمات احترافية تعكس التزامنا بالدقة والشفافية، ودعم رؤية 2030 في بناء بيئة استثمارية متميزة.',
        en: 'We aim to redefine pricing industry standards by providing professional services that reflect our commitment to accuracy and transparency, supporting Vision 2030 in building a distinguished investment environment.'
    },

    mission: {
        ar: 'تمكين المقاولين والمطورين من اتخاذ قرارات مالية سليمة من خلال توفير تسعير دقيق وشامل لجميع بنود المشاريع الإنشائية.',
        en: 'Empowering contractors and developers to make sound financial decisions by providing accurate and comprehensive pricing for all construction project items.'
    }
};

export const SERVICES = [
    {
        id: 'project-pricing',
        icon: 'Calculator',
        title: {
            ar: 'تسعير المشاريع الإنشائية',
            en: 'Construction Project Pricing'
        },
        description: {
            ar: 'تسعير شامل ودقيق لجميع بنود المشاريع الإنشائية بأسعار السوق الحالية',
            en: 'Comprehensive and accurate pricing for all construction project items at current market prices'
        }
    },
    {
        id: 'boq',
        icon: 'FileSpreadsheet',
        title: {
            ar: 'إعداد جداول الكميات',
            en: 'BOQ Preparation'
        },
        description: {
            ar: 'حصر كميات مفصل ودقيق لجميع أعمال المشروع وفق المواصفات القياسية',
            en: 'Detailed and accurate quantity surveying for all project works according to standard specifications'
        }
    },
    {
        id: 'feasibility',
        icon: 'TrendingUp',
        title: {
            ar: 'دراسات الجدوى التسعيرية',
            en: 'Pricing Feasibility Studies'
        },
        description: {
            ar: 'تحليل شامل للتكاليف والعوائد المتوقعة لضمان جدوى المشروع',
            en: 'Comprehensive analysis of costs and expected returns to ensure project feasibility'
        }
    },
    {
        id: 'consultation',
        icon: 'MessageSquare',
        title: {
            ar: 'استشارات التسعير',
            en: 'Pricing Consultation'
        },
        description: {
            ar: 'مراجعة وتدقيق عروض الأسعار وتقديم التوصيات لتحسين التنافسية',
            en: 'Review and audit of price quotes and providing recommendations to improve competitiveness'
        }
    }
];

export const FEATURES = [
    {
        icon: 'Shield',
        title: {
            ar: 'دقة عالية',
            en: 'High Accuracy'
        },
        description: {
            ar: 'أسعار محدثة ودقيقة من السوق السعودي',
            en: 'Updated and accurate prices from the Saudi market'
        }
    },
    {
        icon: 'Zap',
        title: {
            ar: 'سرعة في الإنجاز',
            en: 'Fast Delivery'
        },
        description: {
            ar: 'إنجاز التسعير في وقت قياسي',
            en: 'Pricing completed in record time'
        }
    },
    {
        icon: 'Users',
        title: {
            ar: 'فريق متخصص',
            en: 'Specialized Team'
        },
        description: {
            ar: 'خبراء في حصر الكميات والتسعير',
            en: 'Experts in quantity surveying and pricing'
        }
    },
    {
        icon: 'Award',
        title: {
            ar: 'خبرة واسعة',
            en: 'Extensive Experience'
        },
        description: {
            ar: 'سنوات من الخبرة في السوق السعودي',
            en: 'Years of experience in the Saudi market'
        }
    }
];

// Subscription Plans with detailed features
export interface SubscriptionPlan {
    id: string;
    name: { ar: string; en: string };
    price: number;
    period: { ar: string; en: string };
    projectsIncluded: number; // -1 = unlimited
    extraProjectPrice: number; // Price per extra project
    storageMB: number; // Storage in MB
    features: { ar: string[]; en: string[] };
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
            en: 'Free'
        },
        price: 0,
        period: {
            ar: 'مجاني',
            en: 'Free'
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
            en: 'Professional'
        },
        price: 499,
        period: {
            ar: 'شهرياً',
            en: 'Monthly'
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
            en: 'Enterprise'
        },
        price: 1499,
        period: {
            ar: 'شهرياً',
            en: 'Monthly'
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

export const PAGE_TRANSLATIONS = {
    // Navigation
    nav_home: { ar: 'الرئيسية', en: 'Home' },
    nav_services: { ar: 'خدماتنا', en: 'Services' },
    nav_about: { ar: 'عن الشركة', en: 'About' },
    nav_pricing: { ar: 'الأسعار', en: 'Pricing' },
    nav_contact: { ar: 'تواصل معنا', en: 'Contact' },
    nav_login: { ar: 'تسجيل الدخول', en: 'Login' },
    nav_register: { ar: 'إنشاء حساب', en: 'Register' },
    nav_dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
    nav_logout: { ar: 'تسجيل الخروج', en: 'Logout' },

    // Hero Section
    hero_title: { ar: 'منصة التسعير الذكية للمشاريع الإنشائية', en: 'Smart Pricing Platform for Construction Projects' },
    hero_subtitle: { ar: 'أسعار دقيقة ومحدثة • حصر كميات احترافي • تقارير تفصيلية', en: 'Accurate & Updated Prices • Professional BOQ • Detailed Reports' },
    hero_cta: { ar: 'ابدأ الآن مجاناً', en: 'Start Free Now' },
    hero_cta_secondary: { ar: 'تعرف على المزيد', en: 'Learn More' },

    // Sections
    section_services: { ar: 'خدماتنا', en: 'Our Services' },
    section_services_subtitle: { ar: 'حلول متكاملة لتسعير مشاريعكم', en: 'Complete solutions for your project pricing' },
    section_why_us: { ar: 'لماذا تختارنا؟', en: 'Why Choose Us?' },
    section_plans: { ar: 'خطط الاشتراك', en: 'Subscription Plans' },
    section_contact: { ar: 'تواصل معنا', en: 'Contact Us' },

    // Login Page
    login_title: { ar: 'تسجيل الدخول', en: 'Login' },
    login_email: { ar: 'البريد الإلكتروني', en: 'Email' },
    login_password: { ar: 'كلمة المرور', en: 'Password' },
    login_remember: { ar: 'تذكرني', en: 'Remember me' },
    login_forgot: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
    login_submit: { ar: 'دخول', en: 'Login' },
    login_no_account: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
    login_create_account: { ar: 'إنشاء حساب جديد', en: 'Create new account' },

    // Register Page
    register_title: { ar: 'إنشاء حساب جديد', en: 'Create New Account' },
    register_name: { ar: 'الاسم الكامل', en: 'Full Name' },
    register_email: { ar: 'البريد الإلكتروني', en: 'Email' },
    register_phone: { ar: 'رقم الجوال', en: 'Phone Number' },
    register_company: { ar: 'اسم الشركة', en: 'Company Name' },
    register_password: { ar: 'كلمة المرور', en: 'Password' },
    register_confirm_password: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
    register_plan: { ar: 'اختر خطة الاشتراك', en: 'Choose Subscription Plan' },
    register_terms: { ar: 'أوافق على الشروط والأحكام', en: 'I agree to the Terms and Conditions' },
    register_submit: { ar: 'إنشاء الحساب', en: 'Create Account' },
    register_have_account: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
    register_login: { ar: 'تسجيل الدخول', en: 'Login' },

    // About Page
    about_title: { ar: 'عن أربا للتسعير', en: 'About Arba Pricing' },
    about_vision: { ar: 'رؤيتنا', en: 'Our Vision' },
    about_mission: { ar: 'مهمتنا', en: 'Our Mission' },

    // Footer
    footer_rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
    footer_privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    footer_terms: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },

    // Common
    get_started: { ar: 'ابدأ الآن', en: 'Get Started' },
    learn_more: { ar: 'اعرف المزيد', en: 'Learn More' },
    choose_plan: { ar: 'اختر الخطة', en: 'Choose Plan' },
    popular: { ar: 'الأكثر شعبية', en: 'Most Popular' },
    sar: { ar: 'ريال', en: 'SAR' },

    // Subscription Features
    encrypted_suppliers: { ar: 'أسماء الموردين مشفرة', en: 'Encrypted supplier names' },
    limited_usage: { ar: 'استخدام محدود', en: 'Limited usage' },
    limited_support: { ar: 'دعم محدود', en: 'Limited support' },
    no_ai_pricing: { ar: 'بدون تسعير ذكي', en: 'No AI pricing' },
    no_download: { ar: 'التنزيل غير متاح', en: 'Download not available' },
    upgrade_to_unlock: { ar: 'قم بالترقية لفتح هذه الميزة', en: 'Upgrade to unlock this feature' },
    projects_remaining: { ar: 'المشاريع المتبقية', en: 'Projects remaining' },
    storage_used: { ar: 'المساحة المستخدمة', en: 'Storage used' },
    extra_project_cost: { ar: 'تكلفة المشروع الإضافي', en: 'Extra project cost' },
    unlimited: { ar: 'غير محدود', en: 'Unlimited' },
    per_project: { ar: 'لكل مشروع', en: 'per project' }
};

// Free plan restrictions messages
export const FREE_PLAN_RESTRICTIONS = {
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
    ]
};
