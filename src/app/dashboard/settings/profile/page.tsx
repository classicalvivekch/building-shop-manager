'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    phone: string
    avatar: string
    role: string
}

export default function AdminEditProfilePage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [user, setUser] = useState<User | null>(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [avatar, setAvatar] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    setName(data.user.name || '')
                    setEmail(data.user.email || '')
                    setPhone(data.user.phone || '')
                    setAvatar(data.user.avatar || '')
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (res.ok) {
                setAvatar(data.avatarUrl)
                setMessage({ type: 'success', text: 'Photo uploaded!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload photo' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload photo' })
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, avatar })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                setTimeout(() => router.push('/dashboard/settings'), 1500)
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
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
                <p>Loading...</p>
            </div>
        )
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
                <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Edit Profile</h1>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Avatar with Photo Upload */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            fontWeight: '600',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                            overflow: 'hidden'
                        }}>
                            {!avatar && (name?.charAt(0) || user?.name?.charAt(0) || 'A')}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                border: '3px solid white',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: uploading ? 'wait' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {uploading ? '...' : '📷'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                        {user?.role}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                        Tap camera icon to change photo
                    </p>
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

                {/* Form */}
                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: 'var(--text-primary)'
                        }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '16px',
                                background: 'white',
                                outline: 'none'
                            }}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: 'var(--text-primary)'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '16px',
                                background: 'white',
                                outline: 'none'
                            }}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: 'var(--text-primary)'
                        }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '16px',
                                background: 'white',
                                outline: 'none'
                            }}
                            placeholder="Enter your phone number"
                        />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            This will be visible to employees in Help & Support
                        </p>
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
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}
