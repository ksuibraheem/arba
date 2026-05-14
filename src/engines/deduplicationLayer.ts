/**
 * ARBA V9.0 — Deduplication Layer with Contextual Cross-Reference
 * طبقة كشف التكرار مع التحقق المرجعي
 * 
 * المنطق:
 * 1. يكشف البنود المتشابهة (نفس الوصف + نفس الكمية)
 * 2. يفحص السياق المحيط (الخلايا العمودية والأفقية) للتأكد:
 *    - هل البند في نفس القسم (Division)؟ → تكرار مؤكد
 *    - هل البند في مبنى مختلف؟ → تكرار شرعي (ليس خطأ)
 *    - هل البنود المحيطة متطابقة أيضاً؟ → نسخ/لصق خاطئ
 */

export interface DuplicateResult {
  isDuplicate: boolean;
  originalIndex: number | null;
  confidence: 'exact' | 'likely' | 'legitimate' | 'none';
  note: string;
}

export interface RawItemWithContext {
  description: string;
  qty: number;
  sheetName?: string;
  rowIndex?: number;           // رقم السطر في الشيت الأصلي
  surroundingRows?: string[];  // الأسطر المحيطة (قبل وبعد) — للتحقق المرجعي
  divisionHeader?: string;     // عنوان القسم (Division) اللي البند تحته
}

/**
 * التحقق المرجعي: يقارن السياق المحيط ببندين متشابهين
 * يفحص:
 * 1. هل البندين تحت نفس القسم (Division)؟
 * 2. هل البنود المجاورة عمودياً متطابقة؟ (دليل نسخ/لصق)
 * 3. هل هم في نفس الشيت أو شيتات مختلفة؟
 */
function contextualVerify(
  item1: RawItemWithContext,
  item2: RawItemWithContext
): { isRealDuplicate: boolean; reason: string } {

  const sameSheet = item1.sheetName === item2.sheetName;
  const sameDivision = item1.divisionHeader && item2.divisionHeader &&
    item1.divisionHeader === item2.divisionHeader;

  // ═══ حالة 1: شيتات مختلفة = مباني مختلفة = تكرار شرعي ═══
  if (!sameSheet) {
    return {
      isRealDuplicate: false,
      reason: `بند شرعي: يتكرر في مبنى مختلف (${item1.sheetName} vs ${item2.sheetName})`,
    };
  }

  // ═══ حالة 2: نفس الشيت + نفس القسم = تكرار مؤكد ═══
  if (sameSheet && sameDivision) {
    return {
      isRealDuplicate: true,
      reason: `تكرار مؤكد: نفس البند في نفس القسم "${item1.divisionHeader}"`,
    };
  }

  // ═══ حالة 3: نفس الشيت + أقسام مختلفة ═══
  // نفحص البنود المجاورة عمودياً — إذا متطابقة = نسخ/لصق خاطئ
  if (sameSheet && !sameDivision) {
    const surroundMatch = checkSurroundingMatch(item1, item2);
    if (surroundMatch >= 2) {
      // 2+ بنود محيطة متطابقة = نسخ/لصق block كامل
      return {
        isRealDuplicate: true,
        reason: `تكرار مؤكد: ${surroundMatch} بنود محيطة متطابقة (نسخ/لصق خاطئ)`,
      };
    }
    // أقسام مختلفة وبنود محيطة مختلفة = ممكن يكون شرعي
    return {
      isRealDuplicate: false,
      reason: `بند محتمل التكرار: نفس الشيت لكن أقسام مختلفة — يحتاج مراجعة يدوية`,
    };
  }

  // ═══ حالة 4: نفس الشيت + لا يوجد Division header ═══
  // نعتمد على فحص المحيط العمودي فقط
  const surroundMatch = checkSurroundingMatch(item1, item2);
  if (surroundMatch >= 2) {
    return {
      isRealDuplicate: true,
      reason: `تكرار مؤكد: ${surroundMatch} بنود محيطة متطابقة`,
    };
  }

  // الكمية متطابقة تماماً + نفس الشيت = مشبوه جداً
  if (Math.abs(item1.qty - item2.qty) < 0.01) {
    return {
      isRealDuplicate: true,
      reason: `تكرار مرجّح: نفس الوصف والكمية بالضبط في نفس الشيت`,
    };
  }

  return { isRealDuplicate: false, reason: 'لا يوجد تكرار' };
}

