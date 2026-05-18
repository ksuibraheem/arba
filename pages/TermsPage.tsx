/**
 * Terms of Service — شروط الاستخدام
 * صفحة الشروط والأحكام لمنصة آربا للتسعير
 */

import React, { useState } from 'react';
import { Language } from '../types';
import { Shield, FileText, Scale, Lock, Globe, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface TermsPageProps {
    language: Language;
    onBack?: () => void;
}

const SECTIONS = [
    {
        icon: <FileText className="w-5 h-5" />,
        title: { ar: 'مقدمة وتعريفات', en: 'Introduction & Definitions' },
        content: {
            ar: `مرحباً بك في منصة آربا للتسعير ("المنصة"، "الخدمة")، المملوكة والمشغّلة بواسطة مؤسسة آربا للحلول الرقمية ("آربا"، "نحن"). باستخدامك للمنصة، فأنت توافق على الالتزام بهذه الشروط والأحكام.

• "المستخدم" — أي شخص أو كيان يصل إلى المنصة أو يستخدمها.
• "المشترك" — مستخدم لديه باقة مدفوعة (أساسية، احترافية، أعمال، أو منشآت).
• "المورد" — طرف ثالث مسجل لعرض منتجاته ومواده عبر المنصة.
• "المحتوى" — جميع البيانات، الأسعار، التقارير، والملفات المُنشأة عبر المنصة.`,
            en: `Welcome to Arba Pricing Platform ("Platform", "Service"), owned and operated by Arba Digital Solutions ("Arba", "we"). By using the Platform, you agree to these Terms and Conditions.

• "User" — Any person or entity accessing or using the Platform.
• "Subscriber" — A user with a paid plan (Starter, Professional, Business, or Enterprise).
• "Supplier" — A third party registered to list products and materials.
• "Content" — All data, prices, reports, and files generated via the Platform.`,
        },
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: { ar: 'الخصوصية وحماية البيانات', en: 'Privacy & Data Protection' },
        content: {
            ar: `نلتزم بحماية بياناتك وفقاً لأعلى المعايير:

1. التشفير: جميع البيانات مشفرة أثناء النقل (TLS 1.3) وأثناء التخزين (AES-256).
2. العزل الكامل: بيانات كل مشترك معزولة تماماً عن المشتركين الآخرين.
3. عدم المشاركة: لا نبيع أو نشارك بياناتك مع أطراف ثالثة إلا بموافقتك الصريحة.
4. حق الحذف: يمكنك طلب حذف جميع بياناتك نهائياً في أي وقت.
5. الوصول المحدود: لا يستطيع مديرو النظام الوصول لبيانات الحسابات أو التفاصيل المالية.
6. النسخ الاحتياطي: نحتفظ بنسخ احتياطية مشفرة لمدة 90 يوماً.`,
            en: `We are committed to protecting your data to the highest standards:

1. Encryption: All data encrypted in transit (TLS 1.3) and at rest (AES-256).
2. Full Isolation: Each subscriber's data is completely isolated from others.
3. No Sharing: We never sell or share your data with third parties without explicit consent.
4. Right to Delete: You may request permanent deletion of all your data at any time.
5. Limited Access: System administrators cannot access account data or financial details.
6. Backups: We maintain encrypted backups for 90 days.`,
        },
    },
    {
        icon: <Scale className="w-5 h-5" />,
        title: { ar: 'الاشتراكات والدفع', en: 'Subscriptions & Payment' },
        content: {
            ar: `1. الباقات: تتوفر 5 باقات (مجانية، أساسية، احترافية، أعمال، منشآت) بأسعار وميزات مختلفة.
2. الفوترة: تتم الفوترة شهرياً أو سنوياً حسب اختيارك. الدفع السنوي يوفر خصماً.
3. الترقية: يمكنك الترقية في أي وقت. يتم احتساب الفرق تناسبياً.
4. التخفيض: عند التخفيض، تبقى مشاريعك محفوظة لكن التعديل يقتصر على حصة الباقة الجديدة.
5. الإلغاء: يمكنك إلغاء اشتراكك في أي وقت. تبقى بياناتك متاحة حتى نهاية فترة الفوترة.
6. الاسترداد: لا يتم استرداد المبالغ المدفوعة إلا في حالات استثنائية يحددها فريق الدعم.
7. الضريبة: جميع الأسعار لا تشمل ضريبة القيمة المضافة (15%).`,
            en: `1. Plans: 5 plans available (Free, Starter, Professional, Business, Enterprise) with different prices and features.
2. Billing: Billed monthly or annually at your choice. Annual billing offers a discount.
3. Upgrades: Upgrade anytime. The difference is calculated proportionally.
4. Downgrades: When downgrading, your projects are preserved but editing is limited to the new plan quota.
5. Cancellation: Cancel anytime. Your data remains available until the end of the billing period.
6. Refunds: Refunds are not provided except in exceptional cases determined by our support team.
7. Tax: All prices exclude VAT (15%).`,
        },
    },
    {
        icon: <Lock className="w-5 h-5" />,
        title: { ar: 'الملكية الفكرية', en: 'Intellectual Property' },
        content: {
            ar: `1. ملكية المنصة: جميع حقوق الملكية الفكرية للمنصة (الكود، التصميم، الخوارزميات، العلامة التجارية) مملوكة حصرياً لآربا.
2. ملكية البيانات: أنت تملك بياناتك ومشاريعك بالكامل. آربا لا تدّعي أي حق ملكية على محتواك.
3. التسعير المرجعي: أسعار قاعدة البيانات المرجعية هي ملكية فكرية لآربا ولا يجوز نسخها أو إعادة توزيعها.
4. الذكاء الاصطناعي: نماذج الذكاء الاصطناعي المدربة هي ملكية آربا. نتائج التسعير التي تحصل عليها هي ملكك.
5. الشعار والعلامة: لا يجوز استخدام شعار أو اسم آربا دون إذن كتابي مسبق.`,
            en: `1. Platform Ownership: All IP rights (code, design, algorithms, brand) are exclusively owned by Arba.
2. Data Ownership: You fully own your data and projects. Arba claims no ownership over your content.
3. Benchmark Pricing: Reference database prices are Arba's IP and may not be copied or redistributed.
4. AI Models: Trained AI models are Arba's property. Pricing results you obtain are yours.
5. Logo & Brand: Use of Arba's logo or name requires prior written permission.`,
        },
    },
    {
        icon: <Globe className="w-5 h-5" />,
        title: { ar: 'نظام الموردين و RFQ', en: 'Supplier System & RFQ' },
        content: {
            ar: `1. تسجيل المورد: التسجيل مجاني مع مساحة تخزين محدودة (50 ميجا). يمكن شراء مساحة إضافية.
2. عمولة RFQ: تُفرض عمولة على كل طلب عرض سعر (RFQ) يقبله المورد:
   • 2.5% رسوم بوابة الدفع
   • 10 ر.س رسوم ثابتة
   • 3.5% هامش ربح آربا
3. قفل البيانات: بيانات العميل (هاتف، بريد، عنوان) تبقى مخفية عن المورد حتى يتم دفع العمولة.
4. التسليم: المورد مسؤول عن تسليم المواد وفق المواصفات المتفق عليها.
5. حل النزاعات: في حالة النزاع، يقوم فريق آربا بالتحكيم وفق سياسة حل النزاعات.
6. التقييم: يحق للعميل تقييم المورد بعد إتمام العملية.`,
            en: `1. Supplier Registration: Registration is free with limited storage (50 MB). Additional storage can be purchased.
2. RFQ Commission: A commission is charged on each accepted RFQ:
   • 2.5% payment gateway fee
   • 10 SAR fixed fee
   • 3.5% Arba profit margin
3. Data Lock: Client data (phone, email, address) remains hidden until commission is paid.
4. Delivery: Suppliers are responsible for delivering materials per agreed specifications.
5. Dispute Resolution: In case of dispute, Arba's team arbitrates per the dispute resolution policy.
6. Rating: Clients may rate suppliers after completion.`,
        },
    },
    {
        icon: <AlertTriangle className="w-5 h-5" />,
        title: { ar: 'إخلاء المسؤولية', en: 'Disclaimer' },
        content: {
            ar: `1. دقة الأسعار: أسعار التسعير المرجعية تقريبية ومبنية على بيانات السوق المتاحة. آربا لا تضمن دقتها بنسبة 100%.
2. الاستخدام المهني: المنصة أداة مساعدة وليست بديلاً عن الحكم المهني لمهندس الكميات.
3. التوفر: نسعى لتوفير المنصة 99.9% من الوقت، لكن قد تحدث انقطاعات للصيانة.
4. التحديثات: نحتفظ بحق تحديث هذه الشروط. سيتم إخطارك بأي تغييرات جوهرية.
5. القانون الحاكم: تخضع هذه الشروط لأنظمة المملكة العربية السعودية.
6. الاختصاص القضائي: أي نزاع يُحال للمحاكم المختصة في المملكة العربية السعودية.`,
            en: `1. Price Accuracy: Benchmark prices are approximate and based on available market data. Arba does not guarantee 100% accuracy.
2. Professional Use: The Platform is an assistive tool, not a substitute for professional QS judgment.
3. Availability: We aim for 99.9% uptime but maintenance interruptions may occur.
4. Updates: We reserve the right to update these terms. You'll be notified of material changes.
5. Governing Law: These terms are governed by the laws of the Kingdom of Saudi Arabia.
6. Jurisdiction: Any disputes are referred to competent courts in the Kingdom of Saudi Arabia.`,
        },
    },
];

const TermsPage: React.FC<TermsPageProps> = ({ language, onBack }) => {
    const isAr = language === 'ar';
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

    const toggleSection = (idx: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {isAr ? 'شروط الاستخدام والأحكام' : 'Terms of Service'}
                            </h1>
                            <p className="text-[11px] text-slate-400">
                                {isAr ? 'آخر تحديث: مايو 2026' : 'Last updated: May 2026'}
                            </p>
                        </div>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                            {isAr ? 'رجوع' : 'Back'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
                {/* Intro Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {isAr
                            ? 'باستخدامك لمنصة آربا للتسعير، فأنت توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية. إذا كان لديك أي استفسار، تواصل معنا عبر الدعم الفني.'
                            : 'By using Arba Pricing Platform, you agree to abide by these Terms and Conditions. Please read them carefully. If you have any questions, contact our support team.'}
                    </p>
                </div>

                {/* Sections */}
                {SECTIONS.map((section, idx) => {
                    const isExpanded = expandedSections.has(idx);
                    return (
                        <div
                            key={idx}
                            className={`rounded-2xl border transition-all duration-300 ${
                                isExpanded
                                    ? 'border-indigo-500/30 bg-slate-800/60'
                                    : 'border-slate-700/30 bg-slate-800/30 hover:border-slate-600/50'
                            }`}
                        >
                            <button
                                onClick={() => toggleSection(idx)}
                                className="w-full flex items-center justify-between p-5 text-right"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                        isExpanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400'
                                    }`}>
                                        {section.icon}
                                    </div>
                                    <span className={`text-sm font-bold transition-colors ${
                                        isExpanded ? 'text-white' : 'text-slate-300'
                                    }`}>
                                        {section.title[isAr ? 'ar' : 'en']}
                                    </span>
                                </div>
                                {isExpanded
                                    ? <ChevronUp className="w-4 h-4 text-indigo-400" />
                                    : <ChevronDown className="w-4 h-4 text-slate-500" />
                                }
                            </button>
                            {isExpanded && (
                                <div className="px-5 pb-5">
                                    <div className="border-t border-slate-700/30 pt-4">
                                        <pre className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-sans">
                                            {section.content[isAr ? 'ar' : 'en']}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Footer */}
                <div className="text-center pt-8 pb-12 space-y-3">
                    <p className="text-xs text-slate-500">
                        {isAr
                            ? '© 2024-2026 آربا للحلول الرقمية. جميع الحقوق محفوظة.'
                            : '© 2024-2026 Arba Digital Solutions. All rights reserved.'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                        {isAr
                            ? 'المملكة العربية السعودية — سجل تجاري مسجل'
                            : 'Kingdom of Saudi Arabia — Registered Commercial Entity'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
