import { useState } from 'react'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { DEMO_CREDENTIALS, COMPANY } from '@mock/mockData'

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (
        username === DEMO_CREDENTIALS.superAdmin.username &&
        password === DEMO_CREDENTIALS.superAdmin.password
      ) {
        onLogin()
      } else {
        setError('Invalid credentials. Use demo: admin / admin123')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#202B75] px-8 py-8 text-center">
            <img
              src={COMPANY.logo}
              alt="Silver Star"
              className="h-14 mx-auto mb-4 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <h1 className="text-white text-xl font-bold tracking-wide">Super Admin Portal</h1>
            <p className="text-[#26BCEE] text-sm mt-1">Silver Star Facility Management</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-[#202B75]" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Secure Login</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] focus:border-transparent pr-10"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Demo Credentials</p>
              <p className="text-xs text-gray-600">Username: <span className="font-mono font-semibold text-[#202B75]">admin</span></p>
              <p className="text-xs text-gray-600">Password: <span className="font-mono font-semibold text-[#202B75]">admin123</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 Silver Star Facility Management Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}

