/**
 * ARBA V11.3 — AI Control Center (مركز تحكم الذكاء الاصطناعي)
 * Main shell page with 8 tabs, RBAC-filtered by userRole
 * 
 * Role hierarchy: admin > developer > manager > qs > user
 * QS sees tabs 1-4, Manager sees all 8
 */

import React, { useState, Suspense } from 'react';

// Lazy load all panels
const BrainControlPanel = React.lazy(() => import('../../components/ai-center/BrainControlPanel'));
const LearningPanel = React.lazy(() => import('../../components/ai-center/LearningPanel'));
const AgentsDashboard = React.lazy(() => import('../../components/ai-center/AgentsDashboard'));
const FileProcessingHub = React.lazy(() => import('../../components/ai-center/FileProcessingHub'));
const MonitoringPanel = React.lazy(() => import('../../components/ai-center/MonitoringPanel'));
const AgentCostPanel = React.lazy(() => import('../../components/ai-center/AgentCostPanel'));
const APILogsPanel = React.lazy(() => import('../../components/ai-center/APILogsPanel'));
const AISettingsPanel = React.lazy(() => import('../../components/ai-center/AISettingsPanel'));

// =================== Types ===================

type UserRole = 'user' | 'qs' | 'quantity_surveyor' | 'manager' | 'developer' | 'admin';
type MinRole = 'qs' | 'manager';

interface TabDef {
  id: string;
  icon: string;
  labelAr: string;
  labelEn: string;
  minRole: MinRole;
}

interface AIControlCenterProps {
  language: 'ar' | 'en';
  onNavigate: (page: string) => void;
  userRole: UserRole;
}

// =================== Constants ===================

const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  qs: 1,
  quantity_surveyor: 1,
  manager: 2,
  developer: 3,
  admin: 4,
};

const ALL_TABS: TabDef[] = [
  { id: 'brain', icon: '🧠', labelAr: 'تحكم الدماغ', labelEn: 'Brain Control', minRole: 'qs' },
  { id: 'learning', icon: '📚', labelAr: 'التعليم', labelEn: 'Learning', minRole: 'qs' },
  { id: 'agents', icon: '🤖', labelAr: 'الوكلاء', labelEn: 'AI Agents', minRole: 'qs' },
  { id: 'files', icon: '📁', labelAr: 'الملفات', labelEn: 'Files', minRole: 'qs' },
  { id: 'monitoring', icon: '📊', labelAr: 'المراقبة', labelEn: 'Monitoring', minRole: 'manager' },
  { id: 'costs', icon: '💰', labelAr: 'التكاليف', labelEn: 'Costs', minRole: 'manager' },
  { id: 'api', icon: '🔌', labelAr: 'سجل API', labelEn: 'API Logs', minRole: 'manager' },
  { id: 'settings', icon: '⚙️', labelAr: 'الإعدادات', labelEn: 'Settings', minRole: 'manager' },
];

// =================== Styles ===================

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary, #0B1120)',
    direction: 'rtl' as const,
    fontFamily: 'var(--font-arabic, "Tajawal", "Cairo", sans-serif)',
    color: 'var(--text-primary, #F1F5F9)',
  },
  headerWrapper: {
    background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, transparent 100%)',
    borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
    padding: '24px 32px 0',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  title: {
    fontSize: 'var(--text-3xl, 1.875rem)',
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(135deg, #818CF8 0%, #A5B4FC 50%, #FBBF24 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 'var(--text-sm, 0.875rem)',
    color: 'var(--text-secondary, #94A3B8)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  subtitleDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#34D399',
    display: 'inline-block',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: 'var(--radius-md, 12px)',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    color: 'var(--text-accent, #A5B4FC)',
    cursor: 'pointer',
    fontSize: 'var(--text-sm, 0.875rem)',
    fontFamily: 'inherit',
    transition: 'all 250ms ease',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    overflowX: 'auto' as const,
    overflowY: 'hidden' as const,
    paddingBottom: '0',
    scrollBehavior: 'smooth' as const,
    msOverflowStyle: 'none' as const,
    scrollbarWidth: 'none' as const,
  },
  tab: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '12px 12px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--text-sm, 0.875rem)',
    fontFamily: 'inherit',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#fff' : 'var(--text-secondary, #94A3B8)',
    background: isActive
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.15) 100%)'
      : 'transparent',
    borderBottom: isActive ? '2px solid #6366F1' : '2px solid transparent',
    transition: 'all 250ms ease',
    whiteSpace: 'nowrap' as const,
    position: 'relative' as const,
  }),
  tabIcon: {
    fontSize: '1.1rem',
  },
  tabGlow: {
    position: 'absolute' as const,
    bottom: '0',
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #6366F1, transparent)',
    borderRadius: '2px',
  },
  content: {
    padding: '24px 32px 48px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  loadingFallback: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  loadingText: {
    color: 'var(--text-accent, #A5B4FC)',
    fontSize: 'var(--text-2xl, 1.5rem)',
    fontFamily: 'inherit',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366F1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// =================== Helpers ===================

function hasAccess(userRole: UserRole, minRole: MinRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  return userLevel >= requiredLevel;
}

// =================== Component ===================

const AIControlCenter: React.FC<AIControlCenterProps> = ({ language, onNavigate, userRole }) => {
  const visibleTabs = ALL_TABS.filter(tab => hasAccess(userRole, tab.minRole));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || 'brain');

  const renderPanel = () => {
    switch (activeTab) {
      case 'brain':
        return <BrainControlPanel />;
      case 'learning':
        return <LearningPanel />;
      case 'agents':
        return <AgentsDashboard />;
      case 'files':
        return <FileProcessingHub />;
      case 'monitoring':
        return <MonitoringPanel />;
      case 'costs':
        return <AgentCostPanel />;
      case 'api':
        return <APILogsPanel />;
      case 'settings':
        return <AISettingsPanel />;
      default:
        return <BrainControlPanel />;
    }
  };

  const LoadingFallback = () => (
    <div style={styles.loadingFallback}>
      <div style={styles.loadingSpinner} />
      <div style={styles.loadingText}>⏳ جاري التحميل...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerWrapper}>
        <div style={styles.headerTop}>
          {/* Title Area */}
          <div style={styles.titleArea}>
            <h1 style={styles.title}>🧠 مركز تحكم الذكاء الاصطناعي</h1>
            <p style={styles.subtitle}>
              <span style={styles.subtitleDot} />
              V11.3 • 18 وكيل • 5,121 بند تدريب
            </p>
          </div>

          {/* Back Button */}
          <button
            style={styles.backButton}
            onClick={() => onNavigate('developer')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
            }}
          >
            ← العودة للوحة المطور
          </button>
        </div>

        {/* Tab Bar */}
        <div style={styles.tabBar}>
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                style={styles.tab(isActive)}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#E2E8F0';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary, #94A3B8)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={styles.tabIcon}>{tab.icon}</span>
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {isActive && <span style={styles.tabGlow} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        <Suspense fallback={<LoadingFallback />}>
          {renderPanel()}
        </Suspense>
      </div>
    </div>
  );
};

export default AIControlCenter;
