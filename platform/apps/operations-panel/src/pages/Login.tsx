import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { DEMO_CREDENTIALS, COMPANY, api } from '@mock/mockData'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')

    const cleanUser = u.trim()
    const cleanPass = p.trim()

    try {
      const res = await api.login({
        username: cleanUser,
        password: cleanPass,
      })

      if (res && res.success && res.user) {
        const role = (res.user.role || '').toLowerCase()
        const isAuthorized =
          role.includes('operation') ||
          role.includes('supervisor') ||
          role.includes('admin') ||
          role.includes('manager')

        if (isAuthorized) {
          sessionStorage.setItem('silverstar_ops_user', JSON.stringify(res.user))
          onLogin()
          return
        } else {
          setErr(`Role '${res.user.role}' is not authorized for Operations Management.`)
          setLoading(false)
          return
        }
      } else {
        setErr('Invalid credentials. Please verify username and password.')
      }
    } catch (apiErr: any) {
      console.warn('Backend login attempt:', apiErr)
      // Offline fallback for demo or test accounts
      if (
        (cleanUser === DEMO_CREDENTIALS.operations.username && cleanPass === DEMO_CREDENTIALS.operations.password) ||
        (cleanUser === 'test-admin' && cleanPass === '1234') ||
        (cleanUser === 'ops' && cleanPass === 'ops123')
      ) {
        sessionStorage.setItem('silverstar_ops_user', JSON.stringify({ name: cleanUser, role: 'Operations Manager' }))
        onLogin()
        return
      }
      setErr(apiErr.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#202B75] px-8 py-8 text-center">
          <img src={COMPANY.logo} alt="Silver Star" className="h-14 mx-auto mb-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h1 className="text-white text-xl font-bold">Operations Management</h1>
          <p className="text-[#26BCEE] text-sm mt-1">Field Operations Division</p>
        </div>
        <div className="px-8 py-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
              <input
                type="text"
                value={u}
                onChange={e => setU(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                placeholder="test-admin or ops@silverstarindia.net"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={p}
                  onChange={e => setP(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {err && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100 text-xs">
            <p className="text-gray-500 font-semibold mb-2 uppercase tracking-wider">Configured Credentials</p>
            <p className="text-gray-600">Database User: <span className="font-mono font-semibold text-[#202B75]">test-admin</span> / <span className="font-mono font-semibold text-[#202B75]">1234</span></p>
            <p className="text-gray-600 mt-1">Default Ops: <span className="font-mono font-semibold text-[#202B75]">ops</span> / <span className="font-mono font-semibold text-[#202B75]">ops123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

