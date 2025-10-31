import { Clock, MapPin, Phone, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import banerImage from '../img/baner.png';
import equipoImage from '../img/equipo.png';

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    const observerOptions = {
      threshold: [0, 0.1, 0.5, 1], 
      rootMargin: '-50px 0px -50px 0px' 
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          
          entry.target.classList.add('revealed');
        } else {
          
          entry.target.classList.remove('revealed');
        }
      });
    }, observerOptions);

    
    const scrollElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-up, .scroll-reveal-zoom');
    scrollElements.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);
  const features = [
    {
      title: t('home.features.quality.title'),
      description: t('home.features.quality.description')
    },
    {
      title: t('home.features.experience.title'),
      description: t('home.features.experience.description')
    },
    {
      title: t('home.features.atmosphere.title'),
      description: t('home.features.atmosphere.description')
    }
  ];

  return (
    <div className="min-h-screen">
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={banerImage} 
            alt="Restaurante Bella Vista" 
            className="w-full h-full object-cover transition-transform duration-[20s] ease-out hover:scale-105"
          />
          {}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-amber-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        
        {}
        <div className="absolute top-16 sm:top-20 left-4 sm:left-10 animate-float opacity-30">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-500/50 animate-pulse"></div>
        </div>
        <div className="absolute top-32 sm:top-40 right-8 sm:right-20 animate-float-delayed opacity-30" style={{maxWidth: 'calc(100vw - 2rem)'}}>
          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse"></div>
        </div>
        <div className="absolute bottom-24 sm:bottom-32 left-1/4 animate-float opacity-30">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-lg shadow-orange-500/50 animate-pulse"></div>
        </div>
        
        {}
        <div className="absolute top-1/3 right-1/3 animate-float opacity-20" style={{maxWidth: 'calc(100vw - 2rem)'}}>
          <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float-delayed opacity-20">
          <div className="w-1 h-1 sm:w-2 sm:h-2 bg-amber-300 rounded-full animate-ping"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-white w-full lg:max-w-2xl text-center">
            {}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
              {t('home.hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 sm:mb-8 max-w-2xl leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/10 rounded-lg p-4">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up animate-stagger-3 justify-center">
              <Link 
                to="/reservations"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 btn-glow text-sm sm:text-base text-center shadow-xl hover:shadow-2xl hover:scale-105 transform border border-amber-500/30"
              >
                {t('home.hero.reserveButton')}
              </Link>
              <Link 
                to="/menu"
                className="border-2 border-white/80 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-700 transition-all duration-300 btn-glow text-sm sm:text-base text-center backdrop-blur-sm bg-white/10 hover:bg-white hover:scale-105 transform shadow-xl"
              >
                {t('home.hero.menuButton')}
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-neutral-50 via-white to-amber-50/30 scroll-reveal-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {}
          <div className="text-center mb-12 sm:mb-16 scroll-reveal-zoom reveal-delay-1">
            <div className="inline-block mb-4">
              <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neutral-900 via-amber-800 to-neutral-900 bg-clip-text text-transparent mb-3 sm:mb-4">
              {t('home.welcome.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto px-4 leading-relaxed">
              {t('home.welcome.description')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white p-3 sm:p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 overflow-hidden border border-neutral-100 hover:border-amber-200 ${
                  index === 0 ? 'scroll-reveal-left reveal-delay-2' : 
                  index === 1 ? 'scroll-reveal-up reveal-delay-3' : 
                  'scroll-reveal-right reveal-delay-4'
                }`}
              >
                {}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                {}
                <div className="relative z-10 w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-2 sm:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg group-hover:shadow-xl group-hover:shadow-amber-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  <Star className="h-4 w-4 sm:h-7 sm:w-7 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  
                  {}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse"></div>
                </div>
                
                {}
                <h3 className="text-xs sm:text-xl font-bold text-neutral-900 mb-1 sm:mb-3 relative z-10 group-hover:text-amber-800 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-base text-neutral-600 relative z-10 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-16 lg:py-20 bg-gradient-to-br from-neutral-100 via-amber-50/20 to-orange-50/30 scroll-reveal-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center">
            <div className="scroll-reveal-left reveal-delay-1 order-2 lg:order-1">
              {}
              <div className="mb-6">
                <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mb-4"></div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neutral-900 via-amber-800 to-neutral-900 bg-clip-text text-transparent mb-4 sm:mb-6">
                  {t('home.history.title')}
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-neutral-200/50 hover:border-amber-200 transition-colors duration-300">
                  {t('home.history.description1')}
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-neutral-200/50 hover:border-amber-200 transition-colors duration-300">
                  {t('home.history.description2')}
                </p>
              </div>
            </div>

            {}
            <div className="relative scroll-reveal-zoom reveal-delay-2 order-1 lg:order-2">
              <div className="group relative bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105">
                {}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 via-transparent to-orange-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-amber-300/20 to-red-300/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <img 
                  src={equipoImage} 
                  alt="Nuestro equipo de cocina" 
                  className="relative z-10 w-full h-64 sm:h-80 object-cover rounded-2xl shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105"
                />
                
                {}
                <div className="absolute inset-6 sm:inset-8 border-2 border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>

            {}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-xl lg:col-span-2 scroll-reveal-up reveal-delay-3 order-3 border border-neutral-100 hover:border-amber-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
              {}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {}
              <div className="relative z-10 text-center mb-6 sm:mb-8">
                <div className="inline-block mb-3">
                  <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-900 via-amber-800 to-neutral-900 bg-clip-text text-transparent">
                  {t('home.info.title')}
                </h3>
              </div>
              
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="group/item flex items-start space-x-3 sm:space-x-4 scroll-reveal-left reveal-delay-4 p-3 sm:p-4 rounded-xl hover:bg-amber-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all duration-300">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 text-sm sm:text-base mb-1 group-hover/item:text-amber-800 transition-colors duration-300">
                      {t('home.info.address.label')}
                    </p>
                    <p className="text-neutral-600 text-sm sm:text-sm leading-relaxed">
                      {t('home.info.address.value')}
                    </p>
                  </div>
                </div>

                <div className="group/item flex items-start space-x-3 sm:space-x-4 scroll-reveal-up reveal-delay-5 p-3 sm:p-4 rounded-xl hover:bg-amber-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all duration-300">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 text-sm sm:text-base mb-1 group-hover/item:text-amber-800 transition-colors duration-300">
                      {t('home.info.hours.label')}
                    </p>
                    <p className="text-neutral-600 text-sm sm:text-sm leading-relaxed">
                      {t('home.info.hours.value')}
                    </p>
                  </div>
                </div>

                <div className="group/item flex items-start space-x-3 sm:space-x-4 scroll-reveal-right reveal-delay-6 p-3 sm:p-4 rounded-xl hover:bg-amber-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all duration-300">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 text-sm sm:text-base mb-1 group-hover/item:text-amber-800 transition-colors duration-300">
                      {t('home.info.phone.label')}
                    </p>
                    <p className="text-neutral-600 text-sm sm:text-sm leading-relaxed">
                      {t('home.info.phone.value')}
                    </p>
                  </div>
                </div>
              </div>
              
              {}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
