import { FormEvent, useState } from 'react'
import { AdminSettings, getSettings, updateSettings } from '../../services/adminDb'
import { Clock, CalendarDays, CheckCircle } from 'lucide-react'
import Card from '../../components/admin/ui/Card'
import Button from '../../components/admin/ui/Button'
import Input from '../../components/admin/ui/Input'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(getSettings())
  const [day, setDay] = useState('')
  const [open, setOpen] = useState('')
  const [close, setClose] = useState('')
  const [spDate, setSpDate] = useState('')
  const [spNote, setSpNote] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const addHours = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const hhmm = /^\d{2}:\d{2}$/
    const d = day.trim()
    const o = open.trim()
    const c = close.trim()
    if (!d || !o || !c) {
      setError('Día, apertura y cierre son obligatorios')
      return
    }
    if (!hhmm.test(o) || !hhmm.test(c)) {
      setError('Usa formato de hora HH:MM en apertura y cierre')
      return
    }
    const toMin = (s: string) => {
      const [h, m] = s.split(':').map(Number)
      return h * 60 + m
    }
    if (toMin(o) >= toMin(c)) {
      setError('La hora de apertura debe ser menor que la de cierre')
      return
    }
    const next = { operatingHours: [...settings.operatingHours, { day: d, open: o, close: c }], specialDays: settings.specialDays }
    const saved = updateSettings(next)
    setSettings(saved)
    setDay('')
    setOpen('')
    setClose('')
    setNotice('Horario agregado')
    setTimeout(() => setNotice(''), 2000)
  }
  const addSpecial = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const iso = /^\d{4}-\d{2}-\d{2}$/
    const d = spDate.trim()
    const n = spNote.trim()
    if (!d) {
      setError('Fecha es obligatoria')
      return
    }
    if (!iso.test(d)) {
      setError('Usa formato de fecha YYYY-MM-DD')
      return
    }
    const next = { operatingHours: settings.operatingHours, specialDays: [...settings.specialDays, { date: d, note: n }] }
    const saved = updateSettings(next)
    setSettings(saved)
    setSpDate('')
    setSpNote('')
    setNotice('Día especial agregado')
    setTimeout(() => setNotice(''), 2000)
  }
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
      {error && <div role="alert" className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-600 dark:text-red-200 text-sm">{error}</div>}
      {notice && <div role="status" className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-200 text-sm inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" />{notice}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <form onSubmit={addHours} className="grid gap-3">
            <div className="font-semibold inline-flex items-center gap-2"><Clock className="h-4 w-4 text-accent-600 dark:text-accent-400" />Horarios</div>
            <Input label="Día" value={day} onChange={e => setDay(e.target.value)} />
            <Input label="Apertura (HH:MM)" value={open} onChange={e => setOpen(e.target.value)} />
            <Input label="Cierre (HH:MM)" value={close} onChange={e => setClose(e.target.value)} />
            <Button type="submit">Agregar</Button>
            <div className="grid gap-2">
              {settings.operatingHours.map((h, i) => (<div key={i} className="text-sm text-neutral-600 dark:text-neutral-300">{h.day} · {h.open}-{h.close}</div>))}
            </div>
          </form>
        </Card>
        <Card className="p-4">
          <form onSubmit={addSpecial} className="grid gap-3">
            <div className="font-semibold inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent-600 dark:text-accent-400" />Días especiales</div>
            <Input label="Fecha (YYYY-MM-DD)" value={spDate} onChange={e => setSpDate(e.target.value)} />
            <Input label="Nota" value={spNote} onChange={e => setSpNote(e.target.value)} />
            <Button type="submit">Agregar</Button>
            <div className="grid gap-2">
              {settings.specialDays.map((d, i) => (<div key={i} className="text-sm text-neutral-600 dark:text-neutral-300">{d.date} · {d.note || ''}</div>))}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}