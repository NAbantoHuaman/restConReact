import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Utensils, LayoutDashboard, NotebookTabs, CalendarDays, Settings, FileText, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  if (!user) return <Outlet />
  const isActive = (path: string) => location.pathname.startsWith(path)
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-white">
      <aside className="w-full md:w-64 bg-neutral-900/70 backdrop-blur border-r md:border-r border-amber-700/30 p-4 md:p-5 flex md:flex-col flex-row md:gap-2 gap-1 sticky top-0 z-20">
        <div className="flex items-center gap-2 md:mb-4 mr-4">
          <Utensils className="h-6 w-6 text-amber-300" />
          <div className="font-semibold">Panel Administrativo</div>
        </div>
        <nav className="flex md:flex-col flex-row gap-1 md:gap-2 overflow-x-auto">
          <Link to="/admin/dashboard" className={`inline-flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-amber-600/20 ${isActive('/admin/dashboard') ? 'bg-amber-600/30' : ''}`}><LayoutDashboard className="h-4 w-4 text-amber-300" />Dashboard</Link>
          <Link to="/admin/menu" className={`inline-flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-amber-600/20 ${isActive('/admin/menu') ? 'bg-amber-600/30' : ''}`}><NotebookTabs className="h-4 w-4 text-amber-300" />Menú</Link>
          <Link to="/admin/reservations" className={`inline-flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-amber-600/20 ${isActive('/admin/reservations') ? 'bg-amber-600/30' : ''}`}><CalendarDays className="h-4 w-4 text-amber-300" />Reservas</Link>
          <Link to="/admin/settings" className={`inline-flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-amber-600/20 ${isActive('/admin/settings') ? 'bg-amber-600/30' : ''}`}><Settings className="h-4 w-4 text-amber-300" />Configuración</Link>
          <Link to="/admin/logs" className={`inline-flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-amber-600/20 ${isActive('/admin/logs') ? 'bg-amber-600/30' : ''}`}><FileText className="h-4 w-4 text-amber-300" />Logs</Link>
        </nav>
        <button className="md:mt-auto md:ml-0 ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600/80 hover:bg-red-500 transition-colors" onClick={() => { logout(); navigate('/admin/login') }}>
          <LogOut className="h-4 w-4" />Salir
        </button>
      </aside>
      <div className="flex-1 p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  )
}