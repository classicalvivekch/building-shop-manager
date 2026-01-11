'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface Expense {
    id: number
    description: string
    amount: number | string
    category: string
    expenseDate: string
    receiptPhoto: string | null
    creator: { name: string }
}

export default function ExpensesPage() {
    const router = useRouter()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await fetch('/api/expenses')
                if (res.ok) {
                    const data = await res.json()
                    setExpenses(data.expenses)
                }
            } catch (error) {
                console.error('Error fetching expenses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchExpenses()
    }, [])

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'INVENTORY': return '📦'
            case 'UTILITIES': return '⚡'
            case 'TRANSPORT': return '🚚'
            default: return '📋'
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
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Header */}
            <div className="page-header" style={{ background: 'white' }}>
                <button onClick={() => router.back()} className="back-btn">←</button>
                <h1 className="page-title">Expenses</h1>
                <div style={{ width: '40px' }} />
            </div>

            <div className="page-content">
                {/* Total Card */}
                <div className="card" style={{ background: '#fef2f2', marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Expenses</p>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>
                        ₹{totalExpenses.toLocaleString()}
                    </p>
                </div>

                {/* Expenses List */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>All Expenses</h3>
                <div className="card">
                    {expenses.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                            No expenses recorded
                        </p>
                    ) : (
                        expenses.map(expense => (
                            <div
                                key={expense.id}
                                className="transaction-item"
                                style={{ alignItems: 'flex-start', cursor: 'pointer' }}
                                onClick={() => setSelectedExpense(expense)}
                            >
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: expense.receiptPhoto
                                            ? `url(${expense.receiptPhoto}) center/cover`
                                            : expense.category === 'INVENTORY' ? 'rgba(99, 102, 241, 0.1)'
                                                : expense.category === 'UTILITIES' ? 'rgba(245, 158, 11, 0.1)'
                                                    : expense.category === 'TRANSPORT' ? 'rgba(16, 185, 129, 0.1)'
                                                        : 'rgba(107, 114, 128, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        border: expense.receiptPhoto ? '2px solid var(--primary)' : 'none'
                                    }}
                                >
                                    {!expense.receiptPhoto && getCategoryIcon(expense.category)}
                                </div>
                                <div className="transaction-details">
                                    <p className="transaction-title">{expense.description}</p>
                                    <p className="transaction-subtitle">
                                        {new Date(expense.expenseDate).toLocaleDateString()} • {expense.creator.name}
                                    </p>
                                    {expense.receiptPhoto && (
                                        <span style={{
                                            fontSize: '10px',
                                            color: 'var(--primary)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginTop: '4px'
                                        }}>
                                            📷 Tap to view details
                                        </span>
                                    )}
                                </div>
                                <p className="transaction-amount negative">
                                    -₹{Number(expense.amount).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FAB */}
            <Link href="/dashboard/expenses/new" className="fab">+</Link>

            <BottomNav isAdmin />

            {/* Summary Popup Modal */}
            {selectedExpense && (
                <div
                    onClick={() => setSelectedExpense(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
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
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        {/* Photo */}
                        {selectedExpense.receiptPhoto && (
                            <img
                                src={selectedExpense.receiptPhoto}
                                alt="Receipt"
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '20px 20px 0 0'
                                }}
                            />
                        )}

                        {/* Details */}
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '32px' }}>{getCategoryIcon(selectedExpense.category)}</span>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedExpense.description}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{selectedExpense.category}</p>
                                </div>
                            </div>

                            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>AMOUNT</p>
                                <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>
                                    ₹{Number(selectedExpense.amount).toLocaleString()}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>DATE</p>
                                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p>
                                </div>
                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CREATED BY</p>
                                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedExpense.creator.name}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
