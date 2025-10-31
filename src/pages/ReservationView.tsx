
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { formatTimeLabel } from '../utils/dateTime';

interface QrPayload {
  type?: string;
  date?: string;
  time?: string;
  customer?: string;
  guests?: number;
  table?: string | number;
  zone?: string;
}

function decodePayload(search: string): QrPayload | null {
  const params = new URLSearchParams(search);
  const raw = params.get('data');
  if (!raw) return null;
  try {
    const decodedBase64 = atob(decodeURIComponent(raw));
    return JSON.parse(decodedBase64);
  } catch (e) {
    try {
      
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
}

export default function ReservationView() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const payload = decodePayload(location.search);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div className="max-w-lg w-full bg-white shadow-sm border border-neutral-200 rounded-xl p-6 text-center">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">{language === 'en' ? 'Invalid QR' : 'QR inválido'}</h1>
          <p className="text-neutral-600 mb-4">{language === 'en' ? 'We could not read reservation details from this QR.' : 'No se pudieron leer los datos de la reserva desde este QR.'}</p>
          <Link to="/reservations" className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg">{t('reservations.title')}</Link>
        </div>
      </div>
    );
  }

  const timeLabel = payload.time ? formatTimeLabel(language as 'en' | 'es', payload.time) : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div className="max-w-2xl w-full bg-white shadow-sm border border-neutral-200 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">{language === 'en' ? 'Reservation Details' : 'Detalle de Reserva'}</h1>
          <div className="text-sm text-neutral-500">{new Date().toLocaleString()}</div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-neutral-600">{t('reservations.date')}</div>
              <div className="text-sm font-semibold text-neutral-900">{payload.date || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600">{t('reservations.time')}</div>
              <div className="text-sm font-semibold text-neutral-900">{timeLabel || payload.time || '-'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-neutral-600">{language === 'en' ? 'Customer' : 'Cliente'}</div>
              <div className="text-sm font-semibold text-neutral-900">{payload.customer || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600">{language === 'en' ? 'Guests' : 'Comensales'}</div>
              <div className="text-sm font-semibold text-neutral-900">{payload.guests ?? '-'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-600">{t('reservations.table')}</div>
              <div className="text-sm font-semibold text-neutral-900">{payload.table ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600">{t('reservations.zone')}</div>
              <div className="text-sm font-semibold text-neutral-900">{payload.zone ?? '-'}</div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Link to="/reservations" className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-lg border border-neutral-200">
              {t('reservations.title')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}