import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  isScrolled?: boolean;
}

const languages: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function LanguageSelector({ isScrolled = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageOption: LanguageOption) => {
    setLanguage(languageOption.code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 shadow-sm ${
          isScrolled
            ? 'bg-white/20 border border-white/30 hover:bg-white/30 backdrop-blur-sm'
            : 'bg-white/20 border border-white/30 hover:bg-white/30 backdrop-blur-sm'
        }`}
        aria-label="Selector de idioma"
      >
        <Globe className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isScrolled ? 'text-white' : 'text-white'}`} />
        <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${isScrolled ? 'text-white' : 'text-white'}`}>
          {currentLanguage.code.toUpperCase()}
        </span>
        <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
        <ChevronDown 
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isScrolled ? 'text-white' : 'text-white'}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 sm:w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((languageOption) => (
            <button
              key={languageOption.code}
              onClick={() => handleLanguageChange(languageOption)}
              className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-neutral-50 transition-colors duration-200 ${
                currentLanguage.code === languageOption.code 
                  ? 'bg-amber-50 text-amber-700' 
                  : 'text-neutral-700'
              }`}
            >
              <span className="text-lg sm:text-xl">{languageOption.flag}</span>
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base">{languageOption.name}</div>
                <div className="text-xs text-neutral-500 uppercase">{languageOption.code}</div>
              </div>
              {currentLanguage.code === languageOption.code && (
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}