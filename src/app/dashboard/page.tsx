'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import {
    BellIcon,
    AlertIcon,
    ChartIcon,
    PackageIcon,
    ReceiptIcon,
    WalletIcon,
    TrendingUpIcon,
    HandshakeIcon,
    CalendarIcon,
    UsersIcon,
    ShoppingCartIcon,
    RupeeIcon,
    MoneyOutIcon
} from '@/components/Icons'

interface DashboardStats {
    todaySales: number
    todayExpenses: number
    inventory: {
        totalItems: number
        lowStockCount: number
        totalValue: number
        totalUnits: number
        capacityPercent: number
    }
    borrows: {
        overdueCount: number
        overdueBorrows: Array<{
            id: number
            sale: {
                customer: { name: string } | null
                items: Array<{ item: { name: string }, quantity: number }>
            }
            daysSinceBorrow: number
        }>
    }
    monthlyStats: {
        revenue: number
        expenses: number
        profit: number
        totalInvoices: number
    } | null
    recentActivity: {
        sales: Array<{
            id: number
            orderNumber: string
            totalAmount: number | string
            createdAt: string
            customer: { name: string } | null
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

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user session
                const userRes = await fetch('/api/auth/me')
                if (!userRes.ok) {
                    router.push('/')
                    return
                }
                const userData = await userRes.json()

                if (userData.user.role !== 'ADMIN') {
                    router.push('/employee')
                    return
                }

                setUser(userData.user)

                // Get dashboard stats
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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner" />
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
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
                            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        overflow: 'hidden'
                    }}>
                        {!user?.avatar && (user?.name?.charAt(0) || 'A')}
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{getGreeting()}</p>
                        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>{user?.name || 'Admin'}</h1>
                    </div>
                </div>
                <button style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f1f5f9',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <BellIcon size={22} color="#64748b" />
                </button>
            </div>

            <div className="page-content">
                {/* Borrow Alert Banner */}
                {stats?.borrows && stats.borrows.overdueCount > 0 && (
                    <div className="alert-banner" style={{ marginBottom: '20px' }}>
                        <div className="alert-banner-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertIcon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                                Borrowed Items Alert
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {stats.borrows.overdueCount} items are overdue ({'>'} 7 days)
                            </p>
                        </div>
                        <Link href="/dashboard/borrows" style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                            View Borrowers →
                        </Link>
                    </div>
                )}

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div className="card card-primary stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <RupeeIcon size={22} color="#ffffff" />
                            {stats?.monthlyStats && (
                                <span className="stat-badge">↗ 12%</span>
                            )}
                        </div>
                        <p className="stat-label">Today's Sales</p>
                        <p className="stat-value">₹{stats?.todaySales?.toLocaleString() || '0'}</p>
                    </div>

                    <div className="card stat-card" style={{ background: '#f8fafc' }}>
                        <div style={{ marginBottom: '8px' }}><ChartIcon size={22} color="#475569" /></div>
                        <p className="stat-label" style={{ color: 'var(--text-secondary)' }}>Today's Expenses</p>
                        <p className="stat-value" style={{ color: 'var(--text-primary)' }}>₹{stats?.todayExpenses?.toLocaleString() || '0'}</p>
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <PackageIcon size={22} color="#2563eb" />
                        <h3 style={{ fontWeight: '600' }}>Inventory Health</h3>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '12px' }}>
                        <div className="progress-fill" style={{ width: `${stats?.inventory?.capacityPercent || 0}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            CAPACITY: {stats?.inventory?.capacityPercent || 0}%
                        </span>
                        <span style={{ color: 'var(--warning)' }}>
                            ● {stats?.inventory?.lowStockCount || 0} Low Stock Items
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <Link href="/dashboard/inventory" className="quick-action">
                        <div className="quick-action-icon blue"><PackageIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Inventory</span>
                    </Link>
                    <Link href="/dashboard/sales" className="quick-action">
                        <div className="quick-action-icon green"><ReceiptIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Sales</span>
                    </Link>
                    <Link href="/dashboard/expenses" className="quick-action">
                        <div className="quick-action-icon red"><WalletIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Expenses</span>
                    </Link>
                    <Link href="/dashboard/reports" className="quick-action">
                        <div className="quick-action-icon blue"><TrendingUpIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Reports</span>
                    </Link>
                    <Link href="/dashboard/borrowers" className="quick-action">
                        <div className="quick-action-icon orange"><HandshakeIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Borrowers</span>
                    </Link>
                    <Link href="/dashboard/calendar" className="quick-action">
                        <div className="quick-action-icon green"><CalendarIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Calendar</span>
                    </Link>
                    <Link href="/dashboard/employees" className="quick-action">
                        <div className="quick-action-icon red"><UsersIcon size={22} color="#ffffff" /></div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Employees</span>
                    </Link>
                </div>

                {/* Monthly Summary (Admin Only) */}
                {stats?.monthlyStats && (
                    <>
                        <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Monthly Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            <div className="card" style={{ background: stats.monthlyStats.profit >= 0 ? '#f0fdf4' : '#fef2f2' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>NET PROFIT</p>
                                <p style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: stats.monthlyStats.profit >= 0 ? 'var(--success)' : 'var(--danger)'
                                }}>
                                    ₹{stats.monthlyStats.profit.toLocaleString()}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Margin: {((stats.monthlyStats.profit / stats.monthlyStats.revenue) * 100).toFixed(0)}%
                                </p>
                            </div>
                            <div className="card" style={{ background: '#eff6ff' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>TOTAL INVOICES</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
                                    {stats.monthlyStats.totalInvoices}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>This month</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Recent Activity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600' }}>Recent Activity</h3>
                    <Link href="/dashboard/calendar" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
                        See All
                    </Link>
                </div>
                <div className="card">
                    {stats?.recentActivity?.sales?.length === 0 && stats?.recentActivity?.expenses?.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                            No recent activity
                        </p>
                    ) : (
                        <>
                            {stats?.recentActivity?.sales?.slice(0, 3).map((sale) => (
                                <div key={sale.id} className="transaction-item">
                                    <div className="transaction-icon sale"><ShoppingCartIcon size={18} color="#16a34a" /></div>
                                    <div className="transaction-details">
                                        <p className="transaction-title">Sale #{sale.orderNumber}</p>
                                        <p className="transaction-subtitle">
                                            {sale.items?.map(i => i.item.name).join(', ').slice(0, 30)}...
                                        </p>
                                    </div>
                                    <p className="transaction-amount positive">
                                        +₹{Number(sale.totalAmount).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                            {stats?.recentActivity?.expenses?.slice(0, 2).map((expense) => (
                                <div key={expense.id} className="transaction-item">
                                    <div className="transaction-icon expense"><MoneyOutIcon size={18} color="#dc2626" /></div>
                                    <div className="transaction-details">
                                        <p className="transaction-title">{expense.description}</p>
                                        <p className="transaction-subtitle">
                                            {new Date(expense.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className="transaction-amount negative">
                                        -₹{Number(expense.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <BottomNav isAdmin />
        </div>
    )
}
