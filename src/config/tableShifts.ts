export type TableShift = 'lunch' | 'dinner' | 'both'

// Configurable turnos por mesa: por defecto "both" si no está listado.
// Puedes ajustar este mapa según tu operación real.
export const TABLE_SHIFTS: Record<number, TableShift> = {
  // Terraza (ejemplo: más diurno)
  5: 'lunch',
  6: 'lunch',
  // Barra (ejemplo: más nocturno)
  3: 'dinner',
  4: 'dinner',
  // Interior / Privado (ambos turnos por defecto)
  1: 'both',
  2: 'both',
  7: 'both',
  8: 'both',
  9: 'both',
  10: 'both',
}

export function getTableShift(tableId: number): TableShift {
  return TABLE_SHIFTS[tableId] || 'both'
}