import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useTablesManager } from '../hooks/useTablesManager';
import { RESTAURANT_ZONES, CONSUMPTION_TYPES } from '../config/restaurantConfig';
import { useLanguage } from '../contexts/LanguageContext';
import { formatTimeLabel } from '../utils/dateTime';
// Crea una fecha local a partir de 'YYYY-MM-DD' para evitar desfases por zona horaria
const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

interface WizardProps {
  onClose: () => void;
  onComplete: (reservationData: any) => void;
}

interface ReservationData {
  adults: number;
  children: number;
  babies: number;
  date: string;
  time: string;
  tableId: string;
  zone?: string;
  table?: string;
  consumptionType?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
  acceptTerms?: boolean;
}


interface StepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
}

export default function ReservationWizard({ onClose, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({
    adults: 1,
    children: 0,
    babies: 0,
    date: '',
    time: '',
    tableId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const { 
    tables,
    getAvailableTablesForZone,
    isTableAvailableForDateTime,
    addReservation,
  } = useTablesManager();
  const { t } = useLanguage();

  const updateReservationData = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  // Pasos localizados para el encabezado del wizard
  const LOCALIZED_STEPS = [
    { id: 1, title: t('reservations.choosePeopleTitle'), icon: Users },
    { id: 2, title: t('reservations.selectDateTitle'), icon: Calendar },
    { id: 3, title: t('reservations.selectTimeTitle'), icon: Clock },
    { id: 4, title: t('reservations.chooseZoneTypeTitle'), icon: MapPin },
    { id: 5, title: t('reservations.yourDetailsTitle'), icon: User },
  ];

  const nextStep = () => {
    if (currentStep < LOCALIZED_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return reservationData.adults > 0;
      case 2:
        return reservationData.date !== '';
      case 3:
        return reservationData.time !== '';
      case 4:
        return reservationData.zone !== '' && reservationData.table !== '' && reservationData.consumptionType !== '';
      case 5:
          return reservationData.customerName !== '' && 
                 reservationData.customerEmail !== '' && 
                 reservationData.customerPhone !== '' &&
                 (reservationData.acceptTerms || false);
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 1:
        return reservationData.adults === 0 ? t('reservations.errors.mustSelectAdults') : '';
      case 2:
        return reservationData.date === '' ? t('reservations.errors.mustSelectDate') : '';
      case 3:
        return reservationData.time === '' ? t('reservations.errors.mustSelectTime') : '';
      case 4:
        if (reservationData.zone === '') return t('reservations.errors.mustSelectZone');
        if (reservationData.table === '') return t('reservations.errors.mustSelectTable');
        if (reservationData.consumptionType === '') return t('reservations.errors.mustSelectConsumptionType');
        return '';
      case 5:
        if (reservationData.customerName === '') return t('reservations.errors.customerNameRequired');
        if (reservationData.customerEmail === '') return t('reservations.errors.customerEmailRequired');
        if (reservationData.customerPhone === '') return t('reservations.errors.customerPhoneRequired');
        if (!reservationData.acceptTerms) return t('reservations.errors.acceptTermsRequired');
        return '';
      default:
        return '';
    }
  };

  const handleComplete = async () => {
    try {
      const totalGuests = reservationData.adults + reservationData.children + reservationData.babies;
      
      const reservationToAdd = {
        id: Date.now(),
        tableId: parseInt(reservationData.tableId),
        customerName: reservationData.customerName,
        customerEmail: reservationData.customerEmail,
        customerPhone: reservationData.customerPhone,
        date: reservationData.date,
        time: reservationData.time,
        guests: totalGuests,
        status: 'confirmed' as const,
        specialRequests: reservationData.specialRequests || '',
        zone: reservationData.zone || '',
        table: reservationData.table || '',
        consumptionType: reservationData.consumptionType || ''
      };

      await addReservation(reservationToAdd);
      onComplete(reservationData);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl shadow-2xl max-h-[95vh] flex flex-col mx-2 sm:mx-4">
        {/* Header con progreso */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">{t('reservations.newReservation')}</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {}
          <div className="flex items-center space-x-2">
            {LOCALIZED_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : isCompleted 
                        ? 'bg-white bg-opacity-10 text-white' 
                        : 'text-white text-opacity-60'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < LOCALIZED_STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-2 text-white text-opacity-60" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-[500px]">
            {currentStep === 1 && (
              <StepPersonas 
                data={reservationData} 
                onUpdate={updateReservationData} 
              />
            )}
            {currentStep === 2 && (
              <StepFecha 
                data={reservationData} 
                onUpdate={updateReservationData} 
              />
            )}
            {currentStep === 3 && (
              <StepHora 
                data={reservationData} 
                onUpdate={updateReservationData}
                tables={tables}
                isTableAvailableForDateTime={isTableAvailableForDateTime}
              />
            )}
            {currentStep === 4 && (
              <StepZona 
                data={reservationData} 
                onUpdate={updateReservationData}
                getAvailableTablesForZone={getAvailableTablesForZone}
                isTableAvailableForDateTime={isTableAvailableForDateTime}
              />
            )}
            {currentStep === 5 && (
              <StepDatos 
                data={reservationData} 
                onUpdate={updateReservationData} 
              />
            )}
          </div>
        </div>

        {}
        <div className="flex justify-between items-center p-4 sm:p-6 border-t border-neutral-200 flex-shrink-0 bg-white">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('reservations.prev')}</span>
          </button>

          {}
          <div className="flex-1 text-center px-4">
            {!canProceed() && (
              <p className="text-red-600 text-xs sm:text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-2 sm:px-4 py-2 inline-block">
                {getValidationMessage()}
              </p>
            )}
          </div>

          <div className="text-xs sm:text-sm text-neutral-500">
            {t('reservations.stepCounter', { current: currentStep, total: LOCALIZED_STEPS.length })}
          </div>

          {currentStep < LOCALIZED_STEPS.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                canProceed()
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="sm:hidden">Sig.</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className={`px-4 sm:px-8 py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                canProceed()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Confirmar Reserva</span>
              <span className="sm:hidden">Confirmar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



const StepPersonas: React.FC<StepProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const maxGuests = 10;
  const totalGuests = (data.adults || 0) + (data.children || 0) + (data.babies || 0);

  const updateCount = (type: 'adults' | 'children' | 'babies', increment: boolean) => {
    const currentValue = data[type] || 0;
    let newValue = increment ? currentValue + 1 : currentValue - 1;
    
    if (type === 'adults' && newValue < 1) newValue = 1;
    if (newValue < 0) newValue = 0;
    
    const totalGuests = (type === 'adults' ? newValue : data.adults) + 
                       (type === 'children' ? newValue : data.children) + 
                       (type === 'babies' ? newValue : data.babies);
    
    if (totalGuests > 10) return;
    
    onUpdate({ [type]: newValue });
  };

  const PersonCounter = ({ 
    title, 
    subtitle, 
    count, 
    type 
  }: { 
    title: string; 
    subtitle: string; 
    count: number; 
    type: 'adults' | 'children' | 'babies' 
  }) => (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h4 className="text-lg font-semibold text-neutral-900">{title}</h4>
          <p className="text-sm text-neutral-600">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => updateCount(type, false)}
            disabled={(type === 'adults' && count <= 1) || count <= 0}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
              (type === 'adults' && count <= 1) || count <= 0
                ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
            }`}
          >
            −
          </button>
          <span className="text-xl font-bold text-neutral-900 w-8 text-center">{count}</span>
          <button
            onClick={() => updateCount(type, true)}
            disabled={totalGuests >= maxGuests}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
              totalGuests >= maxGuests
                ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
            }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.choosePeopleTitle')}</h3>
        <p className="text-neutral-600">{t('reservations.childrenNote')}</p>
      </div>

      <div className="space-y-4 mb-8">
        <PersonCounter
          title={t('reservations.adults')}
          subtitle={t('reservations.adultsSubtitle')}
          count={data.adults}
          type="adults"
        />
        <PersonCounter
          title={t('reservations.children')}
          subtitle={t('reservations.childrenSubtitle')}
          count={data.children}
          type="children"
        />
        <PersonCounter
          title={t('reservations.babies')}
          subtitle={t('reservations.babiesSubtitle')}
          count={data.babies}
          type="babies"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-amber-800">
          <span className="font-semibold">{t('reservations.totalPeople', { count: totalGuests })}</span>
          {totalGuests >= maxGuests && (
            <span className="block text-sm mt-1">{t('reservations.maxPeoplePerReservation', { max: maxGuests })}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function StepFecha({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2); 
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-ES';

  const generateAvailableDates = () => {
    const dates = [];
    const current = new Date(today);
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isAvailable = dayOfWeek !== 1;
      
      if (isAvailable) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        dates.push({
          date: `${y}-${m}-${d}`,
          dayName: date.toLocaleDateString(locale, { weekday: 'long' }),
          dayNumber: date.getDate(),
          monthName: date.toLocaleDateString(locale, { month: 'long' }),
          isToday: date.toDateString() === today.toDateString(),
          isTomorrow: date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()
        });
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  const formatDateDisplay = (dateInfo: any) => {
    if (dateInfo.isToday) return t('reservations.today');
    if (dateInfo.isTomorrow) return t('reservations.tomorrow');
    return `${dateInfo.dayName.charAt(0).toUpperCase() + dateInfo.dayName.slice(1)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.selectDateTitle')}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {availableDates.map((dateInfo) => (
          <button
            key={dateInfo.date}
            onClick={() => onUpdate({ date: dateInfo.date })}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              data.date === dateInfo.date
                ? 'border-amber-600 bg-amber-50 text-amber-900'
                : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300'
            }`}
          >
            <div className="text-center">
              <div className={`text-sm font-medium mb-1 ${
                data.date === dateInfo.date ? 'text-amber-700' : 'text-neutral-600'
              }`}>
                {formatDateDisplay(dateInfo)}
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                data.date === dateInfo.date ? 'text-amber-900' : 'text-neutral-900'
              }`}>
                {dateInfo.dayNumber}
              </div>
              <div className={`text-xs ${
                data.date === dateInfo.date ? 'text-amber-700' : 'text-neutral-500'
              }`}>
                {dateInfo.monthName}
              </div>
            </div>
          </button>
        ))}
      </div>

      {data.date && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-amber-800">
            <span className="font-semibold">{t('reservations.selectedDate')}: </span>
            {parseLocalDate(data.date).toLocaleDateString(locale, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}

function StepHora({ 
  data, 
  onUpdate, 
  tables, 
  isTableAvailableForDateTime 
}: { 
  data: ReservationData; 
  onUpdate: (data: Partial<ReservationData>) => void;
  tables: any[];
  isTableAvailableForDateTime: (tableId: number, date: string, time: string) => boolean;
}) {
  const { t, language } = useLanguage();
  const timeSlots = [
    { time: '12:00', label: formatTimeLabel(language, '12:00'), period: 'lunch' },
    { time: '12:30', label: formatTimeLabel(language, '12:30'), period: 'lunch' },
    { time: '13:00', label: formatTimeLabel(language, '13:00'), period: 'lunch' },
    { time: '13:30', label: formatTimeLabel(language, '13:30'), period: 'lunch' },
    { time: '14:00', label: formatTimeLabel(language, '14:00'), period: 'lunch' },
    { time: '14:30', label: formatTimeLabel(language, '14:30'), period: 'lunch' },
    { time: '15:00', label: formatTimeLabel(language, '15:00'), period: 'lunch' },
    { time: '15:30', label: formatTimeLabel(language, '15:30'), period: 'lunch' },
    { time: '19:00', label: formatTimeLabel(language, '19:00'), period: 'dinner' },
    { time: '19:30', label: formatTimeLabel(language, '19:30'), period: 'dinner' },
    { time: '20:00', label: formatTimeLabel(language, '20:00'), period: 'dinner' },
    { time: '20:30', label: formatTimeLabel(language, '20:30'), period: 'dinner' },
    { time: '21:00', label: formatTimeLabel(language, '21:00'), period: 'dinner' },
    { time: '21:30', label: formatTimeLabel(language, '21:30'), period: 'dinner' },
    { time: '22:00', label: formatTimeLabel(language, '22:00'), period: 'dinner' },
    { time: '22:30', label: formatTimeLabel(language, '22:30'), period: 'dinner' },
  ];

  const isTimeAvailable = (time: string) => {
    if (!data.date) return true;
    
    return tables.some(table => 
      isTableAvailableForDateTime(table.id, data.date, time)
    );
  };

  const lunchSlots = timeSlots.filter(slot => slot.period === 'lunch');
  const dinnerSlots = timeSlots.filter(slot => slot.period === 'dinner');

  const TimeSlotButton = ({ slot }: { slot: any }) => {
    const isAvailable = isTimeAvailable(slot.time);
    const isSelected = data.time === slot.time;

    return (
      <button
        onClick={() => isAvailable && onUpdate({ time: slot.time })}
        disabled={!isAvailable}
        className={`p-4 rounded-xl border-2 transition-all ${
          !isAvailable
            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
            : isSelected
              ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-md'
              : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300 hover:shadow-md'
        }`}
      >
        <div className="text-center">
          <div className={`text-lg font-bold mb-1 ${
            !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-900' : 'text-neutral-900'
          }`}>
            {slot.label}
          </div>
          {!isAvailable && (
            <div className="text-xs text-red-500">{t('reservations.notAvailable')}</div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.selectTimeTitle')}</h3>
        <p className="text-neutral-600">{t('reservations.selectTimeSubtitle')}</p>
      </div>

      <div className="space-y-8">
        {}
        <div>
          <h4 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            {t('reservations.lunch')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {lunchSlots.map((slot) => (
              <TimeSlotButton key={slot.time} slot={slot} />
            ))}
          </div>
        </div>

        {}
        <div>
          <h4 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
            {t('reservations.dinner')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {dinnerSlots.map((slot) => (
              <TimeSlotButton key={slot.time} slot={slot} />
            ))}
          </div>
        </div>
      </div>

      {data.time && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-amber-800">
            <span className="font-semibold">{t('reservations.selectedTime')}: </span>
            {timeSlots.find(slot => slot.time === data.time)?.label} - {' '}
            {(timeSlots.find(slot => slot.time === data.time)?.period === 'lunch') ? t('reservations.lunch') : t('reservations.dinner')}
          </p>
        </div>
      )}
    </div>
  );
}

function StepZona({ 
  data, 
  onUpdate, 
  getAvailableTablesForZone, 
  isTableAvailableForDateTime 
}: { 
  data: ReservationData; 
  onUpdate: (data: Partial<ReservationData>) => void;
  getAvailableTablesForZone: (zone: string, guestCount: number, selectedDate: string, selectedTime: string) => any[];
  isTableAvailableForDateTime: (tableId: number, date: string, time: string) => boolean;
}) {
  const { t } = useLanguage();
  const totalGuests = (data.adults || 1) + (data.children || 0) + (data.babies || 0);
  const selectedZone = RESTAURANT_ZONES.find(zone => zone.id === data.zone);
  
  const availableTables = getAvailableTablesForZone(
    data.zone || '',
    totalGuests,
    data.date || '',
    data.time || ''
  );

  // Obtener número real de mesa para el resumen
  const { tables, getTableIdFromWizardId, getWizardIdFromTableId } = useTablesManager();

  // Verificar disponibilidad usando el ID real de mesa
  const isTableAvailableByRealId = (wizardId: string) => {
    if (!data.date || !data.time) return true;
    const realId = getTableIdFromWizardId(wizardId);
    return realId ? isTableAvailableForDateTime(Number(realId), data.date, data.time) : true;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.chooseZoneTypeTitle')}</h3>
        <p className="text-neutral-600">{t('reservations.chooseZoneTypeSubtitle')}</p>
      </div>

      <div className="space-y-8">
        {}
        <div>
          <h4 className="text-xl font-semibold text-neutral-900 mb-4">{t('reservations.restaurantZone')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESTAURANT_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => onUpdate({ zone: zone.id, table: '' })}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  data.zone === zone.id
                    ? 'border-amber-600 bg-amber-50 shadow-md'
                    : 'border-neutral-200 bg-white hover:border-amber-300 hover:shadow-md'
                }`}
              >
                {(() => {
                  const zoneEmoji = (id: string) => id === 'terraza' ? '🌿' : id === 'interior' ? '🏠' : id === 'privado' ? '🔒' : '🍸';
                  return <div className="text-3xl mb-3">{zoneEmoji(zone.id)}</div>;
                })()}
                <h5 className={`text-lg font-bold mb-2 ${
                  data.zone === zone.id ? 'text-amber-900' : 'text-neutral-900'
                }`}>
                  {t(`reservations.zones.${zone.id}.name`)}
                </h5>
                <p className={`text-sm ${
                  data.zone === zone.id ? 'text-amber-700' : 'text-neutral-600'
                }`}>
                  {t(`reservations.zones.${zone.id}.description`)}
                </p>
                <div className={`text-xs mt-2 ${
                  data.zone === zone.id ? 'text-amber-600' : 'text-neutral-500'
                }`}>
                  {getAvailableTablesForZone(zone.id, totalGuests, data.date || '', data.time || '').length} {t('reservations.tablesAvailable')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {}
        {data.zone && (
          <div>
            <h4 className="text-xl font-semibold text-neutral-900 mb-4">
              {t('reservations.availableTablesIn')} {selectedZone ? t(`reservations.zones.${selectedZone.id}.name`) : ''}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTables.map((table) => {
                const wizardId = getWizardIdFromTableId(table.id) || String(table.id);
                const isAvailable = data.date && data.time
                  ? isTableAvailableByRealId(wizardId)
                  : table.status === 'available';
                const isSelected = data.table === wizardId;
                
                return (
                  <button
                    key={table.id}
                    onClick={() => isAvailable && onUpdate({ table: wizardId, tableId: String(table.id) })}
                    disabled={!isAvailable}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !isAvailable
                        ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : isSelected
                          ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-md'
                          : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`font-bold mb-1 ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-900' : 'text-neutral-900'
                      }`}>
                        {t('reservations.table')} {table.number}
                      </div>
                      <div className={`text-xs mb-1 ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-700' : 'text-neutral-600'
                      }`}>
                        {t(`reservations.zones.${table.location}.name`)}
                      </div>
                      <div className={`text-xs ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-600' : 'text-neutral-500'
                      }`}>
                        {t('reservations.capacityUpTo', { count: table.capacity })}
                      </div>
                      {!isAvailable && (
                        <div className="text-xs text-red-500 mt-1">{t('reservations.occupied')}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {availableTables.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                {t('reservations.noTablesAvailableZone', { count: totalGuests })}
                <br />
                {t('reservations.selectAnotherZone')}
              </div>
            )}
          </div>
        )}

        {}
        <div>
          <h4 className="text-xl font-semibold text-neutral-900 mb-4">{t('reservations.consumptionTypeTitle')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONSUMPTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => onUpdate({ consumptionType: type.id })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  data.consumptionType === type.id
                    ? 'border-amber-600 bg-amber-50 shadow-md'
                    : 'border-neutral-200 bg-white hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <h5 className={`font-bold mb-1 ${
                  data.consumptionType === type.id ? 'text-amber-900' : 'text-neutral-900'
                }`}>
                  {t(`reservations.consumptionTypes.${type.id}.name`)}
                </h5>
                <p className={`text-xs ${
                  data.consumptionType === type.id ? 'text-amber-700' : 'text-neutral-600'
                }`}>
                  {t(`reservations.consumptionTypes.${type.id}.description`)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {}
      {(data.zone || data.consumptionType) && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h5 className="font-semibold text-amber-900 mb-2">{t('reservations.currentSelection')}</h5>
          <div className="text-amber-800 space-y-1">
            {data.zone && (
              <p><span className="font-medium">{t('reservations.zone')}:</span> {selectedZone ? t(`reservations.zones.${selectedZone.id}.name`) : ''}</p>
            )}
            {data.table && (() => {
              const selId = getTableIdFromWizardId(String(data.table));
              const selTable = selId ? tables.find(t => t.id === selId) : undefined;
              return (
                <p><span className="font-medium">{t('reservations.table')}:</span> {selTable ? `${selTable.number}` : String(data.table)}</p>
              );
            })()}
            {data.consumptionType && (
              <p><span className="font-medium">{t('reservations.consumptionType')}:</span> {data.consumptionType ? t(`reservations.consumptionTypes.${data.consumptionType}.name`) : ''}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepDatos({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-PE';
  const { tables, getTableIdFromWizardId } = useTablesManager();

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'customerName':
        if (!value.trim()) {
          newErrors.customerName = t('reservations.errors.customerNameRequired');
        } else if (value.trim().length < 2) {
          newErrors.customerName = t('reservations.errors.customerNameMinLength');
        } else {
          delete newErrors.customerName;
        }
        break;
      case 'customerEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.customerEmail = t('reservations.errors.customerEmailRequired');
        } else if (!emailRegex.test(value)) {
          newErrors.customerEmail = t('reservations.errors.invalidEmail');
        } else {
          delete newErrors.customerEmail;
        }
        break;
      case 'customerPhone':
        if (!value.trim()) {
          newErrors.customerPhone = t('reservations.errors.customerPhoneRequired');
        } else if (value.trim().length < 8) {
          newErrors.customerPhone = t('reservations.errors.phoneMinLength');
        } else {
          delete newErrors.customerPhone;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
    validateField(field, value);
  };

  const totalGuests = (data.adults || 1) + (data.children || 0) + (data.babies || 0);

  const selectedRealId = data.table ? getTableIdFromWizardId(String(data.table)) : null;
  const selectedRealNumber = selectedRealId ? tables.find(t => t.id === selectedRealId)?.number : undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.yourDetailsTitle')}</h3>
        <p className="text-neutral-600">{t('reservations.yourDetailsSubtitle')}</p>
      </div>

      {}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <h4 className="text-lg font-semibold text-amber-900 mb-4">{t('reservations.reservationSummaryTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.people')}:</span> {totalGuests} 
              {data.adults && ` (${data.adults} ${t('reservations.adults').toLowerCase()}`}
              {data.children && data.children > 0 && `, ${data.children} ${t('reservations.children').toLowerCase()}`}
              {data.babies && data.babies > 0 && `, ${data.babies} ${t('reservations.babies').toLowerCase()}`}
              {data.adults && ')'}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.date')}:</span> {data.date ? new Intl.DateTimeFormat(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(parseLocalDate(data.date)) : t('reservations.notSelected')}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.time')}:</span> {data.time ? formatTimeLabel(language, data.time) : t('reservations.notSelected')}
            </p>
          </div>
          <div>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.zone')}:</span> {data.zone ? t(`reservations.zones.${data.zone}.name`) : t('reservations.notSelected')}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.table')}:</span> {selectedRealNumber ?? t('reservations.notSelected')}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.type')}:</span> {data.consumptionType ? t(`reservations.consumptionTypes.${data.consumptionType}.name`) : t('reservations.notSelected')}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.customerName')}
          </label>
          <input
            type="text"
            id="customerName"
            value={data.customerName || ''}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
              errors.customerName ? 'border-red-500 bg-red-50' : 'border-neutral-300'
            }`}
            placeholder={t('reservations.form.customerNamePlaceholder')}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.email')}
          </label>
          <input
            type="email"
            id="customerEmail"
            value={data.customerEmail || ''}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
              errors.customerEmail ? 'border-red-500 bg-red-50' : 'border-neutral-300'
            }`}
            placeholder={t('reservations.form.emailPlaceholder')}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.phone')}
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={data.customerPhone || ''}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
              errors.customerPhone ? 'border-red-500 bg-red-50' : 'border-neutral-300'
            }`}
            placeholder={t('reservations.form.phonePlaceholder')}
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.specialRequestsLabel')}
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            value={data.specialRequests || ''}
            onChange={(e) => onUpdate({ specialRequests: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors border-neutral-300"
            placeholder={t('reservations.form.specialRequestsPlaceholder')}
          />
        </div>

        {}
        <div className="flex items-start space-x-3">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={data.acceptTerms || false}
            onChange={(e) => onUpdate({ acceptTerms: e.target.checked })}
            className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-neutral-700">
            {t('reservations.errors.acceptTermsStart')}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              {t('footer.termsOfService')}
            </a>
            {t('reservations.errors.acceptTermsAnd')}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              {t('footer.privacyPolicy')}
            </a>
            *
          </label>
        </div>

        {}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t('reservations.infoImportantTitle')}</p>
              <ul className="space-y-1 text-xs">
                <li>• {t('reservations.infoImportantBullets.bullet1')}</li>
                <li>• {t('reservations.infoImportantBullets.bullet2')}</li>
                <li>• {t('reservations.infoImportantBullets.bullet3')}</li>
                <li>• {t('reservations.infoImportantBullets.bullet4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}