/**
 * فحص التطابق في البنود المحيطة عمودياً
 * يقارن الأسطر اللي قبل وبعد البندين المتشابهين
 * إذا البنود المحيطة نفسها = دليل أن block كامل تم نسخه
 */
function checkSurroundingMatch(
  item1: RawItemWithContext,
  item2: RawItemWithContext
): number {
  if (!item1.surroundingRows || !item2.surroundingRows) return 0;

  let matchCount = 0;
  const maxCheck = Math.min(item1.surroundingRows.length, item2.surroundingRows.length);

  for (let i = 0; i < maxCheck; i++) {
    const row1 = (item1.surroundingRows[i] || '').trim().substring(0, 30);
    const row2 = (item2.surroundingRows[i] || '').trim().substring(0, 30);
    if (row1.length > 3 && row1 === row2) {
      matchCount++;
    }
  }

  return matchCount;
}

/**
 * يفحص قائمة البنود ويكشف التكرارات مع التحقق المرجعي
 */
export function detectDuplicates(items: RawItemWithContext[]): Map<number, DuplicateResult> {
  const results = new Map<number, DuplicateResult>();
  
  // بناء فهرس البنود حسب الوصف المختصر
  const descIndex = new Map<string, number[]>(); // desc_key -> [indices]

  items.forEach((item, idx) => {
    const descKey = item.description.trim().replace(/\r?\n/g, ' ').substring(0, 30);
    if (!descIndex.has(descKey)) descIndex.set(descKey, []);
    descIndex.get(descKey)!.push(idx);
  });

  // فحص كل مجموعة متشابهة
  const markedAsDup = new Set<number>();

  descIndex.forEach((indices, descKey) => {
    if (indices.length <= 1) return; // لا يوجد تكرار

    // مقارنة كل زوج
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const idx1 = indices[i];
        const idx2 = indices[j];
        const item1 = items[idx1];
        const item2 = items[idx2];

        // فقط إذا الكميات متقاربة (فرق أقل من 1%)
        const qtyDiff = Math.abs(item1.qty - item2.qty) / Math.max(item1.qty, 1);
        if (qtyDiff > 0.01) continue;

        // التحقق المرجعي
        const verification = contextualVerify(item1, item2);

        if (verification.isRealDuplicate && !markedAsDup.has(idx2)) {
          markedAsDup.add(idx2);
          results.set(idx2, {
            isDuplicate: true,
            originalIndex: idx1,
            confidence: 'exact',
            note: `${verification.reason} — نسخة من البند #${idx1 + 1}`,
          });
        } else if (!verification.isRealDuplicate && !markedAsDup.has(idx2)) {
          // بند شرعي — نسجله كـ legitimate للتوثيق
          if (!results.has(idx2)) {
            results.set(idx2, {
              isDuplicate: false,
              originalIndex: idx1,
              confidence: 'legitimate',
              note: verification.reason,
            });
          }
        }
      }
    }
  });

  // تعبئة البنود غير المكررة
  items.forEach((_, idx) => {
    if (!results.has(idx)) {
      results.set(idx, {
        isDuplicate: false,
        originalIndex: null,
        confidence: 'none',
        note: '',
      });
    }
  });

  return results;
}

/** عدد التكرارات المكتشفة */
export function countDuplicates(results: Map<number, DuplicateResult>): number {
  let count = 0;
  results.forEach(r => { if (r.isDuplicate) count++; });
  return count;
}
