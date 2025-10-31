import { FormEvent, useMemo, useState } from 'react'
import { cancelReservation, listReservations, updateReservation } from '../../services/adminDb'
import { Pencil, XCircle, CalendarClock, Users, CheckCircle } from 'lucide-react'

type Edit = { id: number | null; date: string; time: string; guests: string }

export default function ReservationsAdmin() {
  const [items, setItems] = useState(listReservations())
  const [reason, setReason] = useState('')
  const [edit, setEdit] = useState<Edit>({ id: null, date: '', time: '', guests: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const groups = useMemo(() => {
    const same = items.filter((r: any) => r.date === today)
    const upcoming = items.filter((r: any) => r.date > today)
    return { same, upcoming }
  }, [items])
  const onStartEdit = (r: any) => setEdit({ id: r.id, date: r.date, time: r.time, guests: String(r.guests) })
  const onSaveEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!edit.id) return
    setError('')
    setNotice('')
    const g = Number(edit.guests || 0)
    if (!edit.date || !edit.time) {
      setError('Fecha y hora son obligatorias')
      return
    }
    if (!Number.isFinite(g) || g <= 0) {
      setError('El número de personas debe ser mayor a 0')
      return
    }
    const updated = updateReservation(edit.id, { date: edit.date, time: edit.time, guests: g })
    if (updated) setItems(items.map((r: any) => (String(r.id) === String(edit.id) ? updated : r)))
    setEdit({ id: null, date: '', time: '', guests: '' })
    setNotice('Reserva actualizada')
    setTimeout(() => setNotice(''), 2000)
  }
  const onCancel = (id: any) => {
    const r = reason.trim()
    setError('')
    setNotice('')
    if (!r) {
      setError('Ingresa un motivo para cancelar')
      return
    }
    const ok = cancelReservation(id, r)
    if (ok) setItems(items.filter((it: any) => String(it.id) !== String(id)))
    setReason('')
    setNotice('Reserva cancelada')
    setTimeout(() => setNotice(''), 2000)
  }
  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold tracking-tight">Reservas</div>
      {error && <div className="p-2 rounded bg-red-900/40 border border-red-500 text-red-200 text-sm">{error}</div>}
      {notice && <div className="p-2 rounded bg-emerald-900/30 border border-emerald-600 text-emerald-200 text-sm inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" />{notice}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 font-semibold inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-300" />Hoy</div>
          <div className="grid gap-3">
            {groups.same.map((r: any) => (
              <div key={String(r.id)} className="p-3 bg-black/30 border border-amber-700/30 rounded-xl grid grid-cols-[1fr_auto] gap-3 items-center hover:border-amber-500 transition-colors">
                <div>
                  <div className="font-semibold">Mesa {r.tableNumber} · {r.time}</div>
                  <div className="text-sm text-neutral-300 inline-flex items-center gap-2"><Users className="h-4 w-4" />{r.customerName} · {r.guests} personas</div>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 px-2 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors" onClick={() => onStartEdit(r)}><Pencil className="h-4 w-4" />Editar</button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 border border-red-700 rounded text-red-400 hover:bg-red-900/40 transition-colors" onClick={() => onCancel(r.id)}><XCircle className="h-4 w-4" />Cancelar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 font-semibold inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-300" />Próximas</div>
          <div className="grid gap-3">
            {groups.upcoming.map((r: any) => (
              <div key={String(r.id)} className="p-3 bg-black/30 border border-amber-700/30 rounded-xl grid grid-cols-[1fr_auto] gap-3 items-center hover:border-amber-500 transition-colors">
                <div>
                  <div className="font-semibold">{r.date} · Mesa {r.tableNumber} · {r.time}</div>
                  <div className="text-sm text-neutral-300 inline-flex items-center gap-2"><Users className="h-4 w-4" />{r.customerName} · {r.guests} personas</div>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 px-2 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors" onClick={() => onStartEdit(r)}><Pencil className="h-4 w-4" />Editar</button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 border border-red-700 rounded text-red-400 hover:bg-red-900/40 transition-colors" onClick={() => onCancel(r.id)}><XCircle className="h-4 w-4" />Cancelar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={onSaveEdit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-black/30 border border-amber-700/30 p-3 rounded-xl">
        <input placeholder="Fecha" value={edit.date} onChange={e => setEdit({ ...edit, date: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <input placeholder="Hora" value={edit.time} onChange={e => setEdit({ ...edit, time: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <input placeholder="Personas" value={edit.guests} onChange={e => setEdit({ ...edit, guests: e.target.value })} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded px-3 py-2 transition-colors">Guardar cambios</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
        <input placeholder="Motivo de cancelación" value={reason} onChange={e => setReason(e.target.value)} className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <div className="text-xs text-neutral-400">Se aplica al botón Cancelar</div>
      </div>
    </div>
  )
}