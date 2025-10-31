


export interface ReservationForICS {
  date: string; 
  time: string; 
  durationMinutes?: number; 
  customerName?: string;
  tableNumber?: string | number;
  zoneName?: string;
  title?: string; 
  description?: string; 
  location?: string; 
}

function pad(n: number): string { return n < 10 ? `0${n}` : String(n); }

function toICSDateTimeLocal(date: Date): string {
  
  return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function createReservationICS(res: ReservationForICS): string {
  const duration = res.durationMinutes ?? 120;
  
  
  const [year, month, day] = new Date(res.date).toISOString().slice(0,10).split('-').map(Number);
  const [hhStr, mmStr] = (res.time || '20:00').split(':');
  const hh = Number(hhStr || 20);
  const mm = Number(mmStr || 0);
  const start = new Date(year, (month-1), day, hh, mm, 0);
  const end = new Date(start.getTime() + duration * 60_000);

  const dtstamp = toICSDateTimeLocal(new Date());
  const dtstart = toICSDateTimeLocal(start);
  const dtend = toICSDateTimeLocal(end);

  const title = res.title || 'Reserva';
  const parts: string[] = [];
  if (res.customerName) parts.push(`Cliente: ${res.customerName}`);
  if (res.tableNumber) parts.push(`Mesa: ${res.tableNumber}`);
  if (res.zoneName) parts.push(`Zona: ${res.zoneName}`);
  const baseDesc = parts.join(' | ');
  const description = [baseDesc, res.description].filter(Boolean).join(' | ');
  const location = res.location || '';

  const uid = `res-${year}${pad(month)}${pad(day)}-${pad(hh)}${pad(mm)}-${Math.random().toString(36).slice(2,10)}@restaurante.local`;

  // Build ICS content
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Restaurante//Reservas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : 'DESCRIPTION:Reserva',
    location ? `LOCATION:${escapeICS(location)}` : 'LOCATION:Restaurante',
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ];

  return lines.join('\r\n');
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}