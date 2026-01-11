'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewInventoryPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [unit, setUnit] = useState('')
    const [category, setCategory] = useState('Other')
    const [purchaseRate, setPurchaseRate] = useState('')
    const [sellingRate, setSellingRate] = useState('')
    const [quantity, setQuantity] = useState('')
    const [lowStockThreshold, setLowStockThreshold] = useState('10')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const categories = ['Cement', 'Steel', 'Bricks', 'Paint', 'Aggregates', 'Plumbing', 'Wood', 'Other']

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !unit) {
            setError('Name and unit are required')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    unit,
                    category,
                    purchaseRate: parseFloat(purchaseRate) || 0,
                    sellingRate: parseFloat(sellingRate) || 0,
                    quantity: parseInt(quantity) || 0,
                    lowStockThreshold: parseInt(lowStockThreshold) || 10,
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to add item')
            }

            router.push('/dashboard/inventory')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add item')
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
                <h1 className="page-title">Add New Item</h1>
                <div style={{ width: '40px' }} />
            </div>

            <div className="page-content">
                <form onSubmit={handleSubmit}>
                    {/* Item Name */}
                    <div className="input-group">
                        <label className="input-label">
                            Item Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., UltraTech Cement"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Unit */}
                    <div className="input-group">
                        <label className="input-label">
                            Unit <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., Bag (50kg), Piece, Kg"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <div className="chip-group">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`chip ${category === cat ? 'active' : ''}`}
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label className="input-label">Purchase Rate (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0.00"
                                value={purchaseRate}
                                onChange={(e) => setPurchaseRate(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Selling Rate (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0.00"
                                value={sellingRate}
                                onChange={(e) => setSellingRate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quantity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label className="input-label">Initial Quantity</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Low Stock Alert</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="10"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Image (placeholder) */}
                    <div className="input-group">
                        <label className="input-label">Product Image</label>
                        <div style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}>
                            <span style={{ fontSize: '24px' }}>📷</span>
                            <p style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '8px' }}>Add Photo</p>
                        </div>
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
                        style={{ marginTop: '16px' }}
                    >
                        {loading ? 'Saving...' : 'Add Item to Inventory'}
                    </button>
                </form>
            </div>
        </div>
    )
}
