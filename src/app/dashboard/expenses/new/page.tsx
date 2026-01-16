'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NewExpensePage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('INVENTORY')
    const [date, setDate] = useState(() => {
        const now = new Date()
        const offset = now.getTimezoneOffset() * 60000
        return new Date(now.getTime() - offset).toISOString().split('T')[0]
    })
    const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const categories = [
        { id: 'INVENTORY', label: 'Inventory', icon: '📦' },
        { id: 'UTILITIES', label: 'Utilities', icon: '⚡' },
        { id: 'TRANSPORT', label: 'Transport', icon: '🚚' },
        { id: 'OTHER', label: 'Other', icon: '📋' },
    ]

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', 'expense')

            const res = await fetch('/api/upload/photo', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setReceiptPhoto(data.imageUrl)
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to upload photo')
            }
        } catch (err) {
            setError('Failed to upload photo')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description) {
            setError('Amount and description are required')
            return
        }
        // Receipt photo is optional

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    category,
                    expenseDate: date,
                    receiptPhoto
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to save expense')
            }

            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save expense')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'white' }}>
            {/* Header */}
            <div className="page-header">
                <button onClick={() => router.back()} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ✕
                </button>
                <h1 className="page-title">New Expense</h1>
                <div style={{ width: '40px' }} />
            </div>

            <div className="page-content">
                {/* Amount Input */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Amount</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '32px', color: 'var(--text-secondary)' }}>₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            style={{
                                fontSize: '48px',
                                fontWeight: '300',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '200px',
                                background: 'transparent',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Description */}
                    <div className="input-group">
                        <label className="input-label">
                            Description <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., Cement bags"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <div className="chip-group">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`chip ${category === cat.id ? 'active' : ''}`}
                                    onClick={() => setCategory(cat.id)}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="input-group">
                        <label className="input-label">Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Receipt Photo */}
                    <div className="input-group">
                        <label className="input-label">Receipt Photo (Optional)</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                        {receiptPhoto ? (
                            <div style={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <img
                                    src={receiptPhoto}
                                    alt="Receipt"
                                    style={{
                                        width: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '12px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setReceiptPhoto(null)}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ✕
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}
                                >
                                    📷 Retake
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: uploading ? '#f3f4f6' : 'white'
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <div className="spinner" style={{ margin: '0 auto' }} />
                                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Uploading...</p>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '32px' }}>📷</span>
                                        <p style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '8px' }}>Add Receipt Photo</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                                            Tap to take photo or select from gallery
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ position: 'fixed', bottom: '24px', left: '20px', right: '20px', maxWidth: '390px', margin: '0 auto' }}
                    >
                        {loading ? 'Saving...' : 'Save Expense'}
                    </button>
                </form>
            </div>
        </div>
    )
}
