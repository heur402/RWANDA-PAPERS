import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

// ── Shared password visibility toggle ──────────────────────────────────────
const PasswordInput = ({ id, value, onChange, placeholder = '••••••••', autoComplete }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Sign In form ────────────────────────────────────────────────────────────
const SignInForm = ({ onSuccess }) => {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert message={error} />}

      <div>
        <label className="label" htmlFor="signin-email">Email Address</label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="admin@rwandapapers.rw"
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="signin-password">Password</label>
        <PasswordInput
          id="signin-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
        />
      </div>

      <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in..." />
    </form>
  )
}

// ── Sign Up form ────────────────────────────────────────────────────────────
const SignUpForm = ({ onSuccess }) => {
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Passwords do not match.')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert message={error} />}

      <div>
        <label className="label" htmlFor="signup-name">Full Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Jean Pierre"
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="signup-email">Email Address</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="admin@rwandapapers.rw"
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="signup-password">Password</label>
        <PasswordInput
          id="signup-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          placeholder="Min. 6 characters"
        />
      </div>

      <div>
        <label className="label" htmlFor="signup-confirm">Confirm Password</label>
        <PasswordInput
          id="signup-confirm"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
        {/* Live match indicator */}
        {form.confirm.length > 0 && (
          <p className={`mt-1.5 text-xs flex items-center gap-1 ${form.password === form.confirm ? 'text-green-600' : 'text-red-500'}`}>
            {form.password === form.confirm
              ? <><CheckCircle className="w-3.5 h-3.5" /> Passwords match</>
              : <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</>
            }
          </p>
        )}
      </div>

      <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account..." />
    </form>
  )
}

// ── Small shared components ─────────────────────────────────────────────────
const Alert = ({ message }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    {message}
  </div>
)

const SubmitButton = ({ loading, label, loadingLabel }) => (
  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
    {loading ? (
      <span className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        {loadingLabel}
      </span>
    ) : label}
  </button>
)

// ── Page ────────────────────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState('signin') // 'signin' | 'signup'

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSuccess = () => navigate('/admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rwanda Papers</h1>
          <p className="text-primary-200 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'signin', label: 'Sign In' },
              { key: 'signup', label: 'Create Account' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === key
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-8">
            {tab === 'signin' ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the dashboard.</p>
                <SignInForm onSuccess={handleSuccess} />
                <p className="mt-5 text-center text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => setTab('signup')} className="text-primary-600 font-medium hover:underline">
                    Create one
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Create admin account</h2>
                <p className="text-gray-500 text-sm mb-6">Register to manage Rwanda Papers content.</p>
                <SignUpForm onSuccess={handleSuccess} />
                <p className="mt-5 text-center text-xs text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => setTab('signin')} className="text-primary-600 font-medium hover:underline">
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminLoginPage
