'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface InventoryItem {
    id: number
    name: string
    unit: string
    category: string
    sellingRate: number | string
    quantity: number
}

interface CartItem {
    itemId: number
    name: string
    unit: string
    quantity: number
    rate: number
    available: number
}

export default function NewSalePage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [step, setStep] = useState(1)

    // Step 1: Customer details
    const [customerName, setCustomerName] = useState('')
    const [customerMobile, setCustomerMobile] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [isBorrow, setIsBorrow] = useState(false)
    const [clientPhoto, setClientPhoto] = useState<string | null>(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    // Step 2: Item selection
    const [items, setItems] = useState<InventoryItem[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')

    // Step 3: Finalize
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BORROW'>('CASH')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const categories = ['All', 'Cement', 'Steel', 'Bricks', 'Paint', 'Aggregates']

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/inventory')
                if (res.ok) {
                    const data = await res.json()
                    setItems(data.items)
                }
            } catch (error) {
                console.error('Error fetching items:', error)
            }
        }
        fetchItems()
    }, [])

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.rate), 0)

    const addToCart = (item: InventoryItem) => {
        const existing = cart.find(c => c.itemId === item.id)
        if (existing) {
            setCart(cart.map(c =>
                c.itemId === item.id
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ))
        } else {
            setCart([...cart, {
                itemId: item.id,
                name: item.name,
                unit: item.unit,
                quantity: 1,
                rate: Number(item.sellingRate),
                available: item.quantity
            }])
        }
    }

    const updateCartQuantity = (itemId: number, newQty: number) => {
        if (newQty <= 0) {
            setCart(cart.filter(c => c.itemId !== itemId))
        } else {
            setCart(cart.map(c =>
                c.itemId === itemId ? { ...c, quantity: newQty } : c
            ))
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingPhoto(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', 'client')

            const res = await fetch('/api/upload/photo', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setClientPhoto(data.imageUrl)
            } else {
                setError('Failed to upload photo')
            }
        } catch (err) {
            setError('Failed to upload photo')
        } finally {
            setUploadingPhoto(false)
        }
    }

    const handleSubmit = async () => {
        if (cart.length === 0) {
            setError('Please add at least one item')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerMobile,
                    customerAddress,
                    clientPhoto,
                    items: cart.map(c => ({
                        itemId: c.itemId,
                        quantity: c.quantity,
                        rate: c.rate
                    })),
                    isBorrow: paymentMethod === 'BORROW',
                    paymentStatus: paymentMethod === 'CASH' ? 'PAID' : 'UNPAID',
                    notes
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to create sale')
            }

            router.push('/dashboard/sales')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create sale')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'white' }}>
            {/* Header */}
            <div className="page-header">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    {step > 1 ? '←' : '✕'}
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="page-title">New Sale</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Step {step} of 3</p>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--primary)' }}>{step}/3</span>
            </div>

            {/* Stepper */}
            <div className="stepper" style={{ padding: '16px' }}>
                <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
                <div className={`step-dot ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`} />
                <div className={`step-dot ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`} />
            </div>

            <div className="page-content" style={{ paddingBottom: '120px' }}>
                {/* Step 1: Customer Details */}
                {step === 1 && (
                    <>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Customer Details</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Enter customer information to begin sale</p>

                        <div className="input-group">
                            <label className="input-label">Customer Name <span className="required">*</span></label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter full name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Mobile Number <span className="required">*</span></label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="000-000-0000"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Delivery Address <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>Optional</span></label>
                            <textarea
                                className="input-field"
                                placeholder="Street, City, Building..."
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Sale Type</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div
                                    className={`sale-type-card ${!isBorrow ? 'active' : ''}`}
                                    onClick={() => setIsBorrow(false)}
                                >
                                    <div className="sale-type-icon">🛒</div>
                                    <p className="sale-type-title">Normal Sale</p>
                                    <p className="sale-type-subtitle">Cash / Credit</p>
                                </div>
                                <div
                                    className={`sale-type-card ${isBorrow ? 'active' : ''}`}
                                    onClick={() => setIsBorrow(true)}
                                >
                                    <div className="sale-type-icon">🔄</div>
                                    <p className="sale-type-title">Borrow / Loan</p>
                                    <p className="sale-type-subtitle">Track lending</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Photo */}
                        <div className="input-group">
                            <label className="input-label">
                                Client Photo <span className="required">*</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                            />
                            {clientPhoto ? (
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={clientPhoto}
                                        alt="Client"
                                        style={{
                                            width: '100%',
                                            maxHeight: '180px',
                                            objectFit: 'cover',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setClientPhoto(null)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11px'
                                    }}>
                                        📷 Client photo attached
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed var(--border)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: uploadingPhoto ? '#f3f4f6' : 'white'
                                    }}
                                >
                                    {uploadingPhoto ? (
                                        <>
                                            <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }} />
                                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>Uploading...</p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '28px' }}>📸</span>
                                            <p style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '6px', fontSize: '14px' }}>Take Client Photo</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                                                Capture customer during sale for records
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Step 2: Select Items */}
                {step === 2 && (
                    <>
                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search items (e.g., Cement, Bricks)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>

                        {/* Categories */}
                        <div className="chip-group" style={{ marginBottom: '16px', overflowX: 'auto', flexWrap: 'nowrap' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`chip ${categoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Items */}
                        {filteredItems.map(item => {
                            const inCart = cart.find(c => c.itemId === item.id)
                            return (
                                <div
                                    key={item.id}
                                    className="card"
                                    style={{
                                        marginBottom: '12px',
                                        border: inCart ? '2px solid var(--primary)' : '1px solid var(--border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: inCart ? '12px' : 0 }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: inCart ? 'none' : '2px solid var(--border)',
                                            background: inCart ? 'var(--primary)' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {inCart && '✓'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--success)' }}>
                                                In Stock: {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                        {!inCart && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: 'auto', padding: '8px 16px' }}
                                                onClick={() => addToCart(item)}
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>

                                    {inCart && (
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quantity</p>
                                                <div className="quantity-selector">
                                                    <button className="quantity-btn" onClick={() => updateCartQuantity(item.id, inCart.quantity - 1)}>−</button>
                                                    <span className="quantity-value">{inCart.quantity}</span>
                                                    <button className="quantity-btn" onClick={() => updateCartQuantity(item.id, inCart.quantity + 1)}>+</button>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Rate (₹)</p>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={inCart.rate}
                                                    onChange={(e) => setCart(cart.map(c =>
                                                        c.itemId === item.id ? { ...c, rate: parseFloat(e.target.value) || 0 } : c
                                                    ))}
                                                    style={{ padding: '10px' }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Subtotal</p>
                                                <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)' }}>
                                                    ₹{(inCart.quantity * inCart.rate).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}

                {/* Step 3: Finalize */}
                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>TOTAL AMOUNT DUE</p>
                            <p style={{ fontSize: '40px', fontWeight: '700' }}>₹{cartTotal.toLocaleString()}</p>
                        </div>

                        {/* Order Summary */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📋</span>
                                    <span style={{ fontWeight: '500' }}>View Order Summary ({cart.length} Items)</span>
                                </div>
                                <span>▼</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="input-group">
                            <label className="input-label">Payment Method</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div
                                    className={`sale-type-card ${paymentMethod === 'CASH' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('CASH')}
                                    style={{ padding: '16px' }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💵</div>
                                    <p style={{ fontWeight: '600' }}>Cash</p>
                                </div>
                                <div
                                    className={`sale-type-card ${paymentMethod === 'BORROW' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('BORROW')}
                                    style={{ padding: '16px' }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                                    <p style={{ fontWeight: '600' }}>Borrow / Credit</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>👤</span>
                                    <span>{customerName || 'Walk-in Customer (Optional)'}</span>
                                </div>
                                <button
                                    style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                    onClick={() => setStep(1)}
                                >
                                    CHANGE
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="input-group">
                            <label className="input-label">Sale Notes</label>
                            <textarea
                                className="input-field"
                                placeholder="Add any additional details about this sale..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: '#fef2f2',
                                color: 'var(--danger)',
                                padding: '12px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '430px',
                background: 'white',
                padding: '16px 20px 24px',
                borderTop: '1px solid var(--border)'
            }}>
                {step === 2 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>TOTAL AMOUNT • {cart.length} Items Selected</span>
                        <span style={{ fontWeight: '700', fontSize: '18px' }}>₹{cartTotal.toLocaleString()}</span>
                    </div>
                )}

                {step < 3 ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 && (!customerName && !customerMobile)}
                    >
                        {step === 1 ? 'Next: Select Items →' : 'Next Step →'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : '✓ Confirm & Print Receipt'}
                    </button>
                )}
            </div>
        </div>
    )
}
