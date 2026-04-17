/**
 * صفحة المبرمج — أدوات تطوير حقيقية
 * Developer Page — Functional dev tools with real state
 */

import React, { useState } from 'react';
import { Code, GitBranch, Bug, Rocket, Terminal, Database, CheckCircle2, Clock, AlertCircle, Plus, X, Loader2, Play } from 'lucide-react';
import { Employee } from '../../../services/employeeService';
import { Language } from '../../../types';

interface DeveloperPageProps {
    language: Language;
    employee: Employee;
}

interface Task { id: string; title: string; status: 'open' | 'progress' | 'done'; priority: 'low' | 'medium' | 'high'; }
interface BugReport { id: string; title: string; severity: 'low' | 'medium' | 'critical'; status: 'open' | 'fixed'; }

const DeveloperPage: React.FC<DeveloperPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const [activePanel, setActivePanel] = useState<'tasks' | 'bugs' | 'deploy' | 'db' | null>(null);
    const [deploying, setDeploying] = useState(false);
    const [deployLog, setDeployLog] = useState<string[]>([]);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        '$ npm run dev',
        'Starting development server...',
        '✓ Ready on http://localhost:3000'
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        { id: 't1', title: t('تطوير API حاسبة التسعير', 'Develop Pricing Calculator API'), status: 'progress', priority: 'high' },
        { id: 't2', title: t('تحسين أداء قاعدة البيانات', 'Optimize database performance'), status: 'open', priority: 'medium' },
        { id: 't3', title: t('إضافة نظام الإشعارات', 'Add notification system'), status: 'open', priority: 'high' },
        { id: 't4', title: t('اختبارات الوحدة للمحاسبة', 'Unit tests for accounting'), status: 'done', priority: 'low' },
    ]);

    const [bugs, setBugs] = useState<BugReport[]>([
        { id: 'b1', title: t('خطأ في حساب الضريبة', 'Tax calculation error'), severity: 'critical', status: 'open' },
        { id: 'b2', title: t('بطء في تحميل صفحة التقارير', 'Slow loading on reports page'), severity: 'medium', status: 'open' },
        { id: 'b3', title: t('مشكلة عرض RTL في الجداول', 'RTL display issue in tables'), severity: 'low', status: 'fixed' },
    ]);

    const [newTaskTitle, setNewTaskTitle] = useState('');

    const toggleTaskStatus = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const next = t.status === 'open' ? 'progress' : t.status === 'progress' ? 'done' : 'open';
            return { ...t, status: next };
        }));
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        setTasks(prev => [...prev, { id: `t_${Date.now()}`, title: newTaskTitle, status: 'open', priority: 'medium' }]);
        setNewTaskTitle('');
    };

    const toggleBugStatus = (id: string) => {
        setBugs(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'open' ? 'fixed' : 'open' } : b));
    };

    const startDeploy = () => {
        setDeploying(true);
        setDeployLog(['🚀 Starting deployment...']);
        const steps = [
            '📦 Building production bundle...',
            '✓ Build completed (3.2s)',
            '🔍 Running tests...',
            '✓ All 47 tests passed',
            '📤 Uploading to server...',
            '✓ Deployed successfully! 🎉'
        ];
        steps.forEach((step, i) => {
            setTimeout(() => {
                setDeployLog(prev => [...prev, step]);
                if (i === steps.length - 1) setDeploying(false);
            }, (i + 1) * 800);
        });
    };

    const runTerminalCommand = () => {
        if (!terminalInput.trim()) return;
        const cmd = terminalInput.trim();
        setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
        // Simulate responses
        const responses: Record<string, string> = {
            'npm run build': '✓ Build completed in 5.2s',
            'npm test': '✓ 47 tests passed, 0 failed',
            'git status': 'On branch main\nNothing to commit, working tree clean',
            'git log': 'commit abc123 — feat: add pricing engine\ncommit def456 — fix: tax calculation',
            'clear': '',
            'help': 'Available: npm run build, npm test, git status, git log, clear',
        };
        if (cmd === 'clear') { setTerminalOutput([]); }
        else { setTerminalOutput(prev => [...prev, responses[cmd] || `Command not found: ${cmd}. Type 'help' for available commands.`]); }
        setTerminalInput('');
    };

    const stats = [
        { label: t('المهام المفتوحة', 'Open Tasks'), value: tasks.filter(t => t.status !== 'done').length, color: 'text-blue-400' },
        { label: t('الأخطاء', 'Bugs'), value: bugs.filter(b => b.status === 'open').length, color: 'text-red-400' },
        { label: t('عمليات النشر', 'Deployments'), value: '28', color: 'text-green-400' },
        { label: t('الالتزامات هذا الأسبوع', 'Commits This Week'), value: '47', color: 'text-purple-400' },
    ];

    const quickActions = [
        { icon: <GitBranch className="w-6 h-6" />, label: t('المهام', 'Tasks'), color: 'from-gray-500 to-slate-600', panel: 'tasks' as const },
        { icon: <Bug className="w-6 h-6" />, label: t('الأخطاء', 'Bugs'), color: 'from-red-500 to-orange-500', panel: 'bugs' as const },
        { icon: <Rocket className="w-6 h-6" />, label: t('النشر', 'Deploy'), color: 'from-blue-500 to-purple-500', panel: 'deploy' as const },
        { icon: <Database className="w-6 h-6" />, label: t('قاعدة البيانات', 'Database'), color: 'from-green-500 to-teal-500', panel: 'db' as const },
    ];

    const statusColors = { open: 'bg-blue-500/20 text-blue-400', progress: 'bg-amber-500/20 text-amber-400', done: 'bg-green-500/20 text-green-400' };
    const statusLabels = { open: t('مفتوح', 'Open'), progress: t('جاري', 'In Progress'), done: t('مكتمل', 'Done') };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-xl p-6 border border-slate-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                        <Code className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم التطوير والبرمجة', 'Development Department')}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">{t('إجراءات سريعة', 'Quick Actions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button key={index} onClick={() => setActivePanel(activePanel === action.panel ? null : action.panel)}
                            className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white hover:scale-105 transition-transform ${activePanel === action.panel ? 'ring-2 ring-white/30' : ''}`}>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">{action.icon}</div>
                            <p className="font-medium">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Panel */}
            {activePanel === 'tasks' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{t('إدارة المهام', 'Task Management')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder={t('مهمة جديدة...', 'New task...')}
                            onKeyDown={e => e.key === 'Enter' && addTask()}
                            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
                        <button onClick={addTask} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"><Plus className="w-4 h-4" /></button>
                    </div>
                    {tasks.map(task => (
                        <div key={task.id} onClick={() => toggleTaskStatus(task.id)} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/20 cursor-pointer hover:border-blue-500/20 transition-colors">
                            <div className="flex items-center gap-3">
                                {task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : task.status === 'progress' ? <Clock className="w-5 h-5 text-amber-400" /> : <AlertCircle className="w-5 h-5 text-blue-400" />}
                                <span className={`text-sm ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>{statusLabels[task.status]}</span>
                        </div>
                    ))}
                </div>
            )}

            {activePanel === 'bugs' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{t('تتبع الأخطاء', 'Bug Tracker')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    {bugs.map(bug => (
                        <div key={bug.id} onClick={() => toggleBugStatus(bug.id)} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/20 cursor-pointer hover:border-red-500/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bug className={`w-5 h-5 ${bug.status === 'fixed' ? 'text-green-400' : bug.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                                <span className={`text-sm ${bug.status === 'fixed' ? 'text-slate-500 line-through' : 'text-white'}`}>{bug.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${bug.severity === 'critical' ? 'bg-red-500/20 text-red-400' : bug.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/30 text-slate-400'}`}>{bug.severity}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${bug.status === 'fixed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{bug.status === 'fixed' ? t('تم', 'Fixed') : t('مفتوح', 'Open')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activePanel === 'deploy' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('نشر التطبيق', 'Deploy Application')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <button onClick={startDeploy} disabled={deploying}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                        {deploying ? <><Loader2 className="w-5 h-5 animate-spin" />{t('جاري النشر...', 'Deploying...')}</> : <><Rocket className="w-5 h-5" />{t('نشر الآن', 'Deploy Now')}</>}
                    </button>
                    {deployLog.length > 0 && (
                        <div className="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-1 max-h-[200px] overflow-y-auto">
                            {deployLog.map((line, i) => <p key={i} className={line.includes('✓') ? 'text-green-400' : line.includes('🚀') ? 'text-blue-400' : 'text-slate-300'}>{line}</p>)}
                        </div>
                    )}
                </div>
            )}

            {activePanel === 'db' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('قاعدة البيانات', 'Database')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[{ name: 'users', count: 156 }, { name: 'projects', count: 3891 }, { name: 'suppliers', count: 89 }, { name: 'employees', count: 45 }, { name: 'invoices', count: 234 }, { name: 'materials', count: 1200 }].map((col, i) => (
                            <div key={i} className="bg-slate-900/40 rounded-lg p-3 text-center border border-slate-700/20"><p className="text-lg font-bold text-emerald-400">{col.count}</p><p className="text-xs text-slate-500">{col.name}</p></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Terminal */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-500 text-sm mr-4">Terminal</span>
                </div>
                <div className="text-sm max-h-[200px] overflow-y-auto space-y-0.5 mb-3">
                    {terminalOutput.map((line, i) => (
                        <p key={i} className={line.startsWith('$') ? 'text-blue-400' : line.includes('✓') ? 'text-emerald-400' : 'text-slate-400'}>{line}</p>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400">$</span>
                    <input value={terminalInput} onChange={e => setTerminalInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runTerminalCommand()}
                        placeholder={t('اكتب أمر...', 'Type command...')}
                        className="flex-1 bg-transparent text-green-400 placeholder-slate-600 focus:outline-none text-sm" />
                    <button onClick={runTerminalCommand} className="text-slate-500 hover:text-emerald-400"><Play className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPage;
