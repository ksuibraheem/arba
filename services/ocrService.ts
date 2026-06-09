/**
 * ARBA V11.3 — OCR Service (Lazy-loaded Tesseract.js)
 * التعرف على النصوص من الصور — يُحمّل عند الطلب فقط (33MB)
 * يدعم العربية والإنجليزية
 */

export interface OCRResult {
  text: string;
  confidence: number;  // 0-100
  language: string;
  processedAt: Date;
  durationMs: number;
  words: OCRWord[];
  lines: string[];
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export type OCRLanguage = 'ara' | 'eng' | 'ara+eng';

class OCRService {
  private worker: any = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  
  /** Initialize Tesseract worker (lazy) */
  private async ensureWorker(lang: OCRLanguage = 'ara+eng'): Promise<void> {
    if (this.worker) return;
    if (this.loadPromise) return this.loadPromise;
    
    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        const Tesseract = await import('tesseract.js');
        this.worker = await Tesseract.createWorker(lang, undefined, {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        });
      } finally {
        this.isLoading = false;
      }
    })();
    
    return this.loadPromise;
  }
  
  /** Recognize text from image file */
  async recognize(file: File, lang: OCRLanguage = 'ara+eng'): Promise<OCRResult> {
    const start = Date.now();
    
    await this.ensureWorker(lang);
    if (!this.worker) throw new Error('فشل في تحميل محرك OCR');
    
    const { data } = await this.worker.recognize(file);
    
    return {
      text: data.text,
      confidence: data.confidence,
      language: lang,
      processedAt: new Date(),
      durationMs: Date.now() - start,
      words: (data.words || []).map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
      lines: data.text.split('\n').filter((l: string) => l.trim()),
    };
  }
  
  /** Recognize text from image URL or base64 */
  async recognizeFromURL(imageUrl: string, lang: OCRLanguage = 'ara+eng'): Promise<OCRResult> {
    const start = Date.now();
    await this.ensureWorker(lang);
    if (!this.worker) throw new Error('فشل في تحميل محرك OCR');
    
    const { data } = await this.worker.recognize(imageUrl);
    
    return {
      text: data.text,
      confidence: data.confidence,
      language: lang,
      processedAt: new Date(),
      durationMs: Date.now() - start,
      words: [],
      lines: data.text.split('\n').filter((l: string) => l.trim()),
    };
  }
  
  /** Check if OCR engine is loaded */
  isReady(): boolean {
    return this.worker !== null;
  }
  
  /** Check if OCR engine is loading */
  isInitializing(): boolean {
    return this.isLoading;
  }
  
  /** Terminate worker to free memory */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.loadPromise = null;
    }
  }
}

export const ocrService = new OCRService();
