type ID = string | number

export type MenuItem = {
  id: ID
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
}

export type AdminSettings = {
  operatingHours: { day: string; open: string; close: string }[]
  specialDays: { date: string; note?: string }[]
}

export type ActivityLog = {
  id: ID
  at: number
  type: string
  payload?: any
}

const KEYS = {
  menu: 'admin_menu_items',
  settings: 'admin_settings',
  logs: 'admin_activity_logs',
  cancelled: 'admin_reservations_cancelled'
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function listMenuItems(): MenuItem[] {
  return read<MenuItem[]>(KEYS.menu, [])
}

export function createMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
  const items = listMenuItems()
  const id = Date.now()
  const next = { ...item, id }
  write(KEYS.menu, [next, ...items])
  appendLog('menu_create', next)
  return next
}

export function updateMenuItem(id: ID, patch: Partial<MenuItem>): MenuItem | null {
  const items = listMenuItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null
  const updated = { ...items[idx], ...patch }
  const next = [...items]
  next[idx] = updated
  write(KEYS.menu, next)
  appendLog('menu_update', { id, patch })
  return updated
}

export function deleteMenuItem(id: ID): boolean {
  const items = listMenuItems()
  const next = items.filter(i => i.id !== id)
  write(KEYS.menu, next)
  appendLog('menu_delete', { id })
  return next.length !== items.length
}

export function listCategories(): string[] {
  const items = listMenuItems()
  const set = new Set(items.map(i => i.category).filter(Boolean))
  return Array.from(set)
}

export type ReservationCancelRecord = { id: ID; reason: string; at: number; snapshot: any }

export function listReservations(): any[] {
  try {
    const raw = localStorage.getItem('reservations')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function updateReservation(id: ID, patch: any): any | null {
  const all = listReservations()
  const idx = all.findIndex(r => String(r.id) === String(id))
  if (idx === -1) return null
  const updated = { ...all[idx], ...patch }
  const next = [...all]
  next[idx] = updated
  localStorage.setItem('reservations', JSON.stringify(next))
  appendLog('reservation_update', { id, patch })
  return updated
}

export function cancelReservation(id: ID, reason: string): boolean {
  const all = listReservations()
  const idx = all.findIndex(r => String(r.id) === String(id))
  if (idx === -1) return false
  const snapshot = all[idx]
  const next = all.filter(r => String(r.id) !== String(id))
  localStorage.setItem('reservations', JSON.stringify(next))
  const record: ReservationCancelRecord = { id, reason, at: Date.now(), snapshot }
  const hist = read<ReservationCancelRecord[]>(KEYS.cancelled, [])
  write(KEYS.cancelled, [record, ...hist])
  appendLog('reservation_cancel', { id, reason })
  return true
}

export function listCancelledReservations(): ReservationCancelRecord[] {
  return read<ReservationCancelRecord[]>(KEYS.cancelled, [])
}

export function getSettings(): AdminSettings {
  return read<AdminSettings>(KEYS.settings, { operatingHours: [], specialDays: [] })
}

export function updateSettings(patch: Partial<AdminSettings>): AdminSettings {
  const cur = getSettings()
  const next = { ...cur, ...patch }
  write(KEYS.settings, next)
  appendLog('settings_update', patch)
  return next
}

export function appendLog(type: string, payload?: any) {
  const logs = read<ActivityLog[]>(KEYS.logs, [])
  const next: ActivityLog = { id: Date.now(), at: Date.now(), type, payload }
  write(KEYS.logs, [next, ...logs])
}

export function listLogs(): ActivityLog[] {
  return read<ActivityLog[]>(KEYS.logs, [])
}

export function exportBackup(): string {
  const data = {
    menu: listMenuItems(),
    reservations: listReservations(),
    cancelled: listCancelledReservations(),
    settings: getSettings(),
    logs: listLogs()
  }
  return JSON.stringify(data)
}