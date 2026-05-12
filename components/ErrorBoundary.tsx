import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

/**
 * Error Boundary — يمنع ظهور صفحة بيضاء عند حدوث أي خطأ
 * يعرض رسالة واضحة بدلاً من صفحة فارغة
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    declare public props: Readonly<ErrorBoundaryProps>;
    public state: ErrorBoundaryState;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('🚨 Application Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    dir="rtl"
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        fontFamily: 'Tajawal, sans-serif',
                        padding: '20px',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '40px',
                            textAlign: 'center',
                            color: 'white',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                            حدث خطأ غير متوقع
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.6 }}>
                            نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة لاحقاً.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 32px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'Tajawal, sans-serif',
                            }}
                        >
                            تحديث الصفحة
                        </button>
                        {this.state.error && (
                            <details
                                style={{
                                    marginTop: '24px',
                                    textAlign: 'left',
                                    direction: 'ltr',
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '12px',
                                }}
                            >
                                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                                    Error Details
                                </summary>
                                <pre
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
