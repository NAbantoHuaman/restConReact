import { FormEvent, useEffect, useMemo, useState } from 'react'
import { cancelReservation, listReservations, updateReservation, reactivateReservation } from '../../services/adminDb'
import { Pencil, XCircle, CalendarClock, Users, CheckCircle, Phone, Mail, Trash } from 'lucide-react'
import { useTablesManager } from '../../hooks/useTablesManager'
import { getTableShift } from '../../config/tableShifts'
import { restaurantConfig } from '../../config/restaurantConfig'
import { formatTimeLabel } from '../../utils/dateTime'
import { useLanguage } from '../../contexts/LanguageContext'
import Card from '../../components/admin/ui/Card'
import Button from '../../components/admin/ui/Button'
import Input from '../../components/admin/ui/Input'
import Select from '../../components/admin/ui/Select'

type Edit = { id: number | null; date: string; time: string; guests: string; tableId?: string }

export default function ReservationsAdmin() {
  const [items, setItems] = useState(listReservations())
  const [reason, setReason] = useState('')
  const [edit, setEdit] = useState<Edit>({ id: null, date: '', time: '', guests: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { tables, isTableAvailableForDateTime, removeReservation } = useTablesManager()
  const { language } = useLanguage()
  const today = new Date().toISOString().slice(0, 10)

  // Evitar desfase al construir Date desde YYYY-MM-DD
  const toLocalDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const da = toLocalDate(a.date).getTime()
      const db = toLocalDate(b.date).getTime()
      if (da !== db) return da - db
      // comparar horas HH:mm
      const [ha, ma] = String(a.time || '00:00').split(':').map(Number)
      const [hb, mb] = String(b.time || '00:00').split(':').map(Number)
      const ta = ha * 60 + ma
      const tb = hb * 60 + mb
      return ta - tb
    })
  }, [items])

  // Actualización dinámica: escuchar cambios en localStorage y eventos de reserva
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'reservations') {
        setItems(listReservations())
      }
    }
    const onCustom = () => setItems(listReservations())
    window.addEventListener('storage', onStorage)
    window.addEventListener('reservationUpdated', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('reservationUpdated', onCustom as EventListener)
    }
  }, [])
  const onStartEdit = (r: any) => setEdit({ id: r.id, date: r.date, time: r.time, guests: String(r.guests), tableId: r.tableId ? String(r.tableId) : '' })
  // Listar todas las mesas con indicador de disponibilidad y capacidad
  const tablesForSelect = useMemo(() => {
    const g = Number(edit.guests || 0)
    return tables.map(t => {
      const meetsCapacity = Number.isFinite(g) && g > 0 ? t.capacity >= g : true
      const hasDateTime = !!edit.date && !!edit.time && Number.isFinite(g) && g > 0
      // Validar turno de mesa vs hora seleccionada
      const shiftOk = hasDateTime ? (() => {
        const tableShift = getTableShift(t.id)
        const availableByShift = (() => {
          const [hh, mm] = String(edit.time || '00:00').split(':').map(Number)
          const minutes = (hh * 60) + (mm || 0)
          const lunchStart = 12 * 60
          const lunchEnd = 15 * 60
          const dinnerStart = 19 * 60
          const dinnerEnd = 23 * 60
          const isLunch = minutes >= lunchStart && minutes <= lunchEnd
          const isDinner = minutes >= dinnerStart && minutes <= dinnerEnd
          if (tableShift === 'both') return true
          if (tableShift === 'lunch') return isLunch
          if (tableShift === 'dinner') return isDinner
          return true
        })()
        return availableByShift
      })() : true
      const available = hasDateTime ? (t.capacity >= g && shiftOk && isTableAvailableForDateTime(t.id, edit.date, edit.time)) : false
      return { ...t, available, meetsCapacity }
    })
  }, [tables, edit.date, edit.time, edit.guests, isTableAvailableForDateTime])

  // Disponibilidad de horario: hay al menos una mesa disponible que cumpla capacidad
  const isTimeSlotAvailableAdmin = (date: string, time: string, guests: number) => {
    if (!date || !time || !Number.isFinite(guests) || guests <= 0) return true
    const anyAvailable = tables.some(t => {
      if (t.capacity < guests) return false
      const tableShift = getTableShift(t.id)
      const [hh, mm] = time.split(':').map(Number)
      const minutes = (hh * 60) + (mm || 0)
      const lunchStart = 12 * 60
      const lunchEnd = 15 * 60
      const dinnerStart = 19 * 60
      const dinnerEnd = 23 * 60
      const isLunch = minutes >= lunchStart && minutes <= lunchEnd
      const isDinner = minutes >= dinnerStart && minutes <= dinnerEnd
      if (tableShift === 'lunch' && !isLunch) return false
      if (tableShift === 'dinner' && !isDinner) return false
      return isTableAvailableForDateTime(t.id, date, time)
    })
    return anyAvailable
  }

  // Rango de fechas permitido como en el formulario del cliente
  const maxAdvanceDays = 60
  const minDate = today
  const maxDate = new Date(new Date().getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
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
    // Validar mesa seleccionada (si se ha elegido)
    let tablePatch: any = {}
    if (edit.tableId) {
      const chosenId = Number(edit.tableId)
      const chosen = tables.find(t => t.id === chosenId)
      if (!chosen) {
        setError('Mesa seleccionada inválida')
        return
      }
      if (chosen.capacity < g) {
        setError(`La mesa ${chosen.number} no tiene capacidad suficiente`)
        return
      }
      // Validar turno de mesa para la hora seleccionada
      const tableShift = getTableShift(chosenId)
      const [hh, mm] = String(edit.time || '00:00').split(':').map(Number)
      const minutes = (hh * 60) + (mm || 0)
      const lunchStart = 12 * 60
      const lunchEnd = 15 * 60
      const dinnerStart = 19 * 60
      const dinnerEnd = 23 * 60
      const isLunch = minutes >= lunchStart && minutes <= lunchEnd
      const isDinner = minutes >= dinnerStart && minutes <= dinnerEnd
      if (tableShift === 'lunch' && !isLunch) {
        setError(`La mesa ${chosen.number} solo está disponible en almuerzo`)
        return
      }
      if (tableShift === 'dinner' && !isDinner) {
        setError(`La mesa ${chosen.number} solo está disponible en cena`)
        return
      }
      if (!isTableAvailableForDateTime(chosenId, edit.date, edit.time)) {
        setError(`La mesa ${chosen.number} no está disponible en ese horario`)
        return
      }
      tablePatch = { tableId: chosen.id, tableNumber: chosen.number }
    }

    // Ajustar consumo según hora (como en el formulario del cliente)
    const timeSlots = {
      lunch: ['12:00','12:30','13:00','13:30','14:00','14:30','15:00'],
      dinner: ['19:00','19:30','20:00','20:30','21:00','21:30','22:00']
    }
    const consumptionType = timeSlots.lunch.includes(edit.time) ? 'almuerzo' : 'cena'

    const updated = updateReservation(edit.id, { date: edit.date, time: edit.time, guests: g, consumptionType, ...tablePatch })
    // Forzar recarga desde almacenamiento para reflejar todos los campos
    if (updated) setItems(listReservations())
    setEdit({ id: null, date: '', time: '', guests: '', tableId: '' })
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
    if (ok) setItems(listReservations())
    setReason('')
    setNotice('Reserva cancelada')
    setTimeout(() => setNotice(''), 2000)
  }

  const onReactivate = (r: any) => {
    setError('')
    setNotice('')
    // Validar horario disponible y slots válidos
    if (!isTableAvailableForDateTime(Number(r.tableId), r.date, r.time)) {
      setError(`La mesa ${r.tableNumber} no está disponible en ese horario para reactivación`)
      return
    }
    const ok = reactivateReservation(r.id)
    if (ok) {
      setItems(listReservations())
      setNotice('Mesa reactivada')
      setTimeout(() => setNotice(''), 2000)
    }
  }

  const onToggleAttended = (r: any) => {
    setError('')
    const updated = updateReservation(r.id, { attended: !r.attended })
    if (updated) setItems(items.map((it: any) => (String(it.id) === String(r.id) ? updated : it)))
  }

  const onDelete = (id: any) => {
    setError('')
    setNotice('')
    const confirm = window.confirm('¿Eliminar la reserva definitivamente?')
    if (!confirm) return
    try {
      removeReservation(Number(id))
      setItems(listReservations())
      setNotice('Reserva eliminada')
      setTimeout(() => setNotice(''), 2000)
    } catch (e) {
      setError('No se pudo eliminar la reserva')
    }
  }
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
        {notice && <div className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-200"><CheckCircle className="h-4 w-4" />{notice}</div>}
      </div>
      {error && <div role="alert" className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-600 dark:text-red-200 text-sm">{error}</div>}
      {/* Cuadrícula responsiva de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((r: any) => (
          <Card key={String(r.id)} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm text-neutral-600 dark:text-neutral-300 inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  <span>{r.date === today ? 'Hoy' : r.date} · {r.time}</span>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Mesa {r.tableNumber}</div>
                {r.status === 'cancelled' && (
                  <div className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">Cancelada</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"><Users className="h-4 w-4" />{r.customerName}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">{r.guests} personas</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {r.customerPhone && (
                <div className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><Phone className="h-4 w-4" />{r.customerPhone}</div>
              )}
              {r.customerEmail && (
                <div className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><Mail className="h-4 w-4" />{r.customerEmail}</div>
              )}
              {r.status === 'cancelled' && r.cancelReason && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Motivo: {r.cancelReason} · Por: {r.cancelledBy || 'administrador'}</div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <input id={`attended-${r.id}`} type="checkbox" checked={Boolean(r.attended)} onChange={() => onToggleAttended(r)} className="h-4 w-4 rounded border-neutral-300" />
                <label htmlFor={`attended-${r.id}`} className="text-neutral-700 dark:text-neutral-300">Asistió</label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onStartEdit(r)}><Pencil className="h-4 w-4" />Editar</Button>
              {r.status !== 'cancelled' ? (
                <Button variant="danger" size="sm" onClick={() => onCancel(r.id)}><XCircle className="h-4 w-4" />Cancelar</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => onReactivate(r)}><CheckCircle className="h-4 w-4" />Reactivar mesa</Button>
              )}
              <Button variant="danger" size="sm" onClick={() => onDelete(r.id)}><Trash className="h-4 w-4" />Eliminar</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <form onSubmit={onSaveEdit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          {/* Calendario de fecha */}
          <Input type="date" label="Fecha" value={edit.date} min={minDate} max={maxDate} onChange={e => setEdit({ ...edit, date: e.target.value })} />
          {/* Desplegable de horas, con formato y disponibilidad */}
          <Select label="Hora" value={edit.time} onChange={e => setEdit({ ...edit, time: e.target.value })}>
            <option value="" className="text-neutral-900">Selecciona hora</option>
            {restaurantConfig.reservationTimeSlots.map(slot => {
              const g = Number(edit.guests || 0)
              const available = isTimeSlotAvailableAdmin(edit.date, slot, g)
              return (
                <option key={slot} value={slot} disabled={!available} className="text-neutral-900">
                  {formatTimeLabel(language as any, slot)} {!available ? '(No disponible)' : ''}
                </option>
              )
            })}
          </Select>
          {/* Personas */}
          <Input type="number" min={1} label="Personas" value={edit.guests} onChange={e => setEdit({ ...edit, guests: e.target.value })} />
          {/* Mesas */}
          <Select label="Mesa" value={edit.tableId || ''} onChange={e => setEdit({ ...edit, tableId: e.target.value })} disabled={!edit.date || !edit.time || !edit.guests}>
            <option value="" className="text-neutral-900">Selecciona mesa</option>
            {tablesForSelect.map(t => (
              <option key={t.id} value={String(t.id)} disabled={!t.available || !t.meetsCapacity} className="text-neutral-900">
                Mesa {t.number} · Capacidad {t.capacity} {t.available && t.meetsCapacity ? '· Disponible' : '· No disponible'}
              </option>
            ))}
          </Select>
          <Button type="submit">Guardar cambios</Button>
        </form>
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
          <Input label="Motivo de cancelación" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Se aplica al botón Cancelar</div>
        </div>
      </Card>
    </div>
  )
}