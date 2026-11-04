import { useState } from 'react'
import { DEMO_CREDENTIALS, COMPANY, CLIENTS } from '@mock/mockData'
import { Building2, Shield, Eye, EyeOff, Smartphone } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const client = CLIENTS.find(c => c.id === 'CLI001')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (
        username === DEMO_CREDENTIALS.client.username &&
        password === DEMO_CREDENTIALS.client.password
      ) {
        onLogin()
      } else {
        setError('Invalid credentials. Use demo: infosys_client / client123')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="bg-[#202B75] px-6 py-8 text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto p-2 mb-3 shadow-md flex items-center justify-center">
            <img
              src={COMPANY.logo}
              alt="Silver Star"
              className="max-h-full max-w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <h1 className="text-white text-base font-bold">Client Portal App</h1>
          <p className="text-[#26BCEE] text-xs mt-0.5 font-medium">{client?.name}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5 text-slate-500 text-xs">
            <Shield size={14} className="text-[#202B75]" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Client Facility Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Portal Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="infosys_client"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs pr-10 focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-rose-600 text-[11px] bg-rose-50 border border-rose-100 rounded-lg p-2.5 leading-tight">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl py-3 text-xs font-semibold shadow-md shadow-[#202B75]/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Client Portal'}
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
            <p className="font-bold text-slate-600 uppercase tracking-wider text-[9px] mb-1">Demo Client Credentials</p>
            <div className="flex justify-between text-slate-600">
              <span>User: <strong className="font-mono text-[#202B75]">infosys_client</strong></span>
              <span>Pass: <strong className="font-mono text-[#202B75]">client123</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
              Strict Tenancy: Only InfoSys Tech Park premises & workforce are visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

