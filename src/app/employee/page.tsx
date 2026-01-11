'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface DashboardStats {
    todayExpenses: number
    monthlyExpenses: number
    inventory: {
        totalUnits: number
        lowStockCount: number
    }
    borrows: {
        overdueCount: number
    }
    recentActivity: {
        sales: Array<{
            id: number
            orderNumber: string
            totalAmount: number | string
            createdAt: string
            items: Array<{ item: { name: string } }>
        }>
        expenses: Array<{
            id: number
            description: string
            amount: number | string
            createdAt: string
        }>
    }
}

interface User {
    id: number
    name: string
    email: string
    avatar: string | null
    role: 'ADMIN' | 'EMPLOYEE'
}

export default function EmployeeDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me')
                if (!userRes.ok) {
                    router.push('/')
                    return
                }
                const userData = await userRes.json()

                if (userData.user.role === 'ADMIN') {
                    router.push('/dashboard')
                    return
                }

                setUser(userData.user)

                const statsRes = await fetch('/api/dashboard/stats')
                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
                }
            } catch (error) {
                console.error('Dashboard error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'GOOD MORNING'
        if (hour < 17) return 'GOOD AFTERNOON'
        return 'GOOD EVENING'
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                background: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: user?.avatar
                            ? `url(${user.avatar}) center/cover`
                            : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        overflow: 'hidden'
                    }}>
                        {!user?.avatar && (user?.name?.charAt(0) || 'E')}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{getGreeting()}</p>
                        <h1 style={{ fontSize: '18px', fontWeight: '700' }}>{user?.name || 'Employee'}</h1>
                    </div>
                </div>
                <button style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f1f5f9',
                    cursor: 'pointer',
                    fontSize: '20px'
                }}>
                    🔔
                </button>
            </div>

            <div className="page-content">
                {/* Borrow Alert */}
                {stats?.borrows && stats.borrows.overdueCount > 0 && (
                    <div className="alert-banner" style={{ marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '12px' }}>⚠️ ACTION REQUIRED</p>
                            <h3 style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>Borrow Alert</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {stats.borrows.overdueCount} items are currently overdue or low in stock.
                            </p>
                        </div>
                        <div style={{ width: '80px', height: '60px', background: '#f1f5f9', borderRadius: '8px' }} />
                    </div>
                )}

                {/* Overview */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span>📊</span>
                            <span style={{ fontSize: '13px', color: 'var(--danger)' }}>Daily Expenses</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: '700' }}>₹{stats?.todayExpenses?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span>🗓️</span>
                            <span style={{ fontSize: '13px', color: 'var(--danger)' }}>Monthly Expenses</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: '700' }}>₹{stats?.monthlyExpenses?.toLocaleString() || '0'}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <Link href="/employee/sales/new" className="card card-primary" style={{ textAlign: 'center', padding: '24px', textDecoration: 'none' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</div>
                        <p style={{ fontWeight: '600' }}>New Sale</p>
                    </Link>
                    <Link href="/employee/expenses/new" className="card" style={{ textAlign: 'center', padding: '24px', textDecoration: 'none', color: 'var(--text-primary)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                        <p style={{ fontWeight: '600' }}>New Expense</p>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600' }}>Recent Activity</h3>
                    <Link href="/employee/sales" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
                        See All
                    </Link>
                </div>
                <div className="card">
                    {(!stats?.recentActivity?.sales?.length && !stats?.recentActivity?.expenses?.length) ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                            No recent activity
                        </p>
                    ) : (
                        <>
                            {stats?.recentActivity?.sales?.slice(0, 3).map((sale) => (
                                <div key={sale.id} className="transaction-item">
                                    <div className="transaction-icon sale">🛒</div>
                                    <div className="transaction-details">
                                        <p className="transaction-title">Sale #{sale.orderNumber}</p>
                                        <p className="transaction-subtitle">
                                            {sale.items?.map(i => i.item.name).join(', ').slice(0, 20)}...
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="transaction-amount positive">+₹{Number(sale.totalAmount).toLocaleString()}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentActivity?.expenses?.slice(0, 2).map((expense) => (
                                <div key={expense.id} className="transaction-item">
                                    <div className="transaction-icon expense">💸</div>
                                    <div className="transaction-details">
                                        <p className="transaction-title">{expense.description}</p>
                                        <p className="transaction-subtitle">Expense</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="transaction-amount negative">-₹{Number(expense.amount).toLocaleString()}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
