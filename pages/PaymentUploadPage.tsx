import React, { useState, useEffect } from 'react';
import { Upload, CreditCard, Building2, ArrowLeft, ArrowRight, Check, FileText, AlertCircle, Smartphone, RefreshCw } from 'lucide-react';
import { registrationService, RegistrationRequest, PaymentMethod, PLAN_PRICES } from '../services/registrationService';

interface PaymentUploadPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    registrationRequestId?: string;
    onPaymentSubmitted?: () => void;
}

const BANK_ACCOUNT_INFO = {
    bankName: { ar: 'بنك الراجحي', en: 'Al Rajhi Bank' },
    accountName: { ar: 'شركة أربا للتقنية', en: 'ARBA Technology Co.' },
    iban: 'SA0380000000608010167519',
    accountNumber: '608010167519'
};

const PAYMENT_METHODS: { id: PaymentMethod; name: { ar: string; en: string }; icon: React.ReactNode; requiresReceipt: boolean }[] = [
    { id: 'bank_transfer', name: { ar: 'تحويل بنكي', en: 'Bank Transfer' }, icon: <Building2 className="w-6 h-6" />, requiresReceipt: true },
    { id: 'mada', name: { ar: 'مدى', en: 'Mada' }, icon: <CreditCard className="w-6 h-6" />, requiresReceipt: false },
    { id: 'credit_card', name: { ar: 'بطاقة ائتمان', en: 'Credit Card' }, icon: <CreditCard className="w-6 h-6" />, requiresReceipt: false },
    { id: 'stc_pay', name: { ar: 'STC Pay', en: 'STC Pay' }, icon: <Smartphone className="w-6 h-6" />, requiresReceipt: false },
    { id: 'apple_pay', name: { ar: 'Apple Pay', en: 'Apple Pay' }, icon: <Smartphone className="w-6 h-6" />, requiresReceipt: false },
];

