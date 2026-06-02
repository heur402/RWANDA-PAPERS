import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { User, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { updateAdminProfile, changeAdminPassword } from '../../api/admin.js'
import { useAuth } from '../../context/AuthContext.jsx'

// ── Password visibility toggle ──────────────────────────────────────────────
const PwdInput = ({ id, label, value, onChange, autoComplete, placeholder }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id} type={show ? 'text' : 'password'}
          autoComplete={autoComplete} required
          value={value} onChange={onChange}
          placeholder={placeholder || '••••••••'}
          className="input pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// ── Profile info section ────────────────────────────────────────────────────
const ProfileInfoForm = () => {
  const { admin, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: admin?.name || '', email: admin?.email || '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    try {
      const { data } = await updateAdminProfile(form)
      updateProfile(data.admin)          // sync context + localStorage
      setSuccess(true)
      toast.success('Profile updated successfully')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Personal Information</h2>
          <p className="text-xs text-gray-500">Update your name and email address</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name" type="text" required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email" type="email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            className="input"
          />
        </div>

        {/* Role badge — read-only */}
        <div>
          <label className="label">Role</label>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
              admin?.role === 'superadmin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {admin?.role === 'superadmin' ? '⭐ Super Admin' : '🛡️ Admin'}
            </span>
            <span className="text-xs text-gray-400">Role cannot be changed here</span>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : success ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Change password section ─────────────────────────────────────────────────
const ChangePasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await changeAdminPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Password changed successfully')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <Lock className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-500">Use a strong password of at least 6 characters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PwdInput
          id="current-pwd" label="Current Password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <PwdInput
          id="new-pwd" label="New Password"
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <PwdInput
          id="confirm-pwd" label="Confirm New Password"
          autoComplete="new-password"
          placeholder="Repeat new password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        {/* Live match indicator */}
        {form.confirm.length > 0 && (
          <p className={`text-xs flex items-center gap-1 ${form.newPassword === form.confirm ? 'text-green-600' : 'text-red-500'}`}>
            {form.newPassword === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </span>
          ) : (
            <><Lock className="w-4 h-4" /> Update Password</>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
const AdminProfile = () => {
  const { admin } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{admin?.name}</h1>
          <p className="text-gray-500 text-sm">{admin?.email}</p>
        </div>
      </div>

      <ProfileInfoForm />
      <ChangePasswordForm />
    </div>
  )
}

export default AdminProfile
