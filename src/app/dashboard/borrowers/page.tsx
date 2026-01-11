'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface BorrowItem {
    name: string
    quantity: number
}

interface Customer {
    id: number | null
    name: string
    mobile: string | null
}

interface BorrowRecord {
    id: number
    borrowDate: string
    dueDate: string
    outstandingAmount: number
    isOverdue: boolean
    daysSinceBorrow: number
    daysOverdue: number
    reminderDismissed: boolean
    orderNumber: string
    customer: Customer | null
    items: BorrowItem[]
}

interface BorrowerData {
    stats: {
        activeBorrowers: number
        borrowsChange: number
        overdueCount: number
        overdueRate: number
    }
    overdueAlerts: BorrowRecord[]
    recentBorrows: BorrowRecord[]
}

export default function BorrowerReportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<BorrowerData | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/borrowers')
            if (res.ok) {
                const borrowerData = await res.json()
                setData(borrowerData)
            }
        } catch (error) {
            console.error('Error fetching borrower data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (borrowId: number, action: 'returned' | 'remind_later') => {
        setActionLoading(borrowId)
        try {
            const res = await fetch('/api/borrowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ borrowId, action })
            })
            if (res.ok) {
                // Refresh data
                await fetchData()
            }
        } catch (error) {
            console.error('Error performing action:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const getDueBadge = (borrow: BorrowRecord) => {
        if (borrow.isOverdue && borrow.daysOverdue > 0) {
            return { text: `${borrow.daysOverdue} Days Overdue`, color: 'var(--danger)', bg: '#fef2f2' }
        }
        if (borrow.daysSinceBorrow >= 6) {
            return { text: 'Due Tomorrow', color: 'var(--warning)', bg: '#fffbeb' }
        }
        return { text: 'On Time', color: 'var(--success)', bg: '#f0fdf4' }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div className="page-header" style={{ background: 'white' }}>
                <button onClick={() => router.back()} className="back-btn">←</button>
                <h1 className="page-title">Borrower Report</h1>
                <button
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    ⚙️
                </button>
            </div>

            <div className="page-content">
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                                background: '#eff6ff',
                                padding: '8px',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}>👥</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Borrowers</span>
                        </div>
                        <p style={{ fontSize: '32px', fontWeight: '700' }}>{data?.stats.activeBorrowers || 0}</p>
                        <p style={{
                            fontSize: '12px',
                            color: (data?.stats.borrowsChange || 0) <= 0 ? 'var(--success)' : 'var(--warning)',
                            marginTop: '4px'
                        }}>
                            ↗ {Math.abs(data?.stats.borrowsChange || 0)}% vs last week
                        </p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                                background: '#fef2f2',
                                padding: '8px',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}>⚠️</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overdue Items</span>
                        </div>
                        <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--danger)' }}>{data?.stats.overdueCount || 0}</p>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--danger)',
                            marginTop: '4px'
                        }}>
                            ↗ {data?.stats.overdueRate || 0}% overdue rate
                        </p>
                    </div>
                </div>

                {/* Overdue Alerts */}
                {(data?.overdueAlerts?.length || 0) > 0 && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '600', fontSize: '16px' }}>Overdue Alerts</h3>
                            <span style={{
                                background: 'var(--danger)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {data?.overdueAlerts?.length || 0}
                            </span>
                        </div>

                        {data?.overdueAlerts?.map((borrow) => {
                            const badge = getDueBadge(borrow)
                            return (
                                <div key={borrow.id} className="card" style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        {/* Product Image Placeholder */}
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '12px',
                                            background: 'var(--background)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px',
                                            flexShrink: 0
                                        }}>
                                            📦
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                                                        {borrow.customer?.name || 'Unknown Customer'}
                                                    </h4>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                        {borrow.items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ')}
                                                    </p>
                                                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--danger)', marginTop: '4px' }}>
                                                        ₹{borrow.outstandingAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {badge.text}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📅</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    Borrowed: {formatDate(borrow.borrowDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button
                                            onClick={() => handleAction(borrow.id, 'remind_later')}
                                            disabled={actionLoading === borrow.id}
                                            style={{
                                                padding: '10px',
                                                border: '1px solid var(--border)',
                                                borderRadius: '10px',
                                                background: 'white',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Remind Later
                                        </button>
                                        <button
                                            onClick={() => handleAction(borrow.id, 'returned')}
                                            disabled={actionLoading === borrow.id}
                                            style={{
                                                padding: '10px',
                                                border: 'none',
                                                borderRadius: '10px',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            ✓ Returned
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}

                {/* Recent Borrows */}
                <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px', marginTop: '24px' }}>
                    Recent Borrows
                </h3>

                {(data?.recentBorrows?.length || 0) === 0 && (data?.overdueAlerts?.length || 0) === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>✅</span>
                        <p style={{ color: 'var(--text-secondary)' }}>No active borrows</p>
                    </div>
                ) : (
                    data?.recentBorrows?.map((borrow) => {
                        const badge = getDueBadge(borrow)
                        return (
                            <div key={borrow.id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {/* Product Image Placeholder */}
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '10px',
                                        background: 'var(--background)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        flexShrink: 0
                                    }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h4 style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>
                                                    {borrow.customer?.name || 'Unknown Customer'}
                                                </h4>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    {borrow.items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ')}
                                                </p>
                                                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--danger)', marginTop: '2px' }}>
                                                    ₹{borrow.outstandingAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: badge.bg,
                                                color: badge.color,
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {badge.text}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📅</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                Borrowed: {formatDate(borrow.borrowDate)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleAction(borrow.id, 'returned')}
                                            disabled={actionLoading === borrow.id}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--primary)',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                padding: '0',
                                                marginTop: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            Mark Returned →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => router.push('/dashboard/sales/new?borrow=true')}
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '20px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
            >
                +
            </button>

            <BottomNav isAdmin />
        </div>
    )
}
