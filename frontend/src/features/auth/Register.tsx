import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from './authApiSlice'
import { useAppDispatch } from '../../app/hooks'
import { setCredentials } from './authSlice'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react'

export function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.includes('@')) e.email = 'Valid email is required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    try {
      const response = await register(form).unwrap()
      dispatch(setCredentials({ user: response.data.user, token: response.data.accessToken }))
      toast.success('Account created successfully! Welcome to BuildStack 🚀')
      navigate('/dashboard')
    } catch (err: any) {
      let msg = 'Registration failed.'
      if (err?.status === 'FETCH_ERROR') {
        msg = 'Cannot connect to backend server. Make sure Spring Boot is running on port 8080.'
      } else if (err?.data?.message) {
        msg = err.data.message
      } else if (err?.data?.error) {
        msg = err.data.error
      }
      setApiError(msg)
      toast.error(msg)
    }
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    height: 42,
    padding: '0 14px',
    borderRadius: 9,
    border: `1px solid ${hasError ? 'rgba(248,113,113,0.6)' : 'var(--border)'}`,
    backgroundColor: 'var(--input)',
    color: 'var(--foreground)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--muted-foreground)',
    marginBottom: 6,
  }

  const errorStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#f87171',
    marginTop: 4,
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length >= 12 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return 'strong'
    if (p.length >= 8) return 'good'
    return 'weak'
  }
  const strength = passwordStrength()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
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
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>BuildStack</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '32px 32px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 6 }}>
            Start building beautiful websites for free
          </p>
        </div>

        {apiError && (
          <div style={{
            marginBottom: 20, padding: '12px 14px', borderRadius: 9,
            backgroundColor: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171', margin: 0 }}>Registration Failed</p>
              <p style={{ fontSize: 12, color: '#fca5a5', margin: '2px 0 0', lineHeight: 1.4 }}>{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                style={inputStyle(!!errors.firstName)}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.firstName ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)' }}
              />
              {errors.firstName && <p style={errorStyle}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                style={inputStyle(!!errors.lastName)}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.lastName ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)' }}
              />
              {errors.lastName && <p style={errorStyle}>{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle(!!errors.email)}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.email ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)' }}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle(!!errors.password), paddingRight: 40 }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.password ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)' }}
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
            {/* Strength indicator */}
            {form.password && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {['weak', 'good', 'strong'].map((level, i) => (
                  <div key={level} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    backgroundColor: strength === 'strong' || (strength === 'good' && i < 2) || (strength === 'weak' && i < 1)
                      ? strength === 'strong' ? '#34d399' : strength === 'good' ? '#f59e0b' : '#f87171'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background-color 0.2s ease',
                  }} />
                ))}
                <span style={{ fontSize: 10, color: strength === 'strong' ? '#34d399' : strength === 'good' ? '#f59e0b' : '#f87171', minWidth: 36 }}>
                  {strength}
                </span>
              </div>
            )}
            {errors.password && <p style={errorStyle}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: 40 }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.confirmPassword ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)' }}
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#34d399' }}>
                  <Check size={15} />
                </div>
              )}
            </div>
            {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
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
              <><Loader2 size={15} className="animate-spin" /> Creating account…</>
            ) : (
              <>Create Account <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#52525b', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
            Sign in →
          </Link>
        </p>
      </div>

      <p style={{ fontSize: 11, color: '#3f3f46', marginTop: 20 }}>
        By creating an account, you agree to our Terms of Service
      </p>
    </div>
  )
}
