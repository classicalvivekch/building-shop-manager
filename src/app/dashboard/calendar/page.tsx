'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface DayData {
    date: string
    sales: Array<{
        id: number
        orderNumber: string
        totalAmount: number | string
        createdAt: string
        customer: { name: string } | null
        isBorrow: boolean
        items: Array<{ item: { name: string } }>
    }>
    expenses: Array<{
        id: number
        description: string
        amount: number | string
        category: string
    }>
    totals: {
        sales: number
        expenses: number
        borrows: number
    }
}

export default function CalendarPage() {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [dayData, setDayData] = useState<DayData | null>(null)
    const [loading, setLoading] = useState(false)

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: (number | null)[] = []

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const fetchDayData = async (date: Date) => {
        setLoading(true)
        try {
            const dateStr = date.toISOString().split('T')[0]
            const res = await fetch(`/api/calendar/${dateStr}`)
            if (res.ok) {
                const data = await res.json()
                setDayData(data)
            }
        } catch (error) {
            console.error('Error fetching day data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDayData(selectedDate)
    }, [selectedDate])

    const handleDateClick = (day: number | null) => {
        if (day) {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            setSelectedDate(newDate)
        }
    }

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
    }

    const isToday = (day: number | null) => {
        if (!day) return false
        const today = new Date()
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
    }

    const isSelected = (day: number | null) => {
        if (!day) return false
        return day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
    }

    const days = getDaysInMonth(currentDate)

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div className="page-header" style={{ background: 'white' }}>
                <button onClick={() => router.back()} className="back-btn">←</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{'<'}</button>
                    <span style={{ fontWeight: '600' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{'>'}</button>
                </div>
                <button
                    onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }}
                    style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                    Today
                </button>
            </div>

            <div className="page-content">
                {/* Calendar Grid */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    {/* Day headers */}
                    <div className="calendar-grid" style={{ marginBottom: '8px' }}>
                        {dayNames.map((day, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="calendar-grid">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'today' : ''}`}
                                onClick={() => handleDateClick(day)}
                                style={{
                                    color: day ? (isToday(day) || isSelected(day) ? 'white' : 'var(--text-primary)') : 'transparent',
                                    cursor: day ? 'pointer' : 'default'
                                }}
                            >
                                {day || ''}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Date Info */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div className="card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--success)', marginBottom: '4px' }}>● SALES</p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success)' }}>
                            +₹{dayData?.totals?.sales?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '4px' }}>● EXPENSES</p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--danger)' }}>
                            -₹{dayData?.totals?.expenses?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--warning)', marginBottom: '4px' }}>● BORROW</p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--warning)' }}>
                            ₹{dayData?.totals?.borrows?.toLocaleString() || '0'}
                        </p>
                    </div>
                </div>

                {/* Transactions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600' }}>Transactions</h3>
                    <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                        View All
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                    </div>
                ) : (
                    <div className="card">
                        {(!dayData?.sales?.length && !dayData?.expenses?.length) ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                                No transactions on this date
                            </p>
                        ) : (
                            <>
                                {dayData?.sales?.map(sale => (
                                    <div key={sale.id} className="transaction-item">
                                        <div className={`transaction-icon ${sale.isBorrow ? 'borrow' : 'sale'}`}>
                                            {sale.isBorrow ? '🔄' : '🛒'}
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-title">
                                                {sale.items?.map(i => i.item.name).join(', ').slice(0, 25)}...
                                            </p>
                                            <p className="transaction-subtitle">
                                                {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.isBorrow ? 'Borrow' : 'Cash'}
                                            </p>
                                        </div>
                                        <p className={`transaction-amount ${sale.isBorrow ? '' : 'positive'}`}>
                                            {sale.isBorrow ? '' : '+'}₹{Number(sale.totalAmount).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {dayData?.expenses?.map(expense => (
                                    <div key={expense.id} className="transaction-item">
                                        <div className="transaction-icon expense">💸</div>
                                        <div className="transaction-details">
                                            <p className="transaction-title">{expense.description}</p>
                                            <p className="transaction-subtitle">{expense.category}</p>
                                        </div>
                                        <p className="transaction-amount negative">
                                            -₹{Number(expense.amount).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fab">+</button>

            <BottomNav isAdmin />
        </div>
    )
}
