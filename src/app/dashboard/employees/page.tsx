'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface Employee {
    id: number
    name: string
    email: string
    phone: string | null
    avatar: string | null
    role: string
    createdAt: string
}

export default function EmployeesPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                const data = await res.json()
                // Filter only employees (not admins)
                setEmployees(data.users.filter((u: Employee) => u.role === 'EMPLOYEE'))
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getAvatarColor = (name: string) => {
        const colors = [
            'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="spinner" />
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
                    <h1 style={{ fontSize: '18px', fontWeight: '600' }}>Employees</h1>
                </div>
                <Link
                    href="/dashboard/settings/users"
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    ➕ Add New
                </Link>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            fontSize: '24px'
                        }}>
                            👥
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{employees.length}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Employees</p>
                    </div>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            fontSize: '24px'
                        }}>
                            ✅
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{employees.length}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active</p>
                    </div>
                </div>

                {/* Employee List */}
                <h3 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px' }}>All Employees</h3>

                {employees.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
                        <p>No employees found</p>
                        <Link
                            href="/dashboard/settings/users"
                            style={{
                                display: 'inline-block',
                                marginTop: '16px',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Add your first employee →
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                onClick={() => router.push(`/dashboard/settings/users/${employee.id}`)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
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
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    background: employee.avatar
                                        ? `url(${employee.avatar}) center/cover`
                                        : getAvatarColor(employee.name),
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {!employee.avatar && getInitials(employee.name)}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        border: '2px solid white'
                                    }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{employee.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {employee.email}
                                    </p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        📞 {employee.phone || 'No phone'}
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '4px'
                                }}>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981'
                                    }}>
                                        Active
                                    </span>
                                    <span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
