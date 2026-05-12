/**
 * ARBA V8.3 — Multilingual Construction Dictionary
 * قاموس مصطلحات البناء متعدد اللغات
 * 
 * يحوّل أي مصطلح بناء (عربي/إنجليزي/فرنسي/صيني/تركي/أردو) إلى canonical keyword
 * بحيث classificationEngine و scopeAuditor يحتاجون قواعد مرة وحدة فقط
 * 
 * SUPPORTED: ar, en, fr, zh, tr, ur (6 لغات)
 */

export type SupportedLang = 'ar' | 'en' | 'fr' | 'zh' | 'tr' | 'ur';

// ═══════════════════════════════════════════════════
// Language Detection
// ═══════════════════════════════════════════════════

const LANG_PATTERNS: { lang: SupportedLang; test: RegExp }[] = [
  { lang: 'ar', test: /[\u0600-\u06FF\u0750-\u077F]/ },
  { lang: 'zh', test: /[\u4E00-\u9FFF\u3400-\u4DBF]/ },
  { lang: 'ur', test: /[\u0600-\u06FF].*[\u06BE\u06C1\u06CC\u06D2]/ }, // Urdu-specific chars
  { lang: 'tr', test: /[çğıöşüÇĞİÖŞÜ]/ },
  { lang: 'fr', test: /[àâéèêëîïôùûüçœæ]/i },
];

/**
 * Detect the primary language of a text
 */
export function detectLanguage(text: string): SupportedLang {
  if (!text) return 'en';
  for (const { lang, test } of LANG_PATTERNS) {
    if (test.test(text)) return lang;
  }
  return 'en';
}

// ═══════════════════════════════════════════════════
// Construction Terms Dictionary
// Each entry maps translations to a canonical English keyword
// ═══════════════════════════════════════════════════

interface TermEntry {
  canonical: string;    // English canonical form (used by classification rules)
  ar: string[];         // Arabic variants
  en: string[];         // English variants
  fr: string[];         // French
  zh: string[];         // Chinese
  tr: string[];         // Turkish
  ur: string[];         // Urdu
}

