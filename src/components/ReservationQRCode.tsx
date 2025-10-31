import { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { formatTimeLabel } from '../utils/dateTime';
import { useLanguage } from '../contexts/LanguageContext';

export interface ReservationQRData {
  date: string;
  time: string;
  customerName?: string;
  table?: string | number;
  zone?: string;
}


function buildQRPayload(data: ReservationQRData, localeLabel: string) {
  return {
    type: 'reservation',
    date: data.date,
    time: data.time,
    timeLabel: localeLabel,
    customerName: data.customerName || '',
    table: data.table || '',
    zone: data.zone || ''
  };
}

export default function ReservationQRCode({ data }: { data: ReservationQRData }) {
  const { language } = useLanguage();
  const timeLabel = useMemo(() => formatTimeLabel(language, data.time), [language, data.time]);
  const value = useMemo(() => JSON.stringify(buildQRPayload(data, timeLabel)), [data, timeLabel]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-md shadow-sm">
        <QRCode value={value} size={128} />
      </div>
      <p className="text-xs text-neutral-500">QR incluye fecha, hora, cliente, mesa y zona</p>
    </div>
  );
}