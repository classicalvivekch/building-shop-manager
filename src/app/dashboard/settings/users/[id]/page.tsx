'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
    id: number
    name: string
    email: string
    phone: string | null
    avatar: string | null
    address: string | null
    salary: number | null
    role: string
    createdAt: string
    totalSales: number
    totalSalesAmount: number
    pendingSalary: number
    totalPaidSalary: number
}

interface SalaryPayment {
    id: number
    amount: number
    month: string
    year: number
    status: 'PENDING' | 'PAID'
    notes: string | null
    paidAt: string | null
    createdAt: string
}

interface SaleItem {
    itemName: string
    quantity: number
    rate: number
    subtotal: number
}

interface Sale {
    id: number
    orderNumber: string
    totalAmount: number
    paymentStatus: string
    createdAt: string
    customerName: string | null
    customerMobile: string | null
    items: SaleItem[]
}

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [salaryHistory, setSalaryHistory] = useState<SalaryPayment[]>([])
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showSalesModal, setShowSalesModal] = useState(false)
    const [showSalaryModal, setShowSalaryModal] = useState(false)
    const [loadingSales, setLoadingSales] = useState(false)
    const [paymentData, setPaymentData] = useState({
        amount: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        status: 'PAID',
        notes: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchEmployeeDetails()
    }, [resolvedParams.id])

    const fetchEmployeeDetails = async () => {
        try {
            const res = await fetch(`/api/users/${resolvedParams.id}`)
            if (res.ok) {
                const data = await res.json()
                setEmployee(data.employee)
                setSalaryHistory(data.salaryHistory || [])
            }
        } catch (error) {
            console.error('Error fetching employee:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSales = async () => {
        setLoadingSales(true)
        try {
            const res = await fetch(`/api/users/${resolvedParams.id}/sales`)
            if (res.ok) {
                const data = await res.json()
                setSales(data.sales || [])
            }
        } catch (error) {
            console.error('Error fetching sales:', error)
        } finally {
            setLoadingSales(false)
        }
    }

    const handleShowSales = () => {
        setShowSalesModal(true)
        if (sales.length === 0) {
            fetchSales()
        }
    }

    const handleRecordPayment = async () => {
        if (!paymentData.amount) return
        setSaving(true)

        try {
            const res = await fetch(`/api/users/${resolvedParams.id}/salary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            })

            if (res.ok) {
                setShowPaymentModal(false)
                setPaymentData({
                    amount: employee?.salary?.toString() || '',
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear(),
                    status: 'PAID',
                    notes: ''
                })
                fetchEmployeeDetails()
            }
        } catch (error) {
            console.error('Error recording payment:', error)
        } finally {
            setSaving(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!employee) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <p>Employee not found</p>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <h1 style={{ fontSize: '18px', fontWeight: '600' }}>Employee Details</h1>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/settings/users/${resolvedParams.id}/edit`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: 'var(--primary)'
                    }}
                >
                    ✏️
                </button>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Profile Section */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: employee.avatar
                                ? `url(${employee.avatar}) center/cover`
                                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            fontWeight: '600',
                            margin: '0 auto',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            overflow: 'hidden'
                        }}>
                            {!employee.avatar && getInitials(employee.name)}
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '2px solid white'
                        }} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '16px' }}>{employee.name}</h2>
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        background: '#f1f5f9',
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        marginTop: '8px'
                    }}>
                        {employee.role === 'ADMIN' ? 'Admin' : 'Sales Assistant'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <a
                        href={`tel:${employee.phone}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                        }}
                    >
                        📞 Call
                    </a>
                    <a
                        href={`sms:${employee.phone}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'var(--primary)',
                            border: 'none',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            color: 'white',
                            fontWeight: '500'
                        }}
                    >
                        💬 Message
                    </a>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                            DUE
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                            {formatCurrency(employee.pendingSalary)}
                        </p>
                    </div>
                    <div
                        onClick={() => setShowSalaryModal(true)}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            💰 SALARY
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: '700' }}>
                            {formatCurrency(employee.salary || 0)}<span style={{ fontSize: '12px', fontWeight: '400' }}>/mo</span>
                        </p>
                    </div>
                    <div
                        onClick={handleShowSales}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            📊 SALES
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: '700' }}>
                            {formatCurrency(employee.totalSalesAmount)}
                        </p>
                    </div>
                </div>

                {/* Personal Information */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Personal Information
                        </h3>
                        <span style={{ color: 'var(--text-secondary)' }}>▼</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>📞</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>Phone</span>
                        <span style={{ fontWeight: '500' }}>{employee.phone || 'Not set'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>✉️</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>Email</span>
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{employee.email || 'Not set'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>📍</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>Address</span>
                        <span style={{ fontWeight: '500' }}>{employee.address || 'Not set'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>📅</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>Joined</span>
                        <span style={{ fontWeight: '500' }}>{new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                        <span>🆔</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>ID Number</span>
                        <span style={{ fontWeight: '500' }}>EMP-{String(employee.id).padStart(3, '0')}</span>
                    </div>
                </div>

                {/* Salary History */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Salary History</h3>
                        <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                            View All
                        </button>
                    </div>

                    {salaryHistory.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            No salary records yet
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {salaryHistory.map((payment) => (
                                <div
                                    key={payment.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        background: payment.status === 'PENDING' ? '#fef2f2' : 'white',
                                        borderLeft: `3px solid ${payment.status === 'PENDING' ? '#dc2626' : '#10b981'}`
                                    }}>
                                        <span style={{ fontSize: '10px', color: payment.status === 'PENDING' ? '#dc2626' : '#10b981', fontWeight: '600' }}>
                                            {payment.month.slice(0, 3).toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '18px', fontWeight: '700' }}>
                                            {String(payment.year).slice(-2)}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{payment.month} Salary</p>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: payment.status === 'PENDING' ? '#fef2f2' : '#dcfce7',
                                            color: payment.status === 'PENDING' ? '#dc2626' : '#15803d'
                                        }}>
                                            {payment.status === 'PENDING' ? '● Pending' : '✓ Paid on time'}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontWeight: '600',
                                            color: payment.status === 'PAID' ? '#10b981' : 'var(--text-primary)'
                                        }}>
                                            {payment.status === 'PAID' ? '+' : ''}{formatCurrency(Number(payment.amount))}
                                        </p>
                                        {payment.status === 'PENDING' ? (
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due in 2 days</span>
                                        ) : (
                                            <button style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                View Slip
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '16px 20px',
                background: 'white',
                borderTop: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => {
                        setPaymentData({
                            ...paymentData,
                            amount: employee.salary?.toString() || ''
                        })
                        setShowPaymentModal(true)
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    ➕ Record Payment
                </button>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px 24px 0 0',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '430px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Record Payment</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Amount</label>
                            <input
                                type="number"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    fontSize: '16px'
                                }}
                                placeholder="Enter amount"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Month</label>
                                <select
                                    value={paymentData.month}
                                    onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px'
                                    }}
                                >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Year</label>
                                <select
                                    value={paymentData.year}
                                    onChange={(e) => setPaymentData({ ...paymentData, year: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px'
                                    }}
                                >
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Status</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setPaymentData({ ...paymentData, status: 'PAID' })}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: paymentData.status === 'PAID' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: paymentData.status === 'PAID' ? '#eff6ff' : 'white',
                                        color: paymentData.status === 'PAID' ? 'var(--primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    ✓ Paid
                                </button>
                                <button
                                    onClick={() => setPaymentData({ ...paymentData, status: 'PENDING' })}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: paymentData.status === 'PENDING' ? '2px solid #dc2626' : '1px solid var(--border)',
                                        background: paymentData.status === 'PENDING' ? '#fef2f2' : 'white',
                                        color: paymentData.status === 'PENDING' ? '#dc2626' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    ● Pending
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Notes (Optional)</label>
                            <textarea
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    fontSize: '14px',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Add any notes..."
                            />
                        </div>

                        <button
                            onClick={handleRecordPayment}
                            disabled={saving || !paymentData.amount}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: saving ? '#93c5fd' : 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {saving ? 'Saving...' : 'Record Payment'}
                        </button>
                    </div>
                </div>
            )}

            {/* Sales Modal */}
            {showSalesModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px 24px 0 0',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '430px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Sales by {employee.name}</h3>
                            <button
                                onClick={() => setShowSalesModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            background: '#dcfce7',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '12px', color: '#15803d', marginBottom: '4px' }}>Total Sales</p>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
                                {formatCurrency(employee.totalSalesAmount)}
                            </p>
                            <p style={{ fontSize: '12px', color: '#15803d' }}>{employee.totalSales} transactions</p>
                        </div>

                        {loadingSales ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="spinner" />
                            </div>
                        ) : sales.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                                No sales found
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        style={{
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            padding: '14px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '14px' }}>#{sale.orderNumber}</p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                    {new Date(sale.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '600', color: '#10b981' }}>
                                                    +{formatCurrency(Number(sale.totalAmount))}
                                                </p>
                                                <span style={{
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: sale.paymentStatus === 'PAID' ? '#dcfce7' : '#fef2f2',
                                                    color: sale.paymentStatus === 'PAID' ? '#15803d' : '#dc2626'
                                                }}>
                                                    {sale.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                        {sale.customerName && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                Customer: {sale.customerName}
                                            </p>
                                        )}
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {sale.items.map((item, i) => (
                                                <span key={i}>
                                                    {item.itemName} × {item.quantity}
                                                    {i < sale.items.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Salary Modal */}
            {showSalaryModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px 24px 0 0',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '430px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Salary Payments</h3>
                            <button
                                onClick={() => setShowSalaryModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                flex: 1,
                                background: '#dcfce7',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '11px', color: '#15803d', marginBottom: '4px' }}>Total Paid</p>
                                <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d' }}>
                                    {formatCurrency(employee.totalPaidSalary || 0)}
                                </p>
                            </div>
                            <div style={{
                                flex: 1,
                                background: '#fef2f2',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '11px', color: '#dc2626', marginBottom: '4px' }}>Pending</p>
                                <p style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                                    {formatCurrency(employee.pendingSalary)}
                                </p>
                            </div>
                        </div>

                        {salaryHistory.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                                No salary payments recorded
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {salaryHistory.map((payment) => (
                                    <div
                                        key={payment.id}
                                        style={{
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '50px',
                                            textAlign: 'center',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: payment.status === 'PAID' ? '#dcfce7' : '#fef2f2',
                                            borderLeft: `3px solid ${payment.status === 'PAID' ? '#10b981' : '#dc2626'}`
                                        }}>
                                            <p style={{ fontSize: '10px', fontWeight: '600', color: payment.status === 'PAID' ? '#10b981' : '#dc2626' }}>
                                                {payment.month.slice(0, 3).toUpperCase()}
                                            </p>
                                            <p style={{ fontSize: '14px', fontWeight: '700' }}>{payment.year}</p>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '500', fontSize: '14px' }}>{payment.month} {payment.year}</p>
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: payment.status === 'PAID' ? '#dcfce7' : '#fef2f2',
                                                color: payment.status === 'PAID' ? '#15803d' : '#dc2626'
                                            }}>
                                                {payment.status === 'PAID' ? '✓ Paid' : '● Pending'}
                                            </span>
                                            {payment.notes && (
                                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    {payment.notes}
                                                </p>
                                            )}
                                        </div>
                                        <p style={{
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            color: payment.status === 'PAID' ? '#10b981' : 'var(--text-primary)'
                                        }}>
                                            {payment.status === 'PAID' ? '+' : ''}{formatCurrency(Number(payment.amount))}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setShowSalaryModal(false)
                                setPaymentData({
                                    ...paymentData,
                                    amount: employee.salary?.toString() || ''
                                })
                                setShowPaymentModal(true)
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                marginTop: '20px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ➕ Record New Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