const TERMS: TermEntry[] = [
  // ═══ CONCRETE ═══
  { canonical: 'concrete', ar: ['خرسانة', 'خراسانة', 'خراسانه', 'خرسانه', 'كونكريت'], en: ['concrete', 'conc'], fr: ['béton', 'beton'], zh: ['混凝土', '砼'], tr: ['beton'], ur: ['کنکریٹ'] },
  { canonical: 'reinforced concrete', ar: ['خرسانة مسلحة', 'خ.م'], en: ['reinforced concrete', 'rc', 'r.c'], fr: ['béton armé'], zh: ['钢筋混凝土'], tr: ['betonarme'], ur: ['مسلح کنکریٹ'] },
  { canonical: 'blinding', ar: ['نظافة', 'خرسانة نظافة'], en: ['blinding', 'lean concrete'], fr: ['béton de propreté'], zh: ['垫层'], tr: ['grobeton'], ur: ['بلائنڈنگ'] },
  { canonical: 'footing', ar: ['قاعدة', 'أساس', 'أساسات'], en: ['footing', 'foundation', 'pad footing'], fr: ['semelle', 'fondation'], zh: ['基础', '地基'], tr: ['temel'], ur: ['بنیاد'] },
  { canonical: 'column', ar: ['عمود', 'أعمدة'], en: ['column', 'col'], fr: ['colonne', 'poteau'], zh: ['柱', '柱子'], tr: ['kolon', 'sütun'], ur: ['کالم'] },
  { canonical: 'beam', ar: ['كمرة', 'جسر', 'ميدة'], en: ['beam', 'tie beam'], fr: ['poutre', 'longrine'], zh: ['梁'], tr: ['kiriş'], ur: ['بیم', 'شہتیر'] },
  { canonical: 'slab', ar: ['سقف', 'بلاطة', 'سلاب'], en: ['slab', 'floor slab'], fr: ['dalle', 'plancher'], zh: ['板', '楼板'], tr: ['döşeme', 'plak'], ur: ['سلیب'] },
  { canonical: 'staircase', ar: ['درج', 'سلم', 'سلالم'], en: ['staircase', 'stair', 'stairs'], fr: ['escalier'], zh: ['楼梯'], tr: ['merdiven'], ur: ['سیڑھیاں'] },

  // ═══ MASONRY ═══
  { canonical: 'block', ar: ['بلوك', 'بلك', 'بلوكات', 'بلكات', 'طابوق'], en: ['block', 'cmu', 'concrete block'], fr: ['bloc', 'parpaing', 'agglo'], zh: ['砌块', '空心砖'], tr: ['blok', 'briket'], ur: ['بلاک', 'اینٹ'] },
  { canonical: 'brick', ar: ['طوب', 'آجر'], en: ['brick', 'clay brick'], fr: ['brique'], zh: ['砖'], tr: ['tuğla'], ur: ['اینٹ'] },

  // ═══ FINISHES ═══
  { canonical: 'plaster', ar: ['لياسة', 'لياسه', 'بياض'], en: ['plaster', 'plastering', 'render'], fr: ['enduit', 'crépi', 'plâtre'], zh: ['抹灰', '粉刷'], tr: ['sıva'], ur: ['پلاسٹر'] },
  { canonical: 'paint', ar: ['دهان', 'دهانات', 'بوية'], en: ['paint', 'painting', 'coating'], fr: ['peinture'], zh: ['油漆', '涂料'], tr: ['boya'], ur: ['پینٹ', 'رنگ'] },
  { canonical: 'tiles', ar: ['بلاط', 'سيراميك', 'سراميك', 'سيرميك'], en: ['tiles', 'tile', 'ceramic'], fr: ['carrelage', 'céramique', 'faïence'], zh: ['瓷砖', '地砖'], tr: ['seramik', 'fayans'], ur: ['ٹائلز'] },
  { canonical: 'porcelain', ar: ['بورسلان', 'بورسلين'], en: ['porcelain'], fr: ['porcelaine', 'grès'], zh: ['瓷质砖'], tr: ['porselen'], ur: ['پورسلین'] },
  { canonical: 'marble', ar: ['رخام'], en: ['marble'], fr: ['marbre'], zh: ['大理石'], tr: ['mermer'], ur: ['سنگ مرمر'] },
  { canonical: 'granite', ar: ['جرانيت', 'غرانيت'], en: ['granite'], fr: ['granit', 'granite'], zh: ['花岗岩'], tr: ['granit'], ur: ['گرینائٹ'] },
  { canonical: 'gypsum board', ar: ['جبس', 'جبسم', 'جبس بورد'], en: ['gypsum', 'gypsum board', 'drywall', 'plasterboard'], fr: ['plaque de plâtre', 'placoplâtre'], zh: ['石膏板'], tr: ['alçıpan'], ur: ['جپسم'] },
  { canonical: 'false ceiling', ar: ['سقف مستعار', 'سقف معلق'], en: ['false ceiling', 'suspended ceiling', 'drop ceiling'], fr: ['faux plafond', 'plafond suspendu'], zh: ['吊顶', '假天花'], tr: ['asma tavan'], ur: ['فالس سیلنگ'] },

  // ═══ WATERPROOFING & INSULATION ═══
  { canonical: 'waterproofing', ar: ['عزل مائي', 'ع.م', 'عزل رطوبة'], en: ['waterproofing', 'damp proof', 'membrane'], fr: ['étanchéité', 'imperméabilisation'], zh: ['防水'], tr: ['su yalıtımı'], ur: ['واٹرپروفنگ'] },
  { canonical: 'thermal insulation', ar: ['عزل حراري', 'ع.ح', 'فوم عزل'], en: ['thermal insulation', 'insulation'], fr: ['isolation thermique', 'isolant'], zh: ['保温', '隔热'], tr: ['ısı yalıtımı'], ur: ['حرارتی عزل'] },

  // ═══ DOORS & WINDOWS ═══
  { canonical: 'door', ar: ['باب', 'أبواب', 'ابواب'], en: ['door', 'doors'], fr: ['porte', 'portes'], zh: ['门'], tr: ['kapı'], ur: ['دروازہ'] },
  { canonical: 'window', ar: ['نافذة', 'نوافذ', 'شباك', 'شبابيك'], en: ['window', 'windows'], fr: ['fenêtre', 'fenêtres'], zh: ['窗', '窗户'], tr: ['pencere'], ur: ['کھڑکی'] },
  { canonical: 'aluminum', ar: ['ألمنيوم', 'المنيوم', 'المونيوم', 'الومنيوم'], en: ['aluminum', 'aluminium'], fr: ['aluminium'], zh: ['铝', '铝合金'], tr: ['alüminyum'], ur: ['ایلومینیم'] },

  // ═══ STEEL ═══
  { canonical: 'rebar', ar: ['حديد تسليح', 'ح.ت', 'تسليح'], en: ['rebar', 'reinforcement', 'reinforcing steel'], fr: ['armature', 'acier', 'ferraillage'], zh: ['钢筋'], tr: ['donatı', 'inşaat demiri'], ur: ['سریا', 'ری بار'] },
  { canonical: 'structural steel', ar: ['هيكل حديد', 'حديد هيكلي'], en: ['structural steel', 'steel structure'], fr: ['charpente métallique', 'acier de structure'], zh: ['钢结构'], tr: ['çelik yapı'], ur: ['سٹرکچرل سٹیل'] },
  { canonical: 'handrail', ar: ['درابزين', 'درابزون'], en: ['handrail', 'railing', 'balustrade'], fr: ['garde-corps', 'rampe', 'balustrade'], zh: ['栏杆', '扶手'], tr: ['korkuluk', 'küpeşte'], ur: ['ریلنگ'] },

  // ═══ ELECTRICAL ═══
  { canonical: 'electrical', ar: ['كهرباء', 'كهربا', 'كهربائي'], en: ['electrical', 'electric', 'elec'], fr: ['électricité', 'électrique'], zh: ['电气', '电'], tr: ['elektrik'], ur: ['بجلی'] },
  { canonical: 'cable', ar: ['كيبل', 'كابل', 'سلك'], en: ['cable', 'wire', 'wiring'], fr: ['câble', 'fil'], zh: ['电缆', '电线'], tr: ['kablo'], ur: ['کیبل', 'تار'] },
  { canonical: 'lighting', ar: ['إنارة', 'اناره', 'إضاءة'], en: ['lighting', 'light', 'luminaire'], fr: ['éclairage', 'luminaire'], zh: ['照明', '灯具'], tr: ['aydınlatma'], ur: ['روشنی'] },
  { canonical: 'socket', ar: ['فيش', 'مقبس', 'بريزة'], en: ['socket', 'outlet', 'receptacle'], fr: ['prise', 'prise électrique'], zh: ['插座'], tr: ['priz'], ur: ['ساکٹ'] },
  { canonical: 'panel board', ar: ['طبلون', 'لوحة كهرباء', 'لوحة توزيع'], en: ['panel board', 'distribution board', 'db'], fr: ['tableau électrique', 'coffret'], zh: ['配电箱', '配电柜'], tr: ['pano', 'dağıtım panosu'], ur: ['پینل بورڈ'] },

  // ═══ PLUMBING ═══
  { canonical: 'plumbing', ar: ['سباكة', 'سباكه', 'صحي'], en: ['plumbing', 'sanitary'], fr: ['plomberie', 'sanitaire'], zh: ['管道', '给排水'], tr: ['tesisat', 'sıhhi tesisat'], ur: ['پلمبنگ'] },
  { canonical: 'pipe', ar: ['ماسورة', 'ماصوره', 'أنبوب'], en: ['pipe', 'piping'], fr: ['tuyau', 'conduite'], zh: ['管', '管道'], tr: ['boru'], ur: ['پائپ'] },
  { canonical: 'fixtures', ar: ['أدوات صحية', 'مغسلة', 'حوض', 'كرسي إفرنجي'], en: ['fixtures', 'sanitary fixtures', 'basin', 'wc'], fr: ['sanitaires', 'lavabo', 'wc'], zh: ['洁具', '卫浴'], tr: ['vitrifiye', 'armatür'], ur: ['فکسچرز'] },

  // ═══ HVAC ═══
  { canonical: 'hvac', ar: ['تكييف', 'تكيف', 'مكيفات', 'تبريد'], en: ['hvac', 'air conditioning', 'ac'], fr: ['climatisation', 'cvc', 'hvac'], zh: ['暖通', '空调'], tr: ['iklimlendirme', 'klima'], ur: ['ایئر کنڈیشنگ'] },
  { canonical: 'duct', ar: ['دكت', 'مجرى هواء'], en: ['duct', 'ductwork', 'air duct'], fr: ['gaine', 'conduit'], zh: ['风管', '风道'], tr: ['kanal', 'hava kanalı'], ur: ['ڈکٹ'] },

  // ═══ FIRE PROTECTION ═══
  { canonical: 'fire system', ar: ['إطفاء', 'حريق', 'إنذار حريق', 'مكافحة حريق'], en: ['fire', 'fire protection', 'fire fighting', 'fire alarm'], fr: ['incendie', 'protection incendie', 'alarme incendie'], zh: ['消防', '灭火'], tr: ['yangın', 'yangın söndürme'], ur: ['فائر', 'آگ بجھانا'] },
  { canonical: 'sprinkler', ar: ['رشاشات', 'سبرنكلر'], en: ['sprinkler', 'sprinklers'], fr: ['sprinkler', 'gicleur'], zh: ['喷淋', '洒水'], tr: ['sprinkler', 'yağmurlama'], ur: ['اسپرنکلر'] },

  // ═══ EARTHWORKS ═══
  { canonical: 'excavation', ar: ['حفر', 'حفريات'], en: ['excavation', 'digging', 'earthwork'], fr: ['excavation', 'terrassement', 'fouille'], zh: ['开挖', '土方'], tr: ['kazı', 'hafriyat'], ur: ['کھدائی'] },
  { canonical: 'backfill', ar: ['ردم', 'ردمية'], en: ['backfill', 'filling'], fr: ['remblai', 'remblayage'], zh: ['回填'], tr: ['dolgу', 'geri dolgu'], ur: ['بیک فل'] },

  // ═══ EXTERNAL ═══
  { canonical: 'asphalt', ar: ['أسفلت', 'زفلتة'], en: ['asphalt', 'bitumen', 'tarmac'], fr: ['asphalte', 'bitume', 'enrobé'], zh: ['沥青', '柏油'], tr: ['asfalt'], ur: ['اسفالٹ'] },
  { canonical: 'interlock', ar: ['انترلوك', 'بلاط متداخل'], en: ['interlock', 'interlocking', 'paving'], fr: ['pavé autobloquant', 'pavé'], zh: ['互锁砖', '联锁砖'], tr: ['kilit taşı', 'parke taşı'], ur: ['انٹرلاک'] },
  { canonical: 'curb', ar: ['بردورة', 'حافة'], en: ['curb', 'kerb', 'curbstone'], fr: ['bordure', 'bordure de trottoir'], zh: ['路缘石', '马路牙'], tr: ['bordür', 'kaldırım bordürü'], ur: ['کرب'] },
  { canonical: 'landscaping', ar: ['تنسيق حدائق', 'أعمال خارجية'], en: ['landscaping', 'landscape'], fr: ['aménagement paysager', 'paysagisme'], zh: ['景观', '园林'], tr: ['peyzaj'], ur: ['لینڈ سکیپنگ'] },
];

