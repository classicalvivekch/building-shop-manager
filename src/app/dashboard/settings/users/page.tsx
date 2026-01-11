'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
    id: number
    name: string
    email: string
    phone: string | null
    avatar: string | null
    role: string
    createdAt: string
}

export default function UserManagementPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'EMPLOYEE',
        phone: '',
        password: ''
    })

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                const data = await res.json()
                setEmployees(data.users)
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role: formData.role
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: 'Employee created successfully!' })
                setFormData({ name: '', email: '', role: 'EMPLOYEE', phone: '', password: '' })
                fetchEmployees()
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create employee' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteEmployee = async (id: number) => {
        if (!confirm('Are you sure you want to delete this employee?')) return

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchEmployees()
            } else {
                alert('Failed to delete employee')
            }
        } catch (error) {
            alert('An error occurred')
        }
    }

    const handleResetPassword = async (id: number) => {
        const newPassword = prompt('Enter new password for this employee:')
        if (!newPassword) return

        try {
            const res = await fetch(`/api/users/${id}/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            })

            if (res.ok) {
                alert('Password reset successfully!')
            } else {
                alert('Failed to reset password')
            }
        } catch (error) {
            alert('An error occurred')
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return { bg: '#dbeafe', text: '#1d4ed8' }
            case 'EMPLOYEE': return { bg: '#dcfce7', text: '#15803d' }
            default: return { bg: '#f3f4f6', text: '#6b7280' }
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getAvatarColor = (name: string) => {
        const colors = [
            'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
            'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    const activeCount = employees.filter(e => e.role === 'EMPLOYEE').length

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '20px' }}>
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
                    <h1 style={{ fontSize: '20px', fontWeight: '600' }}>User Management</h1>
                </div>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '16px' }}>🔔</span>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Admin Access Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '20px' }}>🛡️</span>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>Admin Access</span>
                    </div>
                    <p style={{ fontWeight: '500', marginBottom: '2px' }}>Owner Account</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Manage your master login credentials
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/settings/security')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>🔑</span> Change Password
                    </button>
                </div>

                {/* Add New Employee Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>👥</span>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>Add New Employee</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Create account and assign login credentials
                    </p>

                    {/* Message */}
                    {message.text && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            marginBottom: '16px',
                            background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
                            color: message.type === 'success' ? '#15803d' : '#dc2626',
                            fontSize: '14px'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleCreateEmployee}>
                        {/* Full Name */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    fontSize: '14px',
                                    background: 'var(--background)',
                                    outline: 'none'
                                }}
                                placeholder="e.g. Rajesh Kumar"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    fontSize: '14px',
                                    background: 'var(--background)',
                                    outline: 'none'
                                }}
                                placeholder="e.g. rajesh@shop.com"
                                required
                            />
                        </div>

                        {/* Role and Mobile */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px',
                                        background: 'var(--background)',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="EMPLOYEE">Sales Staff</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Mobile
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px',
                                        background: 'var(--background)',
                                        outline: 'none'
                                    }}
                                    placeholder="+91"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Assign Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 40px 12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px',
                                        background: 'var(--background)',
                                        outline: 'none'
                                    }}
                                    placeholder="Create login password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            ℹ️ Staff will be prompted to change this upon first login
                        </p>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: saving ? '#93c5fd' : 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>➕</span>
                            {saving ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Team Members */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Team Members</h2>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{activeCount} Active</span>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        Loading...
                    </p>
                ) : employees.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        No employees found
                    </p>
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
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: employee.avatar
                                        ? `url(${employee.avatar}) center/cover`
                                        : getAvatarColor(employee.name),
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    overflow: 'hidden'
                                }}>
                                    {!employee.avatar && getInitials(employee.name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', marginBottom: '2px' }}>{employee.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: getRoleColor(employee.role).bg,
                                            color: getRoleColor(employee.role).text
                                        }}>
                                            {employee.role === 'ADMIN' ? 'Admin' : 'Sales Staff'}
                                        </span>
                                        {employee.phone && (
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                • {employee.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleResetPassword(employee.id) }}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'var(--background)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                        title="Reset Password"
                                    >
                                        🔑
                                    </button>
                                    {employee.role !== 'ADMIN' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(employee.id) }}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: '#fef2f2',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '16px'
                                            }}
                                            title="Delete Employee"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
