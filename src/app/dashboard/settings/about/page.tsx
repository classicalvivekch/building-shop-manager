'use client'

import { useRouter } from 'next/navigation'

export default function AdminAboutPage() {
    const router = useRouter()

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: '600' }}>About</h1>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* App Logo & Name */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}>
                        <span style={{ fontSize: '48px' }}>🏗️</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                        Construction Materials Manager
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Version 1.0.0
                    </p>
                </div>

                {/* About Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary)' }}>
                        📱 About This App
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
                        Construction Materials Manager is a comprehensive business management solution
                        designed specifically for building material shops. It helps you manage inventory,
                        track sales, monitor expenses, and handle customer transactions with ease.
                    </p>
                </div>

                {/* Features Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                        ✨ Key Features
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { icon: '📦', text: 'Inventory Management' },
                            { icon: '💰', text: 'Sales Tracking' },
                            { icon: '📊', text: 'Expense Monitoring' },
                            { icon: '📑', text: 'Reports & Analytics' },
                            { icon: '👥', text: 'Multi-user Support' },
                            { icon: '📅', text: 'Calendar Integration' },
                            { icon: '💳', text: 'Borrow Management' },
                        ].map((feature, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                                <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Developer Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #c7d2fe',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#4338ca' }}>
                        👨‍💻 Developer
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            V
                        </div>
                        <div>
                            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e1b4b' }}>
                                Vivek Choudhary
                            </h4>
                            <p style={{ color: '#6366f1', fontSize: '14px', fontWeight: '500' }}>
                                Full Stack Developer
                            </p>
                        </div>
                    </div>
                    <p style={{
                        marginTop: '16px',
                        color: '#4338ca',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontStyle: 'italic'
                    }}>
                        "Building solutions that make business management simpler and more efficient."
                    </p>
                </div>

                {/* Copyright */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        © 2026 Construction Materials Manager
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                        Made with ❤️ in India
                    </p>
                </div>
            </div>
        </div>
    )
}