// ═══════════════════════════════════════════════════
// Scope / Legal Keywords (Multilingual)
// ═══════════════════════════════════════════════════

export const EXCLUSION_TERMS: Record<SupportedLang, string[]> = {
  ar: ['لا يشمل', 'لايشمل', 'ماعدا', 'ما عدا', 'باستثناء', 'يستثنى', 'دون', 'بدون', 'يخصم', 'غير شامل', 'لا يتضمن', 'يستبعد'],
  en: ['excluding', 'not included', 'not including', 'except', 'exclusive of', 'deducting', 'without', 'does not include', 'excludes'],
  fr: ['hors', 'non compris', 'à l\'exclusion', 'sauf', 'excepté', 'sans', 'ne comprend pas', 'excluant'],
  zh: ['不包括', '不含', '除外', '不包含', '排除'],
  tr: ['hariç', 'dahil değil', 'içermez', 'dışında'],
  ur: ['شامل نہیں', 'سوائے', 'بغیر', 'علاوہ'],
};

export const INCLUSION_TERMS: Record<SupportedLang, string[]> = {
  ar: ['شامل', 'شاملاً', 'يشمل', 'يتضمن', 'بما فيها', 'بما في ذلك', 'مع جميع', 'مع كافة', 'شامل لجميع'],
  en: ['including', 'inclusive', 'includes', 'comprising', 'complete with', 'together with', 'inclusive of'],
  fr: ['y compris', 'inclus', 'incluant', 'comprenant', 'compris', 'avec'],
  zh: ['包括', '含', '包含', '含有'],
  tr: ['dahil', 'içerir', 'kapsayan', 'ile birlikte'],
  ur: ['شامل', 'بشمول', 'سمیت'],
};

