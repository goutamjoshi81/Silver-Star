import { useState } from 'react'
import { DEMO_CREDENTIALS, COMPANY, EMPLOYEES } from '@mock/mockData'
import { Shield, Eye, EyeOff, Smartphone, QrCode } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [empCode, setEmpCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (
        empCode.trim().toUpperCase() === DEMO_CREDENTIALS.employee.employeeCode &&
        password === DEMO_CREDENTIALS.employee.password
      ) {
        onLogin()
      } else {
        setError('Invalid credentials. Use demo: SS-10001 / emp123')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="bg-[#202B75] px-6 py-8 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto p-2 mb-3 shadow-md flex items-center justify-center">
            <img
              src={COMPANY.logo}
              alt="Silver Star"
              className="max-h-full max-w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <h1 className="text-white text-base font-bold">Staff Mobile Attendance</h1>
          <p className="text-[#26BCEE] text-xs mt-0.5 font-medium">Frontline Workforce Portal</p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-5 text-slate-500 text-xs">
            <Shield size={14} className="text-[#202B75]" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Secure Staff Sign-In</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employee Code</label>
              <input
                type="text"
                value={empCode}
                onChange={e => setEmpCode(e.target.value)}
                placeholder="SS-10001"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#202B75]"
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
              {loading ? 'Verifying Employee ID...' : 'Login to Staff App'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
            <p className="font-bold text-slate-600 uppercase tracking-wider text-[9px] mb-1">Demo Staff Credentials</p>
            <div className="flex justify-between text-slate-600">
              <span>Code: <strong className="font-mono text-[#202B75]">SS-10001</strong></span>
              <span>Pass: <strong className="font-mono text-[#202B75]">emp123</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Ramesh Kumar · Security Guard · InfoSys Block A
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

