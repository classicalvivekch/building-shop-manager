'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface BorrowRecord {
    id: number
    borrowDate: string
    daysSinceBorrow: number
    overdueDays: number
    isOverdue: boolean
    reminderDismissed: boolean
    outstandingAmount: number | string
    sale: {
        id: number
        orderNumber: string
        totalAmount: number | string
        customer: { name: string, mobile: string } | null
        items: Array<{ item: { name: string }, quantity: number }>
    }
}

interface BorrowData {
    total: number
    overdueCount: number
    records: BorrowRecord[]
    overdueRecords: BorrowRecord[]
    upcomingRecords: BorrowRecord[]
}

export default function BorrowersPage() {
    const router = useRouter()
    const [data, setData] = useState<BorrowData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBorrows = async () => {
            try {
                const res = await fetch('/api/borrows')
                if (res.ok) {
                    const borrowData = await res.json()
                    setData(borrowData)
                }
            } catch (error) {
                console.error('Error fetching borrows:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBorrows()
    }, [])

    const handleReturn = async (id: number) => {
        try {
            const res = await fetch(`/api/borrows/${id}/return`, { method: 'POST' })
            if (res.ok) {
                setData(prev => prev ? {
                    ...prev,
                    records: prev.records.filter(r => r.id !== id),
                    overdueRecords: prev.overdueRecords.filter(r => r.id !== id),
                    upcomingRecords: prev.upcomingRecords.filter(r => r.id !== id),
                    total: prev.total - 1,
                    overdueCount: prev.overdueRecords.find(r => r.id === id) ? prev.overdueCount - 1 : prev.overdueCount
                } : null)
            }
        } catch (error) {
            console.error('Error marking as returned:', error)
        }
    }

    const handleDismiss = async (id: number) => {
        try {
            const res = await fetch(`/api/borrows/${id}/dismiss`, { method: 'POST' })
            if (res.ok) {
                setData(prev => prev ? {
                    ...prev,
                    records: prev.records.map(r => r.id === id ? { ...r, reminderDismissed: true } : r),
                    overdueRecords: prev.overdueRecords.filter(r => r.id !== id),
                    overdueCount: prev.overdueCount - 1
                } : null)
            }
        } catch (error) {
            console.error('Error dismissing reminder:', error)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div className="page-header" style={{ background: 'white' }}>
                <button onClick={() => router.back()} className="back-btn">←</button>
                <h1 className="page-title">Borrower Report</h1>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>⚙️</button>
            </div>

            <div className="page-content">
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="card" style={{ background: '#eff6ff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span>📋</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Borrowers</span>
                        </div>
                        <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{data?.total || 0}</p>
                        <p style={{ fontSize: '11px', color: 'var(--success)' }}>↗ +10% vs last week</p>
                    </div>
                    <div className="card" style={{ background: '#fef2f2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span>⚠️</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overdue Items</span>
                        </div>
                        <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--danger)' }}>{data?.overdueCount || 0}</p>
                        <p style={{ fontSize: '11px', color: 'var(--danger)' }}>↗ +20% overdue rate</p>
                    </div>
                </div>

                {/* Overdue Alerts */}
                {data?.overdueRecords && data.overdueRecords.length > 0 && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '600' }}>Overdue Alerts</h3>
                            <span className="badge badge-danger">{data.overdueRecords.length}</span>
                        </div>

                        {data.overdueRecords.map(record => (
                            <div key={record.id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '15px' }}>{record.sale.customer?.name || 'Unknown'}</p>
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    {record.sale.items.map(i => `${i.item.name} (Qty: ${i.quantity})`).join(', ').slice(0, 40)}
                                                </p>
                                            </div>
                                            <span className="badge badge-danger">{record.overdueDays} Days Overdue</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            📅 Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                        onClick={() => handleDismiss(record.id)}
                                    >
                                        Remind Later
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => handleReturn(record.id)}
                                    >
                                        ✓ Returned
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Recent Borrows */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px', marginTop: '24px' }}>Recent Borrows</h3>
                {data?.upcomingRecords?.length === 0 && data?.overdueRecords?.length === 0 ? (
                    <div className="card">
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                            No active borrow records
                        </p>
                    </div>
                ) : (
                    data?.upcomingRecords?.map(record => {
                        const dueIn = 7 - record.daysSinceBorrow
                        return (
                            <div key={record.id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '15px' }}>{record.sale.customer?.name || 'Unknown'}</p>
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    {record.sale.items.map(i => i.item.name).join(', ').slice(0, 30)}
                                                </p>
                                            </div>
                                            <span className={`badge ${dueIn <= 1 ? 'badge-warning' : 'badge-success'}`}>
                                                {dueIn <= 0 ? 'Due Today' : dueIn === 1 ? 'Due Tomorrow' : 'On Time'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            📅 Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                                    <button
                                        style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                                        onClick={() => handleReturn(record.id)}
                                    >
                                        Mark Returned →
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <BottomNav isAdmin />
        </div>
    )
}