// ═══════════════════════════════════════════════════
// Typo Corrections (Multilingual)
// ═══════════════════════════════════════════════════

const TYPO_MAP: Record<SupportedLang, Record<string, string>> = {
  ar: {
    'خراسانة': 'خرسانة', 'خراسانه': 'خرسانة', 'خرسانه': 'خرسانة',
    'المنيوم': 'ألمنيوم', 'المونيوم': 'ألمنيوم', 'الومنيوم': 'ألمنيوم',
    'بورسلين': 'بورسلان', 'سيرميك': 'سيراميك', 'سراميك': 'سيراميك',
    'جبسم': 'جبس', 'لياسه': 'لياسة', 'دهانات': 'دهان',
    'سباكه': 'سباكة', 'كهربا': 'كهرباء', 'تكيف': 'تكييف',
    'بلوكات': 'بلوك', 'بلكات': 'بلوك', 'اناره': 'إنارة',
    'ماصوره': 'ماسورة', 'ابواب': 'أبواب', 'شبابيك': 'نوافذ',
  },
  en: {
    'concret': 'concrete', 'concete': 'concrete', 'reinfoced': 'reinforced',
    'eletrical': 'electrical', 'electical': 'electrical', 'plubming': 'plumbing',
    'plumming': 'plumbing', 'aluminium': 'aluminum', 'celing': 'ceiling',
    'cealing': 'ceiling', 'insultion': 'insulation', 'excvation': 'excavation',
    'waterprofing': 'waterproofing', 'tilse': 'tiles', 'piant': 'paint',
  },
  fr: {
    'beton': 'béton', 'etancheite': 'étanchéité', 'electricite': 'électricité',
    'ceramique': 'céramique', 'fenetre': 'fenêtre',
  },
  zh: {},
  tr: { 'betonarma': 'betonarme', 'asma tavın': 'asma tavan' },
  ur: {},
};

