'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface InventoryItem {
    id: number
    name: string
    unit: string
    category: string
    purchaseRate: number | string
    sellingRate: number | string
    quantity: number
    lowStockThreshold: number
}

export default function EditInventoryPage() {
    const router = useRouter()
    const params = useParams()
    const itemId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        unit: '',
        category: 'Cement',
        purchaseRate: '',
        sellingRate: '',
        quantity: '',
        lowStockThreshold: ''
    })

    const categories = ['Cement', 'Steel', 'Bricks', 'Paint', 'Aggregates', 'Plumbing', 'Wood', 'Other']
    const units = ['Bags', 'Kg', 'Tons', 'Pieces', 'Liters', 'Meters', 'Sq.ft', 'Cu.ft']

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/inventory/${itemId}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.item.name,
                        unit: data.item.unit,
                        category: data.item.category,
                        purchaseRate: data.item.purchaseRate.toString(),
                        sellingRate: data.item.sellingRate.toString(),
                        quantity: data.item.quantity.toString(),
                        lowStockThreshold: data.item.lowStockThreshold.toString()
                    })
                } else {
                    setError('Failed to load item')
                }
            } catch (err) {
                setError('Error loading item')
            } finally {
                setLoading(false)
            }
        }

        fetchItem()
    }, [itemId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            const res = await fetch(`/api/inventory/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    unit: formData.unit,
                    category: formData.category,
                    purchaseRate: parseFloat(formData.purchaseRate),
                    sellingRate: parseFloat(formData.sellingRate),
                    quantity: parseInt(formData.quantity),
                    lowStockThreshold: parseInt(formData.lowStockThreshold)
                })
            })

            if (res.ok) {
                router.push('/dashboard/inventory')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to update item')
            }
        } catch (err) {
            setError('Error updating item')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/inventory/${itemId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.push('/dashboard/inventory')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to delete item')
            }
        } catch (err) {
            setError('Error deleting item')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
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
                <h1 className="page-title">Edit Item</h1>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🗑️
                </button>
            </div>

            <div className="page-content">
                {error && (
                    <div className="alert-banner" style={{ marginBottom: '16px' }}>
                        <div className="alert-banner-icon">⚠️</div>
                        <p style={{ color: 'var(--danger)' }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Item Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="input-group">
                            <label className="input-label">Category <span className="required">*</span></label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Unit <span className="required">*</span></label>
                            <select
                                className="input-field"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                required
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="input-group">
                            <label className="input-label">Purchase Rate (₹) <span className="required">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-field"
                                value={formData.purchaseRate}
                                onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Selling Rate (₹) <span className="required">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-field"
                                value={formData.sellingRate}
                                onChange={(e) => setFormData({ ...formData, sellingRate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="input-group">
                            <label className="input-label">Current Stock <span className="required">*</span></label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Low Stock Alert</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.lowStockThreshold}
                                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>

                    {/* Profit Margin Preview */}
                    {formData.purchaseRate && formData.sellingRate && (
                        <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Profit Margin</p>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                                ₹{(parseFloat(formData.sellingRate) - parseFloat(formData.purchaseRate)).toFixed(2)}
                                <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '8px' }}>
                                    ({((parseFloat(formData.sellingRate) - parseFloat(formData.purchaseRate)) / parseFloat(formData.purchaseRate) * 100).toFixed(1)}%)
                                </span>
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ marginBottom: '60px' }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            <BottomNav isAdmin />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    onClick={() => setShowDeleteConfirm(false)}
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
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '28px'
                        }}>
                            🗑️
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Delete Item?</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
