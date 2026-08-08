import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from './authApiSlice'
import { useAppDispatch } from '../../app/hooks'
import { setCredentials } from './authSlice'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      const response = await login({ email, password }).unwrap()
      dispatch(setCredentials({ user: response.data.user, token: response.data.accessToken }))
      toast.success('Signed in successfully!')
      navigate('/dashboard')
    } catch (err: any) {
      let msg = 'Invalid email or password.'
      if (err?.status === 'FETCH_ERROR') {
        msg = 'Cannot connect to backend server. Make sure Spring Boot is running on port 8080.'
      } else if (err?.data?.message) {
        msg = err.data.message
      } else if (err?.data?.error) {
        msg = err.data.error
      }
      setError(msg)
      toast.error(msg)
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    height: 42,
    padding: '0 14px',
    borderRadius: 9,
    border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#e4e4e7',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#09090b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>B</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#e4e4e7' }}>BuildStack</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        backgroundColor: '#111113',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '32px 32px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: '#71717a', marginTop: 6 }}>
            Sign in to your BuildStack account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#a1a1aa', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle(!!error)}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#a1a1aa', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle(!!error), paddingRight: 40 }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 12px', borderRadius: 8,
              backgroundColor: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-btn"
            disabled={isLoading}
            style={{
              width: '100%', height: 42,
              background: isLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: 9, cursor: isLoading ? 'wait' : 'pointer',
              color: 'white', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: isLoading ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {isLoading ? (
              <><Loader2 size={15} className="animate-spin" /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#52525b', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
            Create one free →
          </Link>
        </p>
      </div>

      <p style={{ fontSize: 11, color: '#3f3f46', marginTop: 20 }}>
        BuildStack — No-code website builder
      </p>
    </div>
  )
}