// ═══════════════════════════════════════════════════
// Build Lookup Index (for fast translation)
// ═══════════════════════════════════════════════════

const _termIndex = new Map<string, string>();

function buildIndex(): void {
  if (_termIndex.size > 0) return;
  for (const entry of TERMS) {
    const langs: SupportedLang[] = ['ar', 'en', 'fr', 'zh', 'tr', 'ur'];
    for (const lang of langs) {
      for (const variant of entry[lang]) {
        _termIndex.set(variant.toLowerCase(), entry.canonical);
      }
    }
  }
}

// ═══════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════

/**
 * Normalize text: detect language → fix typos → translate to canonical
 */
export function normalizeToCanonical(text: string): { normalized: string; detectedLang: SupportedLang; replacements: number } {
  buildIndex();
  const lang = detectLanguage(text);
  let result = text;
  let replacements = 0;

  // Step 1: Fix typos for detected language
  const typos = TYPO_MAP[lang] || {};
  for (const [typo, fix] of Object.entries(typos)) {
    if (result.includes(typo)) {
      result = result.replace(new RegExp(typo, 'g'), fix);
      replacements++;
    }
  }

  // Step 2: Replace known terms with canonical English
  for (const entry of TERMS) {
    const variants = entry[lang] || [];
    for (const variant of variants) {
      const regex = new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, entry.canonical);
        replacements++;
      }
    }
  }

  return { normalized: result.trim(), detectedLang: lang, replacements };
}

/**
 * Translate a canonical keyword back to a target language
 */
export function translateTerm(canonical: string, targetLang: SupportedLang): string {
  buildIndex();
  const entry = TERMS.find(t => t.canonical === canonical.toLowerCase());
  if (!entry) return canonical;
  return entry[targetLang]?.[0] || entry.en[0] || canonical;
}

/**
 * Get all exclusion keywords for a detected language
 */
export function getExclusionKeywords(lang: SupportedLang): string[] {
  return EXCLUSION_TERMS[lang] || EXCLUSION_TERMS.en;
}

/**
 * Get all inclusion keywords for a detected language
 */
export function getInclusionKeywords(lang: SupportedLang): string[] {
  return INCLUSION_TERMS[lang] || INCLUSION_TERMS.en;
}

/**
 * Get total stats
 */
export function getDictionaryStats(): { terms: number; languages: number; variants: number } {
  buildIndex();
  return { terms: TERMS.length, languages: 6, variants: _termIndex.size };
}
