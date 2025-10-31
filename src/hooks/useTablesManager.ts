import { useState, useEffect, useCallback } from 'react';

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  location: 'interior' | 'barra' | 'terraza' | 'privado';
}

export interface Reservation {
  id: number;
  tableId: number;
  tableNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; 
  time: string; 
  guests: number;
  adults: number;
  children: number;
  babies: number;
  status: 'confirmed';
  zone?: string;
  table?: string; 
  consumptionType?: string;
  specialRequests?: string;
}

const INITIAL_TABLES: Table[] = [
  { id: 1, number: 1, capacity: 2, status: 'available', location: 'interior' },
  { id: 2, number: 2, capacity: 4, status: 'available', location: 'interior' },
  { id: 3, number: 3, capacity: 6, status: 'available', location: 'barra' },
  { id: 4, number: 4, capacity: 2, status: 'available', location: 'barra' },
  { id: 5, number: 5, capacity: 4, status: 'available', location: 'terraza' },
  { id: 6, number: 6, capacity: 6, status: 'available', location: 'terraza' },
  { id: 7, number: 7, capacity: 8, status: 'available', location: 'interior' },
  { id: 8, number: 8, capacity: 2, status: 'available', location: 'interior' },
  { id: 9, number: 9, capacity: 4, status: 'available', location: 'privado' },
  { id: 10, number: 10, capacity: 6, status: 'available', location: 'privado' }
];

const ZONE_TO_LOCATION_MAP: Record<string, Table['location']> = {
  terraza: 'terraza',
  interior: 'interior',
  privado: 'privado',
  barra: 'barra',
};

const WIZARD_TABLE_TO_REAL_TABLE: Record<string, number> = {
  T1: 5,
  T2: 6,
  I1: 1,
  I2: 2,
  I3: 7,
  I4: 8,
  P1: 9,
  P2: 10,
  PT1: 3, 
  PT2: 4, 
  B1: 3,
  B2: 4,
};


const REAL_TO_WIZARD_TABLE: Record<number, string> = Object.entries(WIZARD_TABLE_TO_REAL_TABLE).reduce(
  (acc, [wizId, realId]) => {
    acc[realId] = wizId;
    return acc;
  },
  {} as Record<number, string>
);

const STORAGE = {
  tables: 'tables',
  reservations: 'reservations',
};

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function initializeTables(): Table[] {
  const stored = localStorage.getItem(STORAGE.tables);
  const tablesRaw = stored ? safeParse<Table[]>(stored, INITIAL_TABLES) : INITIAL_TABLES;
  
  const tables = tablesRaw.map<Table>((t) => ((t as any).location === 'patio' ? { ...t, location: 'barra' } : t));
  localStorage.setItem(STORAGE.tables, JSON.stringify(tables));
  return tables;
}

function getStoredReservations(): Reservation[] {
  return safeParse<Reservation[]>(localStorage.getItem(STORAGE.reservations), []);
}

function minutesBetween(dateA: Date, dateB: Date) {
  return Math.abs(dateA.getTime() - dateB.getTime()) / (1000 * 60);
}

