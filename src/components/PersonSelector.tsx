
import { Minus, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PersonSelectorProps {
  adults: number;
  children: number;
  babies: number;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  onBabiesChange: (count: number) => void;
  maxTotal?: number;
}

export default function PersonSelector({
  adults,
  children,
  babies,
  onAdultsChange,
  onChildrenChange,
  onBabiesChange,
  maxTotal = 8
}: PersonSelectorProps) {
  const totalGuests = adults + children + babies;
  const { t } = useLanguage();

  const handleIncrement = (type: 'adults' | 'children' | 'babies') => {
    if (totalGuests >= maxTotal) return;
    
    switch (type) {
      case 'adults':
        onAdultsChange(adults + 1);
        break;
      case 'children':
        onChildrenChange(children + 1);
        break;
      case 'babies':
        onBabiesChange(babies + 1);
        break;
    }
  };

  const handleDecrement = (type: 'adults' | 'children' | 'babies') => {
    switch (type) {
      case 'adults':
        if (adults > 1) onAdultsChange(adults - 1);
        break;
      case 'children':
        if (children > 0) onChildrenChange(children - 1);
        break;
      case 'babies':
        if (babies > 0) onBabiesChange(babies - 1);
        break;
    }
  };

  const CounterButton = ({ 
    type, 
    count, 
    label, 
    description 
  }: { 
    type: 'adults' | 'children' | 'babies';
    count: number;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-b-0">
      <div className="flex-1">
        <h3 className="text-base font-medium text-neutral-900">{label}</h3>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => handleDecrement(type)}
          disabled={
            (type === 'adults' && count <= 1) || 
            (type !== 'adults' && count <= 0)
          }
          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
        >
          <Minus className="h-4 w-4 text-neutral-600" />
        </button>
        <span className="w-8 text-center font-medium text-neutral-900">{count}</span>
        <button
          type="button"
          onClick={() => handleIncrement(type)}
          disabled={totalGuests >= maxTotal}
          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
        >
          <Plus className="h-4 w-4 text-neutral-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">
          {t('reservations.choosePeopleTitle')}
        </h2>
        <p className="text-sm text-neutral-500">
          {t('reservations.childrenNote')}
        </p>
      </div>

      <div className="space-y-0">
        <CounterButton
          type="adults"
          count={adults}
          label={t('reservations.adults')}
          description={t('reservations.adultsSubtitle')}
        />
        <CounterButton
          type="children"
          count={children}
          label={t('reservations.children')}
          description={t('reservations.childrenSubtitle')}
        />
        <CounterButton
          type="babies"
          count={babies}
          label={t('reservations.babies')}
          description={t('reservations.babiesSubtitle')}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-700">{t('reservations.totalPeople', { count: totalGuests })}</span>
        </div>
        {totalGuests >= maxTotal && (
          <p className="text-xs text-red-500 mt-1">
            {t('reservations.maxPeoplePerReservation', { max: maxTotal })}
          </p>
        )}
      </div>
    </div>
  );
}