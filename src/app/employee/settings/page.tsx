'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface User {
    id: number
    name: string
    avatar: string | null
    role: string
}

export default function EmployeeSettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [showAppearance, setShowAppearance] = useState(false)
    const [theme, setTheme] = useState('system')
    const [editHover, setEditHover] = useState(false)
    const [editActive, setEditActive] = useState(false)
    const [logoutHover, setLogoutHover] = useState(false)
    const [logoutActive, setLogoutActive] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
            router.push('/')
        }
    }

    const SettingsItem = ({ icon, title, subtitle, onClick, showArrow = true }: any) => {
        const [isHovered, setIsHovered] = useState(false)
        const [isActive, setIsActive] = useState(false)

        return (
            <div
                onClick={() => {
                    if (onClick) onClick()
                }}
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
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isActive ? '#e0e7ff' : (isHovered ? '#f1f5f9' : 'white'),
                    transform: isActive ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.15s ease-out',
                    position: 'relative'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isActive ? '#c7d2fe' : 'var(--background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    transition: 'background 0.15s ease-out'
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{title}</p>
                    {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</p>}
                </div>
                {showArrow && (
                    <span style={{
                        color: 'var(--text-secondary)',
                        transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                        transition: 'transform 0.15s ease-out'
                    }}>›</span>
                )}
            </div>
        )
    }

    const ThemeButton = ({ label, value }: { label: string; value: string }) => {
        const [isHovered, setIsHovered] = useState(false)
        const [isActive, setIsActive] = useState(false)
        const isSelected = theme === value

        return (
            <button
                onClick={() => setTheme(value)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setIsActive(false) }}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                onTouchStart={() => setIsActive(true)}
                onTouchEnd={() => setIsActive(false)}
                style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : (isHovered ? '#94a3b8' : 'var(--border)')}`,
                    background: isSelected ? 'white' : (isActive ? '#e2e8f0' : (isHovered ? '#f1f5f9' : 'transparent')),
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? '600' : '400',
                    boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none',
                    cursor: 'pointer',
                    transform: isActive ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.15s ease-out'
                }}
            >
                {label}
            </button>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '80px' }}>
            {/* Header */}
            <div className="page-header" style={{ background: 'white' }}>
                <h1 className="page-title">Settings</h1>
            </div>

            <div className="page-content" style={{ padding: '20px' }}>
                {/* Profile Card */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: user?.avatar
                            ? `url(${user.avatar}) center/cover`
                            : 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '600',
                        overflow: 'hidden'
                    }}>
                        {!user?.avatar && (user?.name?.charAt(0) || 'E')}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{user?.name || 'Loading...'}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase' }}>{user?.role || 'Employee'}</p>
                    </div>
                    <button
                        onClick={() => router.push('/employee/settings/profile')}
                        onMouseEnter={() => setEditHover(true)}
                        onMouseLeave={() => { setEditHover(false); setEditActive(false) }}
                        onMouseDown={() => setEditActive(true)}
                        onMouseUp={() => setEditActive(false)}
                        onTouchStart={() => setEditActive(true)}
                        onTouchEnd={() => setEditActive(false)}
                        style={{
                            color: editActive ? '#1e40af' : 'var(--primary)',
                            background: editActive ? '#dbeafe' : (editHover ? '#eff6ff' : 'none'),
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            transform: editActive ? 'scale(0.95)' : 'scale(1)',
                            transition: 'all 0.15s ease-out'
                        }}
                    >
                        Edit →
                    </button>
                </div>

                {/* Settings List */}
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                    <SettingsItem
                        icon="👤"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                        onClick={() => router.push('/employee/settings/profile')}
                    />
                    <SettingsItem
                        icon="🔒"
                        title="Privacy & Security"
                        subtitle="Password and security settings"
                        onClick={() => router.push('/employee/settings/security')}
                    />
                    <SettingsItem
                        icon="🎨"
                        title="Appearance"
                        subtitle="Theme and display options"
                        onClick={() => setShowAppearance(!showAppearance)}
                        showArrow={!showAppearance}
                    />

                    {/* Appearance Options Accordion */}
                    {showAppearance && (
                        <div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <ThemeButton label="Light" value="light" />
                                <ThemeButton label="Dark" value="dark" />
                                <ThemeButton label="System" value="system" />
                            </div>
                        </div>
                    )}

                    <SettingsItem
                        icon="❓"
                        title="Help & Support"
                        subtitle="FAQs and contact support"
                        onClick={() => router.push('/employee/settings/help')}
                    />
                    <SettingsItem
                        icon="ℹ️"
                        title="About"
                        subtitle="App version and information"
                        onClick={() => router.push('/employee/settings/about')}
                        showArrow={true}
                    />
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => { setLogoutHover(false); setLogoutActive(false) }}
                    onMouseDown={() => setLogoutActive(true)}
                    onMouseUp={() => setLogoutActive(false)}
                    onTouchStart={() => setLogoutActive(true)}
                    onTouchEnd={() => setLogoutActive(false)}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: logoutActive ? '#fecaca' : (logoutHover ? '#fee2e2' : '#fef2f2'),
                        color: 'var(--danger)',
                        border: logoutHover ? '1px solid #fca5a5' : '1px solid transparent',
                        borderRadius: '16px',
                        fontWeight: '600',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transform: logoutActive ? 'scale(0.98)' : 'scale(1)',
                        transition: 'all 0.15s ease-out'
                    }}
                >
                    <span>🚪</span> Log Out
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Construction Materials Manager v1.0.0
                </p>
            </div>

            <BottomNav />
        </div>
    )
}
