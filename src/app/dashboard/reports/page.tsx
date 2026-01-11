'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface ReportData {
    period: string
    dateRange: { start: string, end: string }
    summary: {
        totalSales: number
        salesCount: number
        salesChange: number
        totalExpenses: number
        expensesChange: number
        netProfit: number
        profitMargin: number
    }
    salesByCategory: Array<{ category: string, amount: number, percentage: number }>
    topSellingItems: Array<{ id: number, name: string, unit: string, quantitySold: number, totalAmount: number }>
    customers: Array<{ id: number, name: string, mobile: string, orderCount: number, totalSpent: number, paidAmount: number, pendingAmount: number, isRepeat: boolean }>
    employees: Array<{ id: number, name: string, email: string, salesCount: number, totalSales: number }>
    monthlySummary: {
        totalInvoices: number
        inventoryLoss: number
    }
}

export default function ReportsPage() {
    const router = useRouter()
    const [period, setPeriod] = useState('today')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ReportData | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'employees'>('overview')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [showCustomModal, setShowCustomModal] = useState(false)

    const periods = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'custom', label: 'Custom' }
    ]

    const categoryColors: Record<string, string> = {
        'Cement': '#3b82f6',
        'Steel': '#f59e0b',
        'Bricks': '#ef4444',
        'Paint': '#10b981',
        'Aggregates': '#8b5cf6',
        'Other': '#6b7280'
    }

    useEffect(() => {
        fetchReports()
    }, [period, customStart, customEnd])

    const fetchReports = async () => {
        setLoading(true)
        try {
            let url = `/api/reports?period=${period}`
            if (period === 'custom' && customStart && customEnd) {
                url += `&startDate=${customStart}&endDate=${customEnd}`
            }
            const res = await fetch(url)
            if (res.ok) {
                const reportData = await res.json()
                setData(reportData)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePeriodChange = (newPeriod: string) => {
        if (newPeriod === 'custom') {
            setShowCustomModal(true)
        } else {
            setPeriod(newPeriod)
        }
    }

    const applyCustomRange = () => {
        if (customStart && customEnd) {
            setPeriod('custom')
            setShowCustomModal(false)
        }
    }

    if (loading && !data) {
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
                <h1 className="page-title">Reports</h1>
                <button
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                    onClick={() => alert('Download feature coming soon!')}
                >
                    ⬇️
                </button>
            </div>

            <div className="page-content">
                {/* Period Filters */}
                <div className="chip-group" style={{ marginBottom: '20px', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '8px' }}>
                    {periods.map(p => (
                        <button
                            key={p.key}
                            className={`chip ${period === p.key ? 'active' : ''}`}
                            onClick={() => handlePeriodChange(p.key)}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Total Sales Card */}
                <div className="card card-primary" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Total Sales</p>
                            <p style={{ fontSize: '32px', fontWeight: '700', margin: '8px 0' }}>
                                ₹{data?.summary.totalSales.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div style={{
                            background: (data?.summary.salesChange || 0) >= 0 ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}>
                            {(data?.summary.salesChange || 0) >= 0 ? '↗' : '↘'} {Math.abs(data?.summary.salesChange || 0)}%
                        </div>
                    </div>
                    <div style={{
                        height: '6px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '3px',
                        marginTop: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '70%',
                            background: 'white',
                            borderRadius: '3px'
                        }} />
                    </div>
                </div>

                {/* Expenses & Net Profit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expenses</p>
                            <span style={{
                                background: '#fef2f2',
                                color: 'var(--danger)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}>📊</span>
                        </div>
                        <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--danger)' }}>
                            ₹{data?.summary.totalExpenses.toLocaleString() || '0'}
                        </p>
                        <p style={{
                            fontSize: '11px',
                            color: (data?.summary.expensesChange || 0) <= 0 ? 'var(--success)' : 'var(--danger)',
                            marginTop: '4px'
                        }}>
                            ↗ {Math.abs(data?.summary.expensesChange || 0)}% vs yesterday
                        </p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Net Profit</p>
                            <span style={{
                                background: '#f0fdf4',
                                color: 'var(--success)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}>💰</span>
                        </div>
                        <p style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: (data?.summary.netProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                            ₹{data?.summary.netProfit.toLocaleString() || '0'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Margin: {data?.summary.profitMargin || 0}%
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="chip-group" style={{ marginBottom: '20px' }}>
                    <button
                        className={`chip ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={`chip ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        👥 Customers
                    </button>
                    <button
                        className={`chip ${activeTab === 'employees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        👔 Employees
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Sales by Category */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '20px' }}>📈</span>
                            <h3 style={{ fontWeight: '600', fontSize: '16px' }}>Sales by Category</h3>
                        </div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {/* Pie Chart Visual */}
                                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                        {data?.salesByCategory.length ? (
                                            (() => {
                                                let offset = 0
                                                return data.salesByCategory.map((cat, idx) => {
                                                    const dash = cat.percentage
                                                    const dashOffset = 100 - offset
                                                    offset += dash
                                                    return (
                                                        <circle
                                                            key={idx}
                                                            cx="18"
                                                            cy="18"
                                                            r="15.9155"
                                                            fill="transparent"
                                                            stroke={categoryColors[cat.category] || '#6b7280'}
                                                            strokeWidth="4"
                                                            strokeDasharray={`${dash} ${100 - dash}`}
                                                            strokeDashoffset={dashOffset}
                                                        />
                                                    )
                                                })
                                            })()
                                        ) : (
                                            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#e5e7eb" strokeWidth="4" />
                                        )}
                                    </svg>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Top</p>
                                        <p style={{ fontSize: '12px', fontWeight: '600' }}>{data?.salesByCategory[0]?.category || 'N/A'}</p>
                                    </div>
                                </div>
                                {/* Category Legend */}
                                <div style={{ flex: 1 }}>
                                    {data?.salesByCategory.slice(0, 4).map((cat, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: categoryColors[cat.category] || '#6b7280'
                                                }} />
                                                <span style={{ fontSize: '13px' }}>{cat.category}</span>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Items */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '600', fontSize: '16px' }}>Top Selling Items</h3>
                            <span style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer' }}>View All</span>
                        </div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            {data?.topSellingItems.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No items sold</p>
                            ) : (
                                data?.topSellingItems.map((item, idx) => (
                                    <div key={item.id} className="transaction-item">
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: 'var(--background)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '16px'
                                        }}>
                                            📦
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-title">{item.name}</p>
                                            <p className="transaction-subtitle">{item.quantitySold} {item.unit} sold</p>
                                        </div>
                                        <p style={{ fontWeight: '600' }}>₹{item.totalAmount.toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Monthly Summary */}
                        <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>Monthly Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            <div className="card" style={{ background: '#fef2f2' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--danger)' }}>⚠️</span>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inventory Loss</p>
                                </div>
                                <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--danger)' }}>
                                    ₹{data?.monthlySummary.inventoryLoss.toLocaleString() || '0'}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Damaged goods</p>
                            </div>
                            <div className="card" style={{ background: '#eff6ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--primary)' }}>📄</span>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Invoices</p>
                                </div>
                                <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>
                                    {data?.monthlySummary.totalInvoices || 0}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>This month</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'customers' && (
                    <>
                        {/* Customer Breakdown */}
                        <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>Customer Breakdown</h3>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            {data?.customers.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No customer data</p>
                            ) : (
                                data?.customers.map((customer) => (
                                    <div key={customer.id} className="transaction-item" style={{ alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '16px'
                                        }}>
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-title">{customer.name}</p>
                                            <p className="transaction-subtitle">
                                                {customer.isRepeat ? 'Repeat' : 'New Customer'} • {customer.orderCount} orders
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '600' }}>₹{customer.totalSpent.toLocaleString()}</p>
                                            <span className={`badge ${customer.pendingAmount > 0 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '10px' }}>
                                                {customer.pendingAmount > 0 ? 'Pending' : 'Paid'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'employees' && (
                    <>
                        {/* Employee Performance */}
                        <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>Employee Performance</h3>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            {data?.employees.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No employee data</p>
                            ) : (
                                data?.employees.map((employee, idx) => (
                                    <div key={employee.id} className="transaction-item">
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--background)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: idx === 0 ? 'white' : 'var(--text-primary)',
                                            fontWeight: '600',
                                            fontSize: idx === 0 ? '16px' : '14px'
                                        }}>
                                            {idx === 0 ? '🏆' : employee.name.charAt(0)}
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-title">{employee.name}</p>
                                            <p className="transaction-subtitle">{employee.salesCount} sales made</p>
                                        </div>
                                        <p style={{ fontWeight: '600', color: 'var(--success)' }}>₹{employee.totalSales.toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Download Button */}
                <button
                    className="btn btn-primary"
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 40px)',
                        maxWidth: '390px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onClick={() => alert('Download feature coming soon!')}
                >
                    ⬇️ Download Full Report
                </button>
            </div>

            <BottomNav isAdmin />

            {/* Custom Date Modal */}
            {showCustomModal && (
                <div
                    onClick={() => setShowCustomModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '24px',
                            maxWidth: '350px',
                            width: '100%'
                        }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Custom Date Range</h3>
                        <div className="input-group">
                            <label className="input-label">Start Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">End Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={applyCustomRange}>
                            Apply Range
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
