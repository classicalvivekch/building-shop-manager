'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface InventoryItem {
    id: number
    name: string
    unit: string
    category: string
    purchaseRate: number | string
    sellingRate: number | string
    quantity: number
    totalPurchased: number
    totalSold: number
    lowStockThreshold: number
}

export default function InventoryPage() {
    const router = useRouter()
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')

    const categories = ['All', 'Cement', 'Steel', 'Bricks', 'Paint', 'Aggregates', 'Plumbing', 'Wood']

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await fetch('/api/inventory')
                if (res.ok) {
                    const data = await res.json()
                    setItems(data.items)
                }
            } catch (error) {
                console.error('Error fetching inventory:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInventory()
    }, [])

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * Number(item.sellingRate)), 0)
    const lowStockCount = items.filter(item => item.quantity <= item.lowStockThreshold).length

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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                background: 'white'
            }}>
                <button onClick={() => router.back()} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: '600' }}>Inventory</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Admin Dashboard</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>🔔</button>
                </div>
            </div>

            <div className="page-content">
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search materials (e.g., Cement, Steel)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                    />
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto' }}>
                    <div className="card" style={{ minWidth: '140px', background: '#eff6ff' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📦 TOTAL VALUE</p>
                        <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                            ₹{(totalValue / 100000).toFixed(1)}L
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--success)' }}>↗ +12%</p>
                    </div>
                    <div className="card" style={{ minWidth: '140px', background: lowStockCount > 0 ? '#fef2f2' : '#f0fdf4' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⚠️ LOW STOCK</p>
                        <p style={{ fontSize: '20px', fontWeight: '700', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {lowStockCount} Items
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Needs attention</p>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="chip-group" style={{ marginBottom: '20px', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '8px' }}>
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

                {/* Inventory List */}
                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No items found
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const remaining = item.quantity
                        const isLowStock = remaining <= item.lowStockThreshold
                        const stockPercent = Math.min(100, (remaining / item.totalPurchased) * 100)

                        return (
                            <div key={item.id} className="inventory-item">
                                <div className="inventory-item-image">
                                    {item.category === 'Cement' && '🏗️'}
                                    {item.category === 'Steel' && '🔩'}
                                    {item.category === 'Bricks' && '🧱'}
                                    {item.category === 'Paint' && '🎨'}
                                    {item.category === 'Aggregates' && '⛰️'}
                                    {item.category === 'Plumbing' && '🔧'}
                                    {item.category === 'Wood' && '🪵'}
                                    {!['Cement', 'Steel', 'Bricks', 'Paint', 'Aggregates', 'Plumbing', 'Wood'].includes(item.category) && '📦'}
                                </div>
                                <div className="inventory-item-info">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <p className="inventory-item-name">{item.name}</p>
                                            <p className="inventory-item-meta">{item.unit} • ₹{Number(item.sellingRate).toLocaleString()}/unit</p>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/dashboard/inventory/${item.id}/edit`)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <div className="inventory-stock-bar">
                                        <div className="stock-labels">
                                            <span>Total: {item.totalPurchased}</span>
                                            <span>Sold: {item.totalSold}</span>
                                            <span className={isLowStock ? 'low-stock' : ''} style={{ color: isLowStock ? 'var(--danger)' : 'var(--success)' }}>
                                                Remaining: {remaining}
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${stockPercent}%`,
                                                    backgroundColor: isLowStock ? 'var(--danger)' : 'var(--primary)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* FAB */}
            <Link href="/dashboard/inventory/new" className="fab">+</Link>

            <BottomNav isAdmin />
        </div>
    )
}
