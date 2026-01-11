'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface SaleItem {
    item: { name: string }
    quantity: number
    rate: number | string
    subtotal: number | string
}

interface Sale {
    id: number
    orderNumber: string
    totalAmount: number | string
    isBorrow: boolean
    paymentStatus: string
    createdAt: string
    clientPhoto: string | null
    customer: { name: string, mobile: string } | null
    creator: { name: string }
    items: SaleItem[]
}

export default function EmployeeSalesPage() {
    const router = useRouter()
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await fetch('/api/sales')
                if (res.ok) {
                    const data = await res.json()
                    setSales(data.sales)
                }
            } catch (error) {
                console.error('Error fetching sales:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSales()
    }, [])

    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)

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
                <h1 className="page-title">Sales</h1>
                <div style={{ width: '40px' }} />
            </div>

            <div className="page-content">
                {/* Total Card */}
                <div className="card card-primary" style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', opacity: 0.8 }}>Total Sales</p>
                    <p style={{ fontSize: '28px', fontWeight: '700' }}>
                        ₹{totalSales.toLocaleString()}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>{sales.length} orders</p>
                </div>

                {/* Sales List */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>All Sales</h3>
                <div className="card">
                    {sales.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                            No sales recorded
                        </p>
                    ) : (
                        sales.map(sale => (
                            <div
                                key={sale.id}
                                className="transaction-item"
                                style={{ alignItems: 'flex-start', cursor: 'pointer' }}
                                onClick={() => setSelectedSale(sale)}
                            >
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: sale.clientPhoto
                                            ? `url(${sale.clientPhoto}) center/cover`
                                            : sale.isBorrow
                                                ? 'rgba(245, 158, 11, 0.1)'
                                                : 'rgba(16, 185, 129, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        border: sale.clientPhoto ? '2px solid var(--primary)' : 'none'
                                    }}
                                >
                                    {!sale.clientPhoto && (sale.isBorrow ? '🔄' : '🛒')}
                                </div>
                                <div className="transaction-details">
                                    <p className="transaction-title">
                                        {sale.customer?.name || 'Walk-in Customer'}
                                        {sale.isBorrow && <span className="badge badge-warning" style={{ marginLeft: '8px', fontSize: '10px' }}>Borrow</span>}
                                    </p>
                                    <p className="transaction-subtitle">
                                        {sale.orderNumber} • {new Date(sale.createdAt).toLocaleString()}
                                    </p>
                                    <span style={{
                                        fontSize: '10px',
                                        color: 'var(--primary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '4px'
                                    }}>
                                        📋 Tap to view details
                                    </span>
                                </div>
                                <p className={`transaction-amount ${sale.paymentStatus === 'PAID' ? 'positive' : ''}`}>
                                    {sale.paymentStatus === 'PAID' ? '+' : ''}₹{Number(sale.totalAmount).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FAB */}
            <Link href="/employee/sales/new" className="fab">+</Link>

            <BottomNav />

            {/* Summary Popup Modal */}
            {selectedSale && (
                <div
                    onClick={() => setSelectedSale(null)}
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
                            maxHeight: '85vh',
                            overflow: 'auto'
                        }}
                    >
                        {/* Photo */}
                        {selectedSale.clientPhoto && (
                            <img
                                src={selectedSale.clientPhoto}
                                alt="Client"
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderRadius: '20px 20px 0 0'
                                }}
                            />
                        )}

                        {/* Details */}
                        <div style={{ padding: '20px' }}>
                            {/* Customer Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}>
                                    {selectedSale.customer?.name?.charAt(0) || '👤'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedSale.customer?.name || 'Walk-in Customer'}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{selectedSale.customer?.mobile || 'No phone'}</p>
                                </div>
                                {selectedSale.isBorrow && (
                                    <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>Borrow</span>
                                )}
                            </div>

                            {/* Amount */}
                            <div style={{
                                background: selectedSale.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>TOTAL AMOUNT</p>
                                <p style={{ fontSize: '28px', fontWeight: '700', color: selectedSale.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>
                                    ₹{Number(selectedSale.totalAmount).toLocaleString()}
                                </p>
                                <span className={`badge ${selectedSale.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                                    {selectedSale.paymentStatus}
                                </span>
                            </div>

                            {/* Order Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ORDER #</p>
                                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedSale.orderNumber}</p>
                                </div>
                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>DATE</p>
                                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>SOLD BY</p>
                                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedSale.creator?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>ITEMS ({selectedSale.items?.length || 0})</p>
                                <div style={{ background: 'var(--background)', borderRadius: '10px', padding: '12px' }}>
                                    {selectedSale.items?.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: idx < selectedSale.items.length - 1 ? '1px solid var(--border)' : 'none'
                                        }}>
                                            <span style={{ fontSize: '14px' }}>{item.item?.name} x{item.quantity}</span>
                                            <span style={{ fontWeight: '600' }}>₹{Number(item.subtotal).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedSale(null)}
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
