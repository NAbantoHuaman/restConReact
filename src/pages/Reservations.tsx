import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Plus, AlertCircle, Ban, Info, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTablesManager } from '../hooks/useTablesManager';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeLabel } from '../utils/dateTime';
import PersonSelector from '../components/PersonSelector';
import ReservationQRCode from '../components/ReservationQRCode';

import { createReservationReceiptHTML, openReceiptInNewTab } from '../utils/receipt';



export default function Reservations() {
  const { 
    tables, 
    reservations, 
    addReservation, 
    removeReservation, 
    cancelReservation,
    refreshReservations,
    getAvailableTablesForDateTime,
  } = useTablesManager();
  const { user } = useAuth();
  
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-PE';
  // Parsear 'YYYY-MM-DD' como fecha local para evitar desfases por UTC
  const parseLocalDate = (iso: string) => {
    const [y, m, d] = (iso || '').split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };
  
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  // Estados no utilizados eliminados: filteredReservations, selectedDate, selectedStatus, searchTerm, showWizard, editingReservation
  const [formData, setFormData] = useState({
    tableId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    guests: '',
    adults: 1,
    children: 0,
    babies: 0,
  });
  const [showQRId, setShowQRId] = useState<number | null>(null);
  const [cancelModal, setCancelModal] = useState<{open: boolean; targetId: number | null; reason: string}>({open: false, targetId: null, reason: ''});
  const [detailsModal, setDetailsModal] = useState<{open: boolean; reservation: any | null}>({open: false, reservation: null});
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      refreshReservations();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshReservations]);

  // Actualizar datos cuando el componente se monta o cuando se enfoca la ventana
  useEffect(() => {
    const handleFocus = () => {
      refreshReservations();
    };

    window.addEventListener('focus', handleFocus);
    
    
    refreshReservations();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshReservations]);



  const createReservation = () => {
    setError('');

    const totalGuests = formData.adults + formData.children + formData.babies;

    if (
      !formData.tableId ||
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.date ||
      !formData.time ||
      totalGuests === 0
    ) {
      setError(t('reservations.errors.allFieldsRequired'));
      return;
    }

    const tableId = parseInt(formData.tableId);
    const table = tables.find((t) => t.id === tableId);

    if (!table) {
      setError(t('reservations.errors.tableNotFound'));
      return;
    }

    if (totalGuests > table.capacity) {
      setError(t('reservations.errors.capacityExceeded', { tableNumber: table.number, capacity: table.capacity }));
      return;
    }

    const success = addReservation({
      tableId: tableId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      date: formData.date,
      time: formData.time,
      guests: totalGuests,
      adults: formData.adults,
      children: formData.children,
      babies: formData.babies,
    });

    if (success) {
      
      refreshReservations();
      closeModal();
    } else {
      setError(t('reservations.errors.alreadyReserved'));
    }
  };

  

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      tableId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      date: '',
      time: '',
      guests: '',
      adults: 1,
      children: 0,
      babies: 0,
    });
    setError('');
  };

  // Función no utilizada eliminada: formatDate

  // Función no utilizada eliminada: isTimeAvailable

  const isTimeSlotAvailable = (date: string, time: string) => {
    return !reservations.some(reservation => 
      reservation.date === date && 
      reservation.time === time && 
      reservation.status === 'confirmed'
    );
  };

  
  const handleViewReceipt = (reservation: any) => {
    const language = localStorage.getItem("language") || "es";
    const labels = {
      title: language === "en" ? "Reservation Receipt" : "Boleta de Reserva",
      date: language === "en" ? "Date" : "Fecha",
      time: language === "en" ? "Time" : "Hora",
      customer: language === "en" ? "Customer" : "Cliente",
      guests: language === "en" ? "Guests" : "Comensales",
      table: language === "en" ? "Table" : "Mesa",
      zone: language === "en" ? "Zone" : "Zona",
      consumption: language === "en" ? "Consumption" : "Consumo",
      phone: language === "en" ? "Phone" : "Teléfono",
      email: language === "en" ? "Email" : "Correo",
      notes: language === "en" ? "Notes" : "Notas",
      location: language === "en" ? "Location" : "Ubicación",
      qr: language === "en" ? "QR Code" : "Código QR",
    };

    const dateStr = reservation.date;
    const timeStr = reservation.time;
    const tableLabel = `${labels.table} ${reservation.tableNumber ?? reservation.table ?? ""}`;
    const zoneLabel = reservation.zone ?? reservation.zoneLabel ?? undefined;
    const consumptionTypeLabel = reservation.consumptionType ?? reservation.consumptionTypeLabel ?? undefined;
    const location = `${t('footer.restaurantName')}, ${t('home.info.address.value')}`;

    
    const qrPayloadObj = {
      id: reservation.id ?? undefined,
      type: "reservation",
      date: dateStr,
      time: timeStr,
      customer: reservation.customerName ?? reservation.name ?? "",
      guests: reservation.guests ?? reservation.numberOfGuests ?? 0,
      table: reservation.tableNumber ?? reservation.table ?? "",
      zone: zoneLabel ?? "",
    };

    // Encode payload in base64 and build a URL to the reservation-view page
    const payloadBase64 = btoa(JSON.stringify(qrPayloadObj));
    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const qrUrl = `${baseUrl}/reservation-view?data=${encodeURIComponent(payloadBase64)}`;

    const html = createReservationReceiptHTML(
      {
        date: dateStr,
        time: timeStr,
        customerName: reservation.customerName ?? reservation.name ?? "",
        guests: reservation.guests ?? reservation.numberOfGuests ?? 0,
        tableLabel,
        zoneLabel,
        consumptionTypeLabel,
        phone: reservation.phone ?? reservation.phoneNumber ?? "",
        email: reservation.email ?? "",
        specialRequests: reservation.specialRequests ?? reservation.notes ?? "",
        location,
        qrUrl,
      },
      labels
    );

    openReceiptInNewTab(html);
  };

  const toggleQRFor = (id: number) => {
    setShowQRId(prev => (prev === id ? null : id));
  };

  const filtered = reservations.filter(r => selectedStatus === 'all' ? true : r.status === selectedStatus);
  const sortedReservations = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateB.getTime() - dateA.getTime();
  });

  const availableTables = formData.date && formData.time 
    ? getAvailableTablesForDateTime(formData.date, formData.time, formData.adults + formData.children + formData.babies)
    : tables;

  // Usar util compartido formatTimeLabel(language, time) importado desde ../utils/dateTime

  return (
    <div className="min-h-screen py-6 sm:py-12 pt-16 sm:pt-20 bg-gradient-to-br from-amber-50 via-orange-50/30 to-neutral-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-block mb-2 sm:mb-4">
            <div className="w-12 sm:w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-2 sm:mb-4"></div>
          </div>
          <h1 className="text-2xl sm:text-5xl font-bold bg-gradient-to-r from-neutral-900 via-amber-800 to-neutral-900 bg-clip-text text-transparent mb-2 sm:mb-4">
            {t('reservations.title')}
          </h1>

          
          {}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mt-4 sm:mt-8">
            <button
              onClick={refreshReservations}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs sm:text-base">{t('reservations.updateButton')}</span>
              </span>
            </button>
            <Link
              to="/reservation-form"
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                <Plus className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-base">{t('reservations.newReservation')}</span>
              </span>
            </Link>
          </div>
        </div>



        {}
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-8 border border-neutral-100">
          <div className="flex items-center mb-4 sm:mb-8">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mr-2 sm:mr-4 shadow-lg">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-neutral-900 via-amber-800 to-neutral-900 bg-clip-text text-transparent">
                {t('reservations.calendar')}
              </h2>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="text-sm text-neutral-700">{language === 'en' ? 'Filter' : 'Filtrar'}</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            >
              <option value="all">{language === 'en' ? 'All' : 'Todas'}</option>
              <option value="confirmed">{language === 'en' ? 'Confirmed' : 'Confirmadas'}</option>
              <option value="cancelled">{language === 'en' ? 'Cancelled' : 'Canceladas'}</option>
            </select>
          </div>

          {sortedReservations.length === 0 ? (
            <div className="text-center py-8 sm:py-16">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-neutral-800 mb-2 sm:mb-4">{t('reservations.noReservations')}</h3>
<p className="text-sm sm:text-lg text-neutral-600 mb-6 sm:mb-8 max-w-md mx-auto">
  {t('reservations.createFirstReservation')}
</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedReservations.map((reservation, index) => (
                <div
                  key={reservation.id}
                  className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-4 sm:p-6 hover:scale-[1.02] transform border ${reservation.status === 'cancelled' ? 'bg-neutral-100 border-neutral-300' : 'bg-white border-neutral-200 hover:border-amber-300'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {reservation.status !== 'cancelled' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 to-orange-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                        {reservation.tableNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-bold text-neutral-900 group-hover:text-amber-800 transition-colors duration-300 truncate">
                          {reservation.customerName}
                        </h3>
                        <p className="text-neutral-600 flex items-center text-sm sm:text-base mt-1">
                          <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                          {reservation.guests} {reservation.guests === 1 ? t('reservations.person') : t('reservations.people')}
                        </p>
                      </div>
                      {reservation.status === 'cancelled' ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-neutral-200 text-neutral-700 flex items-center gap-1">
                            <Ban className="h-3 w-3" /> {language === 'en' ? 'Cancelled' : 'Cancelada'}
                          </span>
                          <button
                            onClick={() => {
                              const ok = window.confirm(language === 'en' ? 'Delete this reservation permanently?' : '¿Eliminar esta reserva permanentemente?');
                              if (!ok) return;
                              removeReservation(reservation.id);
                              if (showQRId === reservation.id) setShowQRId(null);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-lg flex-shrink-0"
                            title={language === 'en' ? 'Delete' : 'Eliminar'}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                          <button
                            onClick={() => setDetailsModal({open: true, reservation})}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all duration-300 border border-neutral-300 hover:border-neutral-400 hover:shadow-lg flex-shrink-0"
                          >
                            <Info className="h-4 w-4 text-neutral-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCancelModal({open: true, targetId: reservation.id, reason: ''})}
                            className="group/btn relative w-8 h-8 sm:w-10 sm:h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-lg flex-shrink-0"
                            title={language === 'en' ? 'Cancel' : 'Cancelar'}
                          >
                            <Ban className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 group-hover/btn:text-red-600 transition-colors duration-300" />
                          </button>
                          <button
                            onClick={() => {
                              const ok = window.confirm(language === 'en' ? 'Delete this reservation permanently?' : '¿Eliminar esta reserva permanentemente?');
                              if (!ok) return;
                              removeReservation(reservation.id);
                              if (showQRId === reservation.id) setShowQRId(null);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-lg flex-shrink-0"
                            title={language === 'en' ? 'Delete' : 'Eliminar'}
                          >
                            <Trash className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-2">
                        <div className="flex items-center text-neutral-600">
                          <Calendar className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                          <span className="hidden sm:inline">
                            {parseLocalDate(reservation.date).toLocaleDateString(locale, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="sm:hidden">
                            {parseLocalDate(reservation.date).toLocaleDateString(locale, {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-neutral-600">
                          <Clock className="h-4 w-4 mr-1 text-amber-500 flex-shrink-0" />
                          <span className="font-medium">{formatTimeLabel(language, reservation.time)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-2">
                        <div className="flex items-center text-neutral-600">
                          <Phone className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                          <span className="hidden sm:inline">{reservation.customerPhone}</span>
                          <span className="sm:hidden">{reservation.customerPhone.slice(-4)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">{t('reservations.table')}</p>
                          <p className="text-lg font-bold text-amber-600">#{reservation.tableNumber}</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
            onClick={() => handleViewReceipt(reservation)}
                          className="px-3 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-xs sm:text-sm"
                        >
            {language === 'en' ? 'View receipt' : 'Ver boleta'}
                        </button>
                        <button
                          onClick={() => toggleQRFor(reservation.id)}
                          className="px-3 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-xs sm:text-sm"
                        >
                          {showQRId === reservation.id ? (language === 'en' ? 'Hide QR' : 'Ocultar QR') : (language === 'en' ? 'Show QR' : 'Ver QR')}
                        </button>
                      </div>
                    </div>

                    {showQRId === reservation.id && (
                      <div className="mt-3">
                        <ReservationQRCode
                          data={{
                            date: reservation.date,
                            time: reservation.time,
                            customerName: reservation.customerName,
                            table: reservation.tableNumber
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t('reservations.newReservation')}</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('reservations.form.date')}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('reservations.form.time')}
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">{t('reservations.form.selectTime')}</option>
                      <option value="12:00" disabled={!isTimeSlotAvailable(formData.date, '12:00')}>
                        {formatTimeLabel(language, '12:00')} {!isTimeSlotAvailable(formData.date, '12:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="12:30" disabled={!isTimeSlotAvailable(formData.date, '12:30')}>
                        {formatTimeLabel(language, '12:30')} {!isTimeSlotAvailable(formData.date, '12:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="13:00" disabled={!isTimeSlotAvailable(formData.date, '13:00')}>
                        {formatTimeLabel(language, '13:00')} {!isTimeSlotAvailable(formData.date, '13:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="13:30" disabled={!isTimeSlotAvailable(formData.date, '13:30')}>
                        {formatTimeLabel(language, '13:30')} {!isTimeSlotAvailable(formData.date, '13:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="14:00" disabled={!isTimeSlotAvailable(formData.date, '14:00')}>
                        {formatTimeLabel(language, '14:00')} {!isTimeSlotAvailable(formData.date, '14:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="14:30" disabled={!isTimeSlotAvailable(formData.date, '14:30')}>
                        {formatTimeLabel(language, '14:30')} {!isTimeSlotAvailable(formData.date, '14:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="19:00" disabled={!isTimeSlotAvailable(formData.date, '19:00')}>
                        {formatTimeLabel(language, '19:00')} {!isTimeSlotAvailable(formData.date, '19:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="19:30" disabled={!isTimeSlotAvailable(formData.date, '19:30')}>
                        {formatTimeLabel(language, '19:30')} {!isTimeSlotAvailable(formData.date, '19:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="20:00" disabled={!isTimeSlotAvailable(formData.date, '20:00')}>
                        {formatTimeLabel(language, '20:00')} {!isTimeSlotAvailable(formData.date, '20:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="20:30" disabled={!isTimeSlotAvailable(formData.date, '20:30')}>
                        {formatTimeLabel(language, '20:30')} {!isTimeSlotAvailable(formData.date, '20:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="21:00" disabled={!isTimeSlotAvailable(formData.date, '21:00')}>
                        {formatTimeLabel(language, '21:00')} {!isTimeSlotAvailable(formData.date, '21:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="21:30" disabled={!isTimeSlotAvailable(formData.date, '21:30')}>
                        {formatTimeLabel(language, '21:30')} {!isTimeSlotAvailable(formData.date, '21:30') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                      <option value="22:00" disabled={!isTimeSlotAvailable(formData.date, '22:00')}>
                        {formatTimeLabel(language, '22:00')} {!isTimeSlotAvailable(formData.date, '22:00') ? `(${t('reservations.form.notAvailable')})` : ''}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('reservations.form.table')}
                    </label>
                    <select
                      value={formData.tableId}
                      onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">{t('reservations.form.selectTable')}</option>
                      {availableTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {t('reservations.form.tableOption', { number: table.number, capacity: table.capacity })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <PersonSelector
                      adults={formData.adults}
                      children={formData.children}
                      babies={formData.babies}
                      onAdultsChange={(count) => setFormData({ ...formData, adults: count })}
                      onChildrenChange={(count) => setFormData({ ...formData, children: count })}
                      onBabiesChange={(count) => setFormData({ ...formData, babies: count })}
                      maxTotal={8}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('reservations.form.customerName')}
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('reservations.form.customerNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('reservations.form.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('reservations.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('reservations.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('reservations.form.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                >
                  {t('reservations.form.cancel')}
                </button>
                <button
                  onClick={createReservation}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  {t('reservations.form.createReservation')}
                </button>
              </div>
            </div>
          </div>
        )}

        {cancelModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold mb-3">{language === 'en' ? 'Cancel reservation' : 'Cancelar reserva'}</h3>
              <p className="text-sm text-neutral-600 mb-3">{language === 'en' ? 'Provide a reason (required)' : 'Ingrese el motivo (obligatorio)'}</p>
              <textarea
                value={cancelModal.reason}
                onChange={e => setCancelModal({...cancelModal, reason: e.target.value})}
                className="w-full border border-neutral-300 rounded-lg p-2 min-h-[100px]"
                placeholder={language === 'en' ? 'Reason...' : 'Motivo...'}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setCancelModal({open: false, targetId: null, reason: ''})}
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700"
                >
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </button>
                <button
                  onClick={() => {
                    if (!cancelModal.targetId) return;
                    const ok = cancelReservation(cancelModal.targetId, cancelModal.reason, 'administrador');
                    if (ok) setCancelModal({open: false, targetId: null, reason: ''});
                  }}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  disabled={!cancelModal.reason.trim()}
                >
                  {language === 'en' ? 'Confirm Cancel' : 'Confirmar cancelación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {detailsModal.open && detailsModal.reservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold mb-3">{language === 'en' ? 'Cancellation details' : 'Detalles de la cancelación'}</h3>
              <div className="space-y-2 text-sm text-neutral-700">
                <p><strong>{language === 'en' ? 'Reason:' : 'Motivo:'}</strong> {detailsModal.reservation.cancelReason || '-'}</p>
                <p><strong>{language === 'en' ? 'By:' : 'Por:'}</strong> {detailsModal.reservation.cancelledBy || 'administrador'}</p>
                <p><strong>{language === 'en' ? 'At:' : 'Fecha/Hora:'}</strong> {detailsModal.reservation.cancelledAt ? new Date(detailsModal.reservation.cancelledAt).toLocaleString(locale) : '-'}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setDetailsModal({open: false, reservation: null})}
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700"
                >
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
