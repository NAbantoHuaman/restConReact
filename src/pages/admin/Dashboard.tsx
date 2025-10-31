import { listReservations } from '../../services/adminDb'
import { CalendarCheck, ListChecks } from 'lucide-react'

function numForToday() {
  const all = listReservations()
  const today = new Date().toISOString().slice(0, 10)
  return all.filter((r: any) => r.date === today).length
}

export default function AdminDashboard() {
  const todayCount = numForToday()
  const total = listReservations().length
  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-black/30 border border-amber-700/30 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-amber-200">Reservas de hoy</div>
            <CalendarCheck className="h-5 w-5 text-amber-300" />
          </div>
          <div className="text-4xl font-extrabold">{todayCount}</div>
        </div>
        <div className="p-5 bg-black/30 border border-amber-700/30 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-amber-200">Reservas totales</div>
            <ListChecks className="h-5 w-5 text-amber-300" />
          </div>
          <div className="text-4xl font-extrabold">{total}</div>
        </div>
      </div>
    </div>
  )
}