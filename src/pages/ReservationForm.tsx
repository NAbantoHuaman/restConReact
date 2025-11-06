import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Check, ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react';
import { useTablesManager } from '../hooks/useTablesManager';
import { RESTAURANT_ZONES, restaurantConfig } from '../config/restaurantConfig';
import { getMenuItemByKey } from '../config/menuData';
import { useLanguage } from '../contexts/LanguageContext';
import { formatTimeLabel } from '../utils/dateTime';


import { createReservationReceiptHTML, openReceiptInNewTab } from '../utils/receipt';

interface ReservationData {
  adults: number;
  children: number;
  babies: number;
  date: string;
  time: string;
  zone: string;
  table: string;
  tableId?: string;
  consumptionType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  acceptTerms: boolean;
}



export default function ReservationForm() {
  const navigate = useNavigate();
  const { addReservation, tables, getTableIdFromWizardId } = useTablesManager();
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-PE';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [reservationData, setReservationData] = useState<ReservationData>({
    adults: 0,
    children: 0,
    babies: 0,
    date: '',
    time: '',
    zone: '',
    table: '',
    consumptionType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: '',
    acceptTerms: false
  });

  // Localizar títulos de pasos con i18n
  const LOCALIZED_STEPS = [
    { id: 'personas', title: t('reservations.choosePeopleTitle') },
    { id: 'fecha', title: t('reservations.selectDateTitle') },
    { id: 'zona', title: t('reservations.chooseZoneTypeTitle') },
    { id: 'datos', title: t('reservations.yourDetailsTitle') }
  ];

  
  const getStepSubtitle = (id: string) => {
    switch (id) {
      case 'personas':
        return t('reservations.childrenNote');
      case 'fecha':
        return t('reservations.selectDateSubtitle');
      case 'zona':
        return t('reservations.chooseZoneTypeSubtitle');
      case 'datos':
        return t('reservations.yourDetailsSubtitle');
      default:
        return '';
    }
  };
  const nextStep = () => {
    if (currentStep < LOCALIZED_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateReservationData = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  // ICS deprecated: se usa boleta HTML
  const handleViewReceipt = () => {
    const labels = {
      title: language === 'en' ? 'Reservation Receipt' : 'Boleta de Reserva',
      date: language === 'en' ? 'Date' : 'Fecha',
      time: language === 'en' ? 'Time' : 'Hora',
      customer: language === 'en' ? 'Customer' : 'Cliente',
      guests: language === 'en' ? 'Guests' : 'Comensales',
      table: language === 'en' ? 'Table' : 'Mesa',
      zone: language === 'en' ? 'Zone' : 'Zona',
      consumption: language === 'en' ? 'Consumption' : 'Consumo',
      phone: language === 'en' ? 'Phone' : 'Teléfono',
      email: language === 'en' ? 'Email' : 'Correo',
      notes: language === 'en' ? 'Notes' : 'Notas',
      location: language === 'en' ? 'Location' : 'Ubicación',
      qr: language === 'en' ? 'QR Code' : 'Código QR',
    };

    const dateStr = reservationData.date;
    const timeStr = reservationData.time;
    const guests = (reservationData.adults || 0) + (reservationData.children || 0) + (reservationData.babies || 0);

    const realId = reservationData.table ? getTableIdFromWizardId(String(reservationData.table)) : null;
    const selectedTable = realId ? tables.find(t => t.id === realId) : undefined;
    const tableLabelFromSelection = selectedTable ? String(selectedTable.number) : reservationData.table;
    const tableLabel = `${labels.table} ${tableLabelFromSelection ?? ''}`;

    const zoneName = reservationData.zone ? t(`reservations.zones.${reservationData.zone}.name`) : undefined;
    const consumptionTypeLabel = reservationData.consumptionType ? t(`reservations.consumptionTypes.${reservationData.consumptionType}.name`) : undefined;
    const location = `${t('footer.restaurantName')}, ${t('home.info.address.value')}`;

    const qrPayloadObj = {
      type: 'reservation',
      date: dateStr,
      time: timeStr,
      customer: reservationData.customerName,
      guests,
      table: tableLabelFromSelection ?? '',
      zone: zoneName ?? '',
    };

    const payloadBase64 = btoa(JSON.stringify(qrPayloadObj));
    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const qrUrl = `${baseUrl}/reservation-view?data=${encodeURIComponent(payloadBase64)}`;

    const html = createReservationReceiptHTML(
      {
        date: dateStr,
        time: timeStr,
        customerName: reservationData.customerName,
        guests,
        tableLabel,
        zoneLabel: zoneName,
        consumptionTypeLabel,
        phone: reservationData.customerPhone,
        email: reservationData.customerEmail,
        specialRequests: reservationData.specialRequests ?? '',
        location,
        qrUrl,
      },
      labels
    );

    openReceiptInNewTab(html);
  };
  const canProceed = () => {
    switch (LOCALIZED_STEPS[currentStep].id) {
      case 'personas':
        return reservationData.adults > 0;
      case 'fecha':
        return reservationData.date !== '' && reservationData.time !== '';
      case 'zona':
        return reservationData.zone !== '' && reservationData.table !== '';
      case 'datos':
        return reservationData.customerName !== '' && 
               reservationData.customerEmail !== '' && 
               reservationData.customerPhone !== '' &&
               reservationData.acceptTerms;
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (LOCALIZED_STEPS[currentStep].id) {
      case 'personas':
        return reservationData.adults === 0 ? t('reservations.errors.mustSelectAdults') : '';
      case 'fecha':
        if (reservationData.date === '') return t('reservations.errors.mustSelectDate');
        if (reservationData.time === '') return t('reservations.errors.mustSelectTime');
        return '';
      case 'zona':
        if (reservationData.zone === '') return t('reservations.errors.mustSelectZone');
        if (reservationData.table === '') return t('reservations.errors.mustSelectTable');
        return '';
      case 'datos':
        if (reservationData.customerName === '') return t('reservations.errors.customerNameRequired');
        if (reservationData.customerEmail === '') return t('reservations.errors.customerEmailRequired');
        if (reservationData.customerPhone === '') return t('reservations.errors.customerPhoneRequired');
        if (!reservationData.acceptTerms) return t('reservations.errors.acceptTermsRequired');
        return '';
      default:
        return '';
    }
  };

  const handleComplete = () => {
    if (canProceed()) {
      if (reservationData.date && reservationData.time && reservationData.zone && 
          reservationData.table && reservationData.customerName && 
          reservationData.customerEmail && reservationData.customerPhone && 
          reservationData.acceptTerms) {
        
        setIsSubmitting(true);
        
        try {
          const guests = (reservationData.adults || 0) + (reservationData.children || 0) + (reservationData.babies || 0);
          const ok = addReservation({
            ...reservationData,
            guests,
          });
          
          if (!ok) {
            setIsSubmitting(false);
            return;
          }
          
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/reservations');
          }, 2000);
        } catch (error) {
          console.error('Error al crear la reserva:', error);
          setIsSubmitting(false);
        }
      }
    }
  };

  const renderStepContent = () => {
    switch (LOCALIZED_STEPS[currentStep].id) {
      case 'personas':
        return <StepPersonas data={reservationData} onUpdate={updateReservationData} />;
      case 'fecha':
        return <StepFecha data={reservationData} onUpdate={updateReservationData} />;
      case 'zona':
        return <StepZona data={reservationData} onUpdate={updateReservationData} />;
      case 'datos':
        return <StepDatos data={reservationData} onUpdate={updateReservationData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-8">
          <Link 
            to="/reservations" 
            className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4"
          >
            ← {t('nav.reservations')}
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">{t('reservations.newReservation')}</h1>
        </div>

        {}
        <div className="max-w-4xl mx-auto mb-8">
          {}
          <div className="hidden md:flex items-center justify-between">
            {LOCALIZED_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="text-sm font-medium text-neutral-900">
                  {step.title}
                </div>
                <div className="text-xs text-neutral-500 ml-2">
                  {getStepSubtitle(step.id)}
                </div>
                {index < LOCALIZED_STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-amber-600' : 'bg-neutral-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {}
          <div className="md:hidden">
            {}
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-neutral-900 mb-1">
                {LOCALIZED_STEPS[currentStep]?.title}
              </div>
              <div className="text-sm text-neutral-600">
                Paso {currentStep + 1} de {LOCALIZED_STEPS.length}
              </div>
            </div>

            {}
            <div className="flex items-center justify-center space-x-3 mb-4">
              {LOCALIZED_STEPS.map((step, index) => (
                <Fragment key={step.id}>
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    index < currentStep 
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : index === currentStep
                        ? 'bg-amber-50 border-amber-600 text-amber-600'
                        : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                  }`}>
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  {index < LOCALIZED_STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      index < currentStep ? 'bg-amber-600' : 'bg-neutral-300'
                    }`} />
                  )}
                </Fragment>
              ))}
            </div>

            {}
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / LOCALIZED_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {}
        <div className="max-w-6xl mx-auto">
          {}
          {!canProceed() && (
            <div className="mb-4 text-center">
              <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-3 inline-block max-w-full">
                {getValidationMessage()}
              </p>
            </div>
          )}
          
          {}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className={`min-h-[48px] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                currentStep === 0 || isSubmitting
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-600 text-white hover:bg-neutral-700 active:bg-neutral-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('reservations.prev')}
            </button>
            
            {currentStep === LOCALIZED_STEPS.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isSubmitting || !canProceed()}
                className={`min-h-[48px] px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isSubmitting || !canProceed()
                    ? 'bg-neutral-400 text-white cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('reservations.processing')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('reservations.form.createReservation')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={isSubmitting || !canProceed()}
                className={`min-h-[48px] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isSubmitting || !canProceed()
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
                }`}
              >
                {t('reservations.next')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>

        {}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('reservations.successModal.title')}</h3>
              <p className="text-neutral-600 mb-4">
                {t('reservations.successModal.message')}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-green-900 mb-2">{t('reservations.successModal.detailsTitle')}</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><span className="font-medium">{t('reservations.date')}:</span>{' '}
                    {reservationData.date
                      ? new Date(reservationData.date).toLocaleDateString(locale, {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : t('reservations.notSelected')}
                  </p>
                  <p><span className="font-medium">{t('reservations.time')}:</span>{' '}
                    {reservationData.time
                      ? formatTimeLabel(language, reservationData.time)
                      : t('reservations.notSelected')}
                  </p>
                  <p><span className="font-medium">{t('reservations.people')}:</span> {reservationData.adults + reservationData.children + reservationData.babies}</p>
                  <p><span className="font-medium">{t('reservations.table')}:</span>{' '}
                    {(() => {
                      const realId = getTableIdFromWizardId(String(reservationData.table));
                      const selTable = realId ? tables.find(t => t.id === realId) : undefined;
                      return selTable ? `${selTable.number}` : reservationData.table;
                    })()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-center">
                  <button onClick={handleViewReceipt} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    {language === 'en' ? 'View receipt' : 'Ver boleta'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                {t('reservations.successModal.redirecting')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function StepPersonas({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const { t } = useLanguage();
  const updateGuests = (type: 'adults' | 'children' | 'babies', increment: boolean) => {
    const currentValue = data[type] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    onUpdate({ [type]: newValue });
  };

  const PersonCounter = ({ 
    title, 
    description, 
    count, 
    onIncrement, 
    onDecrement, 
    minValue = 0 
  }: {
    title: string;
    description: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    minValue?: number;
  }) => (
    <div className="group flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center space-x-3 flex-1">
        <div>
          <h4 className="text-base font-semibold text-neutral-900">{title}</h4>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onDecrement}
          disabled={count <= minValue}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all font-bold text-lg ${
            count <= minValue
              ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
              : 'border-amber-300 text-amber-700 bg-white hover:bg-amber-50 hover:border-amber-400 active:bg-amber-100'
          }`}
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="min-w-[48px] text-center font-bold text-lg text-neutral-900 px-2">{count}</span>
        <button
          onClick={onIncrement}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border-2 border-amber-300 text-amber-700 bg-white hover:bg-amber-50 hover:border-amber-400 active:bg-amber-100 flex items-center justify-center transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const totalGuests = (data.adults || 0) + (data.children || 0) + (data.babies || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('reservations.choosePeopleTitle')}</h3>
        <p className="text-sm text-neutral-600">{t('reservations.childrenNote')}</p>
      </div>

      <div className="space-y-3 mb-6">
        <PersonCounter
          title={t('reservations.adults')}
          description={t('reservations.adultsSubtitle')}
          count={data.adults || 0}
          onIncrement={() => updateGuests('adults', true)}
          onDecrement={() => updateGuests('adults', false)}
          minValue={0}
        />
        
        <PersonCounter
          title={t('reservations.children')}
          description={t('reservations.childrenSubtitle')}
          count={data.children || 0}
          onIncrement={() => updateGuests('children', true)}
          onDecrement={() => updateGuests('children', false)}
        />
        
        <PersonCounter
          title={t('reservations.babies')}
          description={t('reservations.babiesSubtitle')}
          count={data.babies || 0}
          onIncrement={() => updateGuests('babies', true)}
          onDecrement={() => updateGuests('babies', false)}
        />
      </div>

      {}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
        <p className="text-amber-800">
          <span className="font-semibold">{t('reservations.totalPeople', {count: totalGuests})}</span>
        </p>
        {totalGuests > 8 && (
          <p className="text-sm text-amber-700 mt-2">
            {t('reservations.contactLargeGroups')}
          </p>
        )}
      </div>
    </div>
  );
}

function StepFecha({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const { t, language } = useLanguage();
  const { tables, isTableAvailableForDateTime } = useTablesManager();
  const locale = language === 'en' ? 'en-US' : 'es-PE';

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  

  

  

  
  
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const base = data.date ? new Date(data.date) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [isTransitioningMonth, setIsTransitioningMonth] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<{x: number; y: number} | null>(null);
  const maxAdvanceDays = 60; 
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'almuerzo' | 'cena'>('almuerzo');
  const [selectedDishKey, setSelectedDishKey] = useState<string>('');

  const getMonthLabel = (date: Date) =>
    date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  
  const getWeekdayNames = () => {
    const base = new Date(2021, 0, 4); 
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  };

  const getMonthDays = (monthDate: Date): (Date | null)[] => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    
    const firstDayIndex = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const goToPrevMonth = () => {
    setSlideDirection('right');
    setIsTransitioningMonth(true);
    setTimeout(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
      setIsTransitioningMonth(false);
      setSlideDirection(null);
    }, 150);
  };
  const goToNextMonth = () => {
    setSlideDirection('left');
    setIsTransitioningMonth(true);
    setTimeout(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
      setIsTransitioningMonth(false);
      setSlideDirection(null);
    }, 150);
  };
  
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const threshold = 40; 
    const verticalLimit = 30; 
    if (Math.abs(dx) > threshold && Math.abs(dy) < verticalLimit) {
      if (dx < 0) {
        goToNextMonth();
      } else {
        goToPrevMonth();
      }
    }
    setTouchStart(null);
  };

  
  const parseTime = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const lunchStart = parseTime(restaurantConfig.businessHours.lunch.start);
  const lunchEnd = parseTime(restaurantConfig.businessHours.lunch.end);
  const dinnerStart = parseTime(restaurantConfig.businessHours.dinner.start);
  const dinnerEnd = parseTime(restaurantConfig.businessHours.dinner.end);

  const lunchSlots = restaurantConfig.reservationTimeSlots.filter(ts => {
    const t = parseTime(ts);
    return t >= lunchStart && t <= lunchEnd;
  });
  const dinnerSlots = restaurantConfig.reservationTimeSlots.filter(ts => {
    const t = parseTime(ts);
    return t >= dinnerStart && t <= dinnerEnd;
  });

  const hasLunchAvailability = lunchSlots.length > 0;
  const hasDinnerAvailability = dinnerSlots.length > 0;

  const isDisabledDay = (day: Date) => {
    const today = new Date();
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((dayStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
    const outOfRange = diffDays < 0 || diffDays > maxAdvanceDays;
    const noAvailability = !hasLunchAvailability && !hasDinnerAvailability;
    return outOfRange || noAvailability;
  };
  
  const timeSlots = {
    lunch: [
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
    ],
    dinner: [
      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
    ]
  };

  const isTimeAvailable = (time: string) => {
    if (!data.date) return true;
    const availableTablesForTime = tables.filter(table => 
      isTableAvailableForDateTime(table.id, data.date!, time)
    );
    return availableTablesForTime.length > 0;
  };

  const assignConsumptionTypeForTime = (time: string) => {
    const type = timeSlots.lunch.includes(time) ? 'almuerzo' : 'cena';
    onUpdate({ consumptionType: type });
  };

  const TimeSlotButton = ({ time, available }: { time: string; available: boolean }) => {
    const isSelected = data.time === time;
    return (
      <button
        onClick={() => {
          if (!available) return;
          onUpdate({ time });
          assignConsumptionTypeForTime(time);
        }}
        disabled={!available}
        className={`p-3 rounded-lg border-2 transition-all text-center ${
          !available
            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
            : isSelected
              ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-md'
              : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300 hover:shadow-md'
        }`}
      >
        <div className={`font-semibold ${
          !available ? 'text-neutral-400' : isSelected ? 'text-amber-900' : 'text-neutral-900'
        }`}>
          {formatTimeLabel(language, time)}
        </div>
        {!available && (
          <div className="text-xs text-red-500 mt-1">{t('reservations.form.notAvailable')}</div>
        )}
      </button>
    );
  };

  const PLACEHOLDER_IMG = 'https://via.placeholder.com/320x200?text=Plato';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">{t('reservations.selectDateTitle')}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <div>
          <div
            className="bg-white rounded-2xl shadow-md border border-neutral-200 p-4"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {}
            <div className="flex items-center justify-between mb-3">
              <div className="text-neutral-900 font-bold text-lg capitalize">
                {getMonthLabel(currentMonth)}
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={goToPrevMonth} aria-label="Prev" className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={goToNextMonth} aria-label="Next" className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {}
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-neutral-500 mb-2">
              {getWeekdayNames().map((wn, idx) => (
                <div key={idx} className="py-1">{wn}</div>
              ))}
            </div>

            {}
            <div className={`grid grid-cols-7 gap-2 transition-all duration-300 ${
              isTransitioningMonth
                ? `opacity-0 ${slideDirection === 'left' ? '-translate-x-4' : 'translate-x-4'}`
                : 'opacity-100 translate-x-0'
            }`}>
              {getMonthDays(currentMonth).map((day, idx) => {
                if (!day) return <div key={idx} className="h-9 sm:h-10" />;
                const dayStr = formatDate(day);
                const isSelected = data.date === dayStr;
                const today = new Date();
                const isTodayCell = day.toDateString() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString();
                const disabled = isDisabledDay(day);
                return (
                  <button
                    key={dayStr}
                    onClick={() => {
                      if (disabled) return;
                      onUpdate({ date: dayStr, time: '' });
                      setSelectedPeriod(hasLunchAvailability ? 'almuerzo' : 'cena');
                      setShowTimeModal(true);
                    }}
                    disabled={disabled}
                    className={`h-9 sm:h-10 w-full rounded-xl text-sm flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300 hover:bg-amber-50'
                    } ${isTodayCell && !isSelected ? 'ring-1 ring-amber-300' : ''} ${disabled ? 'opacity-40 cursor-not-allowed hover:border-neutral-200 hover:bg-white' : ''}`}
                    aria-label={day.toLocaleDateString(locale)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold leading-4">{day.getDate()}</span>
                      {}
                      <div className="flex space-x-1 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasLunchAvailability ? 'bg-amber-500' : 'bg-neutral-300'}`} aria-hidden="true" />
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasDinnerAvailability ? 'bg-amber-500' : 'bg-neutral-300'}`} aria-hidden="true" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {false && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-amber-800 text-sm">
                <span className="font-semibold">{t('reservations.selectedDate')}: </span>
                {new Date(data.date).toLocaleDateString(locale, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {}
        <div>
          {(() => {
            const fieldsComplete = Boolean(data.date && data.time && data.consumptionType);
            const missing: string[] = [];
            if (!data.date) missing.push(t('reservations.form.date'));
            if (!data.time) missing.push(t('reservations.form.time'));
            if (!data.consumptionType) missing.push(t('reservations.consumptionType'));
            const consumptionLabel = data.consumptionType === 'almuerzo' ? t('reservations.lunch') : data.consumptionType === 'cena' ? t('reservations.dinner') : '';

            if (!fieldsComplete) {
              return (
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">{t('reservations.currentSelection')}</h4>
                  {missing.length > 0 && (
                    <div className="text-sm text-neutral-700">
                      {missing.length === 1 && !data.time ? (
                        <span className="font-semibold">{t('reservations.form.timeNotSelected')}</span>
                      ) : (
                        <>
                          <span className="font-semibold">{t('reservations.form.notSelected')}:</span>{' '}
                          {missing.join(', ')}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <h4 className="text-lg font-bold text-neutral-900 mb-4">{t('reservations.currentSelection')}</h4>

                {}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{t('reservations.form.date')}</div>
                  <div className="mt-1 text-lg font-bold text-amber-900">
                    {new Date(data.date!).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{t('reservations.consumptionType')}</div>
                  <div className="mt-1 inline-flex items-center px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                    {consumptionLabel}
                  </div>
                </div>

                {}
                <div>
                  <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{t('reservations.form.time')}</div>
                  <div className="mt-1 text-lg font-bold text-amber-900">
                    {formatTimeLabel(language, data.time!)}
                  </div>
                </div>

                {}
              </div>
            );
          })()}

          {}
          {(() => {
            const fieldsComplete = Boolean(data.date && data.time && data.consumptionType);
            if (!fieldsComplete) return null;

            
            const lunchKeys: string[] = ['ceviche', 'caesar', 'limonada'];
            const dinnerKeys: string[] = ['salmon', 'ossobuco', 'tiramisu'];

            const isLunch = data.consumptionType === 'almuerzo';
            const itemKeys = (isLunch ? lunchKeys : dinnerKeys).slice(0, 3);
            const accent = isLunch ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-purple-50 text-purple-900 border-purple-200';
            const priceAccent = isLunch ? 'text-blue-700' : 'text-purple-700';
            const scheduleRange = isLunch
              ? `${formatTimeLabel(language, timeSlots.lunch[0])} – ${formatTimeLabel(language, timeSlots.lunch[timeSlots.lunch.length - 1])}`
              : `${formatTimeLabel(language, timeSlots.dinner[0])} – ${formatTimeLabel(language, timeSlots.dinner[timeSlots.dinner.length - 1])}`;

            return (
              <div className="mt-4">
                {}
                <div className={`inline-flex items-center px-3 py-1 rounded-xl border ${accent} text-xs font-semibold mb-2`}>⏰ {scheduleRange}</div>

                {}
                <div className="hidden md:grid grid-cols-3 gap-3">
                  {itemKeys.map((key) => {
                    const m = getMenuItemByKey(key) || undefined;
                    const src = m?.image || PLACEHOLDER_IMG;
                    const price = m?.price ?? '';
                    const alt = t(`menu.items.${key}.name`);
                    return (
                      <div key={key} className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
                        <div className="card-media">
                          <img
                            src={src}
                            alt={alt}
                            className="card-img"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                          />
                        </div>
                        <div className="card-body-compact">
                          <div className="flex items-center justify-between">
                            <div className="text-sm sm:text-base font-semibold text-neutral-900 truncate">{alt}</div>
                            <div className={`text-xs sm:text-sm font-bold ${priceAccent}`}>{price ? `S/${price}` : ''}</div>
                          </div>
                          <div className="mt-1 text-xs sm:text-sm text-neutral-600 line-clamp-2">{t(`menu.items.${key}.description`)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Móvil: fila horizontal con scroll */}
                <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory">
                  <div className="flex space-x-3">
                    {itemKeys.map((key) => {
                      const m = getMenuItemByKey(key) || undefined;
                      const src = m?.image || PLACEHOLDER_IMG;
                      const price = m?.price ?? '';
                      const alt = t(`menu.items.${key}.name`);
                      return (
                        <div key={key} className="snap-start min-w-[12rem] bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
                          <div className="card-media">
                            <img
                              src={src}
                              alt={alt}
                              className="card-img"
                              loading="lazy"
                              decoding="async"
                              sizes="(max-width: 640px) 80vw, 60vw"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                            />
                          </div>
                          <div className="card-body-compact">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-neutral-900 truncate">{alt}</div>
                              <div className={`text-xs font-bold ${priceAccent}`}>{price ? `S/${price}` : ''}</div>
                            </div>
                            <div className="mt-1 text-[11px] text-neutral-600 line-clamp-2">{t(`menu.items.${key}.description`)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      {/* Modal de selección de hora y platos */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTimeModal(false)}
          />
          {/* Contenido modal */}
          <div className="relative w-full sm:max-w-3xl mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 p-4 sm:p-6 transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-neutral-900 font-bold text-lg">
                {t('reservations.selectedDate')}: {data.date ? new Date(data.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs de periodo */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setSelectedPeriod('almuerzo')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${selectedPeriod==='almuerzo' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-neutral-200 bg-white text-neutral-700 hover:border-amber-300'}`}
              >🍽️ {t('reservations.lunch')}</button>
              <button
                onClick={() => setSelectedPeriod('cena')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${selectedPeriod==='cena' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-neutral-200 bg-white text-neutral-700 hover:border-amber-300'}`}
              >🌙 {t('reservations.dinner')}</button>
            </div>

            {}
            <div className="mb-5">
              <h5 className="text-sm font-semibold text-neutral-800 mb-2">{t('reservations.form.time')}</h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(selectedPeriod==='almuerzo' ? timeSlots.lunch : timeSlots.dinner).map((time) => (
                  <TimeSlotButton key={time} time={time} available={isTimeAvailable(time)} />
                ))}
              </div>
            </div>

            {}
            <div>
              <h5 className="text-sm font-semibold text-neutral-800 mb-2">{t('menu.title')}</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(selectedPeriod==='almuerzo' ? ['carpaccio','ceviche','lomo'] : ['salmon','ossobuco','tiramisu']).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDishKey(key);
                      const name = t(`menu.items.${key}.name`);
                      const current = data.specialRequests || '';
                      const note = `[Dish: ${name}]`;
                      const next = current.includes('[Dish:') ? current.replace(/\[Dish:[^\]]*\]/, note) : (current ? `${current} ${note}` : note);
                      onUpdate({ specialRequests: next });
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${selectedDishKey===key ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 bg-white hover:border-amber-300'}`}
                  >
                    <div className="text-sm font-semibold text-neutral-900">{t(`menu.items.${key}.name`)}</div>
                    <div className="text-xs text-neutral-600 line-clamp-2">{t(`menu.items.${key}.description`)}</div>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >{t('reservations.prev')}</button>
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
              >{t('reservations.next')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



function StepZona({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const { tables, getAvailableTablesForZone, isTableAvailableForDateTime, getWizardIdFromTableId, getTableIdFromWizardId } = useTablesManager();
  const { t } = useLanguage();

  const totalGuests = (data.adults || 0) + (data.children || 0) + (data.babies || 0);

  const availableTables = getAvailableTablesForZone(
    data.zone || '',
    totalGuests,
    data.date || '',
    data.time || ''
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('reservations.chooseZoneTypeTitle')}</h3>
        <p className="text-sm text-neutral-600">{t('reservations.chooseZoneTypeSubtitle')}</p>
      </div>

      <div className="space-y-8">
        {}
        <div>
          <h4 className="text-lg font-semibold text-neutral-900 mb-3">{t('reservations.restaurantZone')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {RESTAURANT_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => onUpdate({ zone: zone.id, table: '' })}
                className={`group p-4 rounded-2xl border transition-all text-left hover:shadow-md ${
                  data.zone === zone.id
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-neutral-200 bg-white hover:border-amber-300'
                }`}
              >
                {(() => {
                  const zoneEmoji = (id: string) => id === 'terraza' ? '🌿' : id === 'interior' ? '🏠' : id === 'privado' ? '🔒' : '🍸';
                  return <div className="text-2xl mb-2">{zoneEmoji(zone.id)}</div>;
                })()}
                <h5 className={`text-base font-bold mb-1 ${
                  data.zone === zone.id ? 'text-amber-900' : 'text-neutral-900'
                }`}>
                  {t(`reservations.zones.${zone.id}.name`)}
                </h5>
                <p className={`text-xs ${
                  data.zone === zone.id ? 'text-amber-700' : 'text-neutral-600'
                }`}>
                  {t(`reservations.zones.${zone.id}.description`)}
                </p>
                <div className={`text-[11px] mt-2 ${
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
            <h4 className="text-lg font-semibold text-neutral-900 mb-3">
              {t('reservations.availableTablesIn')} {t(`reservations.zones.${data.zone}.name`)}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {availableTables.map((table) => {
                const wizardId = getWizardIdFromTableId(table.id) || String(table.id);
                const isAvailable = data.date && data.time
                  ? isTableAvailableForDateTime(table.id, data.date, data.time)
                  : table.status === 'available';
                const isSelected = data.table === wizardId;

                return (
                  <button
                    key={table.id}
                    onClick={() => isAvailable && onUpdate({ table: wizardId, tableId: String(table.id) })}
                    disabled={!isAvailable}
                    className={`p-3 rounded-2xl border transition-all hover:shadow-md ${
                      !isAvailable
                        ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : isSelected
                          ? 'border-amber-400 bg-amber-50 text-amber-900'
                          : 'border-neutral-200 bg-white text-neutral-900 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-bold mb-1 ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-900' : 'text-neutral-900'
                      }`}>
                          {t('reservations.table')} {table.number}
                        </div>
                      <div className={`text-[11px] mb-1 ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-700' : 'text-neutral-600'
                      }`}>
                        {t(`reservations.zones.${table.location}.name`)}
                      </div>
                      <div className={`text-[11px] ${
                        !isAvailable ? 'text-neutral-400' : isSelected ? 'text-amber-600' : 'text-neutral-500'
                      }`}>
                        {t('reservations.capacityUpTo', {count: table.capacity})}
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
                {t('reservations.noTablesAvailableZone', {count: totalGuests})}
                <br />
                {t('reservations.selectAnotherZone')}
              </div>
            )}
          </div>
        )}

        {}
      </div>

      {}
      {data.zone && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h5 className="font-semibold text-amber-900 mb-2">{t('reservations.currentSelection')}</h5>
          <div className="text-amber-800 space-y-1">
            {data.zone && (
              <p><span className="font-medium">{t('reservations.zone')}:</span> {t(`reservations.zones.${data.zone}.name`)}</p>
            )}
            {data.table && (() => {
              const selId = getTableIdFromWizardId(String(data.table));
              const selTable = selId ? tables.find(t => t.id === selId) : undefined;
              return (
                <p><span className="font-medium">{t('reservations.table')}:</span> {selTable ? `${selTable.number}` : data.table}</p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function StepDatos({ data, onUpdate }: { data: ReservationData; onUpdate: (data: Partial<ReservationData>) => void }) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { tables, getTableIdFromWizardId } = useTablesManager();
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-PE';

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('reservations.yourDetailsTitle')}</h3>
        <p className="text-sm text-neutral-600">{t('reservations.yourDetailsSubtitle')}</p>
      </div>

      {}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <h4 className="text-base font-semibold text-amber-900 mb-2">{t('reservations.reservationSummaryTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.people')}:</span> {totalGuests} 
              {data.adults && ` (${data.adults} ${t('reservations.adults')}`}
              {data.children && data.children > 0 && `, ${data.children} ${t('reservations.children')}`}
              {data.babies && data.babies > 0 && `, ${data.babies} ${t('reservations.babies')}`}
              {data.adults && ')'}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.date')}:</span> {data.date
                 ? new Date(data.date).toLocaleDateString(locale, {
                     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                   })
                 : t('reservations.notSelected')}
             </p>
             <p className="text-amber-800">
               <span className="font-medium">{t('reservations.time')}:</span> {data.time
                 ? new Date(`1970-01-01T${data.time}`).toLocaleTimeString(locale, {
                     hour: '2-digit', minute: '2-digit'
                   })
                 : t('reservations.notSelected')}
             </p>
          </div>
          <div>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.zone')}:</span> {data.zone ? t(`reservations.zones.${data.zone}.name`) : t('reservations.notSelected')}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.table')}:</span> {(() => {
                 const selId = getTableIdFromWizardId(String(data.table));
                 const selTable = selId ? tables.find(t => t.id === selId) : undefined;
                 return selTable ? `${selTable.number}` : data.table;
               })()}
            </p>
            <p className="text-amber-800">
              <span className="font-medium">{t('reservations.type')}:</span> {data.consumptionType ? t(`reservations.consumptionTypes.${data.consumptionType}.name`) : t('reservations.notSelected')}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.customerName')} *
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
            {t('reservations.form.email')} *
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
            {t('reservations.form.phone')} *
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
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('reservations.form.specialRequestsLabel')}
          </label>
          <textarea
            id="specialRequests"
            value={data.specialRequests || ''}
            onChange={(e) => onUpdate({ specialRequests: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-neutral-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
            placeholder={t('reservations.form.specialRequestsPlaceholder')}
          />
        </div>

        {}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={data.acceptTerms || false}
            onChange={(e) => onUpdate({ acceptTerms: e.target.checked })}
            className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-neutral-700">
            {t('reservations.acceptTermsStart')}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              {t('footer.termsOfService')}
            </a>
            {t('reservations.acceptTermsAnd')}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">
              {t('footer.privacyPolicy')}
            </a>
            *
          </label>
        </div>
      </div>

      {}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
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
  );
}

