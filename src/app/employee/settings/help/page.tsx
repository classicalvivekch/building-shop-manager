'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminContact {
    name: string
    email: string
    phone: string
}

export default function HelpSupportPage() {
    const router = useRouter()
    const [admin, setAdmin] = useState<AdminContact | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await fetch('/api/admin/contact')
                if (res.ok) {
                    const data = await res.json()
                    setAdmin(data.admin)
                }
            } catch (error) {
                console.error('Error fetching admin:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAdmin()
    }, [])

    const ContactItem = ({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) => {
        const [isHovered, setIsHovered] = useState(false)
        const [isActive, setIsActive] = useState(false)

        const content = (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setIsActive(false) }}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                onTouchStart={() => setIsActive(true)}
                onTouchEnd={() => setIsActive(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: isActive ? '#e0e7ff' : (isHovered ? '#f1f5f9' : 'white'),
                    borderRadius: '12px',
                    cursor: href ? 'pointer' : 'default',
                    transition: 'all 0.15s ease-out',
                    transform: isActive ? 'scale(0.98)' : 'scale(1)'
                }}
            >
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{value}</p>
                </div>
                {href && <span style={{ color: 'var(--primary)', fontSize: '20px' }}>→</span>}
            </div>
        )

        if (href) {
            return <a href={href} style={{ textDecoration: 'none' }}>{content}</a>
        }
        return content
    }

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
                <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Help & Support</h1>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Admin Contact Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px' }}>👨‍💼</span>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Contact Admin</h2>
                    </div>

                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                            Loading contact details...
                        </p>
                    ) : admin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <ContactItem
                                icon="👤"
                                label="Admin Name"
                                value={admin.name}
                            />
                            <ContactItem
                                icon="📧"
                                label="Email"
                                value={admin.email}
                                href={`mailto:${admin.email}`}
                            />
                            <ContactItem
                                icon="📱"
                                label="Phone"
                                value={admin.phone || 'Not available'}
                                href={admin.phone ? `tel:${admin.phone}` : undefined}
                            />
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                            Admin contact not available
                        </p>
                    )}
                </div>

                {/* FAQ Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '24px' }}>❓</span>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>FAQs</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { q: 'How do I add a new sale?', a: 'Go to Dashboard and tap "New Sale" to create a sale record.' },
                            { q: 'How do I track expenses?', a: 'Navigate to the Expenses section to add and view all expenses.' },
                            { q: 'How do I change my password?', a: 'Go to Settings → Privacy & Security to update your password.' },
                        ].map((faq, index) => (
                            <div key={index} style={{
                                padding: '14px',
                                background: 'var(--background)',
                                borderRadius: '10px'
                            }}>
                                <p style={{ fontWeight: '500', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                    {faq.q}
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Info */}
                <div style={{
                    background: '#eff6ff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #bfdbfe',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#1e40af', fontSize: '14px' }}>
                        💬 Need more help? Contact your admin for assistance.
                    </p>
                </div>
            </div>
        </div>
    )
}
