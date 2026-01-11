'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
    id: number
    name: string
    email: string
    phone: string | null
    avatar: string | null
    address: string | null
    salary: number | null
    role: string
}

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        salary: ''
    })

    useEffect(() => {
        fetchEmployeeDetails()
    }, [resolvedParams.id])

    const fetchEmployeeDetails = async () => {
        try {
            const res = await fetch(`/api/users/${resolvedParams.id}`)
            if (res.ok) {
                const data = await res.json()
                const employee = data.employee
                setFormData({
                    name: employee.name || '',
                    email: employee.email || '',
                    phone: employee.phone || '',
                    address: employee.address || '',
                    salary: employee.salary?.toString() || ''
                })
            }
        } catch (error) {
            console.error('Error fetching employee:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            setMessage({ type: 'error', text: 'Name and email are required' })
            return
        }

        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch(`/api/users/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    salary: formData.salary ? parseFloat(formData.salary) : null
                })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Employee updated successfully!' })
                setTimeout(() => {
                    router.back()
                }, 1000)
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to update employee' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setSaving(false)
        }
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
                    <h1 style={{ fontSize: '18px', fontWeight: '600' }}>Edit Employee</h1>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Message */}
                {message.text && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
                        color: message.type === 'success' ? '#15803d' : '#dc2626',
                        fontSize: '14px'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Form Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    {/* Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '15px',
                                background: 'var(--background)',
                                outline: 'none'
                            }}
                            placeholder="Enter full name"
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '15px',
                                background: 'var(--background)',
                                outline: 'none'
                            }}
                            placeholder="Enter email address"
                        />
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '15px',
                                background: 'var(--background)',
                                outline: 'none'
                            }}
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Address */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '15px',
                                background: 'var(--background)',
                                outline: 'none',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                            placeholder="Enter address"
                        />
                    </div>

                    {/* Salary */}
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Monthly Salary (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '15px',
                                background: 'var(--background)',
                                outline: 'none'
                            }}
                            placeholder="Enter monthly salary"
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '16px 20px',
                background: 'white',
                borderTop: '1px solid var(--border)'
            }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: saving ? '#93c5fd' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
            </div>
        </div>
    )
}
