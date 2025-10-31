import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ErrorBoundary from './components/ErrorBoundary';

import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
import ReservationView from './pages/ReservationView';

function AppContent() {
  const location = useLocation();
  
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/menu') return 'menu';
    if (path === '/reservations') return 'reservations';

    if (path === '/reservation-form') return 'reservations';
    if (path === '/reservation-view') return 'reservations';
    return 'home';
  };

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'transparent' }}>
      <Header currentPage={currentPage} />
      <main className="flex-1 overflow-x-hidden" style={{ background: 'none' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<ErrorBoundary><Menu /></ErrorBoundary>} />

          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservation-form" element={<ReservationForm />} />
          <Route path="/reservation-view" element={<ReservationView />} />
          <Route path="/orders" element={<Navigate to="/reservations" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
