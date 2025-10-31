import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-neutral-900 text-white py-8 sm:py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.contact')}
            </h3>
            <div className="space-y-2 text-amber-100">
              <p className="flex items-center justify-center md:justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                {t('home.info.address.label')}: {t('home.info.address.value')}
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 mr-2" />
                {t('home.info.phone.label')}: {t('home.info.phone.value')}
              </p>
              <p className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-2" />
                {t('footer.email')}: {t('footer.emailValue')}
              </p>
            </div>
          </div>

          {}
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-amber-400 mb-3 sm:mb-6 flex items-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
              {}
              <span>{t('footer.hoursTitle')}</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-300 text-xs sm:text-sm">{t('footer.mondayToSaturday')}</span>
                <span className="text-white font-bold text-xs sm:text-sm">1:00 PM - 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300 text-xs sm:text-sm">{t('footer.sunday')}</span>
                <span className="text-red-400 font-bold text-xs sm:text-sm">{t('footer.closed')}</span>
              </div>
            </div>
            <p className="text-xs text-amber-200 mt-2 sm:mt-4 p-2 sm:p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
              {t('footer.note')}
            </p>
          </div>

          {}
          <div className="text-center">
            <div className="flex flex-col items-center justify-center mb-3 sm:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-400 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                <span className="text-neutral-900 font-bold text-sm sm:text-xl">BV</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-amber-400">{t('footer.restaurantName')}</h2>
              <p className="text-neutral-300 text-xs sm:text-sm mt-1 sm:mt-2 max-w-md hidden sm:block">
                {t('footer.description')}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs text-neutral-400">
              <span className="bg-neutral-800 px-2 py-1 sm:px-3 rounded-full">{t('footer.premiumCuisine')}</span>
              <span className="bg-neutral-800 px-2 py-1 sm:px-3 rounded-full hidden sm:inline">{t('footer.freshIngredients')}</span>
              <span className="bg-neutral-800 px-2 py-1 sm:px-3 rounded-full">{t('footer.familyAtmosphere')}</span>
            </div>
          </div>
        </div>

        {}
        <div className="border-t border-neutral-700 pt-4 sm:pt-8 text-center">
          <p className="text-neutral-400 text-xs sm:text-sm">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}