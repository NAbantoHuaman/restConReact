import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Utensils, LayoutDashboard, NotebookTabs, CalendarDays, Settings, FileText, LogOut, SunMedium, Moon } from 'lucide-react'
import Breadcrumbs from '../../components/admin/Breadcrumbs'
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'

function AdminLayoutInner() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  if (!user) return <Outlet />
  const isActive = (path: string) => location.pathname.startsWith(path)
  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors ease-smooth">
      <aside className="w-16 md:w-64 transition-all ease-smooth duration-300 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-r md:border-r border-neutral-200 dark:border-neutral-800 p-3 md:p-5 flex md:flex-col flex-row md:gap-2 gap-1 sticky top-0 z-20">
        <div className="flex items-center gap-2 md:mb-4 mr-2">
          <Utensils className="h-6 w-6 text-accent-600 dark:text-accent-400" />
          <div className="font-semibold hidden md:block">Panel Administrativo</div>
        </div>
        <nav aria-label="Navegación administrativa" className="flex md:flex-col flex-row gap-1 md:gap-2 overflow-x-auto">
          <Link to="/admin/dashboard" aria-current={isActive('/admin/dashboard') ? 'page' : undefined} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-accent-100/60 dark:hover:bg-neutral-800/60 ${isActive('/admin/dashboard') ? 'bg-accent-100/80 dark:bg-neutral-800/60' : ''}`}><LayoutDashboard className="h-4 w-4 text-accent-600 dark:text-accent-400" /><span className="hidden md:inline">Dashboard</span></Link>
          <Link to="/admin/menu" aria-current={isActive('/admin/menu') ? 'page' : undefined} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-accent-100/60 dark:hover:bg-neutral-800/60 ${isActive('/admin/menu') ? 'bg-accent-100/80 dark:bg-neutral-800/60' : ''}`}><NotebookTabs className="h-4 w-4 text-accent-600 dark:text-accent-400" /><span className="hidden md:inline">Menú</span></Link>
          <Link to="/admin/reservations" aria-current={isActive('/admin/reservations') ? 'page' : undefined} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-accent-100/60 dark:hover:bg-neutral-800/60 ${isActive('/admin/reservations') ? 'bg-accent-100/80 dark:bg-neutral-800/60' : ''}`}><CalendarDays className="h-4 w-4 text-accent-600 dark:text-accent-400" /><span className="hidden md:inline">Reservas</span></Link>
          <Link to="/admin/settings" aria-current={isActive('/admin/settings') ? 'page' : undefined} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-accent-100/60 dark:hover:bg-neutral-800/60 ${isActive('/admin/settings') ? 'bg-accent-100/80 dark:bg-neutral-800/60' : ''}`}><Settings className="h-4 w-4 text-accent-600 dark:text-accent-400" /><span className="hidden md:inline">Configuración</span></Link>
          <Link to="/admin/logs" aria-current={isActive('/admin/logs') ? 'page' : undefined} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-accent-100/60 dark:hover:bg-neutral-800/60 ${isActive('/admin/logs') ? 'bg-accent-100/80 dark:bg-neutral-800/60' : ''}`}><FileText className="h-4 w-4 text-accent-600 dark:text-accent-400" /><span className="hidden md:inline">Logs</span></Link>
        </nav>
        <div className="md:mt-auto md:ml-0 ml-auto flex items-center gap-2">
          <button aria-label="Cambiar tema" className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors" onClick={toggle}>
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 transition-colors" onClick={() => { logout(); navigate('/admin/login') }}>
            <LogOut className="h-4 w-4" /><span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <Breadcrumbs />
        <Outlet />
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutInner />
    </ThemeProvider>
  )
}
