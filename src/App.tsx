import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ErrorBoundary from './components/ErrorBoundary';

import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
import ReservationView from './pages/ReservationView';
import AdminLayout from './pages/admin/Layout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import MenuAdmin from './pages/admin/MenuAdmin';
import ReservationsAdmin from './pages/admin/ReservationsAdmin';
import AdminSettingsPage from './pages/admin/Settings';
import AdminLogs from './pages/admin/Logs';

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
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'transparent' }}>
      {!isAdminRoute && <Header currentPage={currentPage} />}
      <main className="flex-1 overflow-x-hidden" style={{ background: 'none' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<ErrorBoundary><Menu /></ErrorBoundary>} />

          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservation-form" element={<ReservationForm />} />
          <Route path="/reservation-view" element={<ReservationView />} />
          <Route path="/orders" element={<Navigate to="/reservations" replace />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route path="dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="menu" element={<RequireAuth><MenuAdmin /></RequireAuth>} />
            <Route path="reservations" element={<RequireAuth><ReservationsAdmin /></RequireAuth>} />
            <Route path="settings" element={<RequireAuth><AdminSettingsPage /></RequireAuth>} />
            <Route path="logs" element={<RequireAuth><AdminLogs /></RequireAuth>} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

function RequireAuth({ children }: { children: any }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}
