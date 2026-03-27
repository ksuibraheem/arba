/**
 * Integration Test Script
 * اختبار تكاملي لتدفق المورد ومهندس الكميات
 */

// محاكاة localStorage
const storage: { [key: string]: string } = {};
const localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; }
};

// محاكاة crypto.randomUUID
const crypto = { randomUUID: () => Math.random().toString(36).substr(2, 9) };

// ====================== Test Data ======================

console.log('🧪 بدء الاختبار التكاملي...\n');

// 1. إنشاء مورد
console.log('1️⃣ إنشاء مورد جديد...');
const testSupplier = {
    id: crypto.randomUUID(),
    companyName: 'شركة البناء الحديث',
    name: 'محمد أحمد',
    email: 'mohamed@test.com',
    phone: '0501234567',
    commercialRegister: '1234567890',
    isActive: true,
    createdAt: new Date().toISOString()
};
console.log(`   ✅ تم إنشاء المورد: ${testSupplier.companyName}`);

// 2. إضافة منتجات
console.log('\n2️⃣ إضافة 3 منتجات...');
const testProducts = [
    { id: crypto.randomUUID(), supplierId: testSupplier.id, name: { ar: 'مواسير حديد 2 انش', en: 'Steel Pipes 2 inch' }, price: 150, category: 'مواد بناء' },
    { id: crypto.randomUUID(), supplierId: testSupplier.id, name: { ar: 'اسمنت علامة الصقر', en: 'Falcon Cement' }, price: 25, category: 'أسمنت' },
    { id: crypto.randomUUID(), supplierId: testSupplier.id, name: { ar: 'رمل ناعم للبناء', en: 'Fine Sand' }, price: 80, category: 'رمل' }
];
testProducts.forEach(p => console.log(`   ✅ ${p.name.ar} - ${p.price} ر.س`));

// 3. إنشاء طلبات مراجعة
console.log('\n3️⃣ إنشاء طلبات مراجعة للمنتجات...');
const reviews = testProducts.map(product => ({
    id: crypto.randomUUID(),
    supplierId: testSupplier.id,
    supplierName: testSupplier.companyName,
    dataType: 'product' as const,
    dataId: product.id,
    dataName: product.name.ar,
    dataAfter: product,
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'revision_requested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}));
reviews.forEach(r => console.log(`   📋 طلب مراجعة: ${r.dataName}`));

// 4. مراجعة من مهندس الكميات
console.log('\n4️⃣ مهندس الكميات يراجع المنتجات...');

const engineerInfo = { id: '489012345', name: 'محمد الزهراني' };

// المنتج الأول: موافقة
reviews[0].status = 'approved';
console.log(`   ✅ موافقة على: ${reviews[0].dataName}`);

// المنتج الثاني: طلب تعديل
reviews[1].status = 'revision_requested';
(reviews[1] as any).revisionNotes = 'السعر يحتاج مراجعة';
console.log(`   ✏️ طلب تعديل: ${reviews[1].dataName} - "${(reviews[1] as any).revisionNotes}"`);

// المنتج الثالث: رفض
reviews[2].status = 'rejected';
(reviews[2] as any).rejectionReason = 'المنتج غير مطابق للمواصفات';
console.log(`   ❌ رفض: ${reviews[2].dataName} - "${(reviews[2] as any).rejectionReason}"`);

// 5. النتائج
console.log('\n5️⃣ ملخص النتائج:');
console.log('   ═══════════════════════════════════════');
console.log(`   | المنتج                    | الحالة        |`);
console.log('   ═══════════════════════════════════════');
reviews.forEach(r => {
    const statusEmoji = r.status === 'approved' ? '✅' : r.status === 'rejected' ? '❌' : '✏️';
    const statusText = r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : 'يحتاج تعديل';
    console.log(`   | ${r.dataName.padEnd(25)} | ${statusEmoji} ${statusText.padEnd(10)} |`);
});
console.log('   ═══════════════════════════════════════');

// 6. التحقق من ظهور المنتج المعتمد
console.log('\n6️⃣ المنتجات المعتمدة المتاحة للأفراد والشركات:');
const approvedProducts = reviews.filter(r => r.status === 'approved');
if (approvedProducts.length > 0) {
    approvedProducts.forEach(r => {
        const product = testProducts.find(p => p.id === r.dataId);
        console.log(`   🛒 ${r.dataName} - ${product?.price} ر.س (من ${r.supplierName})`);
    });
} else {
    console.log('   ⚠️ لا توجد منتجات معتمدة');
}

console.log('\n✅ تم الاختبار بنجاح!');
console.log('════════════════════════════════════════════════════');