const PaymentUploadPage: React.FC<PaymentUploadPageProps> = ({
    language,
    onNavigate,
    registrationRequestId,
    onPaymentSubmitted
}) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [request, setRequest] = useState<RegistrationRequest | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [receiptFile, setReceiptFile] = useState<string | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (registrationRequestId) {
            const req = registrationService.getRequestById(registrationRequestId);
            setRequest(req);
            if (req?.paymentMethod) {
                setSelectedMethod(req.paymentMethod);
            }
        }
    }, [registrationRequestId]);

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setReceiptFile(null);
        setReceiptFileName('');
        setError('');

        if (registrationRequestId) {
            registrationService.selectPaymentMethod(registrationRequestId, method);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError(language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' : 'File size must be less than 5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            setError(language === 'ar' ? 'يرجى رفع صورة أو ملف PDF' : 'Please upload an image or PDF file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setReceiptFile(reader.result as string);
            setReceiptFileName(file.name);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!selectedMethod) {
            setError(language === 'ar' ? 'يرجى اختيار طريقة الدفع' : 'Please select a payment method');
            return;
        }

        const methodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod);

        if (methodInfo?.requiresReceipt && !receiptFile) {
            setError(language === 'ar' ? 'يرجى رفع إيصال الدفع' : 'Please upload the payment receipt');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (registrationRequestId) {
            if (methodInfo?.requiresReceipt && receiptFile) {
                registrationService.uploadPaymentReceipt(registrationRequestId, receiptFile, receiptFileName);
            } else {
                registrationService.submitOnlinePayment(registrationRequestId);
            }
        }

        setSuccess(true);
        setIsLoading(false);

        // Redirect after success
        setTimeout(() => {
            if (onPaymentSubmitted) {
                onPaymentSubmitted();
            } else {
                onNavigate('under-review');
            }
        }, 2000);
    };

    const amount = request?.amount || PLAN_PRICES.professional;

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        {language === 'ar' ? 'تم استلام طلب الدفع!' : 'Payment Request Received!'}
                    </h2>
                    <p className="text-slate-500 mb-6">
                        {selectedMethod === 'bank_transfer'
                            ? (language === 'ar' ? 'تم رفع إيصال الدفع بنجاح. سيتم مراجعته من قبل فريقنا.' : 'Payment receipt uploaded successfully. It will be reviewed by our team.')
                            : (language === 'ar' ? 'طلب الدفع تم بنجاح. سيتم مراجعته والتأكد منه قريباً.' : 'Payment submitted successfully. It will be verified soon.')
                        }
                    </p>
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{language === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {language === 'ar' ? 'إتمام عملية الدفع' : 'Complete Payment'}
                    </h1>
                    <p className="text-slate-400">
                        {language === 'ar' ? 'اختر طريقة الدفع المناسبة لك' : 'Choose your preferred payment method'}
                    </p>
                </div>

                {/* Payment Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    {/* Amount */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-center">
                        <p className="text-emerald-600 text-sm mb-1">
                            {language === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}
                        </p>
                        <p className="text-3xl font-bold text-emerald-700">
                            {amount.toLocaleString()} <span className="text-lg">{language === 'ar' ? 'ر.س' : 'SAR'}</span>
                        </p>
                        <p className="text-emerald-500 text-sm mt-1">
                            {language === 'ar' ? 'اشتراك سنوي - الباقة الاحترافية' : 'Annual Subscription - Professional Plan'}
                        </p>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PAYMENT_METHODS.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method.id)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMethod === method.id
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {method.icon}
                                    <span className="text-sm font-medium">{method.name[language]}</span>
                                    {selectedMethod === method.id && (
                                        <Check className="w-4 h-4 text-emerald-500 absolute top-2 right-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bank Transfer Details */}
                    {selectedMethod === 'bank_transfer' && (
                        <div className="mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    {language === 'ar' ? 'معلومات الحساب البنكي' : 'Bank Account Details'}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">{language === 'ar' ? 'البنك:' : 'Bank:'}</span>
                                        <span className="font-medium text-blue-800">{BANK_ACCOUNT_INFO.bankName[language]}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">{language === 'ar' ? 'اسم الحساب:' : 'Account Name:'}</span>
                                        <span className="font-medium text-blue-800">{BANK_ACCOUNT_INFO.accountName[language]}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">{language === 'ar' ? 'رقم الآيبان:' : 'IBAN:'}</span>
                                        <span className="font-medium text-blue-800 font-mono text-xs" dir="ltr">{BANK_ACCOUNT_INFO.iban}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">{language === 'ar' ? 'رقم الحساب:' : 'Account No:'}</span>
                                        <span className="font-medium text-blue-800 font-mono">{BANK_ACCOUNT_INFO.accountNumber}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Receipt */}
                            <div>
                                <h4 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    {language === 'ar' ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}
                                </h4>
                                <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${receiptFile
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-300 hover:border-emerald-400 bg-slate-50'
                                    }`}>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {receiptFile ? (
                                        <div className="text-emerald-600">
                                            <FileText className="w-10 h-10 mx-auto mb-2" />
                                            <p className="font-medium">{receiptFileName}</p>
                                            <p className="text-sm text-emerald-500">
                                                {language === 'ar' ? 'اضغط لتغيير الملف' : 'Click to change file'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <Upload className="w-10 h-10 mx-auto mb-2" />
                                            <p className="font-medium">
                                                {language === 'ar' ? 'اضغط لرفع إيصال الدفع' : 'Click to upload payment receipt'}
                                            </p>
                                            <p className="text-sm">
                                                {language === 'ar' ? 'صورة أو PDF (حد أقصى 5 ميجا)' : 'Image or PDF (max 5MB)'}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Other Payment Methods Message */}
                    {selectedMethod && selectedMethod !== 'bank_transfer' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-amber-800 font-medium">
                                        {language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}
                                    </p>
                                    <p className="text-amber-600 text-sm">
                                        {language === 'ar'
                                            ? 'بعد إتمام عملية الدفع، ستكون حالة الدفع "تحت المراجعة" وسيتم التحقق منها من قبل فريقنا.'
                                            : 'After completing the payment, it will be marked as "Under Review" and verified by our team.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedMethod || isLoading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                            </>
                        ) : (
                            <>
                                {selectedMethod === 'bank_transfer'
                                    ? (language === 'ar' ? 'تأكيد وإرسال الإيصال' : 'Confirm & Submit Receipt')
                                    : (language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment')
                                }
                                <Arrow className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => onNavigate('under-review')}
                    className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Arrow className="w-4 h-4 rotate-180" />
                    {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
            </div>
        </div>
    );
};

export default PaymentUploadPage;
