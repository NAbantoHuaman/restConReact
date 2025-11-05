import { Calendar, Utensils, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

type Page = 'home' | 'menu' | 'reservations';

interface HeaderProps {
  currentPage: Page;
}

export default function Header({ currentPage }: HeaderProps) {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { id: 'home' as Page, label: t('nav.home'), icon: Home, path: '/' },
    { id: 'menu' as Page, label: t('nav.menu'), icon: Utensils, path: '/menu' },

    { id: 'reservations' as Page, label: t('nav.reservations'), icon: Calendar, path: '/reservations' },
    
  ];

  
  const isTransparent = currentPage === 'home' && !isScrolled;

  return (
    <>
      <style>{`
        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          ${isTransparent 
            ? `
              background: rgba(210, 38, 38, 0) !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              box-shadow: none !important;
            `
            : `
              background: rgba(0, 0, 0, 0.95) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
            `
          }
        }
        
        .navbar-content {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 0.75rem;
        }
        
        .navbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 3.5rem;
        }
        
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        
        .navbar-title {
          font-size: 1.125rem;
          font-weight: bold;
          color: white;
          margin: 0;
        }
        
        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        /* Responsive styles for mobile */
         @media (min-width: 640px) {
           .navbar-content {
             padding: 0 1rem;
           }
           
           .navbar-inner {
             height: 4rem;
           }
           
           .navbar-logo {
             gap: 0.5rem;
           }
           
           .navbar-title {
             font-size: 1.5rem;
           }
           
           .navbar-nav {
             gap: 1rem;
           }
         }
        
        .navbar-links {
          display: flex;
          gap: 0.25rem;
        }
        
        .navbar-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.75rem;
        }
        
        .navbar-link.active {
          background-color: #d97706;
        }
        
        .navbar-link:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .navbar-link-text {
          display: inline;
        }
        
        @media (min-width: 640px) {
          .navbar-links {
            gap: 0.5rem;
          }
          
          .navbar-link {
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
      
      <header className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-inner">
            <div className="navbar-logo">
              <Utensils style={{ height: '2rem', width: '2rem', color: '#f59e0b' }} />
              <h1 className="navbar-title">Bella Vista</h1>
            </div>

            <nav className="navbar-nav" role="navigation" aria-label="Navegación principal">
              <div className="navbar-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`navbar-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon style={{ height: '1.25rem', width: '1.25rem' }} />
                      <span className="navbar-link-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <LanguageSelector isScrolled={isScrolled} />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
