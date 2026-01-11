'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BuildingIcon, UserIcon, LockIcon, EyeIcon, EyeOffIcon, FingerprintIcon } from '@/components/Icons'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/dashboard')
      } else {
        router.push('/employee')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 10px 40px rgba(37, 99, 235, 0.3)'
        }}>
          <BuildingIcon size={44} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Construction Materials Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Sign in to manage inventory and orders
        </p>
      </div>

      {/* Role Toggle */}
      <div className="toggle-group" style={{ marginBottom: '32px' }}>
        <button
          className={`toggle-btn ${role === 'ADMIN' ? 'active' : ''}`}
          onClick={() => setRole('ADMIN')}
        >
          Admin
        </button>
        <button
          className={`toggle-btn ${role === 'EMPLOYEE' ? 'active' : ''}`}
          onClick={() => setRole('EMPLOYEE')}
        >
          Employee
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label className="input-label">Username or Employee ID</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              display: 'flex'
            }}>
              <UserIcon size={18} />
            </span>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              display: 'flex'
            }}>
              <LockIcon size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '44px', paddingRight: '44px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                padding: '4px'
              }}
            >
              {showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <a href="#" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
              Forgot Password?
            </a>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ marginBottom: '24px' }}
        >
          {loading ? (
            <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
          ) : (
            <>Log In →</>
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span>Or sign in with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Face ID Button */}
      <button className="btn btn-outline" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <FingerprintIcon size={20} /> Biometric Login
      </button>

      {/* Footer */}
      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Having trouble? <a href="#" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Contact Support</a>
        </p>
      </div>
    </div>
  )
}

