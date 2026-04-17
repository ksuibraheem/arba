import { Language } from '../../types';
/**
 * ProjectGallery — معرض صور المشروع
 * رفع + ضغط تلقائي (WebP) + تصنيف + ربط ببنود BOQ
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Camera, Image, Filter, Tag, Trash2, ZoomIn, Download, X, Database, AlertTriangle } from 'lucide-react';
import { connectService, ProjectPhoto, compressImage, createThumbnail, formatChatTime } from '../../services/connectService';
import { calculateStorageUsage, formatStorageSize, canUploadFile } from '../../services/storagePackages';
import type { PhotoCategory } from '../../services/connectService';

interface ProjectGalleryProps {
    language: Language;
    userId: string;
    userName: string;
    storageGB: number;
    onBack: () => void;
}

const CATEGORY_CONFIG: Record<PhotoCategory, { label: { ar: string; en: string }; color: string; icon: string }> = {
    before: { label: { ar: 'قبل التنفيذ', en: 'Before' }, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🏚️' },
    during: { label: { ar: 'أثناء التنفيذ', en: 'During' }, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🏗️' },
    after: { label: { ar: 'بعد التسليم', en: 'After' }, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🏠' },
};

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ language, userId, userName, storageGB, onBack }) => {
    const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
    const [filterCategory, setFilterCategory] = useState<PhotoCategory | 'all'>('all');
    const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCategory, setUploadCategory] = useState<PhotoCategory>('during');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadItemCode, setUploadItemCode] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };

    useEffect(() => { loadPhotos(); }, []);

    const loadPhotos = () => setPhotos(connectService.getPhotos());

    const storageUsed = connectService.getStorageUsed();
    const storageInfo = calculateStorageUsage(storageUsed, storageGB);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadError('');

        for (const file of Array.from(files)) {
            // Check storage
            const check = canUploadFile(connectService.getStorageUsed(), file.size, storageGB);
            if (!check.allowed) {
                setUploadError(check.reason?.[language] || '');
                continue;
            }

            try {
                await connectService.addPhoto(file, {
                    uploadedBy: { id: userId, name: userName, role: 'contractor' },
                    category: uploadCategory,
                    linkedItemCode: uploadItemCode || undefined,
                    description: uploadDescription || undefined,
                });
            } catch (err) {
                setUploadError(t('فشل في رفع الصورة', 'Failed to upload photo'));
            }
        }

        setIsUploading(false);
        setShowUploadForm(false);
        setUploadDescription('');
        setUploadItemCode('');
        loadPhotos();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredPhotos = filterCategory === 'all' ? photos : photos.filter(p => p.category === filterCategory);

    // LIGHTBOX
    if (selectedPhoto) {
        return (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-sm font-medium text-white">{selectedPhoto.description || t('صورة', 'Photo')}</p>
                            <p className="text-xs text-slate-400">
                                {selectedPhoto.uploadedBy.name} · {formatChatTime(selectedPhoto.createdAt)}
                                {selectedPhoto.linkedItemCode && ` · ${t('بند', 'Item')}: ${selectedPhoto.linkedItemCode}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${CATEGORY_CONFIG[selectedPhoto.category].color}`}>
                            {CATEGORY_CONFIG[selectedPhoto.category].icon} {CATEGORY_CONFIG[selectedPhoto.category].label[language]}
                        </span>
                        <span className="text-xs text-slate-500">
                            {formatStorageSize(selectedPhoto.originalSize)} → {formatStorageSize(selectedPhoto.compressedSize)}
                        </span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <img
                        src={selectedPhoto.originalUrl}
                        alt={selectedPhoto.description || 'Project photo'}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <span className="text-lg">📸</span>
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('معرض الصور', 'Photo Gallery')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">{photos.length} {t('صورة', 'photos')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('رفع صور', 'Upload')}</span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-4">
                {/* Storage bar */}
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex items-center gap-3">
                    <Database className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex-1">
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${storageInfo.percentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, storageInfo.percentage)}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{storageInfo.usedGB} / {storageInfo.totalGB} GB</span>
                </div>

                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {t('الكل', 'All')} ({photos.length})
                    </button>
                    {(Object.keys(CATEGORY_CONFIG) as PhotoCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${filterCategory === cat ? CATEGORY_CONFIG[cat].color : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent'}`}
                        >
                            {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label[language]} ({photos.filter(p => p.category === cat).length})
                        </button>
                    ))}
                </div>

                {/* Photo Grid */}
                {filteredPhotos.length === 0 ? (
                    <div className="text-center py-16">
                        <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">{t('لا توجد صور', 'No photos yet')}</p>
                        <p className="text-slate-600 text-xs mt-1">{t('ارفع صورة من الموقع لتوثيق المشروع', 'Upload site photos to document the project')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                        {filteredPhotos.map(photo => (
                            <div
                                key={photo.id}
                                className="relative group rounded-xl overflow-hidden border border-slate-700/30 bg-slate-800/40 cursor-pointer hover:border-slate-600/50 transition-all"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img
                                    src={photo.thumbnailUrl || photo.originalUrl}
                                    alt={photo.description || ''}
                                    className="w-full aspect-square object-cover"
                                    loading="lazy"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <p className="text-[10px] text-white truncate">{photo.description || t('صورة', 'Photo')}</p>
                                    <p className="text-[9px] text-slate-300">{formatChatTime(photo.createdAt)}</p>
                                </div>
                                {/* Category badge */}
                                <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-md font-medium border ${CATEGORY_CONFIG[photo.category].color}`}>
                                    {CATEGORY_CONFIG[photo.category].icon}
                                </span>
                                {/* Item code */}
                                {photo.linkedItemCode && (
                                    <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-slate-900/70 text-white flex items-center gap-0.5">
                                        <Tag className="w-2.5 h-2.5" />
                                        {photo.linkedItemCode}
                                    </span>
                                )}
                                {/* Delete */}
                                <button
                                    onClick={e => { e.stopPropagation(); connectService.deletePhoto(photo.id!); loadPhotos(); }}
                                    className="absolute bottom-1.5 right-1.5 p-1 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUploadForm(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-400" />
                            {t('رفع صور', 'Upload Photos')}
                        </h3>

                        {uploadError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <p className="text-xs text-red-300">{uploadError}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('التصنيف', 'Category')}</label>
                                <div className="flex gap-2">
                                    {(Object.keys(CATEGORY_CONFIG) as PhotoCategory[]).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setUploadCategory(cat)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${uploadCategory === cat ? CATEGORY_CONFIG[cat].color : 'bg-slate-700 text-slate-400 border-slate-600'}`}
                                        >
                                            {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label[language]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('وصف (اختياري)', 'Description (optional)')}</label>
                                <input
                                    value={uploadDescription}
                                    onChange={e => setUploadDescription(e.target.value)}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                                    placeholder={t('مثال: صب خرسانة السقف', 'e.g. Roof concrete pouring')}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('رقم البند (اختياري)', 'Item code (optional)')}</label>
                                <input
                                    value={uploadItemCode}
                                    onChange={e => setUploadItemCode(e.target.value)}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                                    placeholder="11.01"
                                />
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <span className="animate-pulse">{t('جاري الرفع والضغط...', 'Uploading & compressing...')}</span>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" />
                                        {t('اختر الصور', 'Select Photos')}
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-slate-500 text-center">
                                {t('يتم ضغط الصور تلقائياً بصيغة WebP لتوفير 90% من المساحة', 'Photos auto-compressed to WebP saving 90% storage')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;
