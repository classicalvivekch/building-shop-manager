'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSecurityPage() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [showPasswords, setShowPasswords] = useState(false)

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
            return
        }

        setSaving(true)

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => router.push('/dashboard/settings'), 1500)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid var(--border)'
            }}>
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
                <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Privacy & Security</h1>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Change Password Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px' }}>🔐</span>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Change Password</h2>
                    </div>

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

                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                fontSize: '14px'
                            }}>
                                Current Password
                            </label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    fontSize: '16px',
                                    background: 'var(--background)',
                                    outline: 'none'
                                }}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                fontSize: '14px'
                            }}>
                                New Password
                            </label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    fontSize: '16px',
                                    background: 'var(--background)',
                                    outline: 'none'
                                }}
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                fontSize: '14px'
                            }}>
                                Confirm New Password
                            </label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    fontSize: '16px',
                                    background: 'var(--background)',
                                    outline: 'none'
                                }}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={showPasswords}
                                    onChange={(e) => setShowPasswords(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Show passwords</span>
                            </label>
                        </div>

                        <button
                            type="submit"
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
                                transition: 'all 0.2s'
                            }}
                        >
                            {saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Security Tips */}
                <div style={{
                    marginTop: '20px',
                    background: '#fffbeb',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #fcd34d'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>💡 Security Tips</p>
                    <ul style={{ color: '#a16207', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                        <li>Use at least 8 characters</li>
                        <li>Include numbers and symbols</li>
                        <li>Avoid using personal information</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