export function useTablesManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const updateTablesStatus = useCallback((baseTables: Table[], currentReservations: Reservation[]): Table[] => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); 
    const currentTimeStr = now.toTimeString().slice(0, 5); 

    return baseTables.map((table) => {
      const tableReservations = currentReservations.filter((r) => r.tableId === table.id);

      const hasCurrentReservation = tableReservations.some((r) => {
        if (r.date !== todayStr) return false;
        const resDateTime = new Date(`${r.date}T${r.time}`);
        const diff = minutesBetween(resDateTime, now);
        return diff >= 0 && diff <= 120; 
      });

      const hasUpcomingTodayOrFuture = tableReservations.some((r) => {
        if (r.date === todayStr) {
          return r.time >= currentTimeStr; 
        }
        return r.date > todayStr; 
      });

      if (hasCurrentReservation) return { ...table, status: 'occupied' };
      if (hasUpcomingTodayOrFuture) return { ...table, status: 'reserved' };
      return { ...table, status: 'available' };
    });
  }, []);

  const loadTablesAndReservations = useCallback(() => {
    const loadedReservations = getStoredReservations();
    const baseTables = initializeTables();
    const updatedTables = updateTablesStatus(baseTables, loadedReservations);

    setReservations(loadedReservations);
    setTables(updatedTables);
  }, [updateTablesStatus]);

  useEffect(() => {
    loadTablesAndReservations();
  }, [loadTablesAndReservations]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE.tables) {
        setTables(initializeTables());
      }
      if (e.key === STORAGE.reservations) {
        setReservations(getStoredReservations());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isTableAvailableForDateTime = useCallback(
    (tableId: number, date: string, time: string): boolean => {
      const tableReservations = reservations.filter((r) => r.tableId === tableId);
      return !tableReservations.some((r) => {
        if (r.date !== date) return false;
        const resDateTime = new Date(`${date}T${r.time}`);
        const requested = new Date(`${date}T${time}`);
        return minutesBetween(resDateTime, requested) < 120; 
      });
    },
    [reservations]
  );

  const getAvailableTablesForZone = useCallback(
    (zone: string, guestCount: number, selectedDate: string, selectedTime: string): Table[] => {
      const location = ZONE_TO_LOCATION_MAP[zone];
      if (!location) return [];
      return tables.filter((table) => {
        if (table.location !== location) return false;
        if (table.capacity < guestCount) return false;
        if (selectedDate && selectedTime) {
          return isTableAvailableForDateTime(table.id, selectedDate, selectedTime);
        }
        return table.status === 'available';
      });
    },
    [tables, isTableAvailableForDateTime]
  );

  const getAvailableTablesForDateTime = useCallback(
    (date: string, time: string, guestCount: number): Table[] => {
      return tables.filter((table) => {
        if (table.capacity < guestCount) return false;
        return isTableAvailableForDateTime(table.id, date, time);
      });
    },
    [tables, isTableAvailableForDateTime]
  );

  const getTableIdFromWizardId = useCallback((wizardTableId: string): number | null => {
    return WIZARD_TABLE_TO_REAL_TABLE[wizardTableId] ?? null;
  }, []);

  const getWizardIdFromTableId = useCallback((tableId: number): string | null => {
    return REAL_TO_WIZARD_TABLE[tableId] ?? null;
  }, []);

  const addReservation = useCallback(
    (reservationData: any) => {
      
      let tableId: number | null = null;
      if (reservationData.tableId !== undefined && reservationData.tableId !== null) {
        const raw = reservationData.tableId as any;
        const num = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
        tableId = Number.isNaN(num) ? null : num;
      }

      if (!tableId && reservationData.table) {
        tableId = getTableIdFromWizardId(String(reservationData.table));
      }
      if (!tableId) {
        console.error('No se pudo encontrar la mesa:', reservationData.table || reservationData.tableId);
        return false;
      }
      
      const baseTables = tables.length ? tables : INITIAL_TABLES;
      const table = baseTables.find((t) => t.id === tableId);
      if (!table) {
        console.error('Mesa no encontrada:', tableId);
        return false;
      }

      const totalGuests =
        reservationData.guests ??
        (Number(reservationData.adults || 0) + Number(reservationData.children || 0) + Number(reservationData.babies || 0));

      const newReservation: Reservation = {
        id: Date.now(),
        tableId,
        tableNumber: table.number,
        customerName: String(reservationData.customerName || ''),
        customerEmail: String(reservationData.customerEmail || ''),
        customerPhone: String(reservationData.customerPhone || ''),
        date: String(reservationData.date || ''),
        time: String(reservationData.time || ''),
        guests: totalGuests,
        adults: Number(reservationData.adults || 0),
        children: Number(reservationData.children || 0),
        babies: Number(reservationData.babies || 0),
        status: 'confirmed',
        zone: reservationData.zone,
        table: reservationData.table,
        consumptionType: reservationData.consumptionType,
        specialRequests: reservationData.specialRequests,
      };

      const updatedReservations = [...reservations, newReservation];
      setReservations(updatedReservations);

      const updatedTables = updateTablesStatus(INITIAL_TABLES, updatedReservations);
      setTables(updatedTables);

      localStorage.setItem(STORAGE.reservations, JSON.stringify(updatedReservations));
      localStorage.setItem(STORAGE.tables, JSON.stringify(updatedTables));

      window.dispatchEvent(
        new CustomEvent('reservationUpdated', {
          detail: { reservations: updatedReservations, tables: updatedTables },
        })
      );

      return true;
    },
    [tables, reservations, updateTablesStatus, getTableIdFromWizardId]
  );

  const removeReservation = useCallback(
    (reservationId: number) => {
      const updatedReservations = reservations.filter((r) => r.id !== reservationId);
      setReservations(updatedReservations);

      const updatedTables = updateTablesStatus(INITIAL_TABLES, updatedReservations);
      setTables(updatedTables);

      localStorage.setItem(STORAGE.reservations, JSON.stringify(updatedReservations));
      localStorage.setItem(STORAGE.tables, JSON.stringify(updatedTables));
    },
    [reservations, updateTablesStatus]
  );

  const refreshData = useCallback(() => {
    loadTablesAndReservations();
  }, [loadTablesAndReservations]);

  return {
    tables,
    reservations,
    getAvailableTablesForZone,
    getAvailableTablesForDateTime,
    isTableAvailableForDateTime,
    getTableIdFromWizardId,
    getWizardIdFromTableId,
    addReservation,
    removeReservation,
    refreshReservations: refreshData,
  };
}