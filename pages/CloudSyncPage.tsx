import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Cloud, CloudOff, RefreshCw, Upload, Download, CheckCircle, XCircle, AlertCircle, ArrowLeft, Database, Server } from 'lucide-react';
import { firebaseService, ConnectionStatus, SyncResult } from '../services/firebaseService';

interface CloudSyncPageProps {
    language: Language;
    onNavigate: (page: string) => void;
}

const CloudSyncPage: React.FC<CloudSyncPageProps> = ({ language, onNavigate }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const isRtl = language === 'ar';

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, label: '' });
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const dataMappings = firebaseService.getDataMappings();

    // Add log entry
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString('ar-SA');
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
    };

    // Test connection
    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        addLog(t('جاري اختبار الاتصال...', 'Testing connection...'));

        const result = await firebaseService.testConnection();
        setConnectionStatus(result);

        if (result.connected) {
            addLog(t(`✅ متصل بـ Firebase (${result.projectId})`, `✅ Connected to Firebase (${result.projectId})`));
        } else {
            addLog(t(`❌ فشل الاتصال: ${result.error}`, `❌ Connection failed: ${result.error}`));
        }

        setIsTestingConnection(false);
    };

    // Sync all data
    const handleSyncData = async () => {
        setIsSyncing(true);
        setSyncResult(null);
        addLog(t('بدء مزامنة البيانات...', 'Starting data sync...'));

        const result = await firebaseService.syncAllData((current, total, label) => {
            setSyncProgress({ current, total, label });
            addLog(t(`📤 مزامنة: ${label}`, `📤 Syncing: ${label}`));
        });

        setSyncResult(result);
        addLog(result.success
            ? (language === 'ar' ? `✅ ${result.message}` : `✅ ${result.message}`)
            : (language === 'ar' ? `⚠️ ${result.message}` : `⚠️ ${result.message}`)
        );

        setIsSyncing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <Cloud className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {t('مزامنة السحابة', 'Cloud Sync')}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {t('تصدير واستيراد البيانات من Firebase', 'Export and import data from Firebase')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('manager')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('رجوع', 'Back')}</span>
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Connection Status Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-3">
                            <Server className="w-5 h-5 text-blue-400" />
                            {t('حالة الاتصال', 'Connection Status')}
                        </h2>
                        <button
                            onClick={handleTestConnection}
                            disabled={isTestingConnection}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                            {t('اختبار الاتصال', 'Test Connection')}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {connectionStatus === null ? (
                            <div className="flex items-center gap-3 text-slate-400">
                                <AlertCircle className="w-6 h-6" />
                                <span>{t('لم يتم اختبار الاتصال بعد', 'Connection not tested yet')}</span>
                            </div>
                        ) : connectionStatus.connected ? (
                            <div className="flex items-center gap-3 text-emerald-400">
                                <CheckCircle className="w-6 h-6" />
                                <div>
                                    <span className="font-medium">{t('متصل', 'Connected')}</span>
                                    <span className="text-slate-400 mx-2">|</span>
                                    <span className="text-slate-300">{connectionStatus.projectId}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-red-400">
                                <XCircle className="w-6 h-6" />
                                <div>
                                    <span className="font-medium">{t('غير متصل', 'Disconnected')}</span>
                                    <span className="text-slate-400 mx-2">|</span>
                                    <span className="text-red-300">{connectionStatus.error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Collections Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                        <Database className="w-5 h-5 text-purple-400" />
                        {t('البيانات المتاحة للمزامنة', 'Data Available for Sync')}
                    </h2>

                    <div className="grid gap-3 mb-6">
                        {dataMappings.map((mapping, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                <span className="text-slate-300">{mapping.label}</span>
                                <span className="text-xs text-slate-500 font-mono">{mapping.collection}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sync Progress */}
                    {isSyncing && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                                <span>{syncProgress.label}</span>
                                <span>{syncProgress.current}/{syncProgress.total}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                                    style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Sync Result */}
                    {syncResult && (
                        <div className={`p-4 rounded-lg mb-6 ${syncResult.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                {syncResult.success ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                )}
                                <span className={syncResult.success ? 'text-emerald-300' : 'text-amber-300'}>
                                    {syncResult.message}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Sync Button */}
                    <button
                        onClick={handleSyncData}
                        disabled={isSyncing || !connectionStatus?.connected}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                {t('جاري المزامنة...', 'Syncing...')}
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                {t('تصدير البيانات للسحابة', 'Export Data to Cloud')}
                            </>
                        )}
                    </button>
                </div>

                {/* Logs Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-bold text-white mb-4">
                        {t('سجل العمليات', 'Activity Log')}
                    </h2>
                    <div className="bg-slate-900/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <p className="text-slate-500">{t('لا توجد عمليات بعد...', 'No activity yet...')}</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="text-slate-400 py-1 border-b border-slate-800 last:border-0">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CloudSyncPage;
