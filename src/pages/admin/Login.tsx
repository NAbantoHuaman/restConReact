import { FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Utensils, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const validate = () => {
    const errors: string[] = []
    if (!user.trim()) errors.push('Ingresa tu usuario')
    if (!pass.trim()) errors.push('Ingresa tu contraseña')
    if (user.trim().length < 3) errors.push('El usuario debe tener al menos 3 caracteres')
    if (pass.trim().length < 4) errors.push('La contraseña debe tener al menos 4 caracteres')
    return errors
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (errors.length) {
      setErr(errors[0])
      return
    }
    setErr('')
    const ok = login(user, pass)
    if (ok) navigate('/admin/dashboard')
    else setErr('Credenciales inválidas')
  }

  return (
    <div className="min-h-screen w-full grid place-items-center bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-black/30 backdrop-blur rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="h-8 w-8 text-amber-300" />
            <div>
              <div className="text-2xl font-bold leading-tight">Bella Vista</div>
              <div className="text-sm text-amber-200">Acceso Administrativo</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Usuario</label>
              <input
                placeholder="Ingresa tu usuario"
                value={user}
                onChange={e => setUser(e.target.value)}
                className="mt-1 w-full bg-white text-black rounded-lg px-3 py-2 border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contraseña</label>
              <input
                placeholder="Ingresa tu contraseña"
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="mt-1 w-full bg-white text-black rounded-lg px-3 py-2 border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {err && <div className="text-red-200 bg-red-900/40 border border-red-500 rounded p-2 text-sm">{err}</div>}

            <button
              className="mt-2 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <ShieldCheck className="h-5 w-5" />
              Ingresar
            </button>
            <button
              type="button"
              className="text-sm text-amber-200 hover:text-white underline text-left"
              onClick={() => setShowHelp(s => !s)}
            >
              Olvidé mi contraseña
            </button>
            {showHelp && (
              <div className="text-sm text-amber-100 bg-black/30 rounded p-3">
                Si olvidaste tus credenciales, contacta al administrador: 
                <a className="underline hover:text-white" href="mailto:contacto@bellavista.com">contacto@bellavista.com</a>
              </div>
            )}
          </form>
        </div>
        <div className="text-center text-xs text-white/80 mt-4">
          © 2024 Bella Vista. Acceso restringido.
        </div>
      </div>
    </div>
  )
}